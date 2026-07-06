import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/utils/supabase";
import dotenv from "dotenv";
import { processAgentRequest } from "../backend/agents/distributorAgent";

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

export async function runAgentConversation(
  conversationId: string,
  dealerName: string,
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  const lastMsg = chatHistory[chatHistory.length - 1]?.parts[0]?.text || "";
  return await processAgentRequest(lastMsg, conversationId, dealerName);
}

export async function runAgentQuery(q: string): Promise<string> {
  return await processAgentRequest(q, "ask-ai-convo", "Business Owner");
}

export async function runAgentDuesAnalysis(dealersList: any[]): Promise<any[]> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const isGroq = geminiKey?.startsWith("gsk_");

  if (aiClient && !isGroq) {
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
      console.error("Gemini dues analysis error, using fallback instead:", err);
    }
  }

  // Resilient rule-based collections analyst engine
  return dealersList.map(d => {
    let risk = 10;
    let action = "Auto-reminder scheduled";
    let promise = null;

    if (d.pending > 100000) {
      risk = 85;
      action = "Personal call by owner";
    } else if (d.pending > 50000) {
      risk = 60;
      action = "WhatsApp automatic nudge";
    } else if (d.trustScore < 70) {
      risk = 50;
      action = "WhatsApp automatic nudge";
    }

    if (d.name.includes("Verma") || d.name.includes("Vijay")) {
      promise = "Nov 5 (Post-Diwali)";
    }

    return {
      dealerId: d.id,
      risk,
      action,
      promise
    };
  });
}
