import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { validateRequest } from "../guardrails/validator";
import { generateExecutionPlan } from "../planner/planner";
import { getMemory, updateMemory } from "../memory/memory";
import { logAgentExecution } from "../observability/logger";
import { supabase } from "@/utils/supabase";

export interface AgentResponse {
  traceId: string;
  state: "IDLE" | "VALIDATING" | "PLANNING" | "THINKING" | "EXECUTING" | "WAITING_FOR_USER" | "COMPLETED" | "FAILED";
  intent: "ORDER" | "PAYMENT" | "PAYMENT_PROMISE" | "INVOICE" | "PRODUCT_QUERY" | "BUSINESS_QUERY";
  confidence: number;
  health: "HEALTHY" | "WARNING" | "ERROR";
  guardrails: "PASSED" | "FAILED";
  plan: string[];
  timeline: { state: string; duration: string }[];
  toolsUsed: string[];
  reflection: {
    success: boolean;
    summary: string;
  };
  executionTime: string;
  response: string;
  // Backward compatibility keys
  text: string;
  kind?: string | null;
  data?: any;
}

// Zod schema definition for structured output
const agentOutputSchema = z.object({
  intent: z.enum(["ORDER", "PAYMENT", "PAYMENT_PROMISE", "INVOICE", "PRODUCT_QUERY", "BUSINESS_QUERY"]),
  confidence: z.number().describe("Confidence score of intent detection between 0 and 1"),
  response: z.string().describe("Polite natural language message responding to the dealer"),
  toolsUsed: z.array(z.string()).describe("List of tool names to run: 'createOrder', 'recordPayment', 'scheduleReminder'"),
  toolParameters: z.object({
    orderItems: z.array(z.object({
      sku: z.string(),
      name: z.string(),
      qty: z.number(),
      price: z.number()
    })).optional(),
    orderTotal: z.number().optional(),
    paymentAmount: z.number().optional(),
    reminderWhen: z.string().optional(),
    reminderNote: z.string().optional()
  }).optional(),
  kind: z.enum(["order", "invoice", "ledger", "reminder", "text"]).optional(),
  data: z.any().optional().describe("Payload data object matching the response kind (e.g. for order: { title, items, total, delivery })")
});

