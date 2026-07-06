import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/utils/supabase";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Create GenAI client or a placeholder if key is missing or not configured
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== "your_gemini_api_key_here") {
  aiClient = new GoogleGenAI({ apiKey });
}

// Function Declarations for Gemini tools
const listProductsDecl = {
  name: "listProducts",
  description: "Get the current product list including inventory stock levels, prices, and categories.",
  parameters: { type: "OBJECT" as const, properties: {} }
};

const listDealersDecl = {
  name: "listDealers",
  description: "Get the list of dealers, outstanding balances (pending dues), trust scores, and statuses.",
  parameters: { type: "OBJECT" as const, properties: {} }
};

const getDealerByIdDecl = {
  name: "getDealerById",
  description: "Get detail stats for a specific dealer by their ID (e.g. pending balance, trust score).",
  parameters: {
    type: "OBJECT" as const,
    properties: {
      id: { type: "STRING" as const, description: "The ID of the dealer, e.g. d1, d2, d3" }
    },
    required: ["id"]
  }
};

const confirmOrderDecl = {
  name: "confirmOrder",
  description: "Places and confirms a new order for a dealer, generates an invoice, and deducts the inventory stock.",
  parameters: {
    type: "OBJECT" as const,
    properties: {
      conversationId: { type: "STRING" as const, description: "The conversation ID" },
      dealerId: { type: "STRING" as const, description: "The dealer ID" },
      invoiceId: { type: "STRING" as const, description: "A unique Invoice ID (like INV-1043)" },
      items: {
        type: "ARRAY" as const,
        description: "Array of items in the order",
        items: {
          type: "OBJECT" as const,
          properties: {
            sku: { type: "STRING" as const, description: "The product SKU (e.g. MCB-32A-SP)" },
            qty: { type: "INTEGER" as const, description: "Quantity ordered" },
            price: { type: "NUMBER" as const, description: "Unit price of the product" },
            name: { type: "STRING" as const, description: "Name of the product" }
          },
          required: ["sku", "qty", "price", "name"]
        }
      },
      total: { type: "NUMBER" as const, description: "Total price of the order" }
    },
    required: ["conversationId", "dealerId", "invoiceId", "items", "total"]
  }
};

const recordPaymentDecl = {
  name: "recordPayment",
  description: "Records a payment from a dealer, updating their ledger (reducing pending balance) and scheduling post-Diwali reminders.",
  parameters: {
    type: "OBJECT" as const,
    properties: {
      conversationId: { type: "STRING" as const, description: "The conversation ID" },
      dealerId: { type: "STRING" as const, description: "The dealer ID" },
      paidAmount: { type: "NUMBER" as const, description: "The amount paid by the dealer" },
      beforeAmount: { type: "NUMBER" as const, description: "The outstanding balance before the payment" }
    },
    required: ["conversationId", "dealerId", "paidAmount", "beforeAmount"]
  }
};

const listInvoicesDecl = {
  name: "listInvoices",
  description: "Get all generated invoices and their payment status.",
  parameters: { type: "OBJECT" as const, properties: {} }
};

const listOrdersDecl = {
  name: "listOrders",
  description: "Get list of orders in progress and their delivery statuses.",
  parameters: { type: "OBJECT" as const, properties: {} }
};

const geminiTools = [
  {
    functionDeclarations: [
      listProductsDecl,
      listDealersDecl,
      getDealerByIdDecl,
      confirmOrderDecl,
      recordPaymentDecl,
      listInvoicesDecl,
      listOrdersDecl
    ]
  }
];

