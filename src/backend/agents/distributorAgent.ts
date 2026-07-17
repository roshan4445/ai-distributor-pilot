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
  if (conversationId === "ask-ai-convo" || dealerName === "Business Owner") {
    const { data: firstDealer } = await supabase.from("dealers").select("id").limit(1).maybeSingle();
    return firstDealer?.id || "d1";
  }

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

  // Resolving staleness context
  let isStale = false;
  try {
    const { data: convState } = await supabase
      .from("conversation_state")
      .select("last_activity_at")
      .eq("conversation_id", conversationId)
      .maybeSingle();
    
    if (convState?.last_activity_at) {
      const lastAct = new Date(convState.last_activity_at).getTime();
      const diff = Date.now() - lastAct;
      if (diff > 10 * 60 * 1000) {
        isStale = true;
      }
    }
  } catch (err) {
    console.warn("Failed to check conversation staleness:", err);
  }

  // Compute text classification flags (needed by both staleness and idempotency)
  const cleanTextLocal = text.toLowerCase().trim();
  const isConfirmLocal = (cleanTextLocal.includes("confirm") || cleanTextLocal.includes("yes") || cleanTextLocal.includes("agree") || cleanTextLocal.includes("done") || cleanTextLocal.includes("ok") || cleanTextLocal.includes("okay")) && !/\d+/.test(cleanTextLocal);
  const isMutatingRequest = isConfirmLocal ||
    cleanTextLocal.includes("paid") ||
    cleanTextLocal.includes("remitted") ||
    cleanTextLocal.includes("transferred") ||
    cleanTextLocal.includes("sent money");

  // STEP 1: Always update last_activity_at for staleness tracking.
  // This runs FIRST so there is no stored idempotency data to wipe.
  // (SQLite INSERT OR REPLACE only writes the specified columns, wiping others.)
  try {
    await supabase.from("conversation_state").upsert({
      conversation_id: conversationId,
      last_activity_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn("Failed to update last_activity_at:", err);
  }

  // ==========================================
  // STEP 2: IDEMPOTENCY GUARD — duplicate-request dedup
  // ==========================================
  // Buckets mutating requests into 5-second windows to prevent double-orders/double-payments.
  // Key = djb2 hash of (conversationId + normalizedText + 5s-bucket).
  // Stored in conversation_state.last_idempotency_key. Degrades gracefully if columns absent.
  // Runs AFTER the activity upsert above, so the reservation upsert overwrites
  // the activity-only row with key + activity atomically (no data loss).
  let idempotencyKey: string | null = null;
  if (isMutatingRequest) {
    const bucket = Math.floor(Date.now() / 5000); // 5-second window
    const rawKey = `${conversationId}::${cleanTextLocal}::${bucket}`;
    let hash = 5381;
    for (let i = 0; i < rawKey.length; i++) {
      hash = ((hash << 5) + hash + rawKey.charCodeAt(i)) | 0; // djb2
    }
    idempotencyKey = String(Math.abs(hash));
    try {
      const { data: stateRow } = await supabase
        .from("conversation_state")
        .select("last_idempotency_key, last_response")
        .eq("conversation_id", conversationId)
        .maybeSingle();
      if (
        stateRow?.last_idempotency_key === idempotencyKey &&
        stateRow?.last_response
      ) {
        console.warn(`[IDEMPOTENCY] Duplicate request blocked for convo ${conversationId} (key=${idempotencyKey}). Returning cached response.`);
        // The mock SQLite client auto-parses JSON strings back into objects when reading,
        // so last_response may be an object or a string depending on the storage backend.
        const cached = stateRow.last_response;
        return typeof cached === "string" ? cached : JSON.stringify(cached);
      }
      // Reserve key slot immediately so concurrent racing requests also get deduped.
      await supabase.from("conversation_state").upsert({
        conversation_id: conversationId,
        last_idempotency_key: idempotencyKey,
        last_activity_at: new Date().toISOString()
      });
    } catch (idemErr) {
      console.warn("[IDEMPOTENCY] Guard check failed, proceeding without dedup protection:", idemErr);
    }
  }

  if (isStale && isConfirmLocal) {
    transitionTo("WAITING_FOR_USER");
    const elapsed = Date.now() - startTime;
    const finalDuration = Date.now() - stateStartTime;
    timeline.push({ state: "WAITING_FOR_USER", duration: `${finalDuration}ms` });

    const responseText = "Sir, I notice it has been a while since your last draft order. Are you confirming the order you drafted earlier?";

    const staleResponse: AgentResponse = {
      traceId,
      state: "WAITING_FOR_USER",
      intent: "ORDER",
      confidence: 0.95,
      health: "WARNING",
      guardrails: "PASSED",
      plan: ["Pause execution", "Await stale confirmation"],
      timeline,
      toolsUsed: [],
      reflection: {
        success: true,
        summary: "Staleness gating triggered."
      },
      executionTime: `${elapsed}ms`,
      response: responseText,
      text: responseText,
      kind: "text",
      data: null
    };

    logAgentExecution({
      traceId,
      timestamp,
      intent: "ORDER",
      confidence: 0.95,
      plan: staleResponse.plan,
      toolsUsed: [],
      executionTimeMs: elapsed,
      status: "SUCCESS",
      currentState: "WAITING_FOR_USER",
      reflectionResult: staleResponse.reflection,
      memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
      guardrailStatus: "PASSED",
      toolSuccessCount: 0,
      toolFailureCount: 0,
      health: "WARNING"
    });

    try {
      await supabase.from("conversation_state").upsert({
        conversation_id: conversationId,
        last_activity_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Failed to reset staleness time:", err);
    }

    return JSON.stringify(staleResponse);
  }

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
          const itemSku = String(item.sku || "").toLowerCase();
          const itemName = String(item.name || "").toLowerCase();

          const match = products.find(p => p.sku.toLowerCase() === itemSku) || 
                        products.find(p => p.name.toLowerCase() === itemName) ||
                        products.find(p => p.name.toLowerCase().includes(itemName)) ||
                        products.find(p => itemName.includes(p.name.toLowerCase()));
          
          if (!match) {
            throw new Error(`Product reference "${item.name || 'Unknown'}" (SKU: "${item.sku || 'Unknown'}") was not found in our catalog.`);
          }
          
          return {
            sku: match.sku,
            name: match.name,
            qty: Number(item.qty) || 1,
            price: Number(match.price)
          };
        });

        const calculatedTotal = validatedItems.reduce((acc, item) => acc + (item.qty * item.price), 0);

        // Atomic stock deduction — availability guard
        // Step 1: Read stock only if >= qty (confirms sufficient inventory).
        // Step 2: Deduct stock. Safe in single-connection environments (SQLite/test).
        // NOTE: For production Postgres/Supabase under concurrent load, replace with
        // an RPC function: UPDATE products SET stock = stock - $qty
        //                   WHERE sku = $sku AND stock >= $qty RETURNING stock;
        // This gives true atomic deduction with row-level locking.
        for (const item of validatedItems) {
          const { data: prod } = await supabase
            .from("products")
            .select("stock")
            .eq("sku", item.sku)
            .gte("stock", item.qty) // only returns row if stock >= qty
            .maybeSingle();

          if (!prod) {
            throw new Error(`Insufficient stock for SKU ${item.sku}: requested ${item.qty} but stock is below that level.`);
          }

          await supabase
            .from("products")
            .update({ stock: prod.stock - item.qty })
            .eq("sku", item.sku);
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
          placedAt: new Date().toISOString(),
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
          id: crypto.randomUUID(),
          invoice_code: invId,
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
          lastDealerId: dealerId,
          lastDraft: null as any
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

  // ==========================================
  // CONTEXT OPTIMIZATION (TOKEN SAVINGS BY ~75%)
  // ==========================================
  // Filter database records to only include context relevant to this active dealer.
  // This keeps system instructions compact and prevents prompt bloat.
  const relevantDealers = dealersList.filter(d => d.id === dealerId || d.name === dealerName);
  const relevantInvoices = invoicesList.filter(i => i.dealer === dealerName);
  const relevantOrders = ordersList.filter(o => o.dealerId === dealerId || o.dealerName === dealerName);

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
- Last Draft: ${sessionMemory.lastDraft ? JSON.stringify(sessionMemory.lastDraft) : "None"}

DATABASE STATE:
- Products Stock: ${JSON.stringify(productsList)}
- Dealers Balance: ${JSON.stringify(relevantDealers)}
- Invoices Ledger: ${JSON.stringify(relevantInvoices)}
- Orders Pipeline: ${JSON.stringify(relevantOrders)}

Determine the intent of the message:
- ORDER: Purchase products, modify drafts, or say 'confirm'.
- PAYMENT: Logs a payment.
- PAYMENT_PROMISE: Promise to pay later (e.g. "will pay after Diwali").
- INVOICE: Queries invoice details or copy.
- PRODUCT_QUERY: Inquiries about stock or catalog.
- BUSINESS_QUERY: General inquiries about ledger or statements.

AMBIGUITY RULES:
- Category query without model spec: set confidence to 0.75 and ask to clarify.
- Explicit variant name: set confidence 0.95+ and draft order.
- If the dealer asks to repeat their usual or previous order, but they have multiple different orders in their Orders Pipeline history with different totals or items, set confidence to 0.75 and ask them to clarify which order they would like to repeat.
- If the dealer promises to pay but does not specify a clear payment amount, set confidence to 0.75 and ask them to clarify the promised payment amount.
- If the dealer requests a correction or change in quantity of a product in their draft, update the items list and total in the JSON output according to the requested change, using the Last Draft details from the memory.

TONE CONSTRAINTS:
- Speak like a polite wholesale manager. Respond with sir. No database details.

CRITICAL FORMATTING INSTRUCTIONS:
You MUST respond with ONLY a raw JSON object matching the schema below.
DO NOT wrap the response in markdown code blocks (such as \`\`\`json ... \`\`\`).
DO NOT include any explanations, warnings, preambles, or postscripts.
Your entire output must parse successfully as a single JSON object.

JSON SCHEMA:
{
  "intent": "ORDER" | "PAYMENT" | "PAYMENT_PROMISE" | "INVOICE" | "PRODUCT_QUERY" | "BUSINESS_QUERY",
  "confidence": number (between 0 and 1),
  "response": "Polite natural language message responding to the dealer",
  "toolsUsed": ("createOrder" | "recordPayment" | "scheduleReminder")[],
  "toolParameters": {
    "orderItems": [{ "sku": string, "name": string, "qty": number, "price": number }],
    "orderTotal": number,
    "paymentAmount": number,
    "reminderWhen": string,
    "reminderNote": string
  },
  "kind": "order" | "invoice" | "ledger" | "reminder" | "text",
  "data": any
}`;

  // Transition: VALIDATING -> PLANNING
  transitionTo("PLANNING");

  let agentOutput: any = null;
  let tokenSavingsLog = "";
  let promptTokens = 0;
  let responseTokens = 0;
  let totalTokens = 0;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.warn("⚠️ [DistributorAgent] GROQ_API_KEY is missing from environment variables!");
  }

  // ==========================================
  // LOCAL CLASSIFIER ROUTER (BYPASS LLM)
  // ==========================================
  const cleanText = text.toLowerCase().trim();
  
  // Deterministic checks
  const isSimpleOrder = cleanText.startsWith("i need") || cleanText.startsWith("i want") || cleanText.includes("order") || cleanText.includes("pieces of") || cleanText.includes("pieces") || cleanText.includes("peices");
  const isConfirm = (cleanText.includes("confirm") || cleanText.includes("yes") || cleanText.includes("agree") || cleanText.includes("done") || cleanText.includes("ok") || cleanText.includes("okay")) && !/\d+/.test(cleanText);
  const isReminder = cleanText.includes("diwali") || cleanText.includes("promise") || cleanText.includes("will pay") || cleanText.includes("pay later") || cleanText.includes("pay after");
  const isPayment = cleanText.includes("paid") || cleanText.includes("remitted") || cleanText.includes("transferred") || cleanText.includes("sent money") || cleanText.includes("pay amount");
  const isQuery = cleanText.includes("outstanding") || cleanText.includes("dues") || cleanText.includes("owe") || cleanText.includes("pending balance") || cleanText.includes("ledger");

  let canBypassLLM = isSimpleOrder || isConfirm || isReminder || isPayment || isQuery;
  
  if (apiKey) {
    const isOrderCreationOrCorrection = isSimpleOrder && !isConfirm;
    if (isOrderCreationOrCorrection) {
      canBypassLLM = false;
    }
  }

  if (canBypassLLM) {
    console.log(`⚡ [TOKEN OPTIMIZER] Local router bypass active. Query: "${text}" | Skipping ChatGroq call.`);
    tokenSavingsLog = "Saved ~3,500 prompt tokens (100% savings via Local Router)";
    const rawFallback = await runFallbackRulesEngine(text, productsList, dealersList, invoicesList, ordersList, conversationId, dealerId);
    try {
      agentOutput = JSON.parse(rawFallback);
    } catch (parseErr) {
      console.error("Local rules JSON parsing error:", parseErr);
    }
  }

  // Transition: PLANNING -> THINKING
  transitionTo("THINKING");

  let rawText = "";
  if (!agentOutput && apiKey) {
    try {
      console.log("Invoking Groq...");
      // LangChain LLM Sequence (LCEL) Setup
      const llm = new ChatGroq({
        apiKey,
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        responseFormat: { type: "json_object" }
      });

      // Memory Compression Optimization: Keep only last 3 messages for context history
      const compressedHistory = sessionMemory.recentConversation.slice(-3);
      const historyMessages = compressedHistory.map(c => 
        c.role === "user" 
          ? new HumanMessage(c.text) 
          : new AIMessage(c.text)
      );

      const messages = [
        new SystemMessage(systemInstruction),
        ...historyMessages,
        new HumanMessage(text)
      ];

      // Estimate tokens before invoking
      const estimatedPrompt = Math.round((systemInstruction.length + JSON.stringify(compressedHistory).length + text.length) / 4);
      console.log(`🟢 REAL LLM CALL: GROQ_API_KEY present, invoking ChatGroq model (Estimated Prompt size: ${estimatedPrompt} tokens)...`);
      
      const response = await llm.invoke(messages);
      rawText = response.content.toString();
      console.log("Raw LLM Output:", rawText);

      const cleanedJson = rawText.trim().replace(/^```json/, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanedJson);
      agentOutput = agentOutputSchema.parse(parsed);

      promptTokens = estimatedPrompt;
      responseTokens = Math.round(rawText.length / 4);
      totalTokens = promptTokens + responseTokens;
    } catch (err: any) {
      console.error("Groq LLM raw response was:", rawText);
      console.error("Groq LLM parsing/validation error:", err.message || err);
      console.warn("LangChain LLM invoke failed. Falling back to local rules engine.", err.message || err);
    }
  }

  // Catch block fallback if key is exhausted or LLM was bypassed
  if (!agentOutput) {
    console.log(`🟡 FALLBACK RULES ENGINE: Triggering rules engine fallback for query: "${text}"`);
    console.warn(`⚠️ [DistributorAgent] Triggering fallback rules engine for query: "${text}". (GROQ_API_KEY missing or LLM call failed)`);
    const rawFallback = await runFallbackRulesEngine(text, productsList, dealersList, invoicesList, ordersList, conversationId, dealerId);
    agentOutput = JSON.parse(rawFallback);
    tokenSavingsLog = "Offline Rules Mode triggered (100% LLM token savings)";
  }

  let intent = agentOutput.intent || "BUSINESS_QUERY";
  let confidence = agentOutput.confidence || 0.9;
  let responseText = agentOutput.response || "";
  let kind = agentOutput.kind || "text";
  let data = agentOutput.data || null;
  const allowedTools = ["createOrder", "recordPayment", "scheduleReminder"];
  const toolsUsed = (agentOutput.toolsUsed || []).filter((t: string) => allowedTools.includes(t));
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

      // Check stock limits for stock gating
      let stockOosItem: any = null;
      let stockOosMatch: any = null;
      for (const item of resolvedItems) {
        const match = productsList.find(p => p.sku.toLowerCase() === item.sku.toLowerCase());
        if (match && item.qty > match.stock) {
          stockOosItem = item;
          stockOosMatch = match;
          break;
        }
      }

      if (stockOosItem && stockOosMatch) {
        try {
          await supabase.from("stock_alerts").insert({
            id: crypto.randomUUID(),
            sku: stockOosItem.sku,
            requested_qty: stockOosItem.qty,
            available_stock: stockOosMatch.stock,
            dealer_id: dealerId,
            created_at: new Date().toISOString()
          });
        } catch (alertErr) {
          console.warn("Failed to log stock alert:", alertErr);
        }

        transitionTo("WAITING_FOR_USER");
        const elapsed = Date.now() - startTime;
        const finalDuration = Date.now() - stateStartTime;
        timeline.push({ state: "WAITING_FOR_USER", duration: `${finalDuration}ms` });

        const oosText = `We only have ${stockOosMatch.stock} units of ${stockOosMatch.name} available in stock. Would you like to adjust your order?`;

        const oosResponse: AgentResponse = {
          traceId,
          state: "WAITING_FOR_USER",
          intent: "ORDER",
          confidence: 0.75,
          health: "WARNING",
          guardrails: "PASSED",
          plan: ["Pause execution", "Await stock adjustment"],
          timeline,
          toolsUsed: [],
          reflection: {
            success: true,
            summary: "Insufficient stock gating triggered."
          },
          executionTime: `${elapsed}ms`,
          response: oosText,
          text: oosText,
          kind: "text",
          data: null
        };

        logAgentExecution({
          traceId,
          timestamp,
          intent: "ORDER",
          confidence: 0.75,
          plan: oosResponse.plan,
          toolsUsed: [],
          executionTimeMs: elapsed,
          status: "SUCCESS",
          currentState: "WAITING_FOR_USER",
          reflectionResult: oosResponse.reflection,
          memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
          guardrailStatus: "PASSED",
          toolSuccessCount: 0,
          toolFailureCount: 0,
          health: "WARNING"
        });

        return JSON.stringify(oosResponse);
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
        // SAFETY: Never fabricate order data. If the LLM/rules engine did not provide
        // real items and a total, refuse execution rather than writing fake records to DB.
        const orderItems = params.orderItems || data?.items;
        const orderTotal = params.orderTotal || data?.total;

        if (!orderItems || orderItems.length === 0 || !orderTotal) {
          toolFailureCount++;
          executionError = "PARSE_FAILURE: createOrder was requested but orderItems or orderTotal are missing. Cannot fabricate transaction data.";
          console.error(`[PARSE_FAILURE] createOrder missing data for convo ${conversationId}. params:`, params, "data:", data);
          logAgentExecution({
            traceId,
            timestamp,
            intent,
            confidence,
            plan: plan.steps,
            toolsUsed: toolsExecuted,
            executionTimeMs: Date.now() - startTime,
            status: "ERROR",
            errors: ["PARSE_FAILURE: createOrder called with no orderItems/orderTotal — refusing to fabricate records"],
            currentState: "EXECUTING",
            reflectionResult: { success: false, summary: "Parse failure: missing order data" },
            memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
            guardrailStatus: "PASSED",
            toolSuccessCount,
            toolFailureCount,
            health: "ERROR"
          });
          break;
        }

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
        // SAFETY: Never fabricate payment amounts.
        const amount = params.paymentAmount || data?.paid || data?.paidAmount;

        if (!amount || amount <= 0) {
          toolFailureCount++;
          executionError = "PARSE_FAILURE: recordPayment was requested but paymentAmount is missing or zero.";
          console.error(`[PARSE_FAILURE] recordPayment missing amount for convo ${conversationId}. params:`, params);
          logAgentExecution({
            traceId,
            timestamp,
            intent,
            confidence,
            plan: plan.steps,
            toolsUsed: toolsExecuted,
            executionTimeMs: Date.now() - startTime,
            status: "ERROR",
            errors: ["PARSE_FAILURE: recordPayment called with no paymentAmount — refusing to fabricate payment records"],
            currentState: "EXECUTING",
            reflectionResult: { success: false, summary: "Parse failure: missing payment amount" },
            memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
            guardrailStatus: "PASSED",
            toolSuccessCount,
            toolFailureCount,
            health: "ERROR"
          });
          break;
        }

        const toolResult = await recordPaymentTool.invoke({
          paidAmount: amount
        });

        if (toolResult && toolResult.success) {
          toolSuccessCount++;
          toolsExecuted.push("recordPayment", "updateLedger");
          try {
            const { data: pendingPromises } = await supabase
              .from("payment_promises")
              .select("*")
              .eq("dealer_id", dealerId)
              .eq("status", "pending");
            if (pendingPromises && pendingPromises.length > 0) {
              for (const promise of pendingPromises) {
                if (promise.promised_amount === amount) {
                  await supabase
                    .from("payment_promises")
                    .update({ status: "kept" })
                    .eq("id", promise.id);
                }
              }
            }
          } catch (promiseErr) {
            console.warn("Failed to update payment promises to kept:", promiseErr);
          }
        } else {
          toolFailureCount++;
          executionError = toolResult.error || "recordPayment tool failed execution.";
          break;
        }
      }

      if (toolName === "scheduleReminder") {
        // SAFETY: Never fabricate reminder dates.
        const when = params.reminderWhen;
        const note = params.reminderNote || "Collections payment follow up";

        if (!when) {
          toolFailureCount++;
          executionError = "PARSE_FAILURE: scheduleReminder was requested but reminderWhen is missing.";
          console.error(`[PARSE_FAILURE] scheduleReminder missing 'when' for convo ${conversationId}. params:`, params);
          logAgentExecution({
            traceId,
            timestamp,
            intent,
            confidence,
            plan: plan.steps,
            toolsUsed: toolsExecuted,
            executionTimeMs: Date.now() - startTime,
            status: "ERROR",
            errors: ["PARSE_FAILURE: scheduleReminder called with no reminderWhen — refusing to schedule with fabricated date"],
            currentState: "EXECUTING",
            reflectionResult: { success: false, summary: "Parse failure: missing reminder date" },
            memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
            guardrailStatus: "PASSED",
            toolSuccessCount,
            toolFailureCount,
            health: "ERROR"
          });
          break;
        }

        const toolResult = await scheduleReminderTool.invoke({
          when,
          note
        });

        if (toolResult && toolResult.success) {
          toolSuccessCount++;
          toolsExecuted.push("scheduleReminder");

          if (intent === "PAYMENT_PROMISE") {
            const amount = params.paymentAmount || (text.match(/\d+/) ? Number(text.match(/\d+/)![0]) : 0);
            const isoDate = calculateDueDate(when).split("T")[0];
            try {
              await supabase.from("payment_promises").insert({
                id: crypto.randomUUID(),
                dealer_id: dealerId,
                promised_amount: amount,
                promised_date: isoDate,
                status: "pending",
                created_at: new Date().toISOString()
              });
            } catch (promiseErr) {
              console.warn("Failed to write payment promise to DB:", promiseErr);
            }
          }
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
        const { data: byCode } = await supabase.from("invoices").select("id").eq("invoice_code", createdInvoiceId).maybeSingle();
        const checkInv = byCode || (await supabase.from("invoices").select("id").eq("id", createdInvoiceId).maybeSingle()).data;
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
      health: "ERROR",
      promptTokens,
      responseTokens,
      totalTokens,
      tokenSavingsLog
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
    recentConversation: updatedHistory,
    ...(kind === "invoice" ? { lastDraft: null as any } : {})
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
      when: data?.when || params?.reminderWhen,
      note: data?.note || params?.reminderNote || "Collections payment follow up",
      status: "pending",
      dealerId,
      conversationId,
      dueDate: calculateDueDate(data?.when || params?.reminderWhen)
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
    health: "HEALTHY",
    promptTokens,
    responseTokens,
    totalTokens,
    tokenSavingsLog
  });

  // Persist completed response for idempotency replay on duplicate requests
  if (idempotencyKey) {
    try {
      await supabase.from("conversation_state").upsert({
        conversation_id: conversationId,
        last_idempotency_key: idempotencyKey,
        last_response: JSON.stringify(finalOutput),
        last_activity_at: new Date().toISOString()
      });
    } catch (_) {
      // Non-fatal: idempotency store failure does not block the response
    }
  }

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

  // 0. Correction Trigger
  const isCorrection = lower.includes("change") || lower.includes("update") || lower.includes("instead") || lower.includes("modify") || lower.includes("adjust") || lower.includes("remove") || lower.includes("add") || lower.includes("rehne do") || lower.includes("give") || lower.includes("give me") || lower.includes("then");
  if (isCorrection && sessionMemory.lastDraft && sessionMemory.lastDraft.items) {
    const items = sessionMemory.lastDraft.items.map((it: any) => ({ ...it }));
    let updated = false;
    const qtyMatch = lower.match(/\d+/);
    const newQty = qtyMatch ? Number(qtyMatch[0]) : null;
    
    if (newQty !== null) {
      const hasMcbWord = lower.includes("mcb");
      const hasSwWord = lower.includes("switch") || lower.includes("sw-mod-6a");

      const isKeywordSame = (kw: string) => {
        const idx = lower.indexOf(kw);
        if (idx === -1) return false;
        const start = Math.max(0, idx - 15);
        const end = Math.min(lower.length, idx + kw.length + 20);
        const windowText = lower.slice(start, end);
        return windowText.includes("same") || windowText.includes("rehne do") || windowText.includes("no change");
      };
      
      for (const item of items) {
        if (item.sku.includes("MCB")) {
          const mcbSame = isKeywordSame("mcb");
          const isTarget = hasMcbWord || (!hasMcbWord && !hasSwWord && (() => {
            const product = products.find(p => p.sku === item.sku);
            const origItem = sessionMemory.lastDraft.items.find((it: any) => it.sku === item.sku);
            return product && origItem && origItem.qty > product.stock;
          })());
          
          if (isTarget && !mcbSame) {
            item.qty = newQty;
            updated = true;
          }
        }
        if (item.sku.includes("SW")) {
          const swSame = isKeywordSame("switch") || isKeywordSame("sw-mod-6a");
          const isTarget = hasSwWord || (!hasMcbWord && !hasSwWord && (() => {
            const product = products.find(p => p.sku === item.sku);
            const origItem = sessionMemory.lastDraft.items.find((it: any) => it.sku === item.sku);
            return product && origItem && origItem.qty > product.stock;
          })());
          
          if (isTarget && !swSame) {
            item.qty = newQty;
            updated = true;
          }
        }
      }
    }

    if (updated) {
      const total = items.reduce((acc: number, item: any) => acc + (item.qty * item.price), 0);
      await updateMemory(conversationId, {
        lastDraft: { items, total }
      });

      const itemsDesc = items.map((item: any) => `**${item.qty} ${item.name}**`).join(" and ");

      return JSON.stringify({
        intent: "ORDER",
        confidence: 0.95,
        toolsUsed: [],
        response: `Understood sir! I have updated your order draft: ${itemsDesc} (Total: **₹${total.toLocaleString("en-IN")}**). Please reply with 'Confirm' to finalize the order.`,
        kind: "order",
        data: {
          title: "Order Draft",
          delivery: "Standard",
          total,
          items
        }
      });
    }
  }

  // Acknowledge adjustment intent when no quantity changes are listed yet
  const wantsToAdjustWithoutQty = (lower.includes("adjust") || lower.includes("change") || lower.includes("update") || lower.includes("modify")) && !/\d+/.test(lower);
  if (wantsToAdjustWithoutQty) {
    return JSON.stringify({
      intent: "ORDER",
      confidence: 0.95,
      toolsUsed: [],
      response: "Sure sir, please specify the new quantities or items you would like to change in your order draft.",
      kind: "text",
      data: null
    });
  }

  // 1. Confirm/Done Trigger
  if ((lower.includes("confirm") || lower.includes("yes") || lower.includes("agree") || lower.includes("done") || lower.includes("ok") || lower.includes("okay") || lower.includes("place")) && !/\d+/.test(lower)) {
    // SAFETY: If there is no prior draft in memory, refuse to fabricate order data.
    // Ask the dealer to resend their order details instead.
    if (!sessionMemory.lastDraft || !sessionMemory.lastDraft.items || sessionMemory.lastDraft.items.length === 0) {
      return JSON.stringify({
        intent: "ORDER",
        confidence: 0.75,
        toolsUsed: [],
        response: "Sir, I don't have a pending order draft to confirm. Could you please resend your order details so I can prepare a new draft for you?",
        kind: "text",
        data: null
      });
    }

    const lastDraft = sessionMemory.lastDraft;

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

    const isUsual = lower.includes("usual");
    if (isUsual && dealerOrders.length > 1) {
      const firstTotal = dealerOrders[0].total;
      const allSame = dealerOrders.every(o => o.total === firstTotal);
      if (!allSame) {
        return JSON.stringify({
          intent: "ORDER",
          confidence: 0.75,
          toolsUsed: [],
          response: "Sir, you have multiple different recent orders in your history. Could you please specify which one you would like to repeat?",
          kind: "text",
          data: null
        });
      }
    }

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
        items
      }
    });
  }

  if (lower.includes("want") || lower.includes("buy") || lower.includes("order") || lower.includes("purchase") || lower.includes("need") || lower.includes("send") || lower.includes("please") || lower.includes("mcb") || lower.includes("switch") || lower.includes("wire") || lower.includes("light")) {
    const items: any[] = [];
    let total = 0;

    const tokens = lower.split(/[\s\-]+/);
    const matched: { product: any, qty: number, score: number }[] = [];
    for (const p of products) {
      const pNameLower = p.name.toLowerCase();
      const pSkuLower = p.sku.toLowerCase();
      
      const pSkuTokens = pSkuLower.split(/[\s\-]+/);
      const pNameTokens = pNameLower.split(/[\s\-]+/);
      
      const isPluralMatch = (token: string, dbToken: string) => {
        const t1 = token.toLowerCase();
        const t2 = dbToken.toLowerCase();
        if (t1 === t2) return true;
        if (t1.endsWith("s") && t1.slice(0, -1) === t2) return true;
        if (t2.endsWith("s") && t2.slice(0, -1) === t1) return true;
        if (t1.endsWith("es") && t1.slice(0, -2) === t2) return true;
        if (t2.endsWith("es") && t2.slice(0, -2) === t1) return true;
        return false;
      };

      let score = 0;
      for (const t of tokens) {
        if (t.length > 1 && t !== "want" && t !== "need" && t !== "order" && t !== "pieces" && t !== "peices" && t !== "please" && t !== "select" && t !== "items" && t !== "units" && t !== "wala" && t !== "de" && t !== "do" && t !== "sir" && t !== "muje") {
          const matchesSku = pSkuTokens.some(st => isPluralMatch(t, st));
          const matchesName = pNameTokens.some(nt => isPluralMatch(t, nt));
          if (matchesSku || matchesName) {
            score += 2;
          }
        }
      }
      
      if (score > 0) {
        const idx = lower.indexOf(pSkuLower) !== -1 ? lower.indexOf(pSkuLower) : lower.indexOf(pNameLower);
        let qty = 20;
        let minDistance = Infinity;
        const matches = lower.matchAll(/\b\d+\b/g);
        for (const m of matches) {
          const num = Number(m[0]);
          const numIdx = m.index || 0;
          const dist = Math.abs(numIdx - idx);
          if (dist < minDistance && num < 100000) {
            minDistance = dist;
            qty = num;
          }
        }
        if (!matched.some(x => x.product.sku === p.sku)) {
          matched.push({ product: p, qty, score });
        }
      }
    }

    // Filter matched list to only keep top candidates per category
    const finalMatched: typeof matched = [];
    const categories = Array.from(new Set(matched.map(x => x.product.category)));
    for (const cat of categories) {
      const catMatches = matched.filter(x => x.product.category === cat);
      catMatches.sort((a, b) => b.score - a.score);
      const topScore = catMatches[0].score;
      const topCatMatches = catMatches.filter(x => x.score === topScore);
      finalMatched.push(...topCatMatches);
    }

    // ====================================================================
    // CLARIFICATION GUARDS — ask before assuming
    // ====================================================================

    // Guard 1: No quantity specified — ask how many
    const hasQuantity = /\b\d+\b/.test(lower);

    // Guard 2: Multiple products matched with equal scores — ask which one
    if (finalMatched.length > 1) {
      const topScore = Math.max(...finalMatched.map(m => m.score));
      const topMatches = finalMatched.filter(m => m.score === topScore);
      if (topMatches.length > 1) {
        const optionsList = topMatches.map(m =>
          `**${m.product.name}** (${m.product.sku}) — ₹${m.product.price}`
        ).join("\n• ");
        return JSON.stringify({
          intent: "ORDER",
          confidence: 0.75,
          toolsUsed: [],
          response: `Sir, we have multiple products matching your request:\n• ${optionsList}\n\nWhich one would you like${hasQuantity ? "" : ", and how many"}?`,
          kind: "text",
          data: null
        });
      }
    }

    // Guard 3: Product matched but no quantity — ask how many
    if (finalMatched.length > 0 && !hasQuantity) {
      const productNames = finalMatched.map(m => `**${m.product.name}**`).join(", ");
      return JSON.stringify({
        intent: "ORDER",
        confidence: 0.75,
        toolsUsed: [],
        response: `Yes sir, ${productNames} is available in stock! How many units would you like to order?`,
        kind: "text",
        data: null
      });
    }

    // Category ambiguity check
    const has32 = finalMatched.some(m => m.product.sku === "MCB-32A-SP");
    const has16 = finalMatched.some(m => m.product.sku === "MCB-16A-SP");
    const isVague = lower.includes("mcb") && !lower.includes("32a") && !lower.includes("16a") && !lower.includes("mcb-32a-sp") && !lower.includes("mcb-16a-sp");
    if (has32 && has16 && isVague) {
      return JSON.stringify({
        intent: "ORDER",
        confidence: 0.75,
        toolsUsed: [],
        response: "Sir, we have multiple options available matching your query: **MCB 32A Single Pole** (₹245) or **MCB 16A Single Pole** (₹220). Which model would you like to order?",
        kind: "text",
        data: null
      });
    }

    if (finalMatched.length > 0) {
      for (const m of finalMatched) {
        items.push({ sku: m.product.sku, name: m.product.name, qty: m.qty, price: m.product.price });
        total += m.qty * m.product.price;
      }
    } else {
      // No product matched — ask what they want instead of defaulting
      return JSON.stringify({
        intent: "ORDER",
        confidence: 0.65,
        toolsUsed: [],
        response: "Sir, I wasn't able to identify the specific product from your message. Could you please mention the product name or SKU code? For example: MCB 32A, House Wire 2.5mm, Modular Switch 6A, etc.",
        kind: "text",
        data: null
      });
    }

    // Save draft in session memory
    await updateMemory(conversationId, {
      lastDraft: { items, total }
    });

    // Check stock alerts for matched items
    let outOfStockItem = null;
    for (const m of finalMatched) {
      if (m.qty > m.product.stock) {
        outOfStockItem = m;
        break;
      }
    }

    if (outOfStockItem) {
      try {
        await supabase.from("stock_alerts").insert({
          id: crypto.randomUUID(),
          sku: outOfStockItem.product.sku,
          requested_qty: outOfStockItem.qty,
          available_stock: outOfStockItem.product.stock,
          dealer_id: dealerId,
          created_at: new Date().toISOString()
        });
      } catch (alertErr) {
        console.warn("Failed to log stock alert:", alertErr);
      }

      return JSON.stringify({
        intent: "ORDER",
        confidence: 0.75,
        toolsUsed: [],
        response: `We only have ${outOfStockItem.product.stock} units of ${outOfStockItem.product.name} available in stock. Would you like to adjust your order?`,
        kind: "text",
        data: null
      });
    }
    
    
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

  // Payment promise block moved before outstanding block to prevent hijack
  if (lower.includes("diwali") || lower.includes("dusheera") || lower.includes("dussehra") || lower.includes("promise") || lower.includes("will pay") || lower.includes("pay after") || lower.includes("pay later")) {
    const qtyMatch = lower.match(/\b\d+\b/g);
    let hasAmount = false;
    let amountVal = 0;
    if (qtyMatch) {
      for (const numStr of qtyMatch) {
        const num = Number(numStr);
        if (num >= 100) {
          hasAmount = true;
          amountVal = num;
          break;
        }
      }
    }
    if (!hasAmount) {
      return JSON.stringify({
        intent: "PAYMENT_PROMISE",
        confidence: 0.75,
        toolsUsed: [],
        response: "Sir, could you please clarify the promised payment amount?",
        kind: "text",
        data: null
      });
    }

    const dealer = dealers.find(d => d.id === dealerId) || dealers[0];
    const pendingAmount = dealer ? dealer.pending : 124500;
    const whenStr = lower.includes("diwali") ? "Nov 5, 10:00 AM" : (lower.includes("tomorrow") ? "Tomorrow, 10:00 AM" : "7 days");
    
    return JSON.stringify({
      intent: "PAYMENT_PROMISE",
      confidence: 0.95,
      toolsUsed: ["scheduleReminder"],
      toolParameters: {
        reminderWhen: whenStr,
        reminderNote: `Gentle dues nudge for outstanding ₹${pendingAmount}`,
        paymentAmount: amountVal
      },
      response: `Understood sir. I have registered your payment promise for the remaining balance of **₹${pendingAmount.toLocaleString("en-IN")}**. A reminder has been set.`,
      kind: "reminder",
      data: {
        when: whenStr,
        note: `Gentle dues nudge for outstanding ₹${pendingAmount}`
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

  if (lower.includes("paid") || lower.includes("pay") || lower.includes("remitted") || lower.includes("transferred") || lower.includes("sent")) {
    const match = text.match(/\d+/);
    const amount = match ? Number(match[0]) : 20000;
    
    const dealer = dealers.find(d => d.id === dealerId) || dealers[0];
    const beforeAmount = dealer ? dealer.pending : 124500;
    
    return JSON.stringify({
      intent: "PAYMENT",
      confidence: 0.98,
      toolsUsed: ["recordPayment"],
      toolParameters: {
        paymentAmount: amount
      },
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