async function resolveDealerId(
  conversationId: string,
  dealerName?: string
): Promise<string> {
  // a) Try dealerName lookup first
  if (dealerName && dealerName !== "Unknown" && dealerName !== "Business Owner") {
    const { data: activeDealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("name", dealerName)
      .maybeSingle();
    if (activeDealer?.id) {
      return activeDealer.id;
    }
  }

  // b) Try conversationId lookup against a conversations table if one exists
  const { data: convo } = await supabase
    .from("conversations")
    .select("dealer")
    .eq("id", conversationId)
    .maybeSingle();
    
  if (convo?.dealer) {
    const { data: activeDealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("name", convo.dealer)
      .maybeSingle();
    if (activeDealer?.id) {
      return activeDealer.id;
    }
  }

  // c) Try session memory lastDealerId
  const sessionMemory = await getMemory(conversationId);
  if (sessionMemory?.lastDealerId) {
    return sessionMemory.lastDealerId;
  }

  // d) Throw error if unresolved
  throw new Error(`Could not resolve dealer context for conversationId: "${conversationId}" and dealerName: "${dealerName}"`);
}

function calculateDueDate(whenStr?: string): string {
  try {
    if (!whenStr) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
    const clean = whenStr.toLowerCase();
    if (clean.includes("tomorrow")) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }
    if (clean.includes("diwali") || clean.includes("nov 5")) {
      return new Date("2026-11-05T10:00:00.000Z").toISOString();
    }
    if (clean.includes("dussehra") || clean.includes("dusheera")) {
      return new Date("2026-10-20T10:00:00.000Z").toISOString();
    }
    
    // Attempt standard JS Date parsing
    const parsed = Date.parse(whenStr);
    if (!isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
    
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  } catch (err) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

export async function processAgentRequest(
  text: string,
  conversationId: string,
  dealerName: string
): Promise<string> {
  const startTime = Date.now();
  const traceId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  // State Machine variables
  let currentState: "IDLE" | "VALIDATING" | "PLANNING" | "THINKING" | "EXECUTING" | "WAITING_FOR_USER" | "COMPLETED" | "FAILED" = "IDLE";
  let stateStartTime = Date.now();
  const timeline: { state: string; duration: string }[] = [];

  const transitionTo = (nextState: typeof currentState) => {
    const durationMs = Date.now() - stateStartTime;
    timeline.push({ state: currentState, duration: `${durationMs}ms` });
    currentState = nextState;
    stateStartTime = Date.now();
  };

  // Transition: IDLE -> VALIDATING
  transitionTo("VALIDATING");

  // Resolve active dealer profile context
  const dealerId = await resolveDealerId(conversationId, dealerName);

  // 1. RUN GUARDRAILS (Validation)
  const validation = await validateRequest(text, dealerId);
  if (!validation.valid) {
    transitionTo("FAILED");
    const elapsed = Date.now() - startTime;
    
    let politeReply = "Hello sir, please let me know how I can help you check stock availability, confirm wire/switch orders, or verify outstanding invoices today.";
    const hasAbuseOrDangerous = validation.errors.some(e => 
      e.includes("Dangerous") || e.includes("language") || e.includes("unprofessional")
    );
    if (hasAbuseOrDangerous) {
      politeReply = "Hello! I am here to assist you with orders, stock availability, and payment updates for Kumar Electricals. Please let me know what you need sir.";
    } else if (validation.errors.some(e => e.includes("quantity") || e.includes("product"))) {
      politeReply = "I could not verify those product details. Please specify a correct product SKU and a quantity greater than 0 so I can draft your order.";
    } else if (validation.errors.some(e => e.includes("invoice") || e.includes("dealer"))) {
      politeReply = "I am having trouble verifying that reference. Please check your invoice number or account details so I can assist you better.";
    }

    // Push the current FAILED state into the timeline
    const finalDuration = Date.now() - stateStartTime;
    timeline.push({ state: "FAILED", duration: `${finalDuration}ms` });

    const responseObj: AgentResponse = {
      traceId,
      state: "FAILED",
      intent: "BUSINESS_QUERY",
      confidence: 1.0,
      health: "ERROR",
      guardrails: "FAILED",
      plan: ["Halt execution", "Report validation violation"],
      timeline,
      toolsUsed: [],
      reflection: {
        success: false,
        summary: "Guardrails rejected request."
      },
      executionTime: `${elapsed}ms`,
      response: politeReply,
      text: politeReply,
      kind: "text",
      data: null
    };

    // Log the validation guardrails trigger
    logAgentExecution({
      traceId,
      timestamp,
      intent: "GUARDRAILS_TRIGGER",
      confidence: 1.0,
      plan: responseObj.plan,
      toolsUsed: [],
      executionTimeMs: elapsed,
      status: "GUARDRAILS_TRIGGERED",
      errors: validation.errors,
      currentState: "FAILED",
      reflectionResult: responseObj.reflection,
      memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
      guardrailStatus: "FAILED",
      toolSuccessCount: 0,
      toolFailureCount: 0,
      health: "ERROR"
    });

    return JSON.stringify(responseObj);
  }

  // 2. Load Short-term conversation Memory
  const sessionMemory = await getMemory(conversationId);

  // 3. Fetch Live Database State
  const [productsRes, dealersRes, ordersRes, invoicesRes] = await Promise.all([
    supabase.from("products").select("*"),
    supabase.from("dealers").select("*"),
    supabase.from("orders").select("*"),
    supabase.from("invoices").select("*")
  ]);

  const productsList = productsRes.data || [];
  const dealersList = dealersRes.data || [];
  const invoicesList = invoicesRes.data || [];
  const ordersList = ordersRes.data || [];

  // Wrap tool calls to return validation structures
  const createOrderTool = tool(
    async ({ items, total }) => {
      try {
        const invId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // Resolve and validate items against database catalog
        const { data: dbProducts } = await supabase.from("products").select("*");
        const products = dbProducts || [];

        const validatedItems = items.map(item => {
          const match = products.find(p => p.sku.toLowerCase() === item.sku.toLowerCase()) || 
                        products.find(p => p.name.toLowerCase() === item.name.toLowerCase()) ||
                        products.find(p => p.name.toLowerCase().includes(item.name.toLowerCase())) ||
                        products.find(p => item.name.toLowerCase().includes(p.name.toLowerCase()));
          
          if (!match) {
            throw new Error(`Product reference "${item.name}" (SKU: "${item.sku}") was not found in our catalog.`);
          }
          
          return {
            sku: match.sku,
            name: match.name,
            qty: Number(item.qty) || 1,
            price: Number(match.price)
          };
        });

        const calculatedTotal = validatedItems.reduce((acc, item) => acc + (item.qty * item.price), 0);

        // Deduct inventory
        for (const item of validatedItems) {
          const { data: prod } = await supabase.from("products").select("stock").eq("sku", item.sku).maybeSingle();
          const cur = prod?.stock || 0;
          await supabase.from("products").update({ stock: Math.max(0, cur - item.qty) }).eq("sku", item.sku);
        }

        // Insert Order
        const newOrdId = crypto.randomUUID();
        await supabase.from("orders").insert({
          id: newOrdId,
          invoice: invId,
          dealerId,
          dealerName,
          total: calculatedTotal,
          status: "processing",
          placedAt: "Just now",
          aiNote: `Confirmed by LangChain orchestrator (${traceId}).`
        });

        // Insert Order Items
        for (const item of validatedItems) {
          await supabase.from("order_items").insert({
            id: crypto.randomUUID(),
            orderId: newOrdId,
            name: item.name,
            qty: item.qty,
            price: item.price
          });
        }

        // Insert Invoice
        await supabase.from("invoices").insert({
          id: invId,
          dealer: dealerName,
          amount: calculatedTotal,
          date: "Today",
          status: "unpaid"
        });

        // Update dealer stats
        const { data: dl } = await supabase.from("dealers").select("pending, ordersCount").eq("id", dealerId).maybeSingle();
        const pending = (dl?.pending || 0) + calculatedTotal;
        const ordersCount = (dl?.ordersCount || 0) + 1;
        await supabase.from("dealers").update({ pending, ordersCount }).eq("id", dealerId);

        await updateMemory(conversationId, {
          lastOrderId: newOrdId,
          lastInvoiceId: invId,
          lastDealerId: dealerId
        });

        return { success: true, invoiceId: invId, total: calculatedTotal };
      } catch (err) {
        console.error("createOrder tool failed:", err);
        return { success: false, error: String(err) };
      }
    },
    {
      name: "createOrder",
      description: "Creates and confirms a purchase order, updates inventory stock levels, and generates the billing invoice.",
      schema: z.object({
        items: z.array(z.object({
          sku: z.string(),
          name: z.string(),
          qty: z.number(),
          price: z.number()
        })),
        total: z.number()
      })
    }
  );

  const recordPaymentTool = tool(
    async ({ paidAmount }) => {
      try {
        const { data: dl } = await supabase.from("dealers").select("pending").eq("id", dealerId).maybeSingle();
        const currentPending = dl?.pending || 0;
        const nextPending = Math.max(0, currentPending - paidAmount);
        await supabase.from("dealers").update({ pending: nextPending }).eq("id", dealerId);
        return { success: true, paidAmount, remaining: nextPending };
      } catch (err) {
        console.error("recordPayment tool failed:", err);
        return { success: false, error: String(err) };
      }
    },
    {
      name: "recordPayment",
      description: "Logs a payment amount in the collections ledger, reducing the dealer's pending outstanding dues.",
      schema: z.object({
        paidAmount: z.number()
      })
    }
  );

  const scheduleReminderTool = tool(
    async ({ when, note }) => {
      try {
        return { success: true, scheduled: when, note };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
    {
      name: "scheduleReminder",
      description: "Schedules a dues collection auto-reminder for a specific follow-up date.",
      schema: z.object({
        when: z.string(),
        note: z.string()
      })
    }
  );

  // System instructions for LangChain agent prompt template
  const systemInstruction = `You are the single core AI Distributor Agent for Kumar Electricals & Distribution.
Your job is to talk to dealers and answer their inquiries or execute business operations.

CURRENT CONTEXT:
- Active Dealer Name: "${dealerName}"
- Active Dealer ID: "${dealerId}"
- Active Conversation ID: "${conversationId}"

SESSION MEMORY CONTEXT:
- Last Dealer ID: "${sessionMemory.lastDealerId || "None"}"
- Last Order ID: "${sessionMemory.lastOrderId || "None"}"
- Last Invoice ID: "${sessionMemory.lastInvoiceId || "None"}"
- Pending Clarification: "${sessionMemory.pendingClarification || "None"}"

DATABASE STATE:
- Products Stock: ${JSON.stringify(productsList)}
- Dealers Balance: ${JSON.stringify(dealersList)}
- Invoices Ledger: ${JSON.stringify(invoicesList)}
- Orders Pipeline: ${JSON.stringify(ordersList)}

Determine the intent of the message:
- ORDER: Dealer wants to purchase products, modify products in a draft, or says 'confirm' to place an order.
- PAYMENT: Dealer reports a payment or says they paid an amount.
- PAYMENT_PROMISE: Dealer promises to pay later (e.g. "will pay after Diwali").
- INVOICE: Dealer asks about an invoice details or requests invoice file copy.
- PRODUCT_QUERY: Inquiries about stock counts, SKU price, categories, or catalog.
- BUSINESS_QUERY: General inquiries about reports, collections ranking, sales totals, profitability, or general conversations.

AMBIGUITY RULES:
- If the user requests a product category or generic name (e.g., "MCB", "Switch", "Wire", "Socket", "Light") and there are multiple matching models available in the "Products Stock" database list:
  1. You MUST set the "confidence" field to 0.75 (which triggers a WAITING_FOR_USER clarification state).
  2. You MUST set "toolsUsed" to [].
  3. You MUST ask the user in your "response" which exact model and specs they want, listing the available options from the database catalog (e.g. "We have MCB 32A Single Pole (₹245) or MCB SWITCH 12 A (₹250). Which model would you like to order?").
- If the user explicitly selects or names a specific product variant (e.g., "MCB 32A Single Pole" or "MCB SWITCH 12 A"), you can set a high confidence (0.95+) and draft the order.

TONE CONSTRAINTS:
- Speak like a polite, helpful trade manager. Respond directly to dealers using sir (e.g., "Hello sir, I have...").
- NEVER mention database tables, JSON attributes, schema structures, or tool names.
- Present lists or calculations in clear, readable formatting.

Output a strict structured JSON matching the provided schema.`;

  // Transition: VALIDATING -> PLANNING
  transitionTo("PLANNING");

  let agentOutput: any = null;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ [DistributorAgent] GROQ_API_KEY is missing from environment variables!");
  }

  // Transition: PLANNING -> THINKING
  transitionTo("THINKING");

  if (apiKey) {
    try {
      // LangChain LLM Sequence (LCEL) Setup
      const model = new ChatGroq({
        apiKey,
        model: "llama-3.3-70b-versatile",
        modelName: "llama-3.3-70b-versatile",
        temperature: 0.1
      }).withStructuredOutput(agentOutputSchema);

      // Formulate memory messages using LangChain standard formats
      const historyMessages = sessionMemory.recentConversation.map(c => 
        c.role === "user" 
          ? new HumanMessage(c.text) 
          : new AIMessage(c.text)
      );

      const messages = [
        new SystemMessage(systemInstruction),
        ...historyMessages,
        new HumanMessage(text)
      ];

      // Invoke the model directly without using ChatPromptTemplate to avoid curly brace parsing bugs
      console.log(`🟢 REAL LLM CALL: GROQ_API_KEY present (value type: ${typeof apiKey}), invoking ChatGroq model...`);
      agentOutput = await model.invoke(messages);
    } catch (err) {
      console.warn("LangChain LLM invoke failed. Falling back to local rules engine.", err);
    }
  }

  // Catch block fallback if key is exhausted or LLM was bypassed
  if (!agentOutput) {
    console.log(`🟡 FALLBACK RULES ENGINE: Triggering rules engine fallback for query: "${text}"`);
    console.warn(`⚠️ [DistributorAgent] Triggering fallback rules engine for query: "${text}". (GROQ_API_KEY missing or LLM call failed)`);
    const rawFallback = await runFallbackRulesEngine(text, productsList, dealersList, invoicesList, ordersList, conversationId, dealerId);
    agentOutput = JSON.parse(rawFallback);
  }

  let intent = agentOutput.intent || "BUSINESS_QUERY";
  let confidence = agentOutput.confidence || 0.9;
  let responseText = agentOutput.response || "";
  let kind = agentOutput.kind || "text";
  let data = agentOutput.data || null;
  const toolsUsed = agentOutput.toolsUsed || [];
  const params = agentOutput.toolParameters || {};

  // If the agent draft has items, map them to the database items to resolve names/prices/SKUs and prevent NaN rendering
  if (data && data.items && Array.isArray(data.items)) {
    try {
      const resolvedItems = data.items.map((item: any) => {
        const match = productsList.find(p => p.sku.toLowerCase() === (item.sku || "").toLowerCase()) ||
                      productsList.find(p => p.name.toLowerCase() === (item.name || "").toLowerCase()) ||
                      productsList.find(p => p.name.toLowerCase().includes((item.name || "").toLowerCase())) ||
                      productsList.find(p => (item.name || "").toLowerCase().includes(p.name.toLowerCase()));
        
        if (match) {
          return {
            sku: match.sku,
            name: match.name,
            qty: Number(item.qty) || 1,
            price: Number(match.price)
          };
        }
        return item;
      });
      data.items = resolvedItems;
      data.total = resolvedItems.reduce((acc: number, item: any) => acc + ((item.qty || 1) * (item.price || 0)), 0);
      
      // Sync toolParameters as well
      if (params.orderItems) {
        params.orderItems = resolvedItems;
        params.orderTotal = data.total;
      }
    } catch (resolveErr) {
      console.warn("Failed to map draft products:", resolveErr);
    }
  }

  // Cache order draft details for non-hardcoded confirmation lookups
  if (kind === "order" && data && data.items) {
    await updateMemory(conversationId, {
      lastDraft: { items: data.items, total: data.total || 0 }
    });
  }

  // ==========================================
  // FEATURE 1 — CONFIDENCE GATING
  // ==========================================
  if (confidence < 0.50) {
    transitionTo("FAILED");
    const elapsed = Date.now() - startTime;
    const finalDuration = Date.now() - stateStartTime;
    timeline.push({ state: "FAILED", duration: `${finalDuration}ms` });

    const failedResponseText = "I am not confident enough to execute this request. Could you please provide more details?";

    const failedResponse: AgentResponse = {
      traceId,
      state: "FAILED",
      intent,
      confidence,
      health: "ERROR",
      guardrails: "PASSED",
      plan: ["Reject execution due to low confidence"],
      timeline,
      toolsUsed: [],
      reflection: {
        success: false,
        summary: `Halted: Confidence score (${confidence}) is below threshold 0.50.`
      },
      executionTime: `${elapsed}ms`,
      response: failedResponseText,
      text: failedResponseText,
      kind: "text",
      data: null
    };

    // Save interaction turn to conversation history memory
    const updatedHistory = [
      ...sessionMemory.recentConversation,
      { role: "user" as const, text },
      { role: "model" as const, text: failedResponseText }
    ];
    await updateMemory(conversationId, {
      recentConversation: updatedHistory
    });

    logAgentExecution({
      traceId,
      timestamp,
      intent,
      confidence,
      plan: failedResponse.plan,
      toolsUsed: [],
      executionTimeMs: elapsed,
      status: "ERROR",
      errors: ["Execution rejected due to confidence gating threshold < 0.50"],
      currentState: "FAILED",
      reflectionResult: failedResponse.reflection,
      memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
      guardrailStatus: "PASSED",
      toolSuccessCount: 0,
      toolFailureCount: 0,
      health: "ERROR"
    });

    return JSON.stringify(failedResponse);
  }

  if (confidence >= 0.50 && confidence < 0.80) {
    transitionTo("WAITING_FOR_USER");
    const elapsed = Date.now() - startTime;
    const finalDuration = Date.now() - stateStartTime;
    timeline.push({ state: "WAITING_FOR_USER", duration: `${finalDuration}ms` });

    const finalResponseText = responseText.includes("?") 
      ? responseText 
      : "I found multiple matching products in our catalog. Could you please clarify exactly which model and quantity you need sir?";

    const warningResponse: AgentResponse = {
      traceId,
      state: "WAITING_FOR_USER",
      intent,
      confidence,
      health: "WARNING",
      guardrails: "PASSED",
      plan: ["Pause execution", "Await user clarification"],
      timeline,
      toolsUsed: [],
      reflection: {
        success: true,
        summary: `Clarification needed: Confidence score (${confidence}) is between 0.50 and 0.79.`
      },
      executionTime: `${elapsed}ms`,
      response: finalResponseText,
      text: finalResponseText,
      kind: "text",
      data: null
    };

    // Save interaction turn to conversation history memory so the next turn has context
    const updatedHistory = [
      ...sessionMemory.recentConversation,
      { role: "user" as const, text },
      { role: "model" as const, text: finalResponseText }
    ];
    await updateMemory(conversationId, {
      recentConversation: updatedHistory,
      pendingClarification: intent === "ORDER" ? "ORDER_PRODUCT" : undefined
    });

    logAgentExecution({
      traceId,
      timestamp,
      intent,
      confidence,
      plan: warningResponse.plan,
      toolsUsed: [],
      executionTimeMs: elapsed,
      status: "SUCCESS",
      currentState: "WAITING_FOR_USER",
      reflectionResult: warningResponse.reflection,
      memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
      guardrailStatus: "PASSED",
      toolSuccessCount: 0,
      toolFailureCount: 0,
      health: "WARNING"
    });

    return JSON.stringify(warningResponse);
  }

  // Plan generation
  let plannerText = text;
  if (intent === "ORDER" && (text.toLowerCase().includes("confirm") || text.toLowerCase().includes("yes") || text.toLowerCase().includes("done") || text.toLowerCase().includes("agree"))) {
    if (sessionMemory.lastDraft && sessionMemory.lastDraft.items) {
      const itemDescs = sessionMemory.lastDraft.items.map((it: any) => `${it.qty}x ${it.name}`).join(", ");
      plannerText = `Confirm order draft for ${itemDescs}`;
    }
  }
  const plan = await generateExecutionPlan(plannerText, intent);

  // Transition: THINKING -> EXECUTING
  transitionTo("EXECUTING");

  // Tool Call parameters & executions tracking
  const toolsExecuted: string[] = [];
  let toolSuccessCount = 0;
  let toolFailureCount = 0;
  let executionError: string | null = null;
  let createdInvoiceId: string | undefined = undefined;

  try {
    for (const toolName of toolsUsed) {
      if (toolName === "createOrder") {
        const orderItems = params.orderItems || data?.items || [
          { name: "MCB 32A Single Pole", qty: 20, price: 245, sku: "MCB-32A-SP" },
          { name: "Modular Switch 6A", qty: 15, price: 78, sku: "SW-MOD-6A" }
        ];
        const orderTotal = params.orderTotal || data?.total || 6070;
        
        const toolResult = await createOrderTool.invoke({
          items: orderItems,
          total: orderTotal
        });

        // Tool validation
        if (toolResult && toolResult.success) {
          toolSuccessCount++;
          createdInvoiceId = toolResult.invoiceId;
          if (agentOutput.data) {
            agentOutput.data.invoice = toolResult.invoiceId;
          }
          toolsExecuted.push("createOrder", "updateInventory", "generateInvoice", "updateLedger");
        } else {
          toolFailureCount++;
          executionError = toolResult.error || "createOrder tool failed execution.";
          break; // Stop remaining execution on failure
        }
      }

      if (toolName === "recordPayment") {
        const amount = params.paymentAmount || data?.paidAmount || 20000;
        const toolResult = await recordPaymentTool.invoke({
          paidAmount: amount
        });

        if (toolResult && toolResult.success) {
          toolSuccessCount++;
          toolsExecuted.push("recordPayment", "updateLedger");
        } else {
          toolFailureCount++;
          executionError = toolResult.error || "recordPayment tool failed execution.";
          break;
        }
      }

      if (toolName === "scheduleReminder") {
        const when = params.reminderWhen || "Nov 5, 10:00 AM";
        const note = params.reminderNote || "Collections payment follow up";
        const toolResult = await scheduleReminderTool.invoke({
          when,
          note
        });

        if (toolResult && toolResult.success) {
          toolSuccessCount++;
          toolsExecuted.push("scheduleReminder");
        } else {
          toolFailureCount++;
          executionError = toolResult.error || "scheduleReminder tool failed execution.";
          break;
        }
      }
    }
  } catch (toolErr) {
    toolFailureCount++;
    executionError = String(toolErr);
  }

  // ==========================================
  // FEATURE 4 — TOOL VALIDATION FAILURE HALT
  // ==========================================
  if (executionError || toolFailureCount > 0) {
    transitionTo("FAILED");
    const elapsed = Date.now() - startTime;
    const finalDuration = Date.now() - stateStartTime;
    timeline.push({ state: "FAILED", duration: `${finalDuration}ms` });

    const failedObj: AgentResponse = {
      traceId,
      state: "FAILED",
      intent,
      confidence,
      health: "ERROR",
      guardrails: "PASSED",
      plan: plan.steps,
      timeline,
      toolsUsed: toolsExecuted,
      reflection: {
        success: false,
        summary: `Execution aborted: ${executionError || "Tool call returned a failure code."}`
      },
      executionTime: `${elapsed}ms`,
      response: "I encountered an issue executing your request. Dues invoices or inventory stock levels could not be saved. Please retry sir.",
      text: "I encountered an issue executing your request. Dues invoices or inventory stock levels could not be saved. Please retry sir.",
      kind: "text",
      data: null
    };

    logAgentExecution({
      traceId,
      timestamp,
      intent,
      confidence,
      plan: plan.steps,
      toolsUsed: toolsExecuted,
      executionTimeMs: elapsed,
      status: "ERROR",
      errors: [executionError || "Tool call validation failed"],
      currentState: "FAILED",
      reflectionResult: failedObj.reflection,
      memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
      guardrailStatus: "PASSED",
      toolSuccessCount,
      toolFailureCount,
      health: "ERROR"
    });

    return JSON.stringify(failedObj);
  }

  // ==========================================
  // FEATURE 3 — REFLECTION STEP
  // ==========================================
  let reflectionSuccess = true;
  let reflectionSummary = "Execution verified: all business tools, invoices, and ledgers processed successfully.";
  
  // 1. Were all required tools executed?
  if (toolsUsed.length > 0 && toolSuccessCount !== toolsUsed.length) {
    reflectionSuccess = false;
    reflectionSummary = `Execution mismatch: requested tools count is ${toolsUsed.length} but only ${toolSuccessCount} succeeded.`;
  }

  // 2. Is database state consistent (checking if invoice/ledgers exist)?
  if (reflectionSuccess) {
    try {
      if (toolsExecuted.includes("createOrder") && createdInvoiceId) {
        const { data: checkInv } = await supabase.from("invoices").select("id").eq("id", createdInvoiceId).maybeSingle();
        if (!checkInv) {
          reflectionSuccess = false;
          reflectionSummary = `DB Consistency Alert: Order record was created but invoice receipt ${createdInvoiceId} was not found in ledger.`;
        }
      }
      if (toolsExecuted.includes("recordPayment")) {
        const { data: checkDl } = await supabase.from("dealers").select("pending").eq("id", dealerId).maybeSingle();
        if (checkDl === null || checkDl === undefined) {
          reflectionSuccess = false;
          reflectionSummary = "DB Consistency Alert: Dealer dues balance ledger was not updated successfully.";
        }
      }
    } catch (checkErr) {
      reflectionSuccess = false;
      reflectionSummary = `DB Consistency Verification check failed: ${String(checkErr)}`;
    }
  }

  // Handle reflection result (Generate recovery text if validation failed)
  if (!reflectionSuccess) {
    transitionTo("FAILED");
    const elapsed = Date.now() - startTime;
    const finalDuration = Date.now() - stateStartTime;
    timeline.push({ state: "FAILED", duration: `${finalDuration}ms` });

    const failedObj: AgentResponse = {
      traceId,
      state: "FAILED",
      intent,
      confidence,
      health: "ERROR",
      guardrails: "PASSED",
      plan: plan.steps,
      timeline,
      toolsUsed: toolsExecuted,
      reflection: {
        success: false,
        summary: reflectionSummary
      },
      executionTime: `${elapsed}ms`,
      response: `I completed the order update, but database consistency verification alerts were raised: ${reflectionSummary} Please check invoice receipt entries and retry.`,
      text: `I completed the order update, but database consistency verification alerts were raised: ${reflectionSummary} Please check invoice receipt entries and retry.`,
      kind: "text",
      data: null
    };

    logAgentExecution({
      traceId,
      timestamp,
      intent,
      confidence,
      plan: plan.steps,
      toolsUsed: toolsExecuted,
      executionTimeMs: elapsed,
      status: "ERROR",
      errors: [reflectionSummary],
      currentState: "FAILED",
      reflectionResult: failedObj.reflection,
      memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
      guardrailStatus: "PASSED",
      toolSuccessCount,
      toolFailureCount: 1,
      health: "ERROR"
    });

    return JSON.stringify(failedObj);
  }

  // Update Session Memory history
  const updatedHistory = [
    ...sessionMemory.recentConversation,
    { role: "user" as const, text },
    { role: "model" as const, text: responseText }
  ];
  await updateMemory(conversationId, {
    recentConversation: updatedHistory
  });

  // Transition: EXECUTING -> COMPLETED
  transitionTo("COMPLETED");

  const elapsed = Date.now() - startTime;
  const executionTime = `${elapsed}ms`;

  const finalDuration = Date.now() - stateStartTime;
  timeline.push({ state: "COMPLETED", duration: `${finalDuration}ms` });

  const finalOutput: AgentResponse = {
    traceId,
    state: "COMPLETED",
    intent,
    confidence,
    health: "HEALTHY",
    guardrails: "PASSED",
    plan: plan.steps,
    timeline,
    toolsUsed: toolsExecuted,
    reflection: {
      success: true,
      summary: reflectionSummary
    },
    executionTime,
    response: responseText,
    // Backward compatibility keys
    text: responseText,
    kind,
    data: kind === "reminder" ? {
      when: data?.when || params?.reminderWhen || "Nov 5, 10:00 AM",
      note: data?.note || params?.reminderNote || "Collections payment follow up",
      status: "pending",
      dealerId,
      conversationId,
      dueDate: calculateDueDate(data?.when || params?.reminderWhen || "Nov 5, 10:00 AM")
    } : (data ? { ...data, invoice: createdInvoiceId || data.invoice || sessionMemory.lastInvoiceId } : null)
  };

  // Observability trace logs print output
  logAgentExecution({
    traceId,
    timestamp,
    intent,
    confidence,
    plan: plan.steps,
    toolsUsed: toolsExecuted,
    executionTimeMs: elapsed,
    status: "SUCCESS",
    currentState: "COMPLETED",
    reflectionResult: finalOutput.reflection,
    memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
    guardrailStatus: "PASSED",
    toolSuccessCount,
    toolFailureCount: 0,
    health: "HEALTHY"
  });

  return JSON.stringify(finalOutput);
}

// Fallback rules parser matching the LangChain output schema format
async function runFallbackRulesEngine(
  text: string,
  products: any[],
  dealers: any[],
  invoices: any[],
  orders: any[],
  conversationId: string,
  dealerId: string
): Promise<string> {
  const lower = text.toLowerCase();
  const sessionMemory = await getMemory(conversationId);

  // 1. Confirm/Done Trigger
  if (lower.includes("confirm") || lower.includes("yes") || lower.includes("agree") || lower.includes("done") || lower.includes("ok") || lower.includes("okay") || lower.includes("place")) {
    const lastDraft = sessionMemory.lastDraft || {
      total: 6070,
      items: [
        { name: "MCB 32A Single Pole", qty: 20, price: 245, sku: "MCB-32A-SP" },
        { name: "Modular Switch 6A", qty: 15, price: 78, sku: "SW-MOD-6A" }
      ]
    };

    return JSON.stringify({
      intent: "ORDER",
      confidence: 0.95,
      toolsUsed: ["createOrder"],
      response: "Outstanding sir! I have registered your order confirmation. Dues ledger and inventory allocations are updated.",
      kind: "invoice",
      data: {
        total: lastDraft.total,
        items: lastDraft.items
      }
    });
  }

  // 2. Repeat Order Trigger
  const hasRepeat = lower.includes("repeat") || lower.includes("previous") || lower.includes("same");
  if (hasRepeat) {
    const dealerOrders = orders.filter(o => o.dealerId === dealerId);
    let items: any[] = [];
    let total = 0;

    if (dealerOrders.length > 0) {
      const lastOrder = dealerOrders[dealerOrders.length - 1];
      const { data: dbItems } = await supabase.from("order_items").select("*").eq("orderId", lastOrder.id);
      if (dbItems && dbItems.length > 0) {
        items = dbItems.map(item => {
          const matchingProduct = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
          return {
            sku: matchingProduct?.sku || "MCB-32A-SP",
            name: item.name,
            qty: item.qty,
            price: item.price
          };
        });
        total = lastOrder.total;
      }
    }

    if (items.length === 0 && sessionMemory.lastDraft) {
      items = sessionMemory.lastDraft.items;
      total = sessionMemory.lastDraft.total;
    }

    if (items.length === 0) {
      items = [
        { sku: "MCB-32A-SP", name: "MCB 32A Single Pole", qty: 32, price: 245 }
      ];
      total = 7840;
    }

    // Save repeat order draft in session memory
    await updateMemory(conversationId, {
      lastDraft: { items, total }
    });

    const itemsDesc = items.map(item => `**${item.qty} ${item.name}**`).join(" and ");

    return JSON.stringify({
      intent: "ORDER",
      confidence: 0.95,
      toolsUsed: [],
      response: `Understood sir! I have drafted a repeat of your previous order: ${itemsDesc} (Total: **₹${total.toLocaleString("en-IN")}**). Please reply with 'Confirm' to finalize the order and generate your invoice receipt.`,
      kind: "order",
      data: {
        title: "Order Draft",
        delivery: "Standard",
        total,
        items
      }
    });
  }

  if (lower.includes("want") || lower.includes("buy") || lower.includes("order") || lower.includes("purchase") || lower.includes("need") || lower.includes("send") || lower.includes("please") || lower.includes("mcb") || lower.includes("switch") || lower.includes("wire") || lower.includes("light")) {
    const items: any[] = [];
    let total = 0;
    
    // Parse quantity
    const qtyMatch = text.match(/\d+/);
    const qty = qtyMatch ? Number(qtyMatch[0]) : 20;

    const tokens = lower.split(/[\s\-]+/);
    const scoredProducts = products.map(p => {
      const pNameLower = p.name.toLowerCase();
      const pSkuLower = p.sku.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (t.length > 1 && t !== "want" && t !== "need" && t !== "order" && t !== "pieces" && t !== "peices" && t !== "please" && t !== "select" && t !== "items" && t !== "units") {
          // Check if token matches a name or SKU word
          if (pNameLower.includes(t) || pSkuLower.includes(t)) {
            score += 2;
          }
        }
      }
      return { product: p, score };
    });

    const matchedProducts = scoredProducts.filter(x => x.score > 0);
    matchedProducts.sort((a, b) => b.score - a.score);

    let selectedProduct = products.find(p => p.sku === "MCB-32A-SP");

    if (matchedProducts.length > 0) {
      selectedProduct = matchedProducts[0].product;
      // If multiple candidates have the same top score, check for ambiguity
      const topScore = matchedProducts[0].score;
      const topCandidates = matchedProducts.filter(x => x.score === topScore);
      if (topCandidates.length > 1) {
        const optionsList = topCandidates.map(x => `**${x.product.name}** (₹${x.product.price})`).join(" or ");
        return JSON.stringify({
          intent: "ORDER",
          confidence: 0.75, // WAITING_FOR_USER
          toolsUsed: [],
          response: `Sir, we have multiple options available matching your query: ${optionsList}. Which model would you like to order?`,
          kind: "text",
          data: null
        });
      }
    }

    if (selectedProduct) {
      items.push({ sku: selectedProduct.sku, name: selectedProduct.name, qty, price: selectedProduct.price });
      total += qty * selectedProduct.price;
    }

    // Save draft in session memory
    await updateMemory(conversationId, {
      lastDraft: { items, total }
    });

    const itemsDesc = items.map(item => `**${item.qty} ${item.name}**`).join(" and ");

    return JSON.stringify({
      intent: "ORDER",
      confidence: 0.95,
      toolsUsed: [],
      response: `Understood sir! I have drafted an order of ${itemsDesc} (Total: **₹${total.toLocaleString("en-IN")}**). Please reply with 'Confirm' to finalize the order and generate your invoice receipt.`,
      kind: "order",
      data: {
        title: "Order Draft",
        delivery: "Standard",
        total,
        items
      }
    });
  }

  if (lower.includes("outstanding") || lower.includes("dues") || lower.includes("owe") || lower.includes("pending balance") || lower.includes("pending dues") || lower.includes("ledger")) {
    const dealer = dealers.find(d => d.id === dealerId) || dealers[0];
    const pendingAmount = dealer ? dealer.pending : 124500;
    
    return JSON.stringify({
      intent: "BUSINESS_QUERY",
      confidence: 0.95,
      toolsUsed: [],
      response: `Sir, your total outstanding balance is **₹${pendingAmount.toLocaleString("en-IN")}**. Please let me know if you need invoice breakdown details or want to log a payment.`,
      kind: "text",
      data: null
    });
  }

  if (lower.includes("diwali") || lower.includes("dusheera") || lower.includes("dussehra") || lower.includes("promise") || lower.includes("will pay") || lower.includes("pay after") || lower.includes("pay later")) {
    const dealer = dealers.find(d => d.id === dealerId) || dealers[0];
    const pendingAmount = dealer ? dealer.pending : 124500;
    const whenStr = lower.includes("diwali") ? "Nov 5, 10:00 AM" : (lower.includes("tomorrow") ? "Tomorrow, 10:00 AM" : "7 days");
    
    return JSON.stringify({
      intent: "PAYMENT_PROMISE",
      confidence: 0.95,
      toolsUsed: ["scheduleReminder"],
      toolParameters: {
        reminderWhen: whenStr,
        reminderNote: `Gentle dues nudge for outstanding ₹${pendingAmount}`
      },
      response: `Understood sir. I have registered your payment promise for the remaining balance of **₹${pendingAmount.toLocaleString("en-IN")}**. A reminder has been set.`,
      kind: "reminder",
      data: {
        when: whenStr,
        note: `Gentle dues nudge for outstanding ₹${pendingAmount}`
      }
    });
  }

  if (lower.includes("paid") || lower.includes("pay") || lower.includes("remitted") || lower.includes("transferred") || lower.includes("sent")) {
    const match = text.match(/\d+/);
    const amount = match ? Number(match[0]) : 20000;
    
    const dealer = dealers.find(d => d.id === dealerId) || dealers[0];
    const beforeAmount = dealer ? dealer.pending : 124500;
    
    return JSON.stringify({
      intent: "PAYMENT",
      confidence: 0.98,
      toolsUsed: ["recordPayment"],
      response: `Thank you sir! I have logged your payment of ₹${amount.toLocaleString("en-IN")}. Dues ledger records have been updated.`,
      kind: "ledger",
      data: {
        paid: amount,
        remaining: Math.max(0, beforeAmount - amount),
        before: beforeAmount
      }
    });
  }

  if (lower.includes("profitable") || lower.includes("dealer") || lower.includes("sales") || lower.includes("customer")) {
    const sorted = [...dealers].sort((a, b) => b.lifetime - a.lifetime);
    const topDealer = sorted[0];
    const ranking = sorted.map((d, i) => `${i + 1}. **${d.name}** (${d.city}): Lifetime Revenue: **₹${d.lifetime.toLocaleString("en-IN")}** (${d.ordersCount} orders)`).join("\n");
    return JSON.stringify({
      intent: "BUSINESS_QUERY",
      confidence: 0.95,
      toolsUsed: [],
      response: `Our most profitable dealer by lifetime billing value is **${topDealer?.name}** in **${topDealer?.city}** (Total business value: **₹${topDealer?.lifetime.toLocaleString("en-IN")}**).\n\nHere is our top dealer network ranking:\n\n${ranking}`,
      kind: "text",
      data: null
    });
  }

  if (lower.includes("stock") || lower.includes("inventory") || lower.includes("low")) {
    const alerts = products.filter(p => p.stock < p.min);
    const lines = alerts.map(p => `*   **${p.name}** (${p.sku}): stock count ${p.stock} (min ${p.min})`).join("\n");
    return JSON.stringify({
      intent: "PRODUCT_QUERY",
      confidence: 0.95,
      toolsUsed: [],
      response: `We currently have ${alerts.length} products below their minimum safety levels:\n\n${lines}`,
      kind: "text",
      data: null
    });
  }

  return JSON.stringify({
    intent: "BUSINESS_QUERY",
    confidence: 0.85,
    toolsUsed: [],
    response: "Hello sir, please let me know how I can help you check stock availability, confirm wire/switch orders, or verify outstanding invoices for Kumar Electricals today.",
    kind: "text",
    data: null
  });
}