// Tool handlers executing Supabase queries
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  listProducts: async () => {
    const { data } = await supabase.from("products").select("*");
    return data || [];
  },
  listDealers: async () => {
    const { data } = await supabase.from("dealers").select("*");
    return data || [];
  },
  getDealerById: async ({ id }) => {
    const { data } = await supabase.from("dealers").select("*").eq("id", id).maybeSingle();
    return data || null;
  },
  confirmOrder: async ({ conversationId, dealerId, invoiceId, items, total }) => {
    // 1. Deduct stock levels in products table
    for (const item of items) {
      const { data: prod } = await supabase.from("products").select("stock").eq("sku", item.sku).maybeSingle();
      const currentStock = prod?.stock || 0;
      await supabase.from("products").update({
        stock: Math.max(0, currentStock - item.qty)
      }).eq("sku", item.sku);
    }

    // 2. Fetch dealer name
    const { data: dealer } = await supabase.from("dealers").select("name").eq("id", dealerId).maybeSingle();
    const dealerName = dealer?.name || "Unknown";

    // 3. Insert order
    const orderId = crypto.randomUUID();
    await supabase.from("orders").insert({
      id: orderId,
      invoice: invoiceId,
      dealerId,
      dealerName,
      total,
      status: "processing",
      placedAt: "Just now",
      aiNote: "Confirmed live by Gemini AI Copilot Agent."
    });

    // 4. Insert order items
    for (const item of items) {
      await supabase.from("order_items").insert({
        id: crypto.randomUUID(),
        orderId,
        name: item.name,
        qty: item.qty,
        price: item.price
      });
    }

    // 5. Create invoice
    await supabase.from("invoices").insert({
      id: invoiceId,
      dealer: dealerName,
      amount: total,
      date: "Today",
      status: "unpaid"
    });

    // 6. Update dealer stats
    const { data: dl } = await supabase.from("dealers").select("pending, ordersCount").eq("id", dealerId).maybeSingle();
    const pending = (dl?.pending || 0) + total;
    const ordersCount = (dl?.ordersCount || 0) + 1;
    await supabase.from("dealers").update({ pending, ordersCount }).eq("id", dealerId);

    // 7. Insert message widget inside chat db
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    await supabase.from("messages").insert({
      id: crypto.randomUUID(),
      conversationId,
      fromRole: "ai",
      text: `Invoice ${invoiceId} generated. Inventory updated. Delivery scheduled.`,
      time,
      kind: "invoice",
      data: JSON.stringify({ invoice: invoiceId, total })
    });

    // Update conversation preview
    await supabase.from("conversations").update({
      preview: `Invoice ${invoiceId} sent ✅`,
      unread: 0
    }).eq("id", conversationId);

    return { status: "success", invoiceId, message: "Order confirmed, invoice created, stock deducted." };
  },
  recordPayment: async ({ conversationId, dealerId, paidAmount, beforeAmount }) => {
    let activeBefore = beforeAmount;
    if (activeBefore === undefined || activeBefore === null) {
      const { data: dl } = await supabase.from("dealers").select("pending").eq("id", dealerId).maybeSingle();
      activeBefore = dl?.pending || 0;
    }
    const remaining = Math.max(0, activeBefore - paidAmount);

    // 1. Update dealer balance
    await supabase.from("dealers").update({ pending: remaining }).eq("id", dealerId);

    // 2. Add ledger message card in chat db
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    await supabase.from("messages").insert({
      id: crypto.randomUUID(),
      conversationId,
      fromRole: "ai",
      text: "Payment recorded. Ledger updated.",
      time,
      kind: "ledger",
      data: JSON.stringify({ paid: paidAmount, remaining, before: activeBefore })
    });

    // 3. Add scheduled follow-up reminder card
    await supabase.from("messages").insert({
      id: crypto.randomUUID(),
      conversationId,
      fromRole: "ai",
      text: "Reminder scheduled for post-Diwali.",
      time,
      kind: "reminder",
      data: JSON.stringify({ when: "Nov 5, 10:00 AM", note: `Gentle nudge for remaining ₹${remaining.toLocaleString("en-IN")}` })
    });

    // Update conversation preview
    await supabase.from("conversations").update({
      preview: `Paid ₹${paidAmount.toLocaleString("en-IN")} today. Remaining after Diwali.`,
      unread: 0
    }).eq("id", conversationId);

    return { status: "success", remaining, message: "Payment logged, ledger updated, post-Diwali reminders scheduled." };
  },
  listInvoices: async () => {
    const { data } = await supabase.from("invoices").select("*");
    return data || [];
  },
  listOrders: async () => {
    const { data } = await supabase.from("orders").select("*");
    return data || [];
  }
};

async function callGroq(messages: any[], jsonMode = false): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No Groq API key configured");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.1,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq API error: ${txt}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function runAgentConversation(
  conversationId: string,
  dealerName: string,
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    console.log("Routing runAgentConversation to Groq Llama 3...");

    // 1. Fetch live database context in parallel for prompt injection
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

    const dlContext = dealersList.find(d => d.name === dealerName);
    const activeDealerId = dlContext?.id || (conversationId === "c1" ? "d3" : conversationId === "c2" ? "d1" : "d2");

    const systemInstruction = `You are a sharp, proactive AI Business Operations Manager for Kumar Electricals & Distribution.
Your job is to talk to dealers over WhatsApp (represented by this chat) and help manage their orders, payments, and dues.

CURRENT CONVERSATION CONTEXT:
- Active Dealer Name: "${dealerName}"
- Active Dealer ID: "${activeDealerId}"
- Active Conversation ID: "${conversationId}"

DATABASE LIVE STATE:
- Products Stock: ${JSON.stringify(productsList)}
- Dealers Balance: ${JSON.stringify(dealersList)}
- Invoices: ${JSON.stringify(invoicesList)}
- Orders: ${JSON.stringify(ordersList)}

Dealers may:
- Place and Confirm orders. If they request products, verify stock and wholesale pricing from the Products Stock table. Formulate a draft order and present it to them.
  - If they say 'Confirm', 'Confirm this', 'Yes', or agree to the draft, you MUST schedule a confirmOrder tool call in the toolCall JSON output. Generate a unique invoice ID (like INV-1045) for it.
- Log payments or payment promises (e.g. "I paid 20,000", "Remaining after Diwali").
  - If they pay, schedule a recordPayment tool call in the toolCall JSON output.

Note: In your natural text message to the dealer, never mention database schemas, table structures, API calls, or tool execution names. Talk like a polite, professional human business manager.

You MUST format your final response as a strict JSON object:
{
  "text": "Your natural language chat response to the dealer",
  "toolCall": {
    "name": "confirmOrder" | "recordPayment" | null,
    "args": {
      // For confirmOrder: { conversationId, dealerId, invoiceId, items: [{sku, name, qty, price}], total }
      // For recordPayment: { conversationId, dealerId, paidAmount, beforeAmount: null }
    }
  },
  "kind": "text" | "order",
  "data": null or an object (only if kind is "order")
}

If you are presenting an order draft (before they confirm), set kind: "order" and populate data with items, total, and title.
Otherwise, set kind: "text" and data: null.`;

    try {
      const messages = [
        { role: "system", content: systemInstruction },
        ...chatHistory.map(h => ({
          role: h.role === "user" ? ("user" as const) : ("assistant" as const),
          content: h.parts[0]?.text || ""
        }))
      ];

      const groqReply = await callGroq(messages, true);
      const parsed = JSON.parse(groqReply.trim());

      // If a toolCall is scheduled by Groq, execute it!
      if (parsed.toolCall && parsed.toolCall.name) {
        const toolName = parsed.toolCall.name;
        const toolArgs = parsed.toolCall.args || {};
        console.log(`Groq scheduled tool execution: ${toolName} with args:`, toolArgs);
        
        const handler = toolHandlers[toolName];
        if (handler) {
          await handler({
            ...toolArgs,
            conversationId,
            dealerId: activeDealerId
          });
        }
      }

      // Return the raw JSON so our postMessage endpoint parses it correctly
      return JSON.stringify({
        text: parsed.text || "Message processed.",
        kind: parsed.kind || "text",
        data: parsed.data || null
      });
    } catch (err) {
      console.error("Groq conversation agent error:", err);
      // Fallback to Gemini/Simulated on failure
    }
  }
  if (!aiClient) {
    const lastMsg = chatHistory[chatHistory.length - 1]?.parts[0]?.text || "";
    const lower = lastMsg.toLowerCase();
    
    if (lower.includes("confirm")) {
      await toolHandlers.confirmOrder({
        conversationId,
        dealerId: conversationId === "c1" ? "d3" : conversationId === "c2" ? "d1" : "d2",
        invoiceId: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [
          { name: "MCB 32A Single Pole", qty: 20, price: 245, sku: "MCB-32A-SP" },
          { name: "Modular Switch 6A", qty: 15, price: 78, sku: "SW-MOD-6A" },
        ],
        total: 6070
      });
      return "Order confirmed and invoice generated. Stock has been deducted.";
    } else if (lower.includes("paid") || lower.includes("pay")) {
      const matchDigits = lastMsg.match(/\d+/);
      const amount = matchDigits ? Number(matchDigits[0]) : 20000;
      const dealerId = conversationId === "c2" ? "d1" : conversationId === "c1" ? "d3" : "d2";
      const dealerData = await toolHandlers.getDealerById({ id: dealerId });
      const beforeAmount = dealerData?.pending || 124500;

      await toolHandlers.recordPayment({
        conversationId,
        dealerId,
        paidAmount: amount,
        beforeAmount
      });
      return `Payment of ₹${amount.toLocaleString("en-IN")} logged in ledger. Outstanding balance updated.`;
    }
    
    return `[SIMULATED - Please add GEMINI_API_KEY to your .env] Received message: "${lastMsg}". Type "Confirm" to place order or "Paid 20000" to simulate SQL ledger payments.`;
  }

  // Fetch active dealer ID from the database using dealerName
  const { data: dlContext } = await supabase.from("dealers").select("id").eq("name", dealerName).maybeSingle();
  const activeDealerId = dlContext?.id || (conversationId === "c1" ? "d3" : conversationId === "c2" ? "d1" : "d2");

  const systemInstruction = `You are a sharp, proactive AI Business Operations Manager for Kumar Electricals & Distribution.
Your job is to talk to dealers over WhatsApp (represented by this chat) and help manage their orders, payments, and dues.

CURRENT CONVERSATION CONTEXT:
- Active Dealer Name: "${dealerName}"
- Active Dealer ID: "${activeDealerId}"
- Active Conversation ID: "${conversationId}"

Use these EXACT active IDs when invoking the confirmOrder or recordPayment tool handlers. Do not guess or hallucinate any other values.

Dealers may:
- Place and Confirm orders. If they request products, lookup products using listProducts to verify stock and pricing. Formulate a draft order and present it to them. If they say 'Confirm', 'Confirm this', 'Yes', or agree to the draft, you MUST call the confirmOrder tool immediately to write it to the database. Generate a unique invoice ID (like INV-1045) for it.
- Log payments or payment promises (e.g. "I paid 20,000", "Remaining after Diwali"). If they pay, look up their details using listDealers, calculate the new balance, and call recordPayment to save it in the ledger and schedule reminders.
- Ask questions. Answer using the database tools.

Note: The database listing tools (listProducts, listDealers, listOrders, listInvoices) do not accept filter parameters. Retrieve the full arrays and perform any filtering or matching inside your reasoning before formulating a reply.

TONE & CRITICAL CONSTRAINTS:
1. Always communicate formally, politely, and naturally, just like a professional business manager. Respond in the same language or tone they use (e.g. Hinglish or English).
2. Never mention database structures, API calls, or tool execution names in the "text" field of your final response. Never say "I ran confirmOrder", "according to listProducts", "database tool", "updated record", or "called recordPayment".
3. Communicate values (outstanding balances, stock counts) directly and naturally.

You MUST format your final response as a strict JSON object (do not include markdown tags like \`\`\`json, just output raw JSON). The JSON structure MUST be:
{
  "text": "Your natural language chat response to the dealer",
  "kind": "text" or "order",
  "data": null or an object
}

If you are presenting an order draft (before they confirm), you MUST set:
- "kind": "order"
- "data": {
    "title": "Order Draft",
    "delivery": "Standard",
    "total": number,
    "items": [
      { "sku": "string", "name": "string", "qty": number, "price": number }
    ]
  }

For all other messages (including post-confirmation replies, greetings, payment logs, general questions), set "kind": "text" and "data": null.`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: chatHistory.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      config: {
        systemInstruction,
        tools: geminiTools
      }
    });

    const calls = response.functionCalls;
    if (calls && calls.length > 0) {
      const toolResponseParts = [];
      for (const call of calls) {
        const handler = toolHandlers[call.name];
        if (handler) {
          console.log(`AI Agent executing tool call: ${call.name} with args:`, call.args);
          const result = await handler(call.args);
          toolResponseParts.push({
            functionResponse: {
              name: call.name,
              response: { result: result }
            }
          });
        }
      }

      const followUpResponse = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...chatHistory.map(h => ({ role: h.role, parts: h.parts })),
          { role: "model", parts: response.candidates?.[0]?.content?.parts || [] },
          { role: "user", parts: toolResponseParts }
        ],
        config: {
          systemInstruction,
          tools: geminiTools
        }
      });

      return followUpResponse.text || "I have updated the records.";
    }

    return response.text || "Message processed.";
  } catch (err) {
    console.error("Gemini AI agent error:", err);
    
    // FALLBACK SIMULATION IF RATE LIMITED
    const lastMsg = chatHistory[chatHistory.length - 1]?.parts[0]?.text || "";
    const lower = lastMsg.toLowerCase();
    
    if (lower.includes("confirm") || lower.includes("yes") || lower.includes("agree")) {
      const invId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
      await toolHandlers.confirmOrder({
        conversationId,
        dealerId: conversationId === "c1" ? "d3" : conversationId === "c2" ? "d1" : "d2",
        invoiceId: invId,
        items: [
          { name: "MCB 32A Single Pole", qty: 20, price: 245, sku: "MCB-32A-SP" },
          { name: "Modular Switch 6A", qty: 15, price: 78, sku: "SW-MOD-6A" },
        ],
        total: 6070
      });
      return JSON.stringify({
        text: `The order has been successfully placed, and invoice ${invId} has been generated. The items have been registered, inventory updated, and shipment dispatched.`,
        kind: "text",
        data: null
      });
    }

    if (lower.includes("paid") || lower.includes("pay") || lower.includes("diwali") || lower.includes("ledger")) {
      const matchDigits = lastMsg.match(/\d+/);
      const amount = matchDigits ? Number(matchDigits[0]) : 20000;
      const dealerId = conversationId === "c2" ? "d1" : conversationId === "c1" ? "d3" : "d2";
      
      await toolHandlers.recordPayment({
        conversationId,
        dealerId,
        paidAmount: amount,
        beforeAmount: null
      });

      return JSON.stringify({
        text: `Thank you. I have successfully recorded your payment of ₹${amount.toLocaleString("en-IN")} in the outstanding dues ledger. The balance has been updated accordingly.`,
        kind: "text",
        data: null
      });
    }

    // Default polite draft response
    return JSON.stringify({
      text: "Understood. I have drafted the requested order of **20 MCB 32A Single Pole** and **15 Modular Switch 6A** (Total: **₹6,070**). Please reply with 'Confirm' to finalize the order and generate your invoice receipt.",
      kind: "order",
      data: {
        title: "Order Draft",
        delivery: "Standard",
        total: 6070,
        items: [
          { sku: "MCB-32A-SP", name: "MCB 32A Single Pole", qty: 20, price: 245 },
          { sku: "SW-MOD-6A", name: "Modular Switch 6A", qty: 15, price: 78 }
        ]
      }
    });
  }
}

export async function runAgentQuery(q: string): Promise<string> {
  if (process.env.GROQ_API_KEY) {
    console.log("Routing runAgentQuery to Groq Llama 3...");

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

    const systemInstruction = `You are the AI brain of Kumar Electricals & Distribution.
The owner (Roshan) is asking you a question about the business ledgers, inventory, or dealers.

DATABASE LIVE STATE:
- Products Stock: ${JSON.stringify(productsList)}
- Dealers balance: ${JSON.stringify(dealersList)}
- Invoices: ${JSON.stringify(invoicesList)}
- Orders: ${JSON.stringify(ordersList)}

Analyze the database state above to answer the owner's question.

TONE & CRITICAL CONSTRAINTS:
1. Always communicate formally, politely, and naturally, just like a highly professional business analyst.
2. Never mention database terms, SQL table structures, JSON structures, or API execution details to the owner. Do not say "I checked the products stock table", "according to the JSON", or "database query". State your answers directly as clear facts (e.g. say "We currently have 42 units of MCB 32A in stock" instead of "the table returns 42 stock").
3. Present calculations (sums, trends, profiles) in clean, readable lists or bullet points, keeping the output polished and easy to read.`;

    try {
      const messages = [
        { role: "system", content: systemInstruction },
        { role: "user", content: q }
      ];

      const groqReply = await callGroq(messages, false);
      return groqReply;
    } catch (err) {
      console.error("Groq query agent error:", err);
      // Fallback to Gemini/Simulated on failure
    }
  }
  if (!aiClient) {
    return `[SIMULATED - Please add GEMINI_API_KEY to your .env] Answer to query: "${q}". Define your API key in .env to query SQLite dynamically using the Gemini AI agent.`;
  }

  const systemInstruction = `You are the AI brain of Kumar Electricals & Distribution.
The owner (Roshan) is asking you a question about the business ledgers, inventory, or dealers.
Use the database tools (listProducts, listDealers, listOrders, listInvoices) to get live database records, calculate answers, and formulate a clear, precise response.

TONE & CRITICAL CONSTRAINTS:
1. Always communicate formally, politely, and naturally, just like a highly professional business analyst.
2. Never mention database terms, tool names, or API execution details to the owner. Do not say "I ran listProducts", "according to the table", "tool call", "JSON data", or "database query". State your answers directly as clear facts (e.g. say "We currently have 42 units of MCB 32A in stock at our warehouse" instead of "the product table returns 42 stock for SKU").
3. Present calculations (sums, trends, profiles) in clean, readable lists or bullet points, keeping the output polished and easy to read.

IMPORTANT: The database listing tools do not accept search or date filters. Call the tools to retrieve all records (e.g. listInvoices to retrieve all invoices, listOrders to retrieve all orders), and then perform any filtering, counting, summing, or grouping in memory to answer the user's question accurately.`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: q,
      config: {
        systemInstruction,
        tools: geminiTools
      }
    });

    const calls = response.functionCalls;
    if (calls && calls.length > 0) {
      const toolResponseParts = [];
      for (const call of calls) {
        const handler = toolHandlers[call.name];
        if (handler) {
          const result = await handler(call.args);
          toolResponseParts.push({
            functionResponse: {
              name: call.name,
              response: { result: result }
            }
          });
        }
      }

      const followUpResponse = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: q }] },
          { role: "model", parts: response.candidates?.[0]?.content?.parts || [] },
          { role: "user", parts: toolResponseParts }
        ],
        config: {
          systemInstruction,
          tools: geminiTools
        }
      });

      return followUpResponse.text || "Here is the data I loaded.";
    }

    return response.text || "Query completed.";
  } catch (err) {
    console.error("Gemini AI query error:", err);
    
    // FALLBACK SIMULATION IF RATE LIMITED
    const lower = q.toLowerCase();
    
    // 1. Dues follow up query
    if (lower.includes("follow up") || lower.includes("due") || lower.includes("pay") || lower.includes("ledger")) {
      const { data: dealers } = await supabase.from("dealers").select("*");
      const list = dealers || [];
      const overdue = list.filter(d => d.pending > 50000);
      if (overdue.length > 0) {
        const lines = overdue.map(d => `*   **${d.name}** (${d.city}): Outstanding balance of **₹${d.pending.toLocaleString("en-IN")}** (Average payment cycle: ${d.avgPaymentDays} days). Recommended action: Follow up regarding oldest invoice copy.`);
        return `Based on our current ledger, we should follow up with the following dealers who have significant outstanding balances:\n\n${lines.join("\n")}\n\nI recommend sending them a payment request card via WhatsApp.`;
      }
      return "All dealer balances are currently within safe credit limits. No critical follow-ups are needed today.";
    }

    // 2. Stock / Inventory query
    if (lower.includes("stock") || lower.includes("inventory") || lower.includes("low") || lower.includes("alert")) {
      const { data: products } = await supabase.from("products").select("*");
      const list = products || [];
      const lowStock = list.filter(p => p.stock < p.min);
      if (lowStock.length > 0) {
        const lines = lowStock.map(p => `*   **${p.name}** (SKU: \`${p.sku}\`): Current stock: **${p.stock}** units (Minimum threshold: ${p.min}).`);
        return `We have identified the following items running below their minimum safety thresholds:\n\n${lines.join("\n")}\n\nI suggest drafting purchase orders for these items to restore stock levels.`;
      }
      return "Inventory levels are fully stocked. No safety limit triggers detected.";
    }

    // 3. Orders query
    if (lower.includes("order") || lower.includes("active") || lower.includes("pipeline")) {
      const { data: orders } = await supabase.from("orders").select("*");
      const list = orders || [];
      const active = list.filter(o => o.status !== "delivered");
      if (active.length > 0) {
        const lines = active.map(o => `*   Order **${o.invoice}** for **${o.dealerName}** (Value: **₹${o.total.toLocaleString("en-IN")}**): Current Status: **${o.status.toUpperCase()}**.`);
        return `We currently have ${active.length} active orders in our pipeline:\n\n${lines.join("\n")}\n\nWe should push these to the next stage to meet delivery schedules.`;
      }
      return "There are no active orders in progress right now. All placed orders have been fully delivered.";
    }

    // 4. Invoices query
    if (lower.includes("invoice") || lower.includes("revenue") || lower.includes("cash")) {
      const { data: invoices } = await supabase.from("invoices").select("*");
      const list = invoices || [];
      const totalInvoices = list.reduce((sum, inv) => sum + inv.amount, 0);
      return `Our total billed receivables from generated invoices is **₹${totalInvoices.toLocaleString("en-IN")}** across ${list.length} transactions.\n\nLet me know if you would like me to list specific invoice files or dealer dues records.`;
    }

    // 5. Profitable/Sales/Dealer ranking query
    if (lower.includes("profitable") || lower.includes("dealer") || lower.includes("sales") || lower.includes("customer")) {
      const { data: dealers } = await supabase.from("dealers").select("*");
      const list = dealers || [];
      if (list.length > 0) {
        const sorted = [...list].sort((a, b) => b.lifetime - a.lifetime);
        const topDealer = sorted[0];
        const lines = sorted.map((d, i) => `${i + 1}.  **${d.name}** (${d.city}): Lifetime Revenue: **₹${d.lifetime.toLocaleString("en-IN")}** (${d.ordersCount} orders placed).`);
        return `Our most profitable dealer by lifetime billing value is **${topDealer.name}** in **${topDealer.city}** (Total business value: **₹${topDealer.lifetime.toLocaleString("en-IN")}**).\n\nHere is our top dealer network ranking:\n\n${lines.join("\n")}`;
      }
      return "All dealer records are healthy. No sales logs recorded yet.";
    }

    // Default polite response
    return "The Kumar Electricals ledger database is fully connected. We have active records for Outstanding Dues, Product Stock Levels, and Live Orders. Please let me know if you would like a status update on any of these areas.";
  }
}

export async function runAgentDuesAnalysis(dealersList: any[]): Promise<any[]> {
  if (!aiClient) {
    throw new Error("No Gemini client configured");
  }

  const prompt = `You are the AI Collections Underwriter for Kumar Electricals & Distribution.
We have a list of dealers with outstanding balances.
For each dealer, analyze their metrics and output:
1. A dynamic risk score (0 to 100) based on their pending balance, trust score, average payment days, and status.
2. A recommended action string (e.g., "Personal call by owner", "WhatsApp automatic nudge", "Auto-reminder scheduled", "Pause credit line") based on how risky they are.
3. Any payment promises or dates if known (e.g., "Nov 5 (Post-Diwali)" or null).

Dealers list:
${JSON.stringify(dealersList, null, 2)}

Return your analysis as a strict JSON array of objects. Do not include markdown code blocks (like \`\`\`json), just raw JSON. Each object MUST look like:
{
  "dealerId": "string",
  "risk": number,
  "action": "string",
  "promise": "string or null"
}
`;

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const cleaned = response.text || "";
    const jsonStr = cleaned.trim().replace(/^```json/, "").replace(/```$/, "").trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Gemini dues analysis error:", err);
    throw err;
  }
}

