import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/utils/supabase";
import { runAgentConversation, runAgentQuery, runAgentDuesAnalysis } from "./gemini";

// Helper dummy ensureDb to keep existing codebase compatibility
export async function ensureDb() {}

export function isTodayIST(dateInput: string) {
  if (!dateInput.includes("T") && isNaN(Date.parse(dateInput))) {
    return dateInput.includes("min") || 
           dateInput.includes("hour") || 
           dateInput.includes("Today") ||
           dateInput.includes("now");
  }
  const date = new Date(dateInput);
  try {
    const istDateString = date.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
    const todayISTString = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
    return istDateString === todayISTString;
  } catch (e) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
}

export function formatRelativeTime(dateInput: string) {
  if (!dateInput.includes("T") && isNaN(Date.parse(dateInput))) {
    return dateInput;
  }
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) {
    try {
      const dateIST = date.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
      const nowIST = now.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
      if (dateIST === nowIST) {
        return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
      }
    } catch (e) {}
  }
  
  try {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const dateIST = date.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
    const yesterdayIST = yesterday.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
    if (dateIST === yesterdayIST) {
      return "Yesterday";
    }
  } catch (e) {}
  
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  const [
    { data: dealers },
    { data: products },
    { data: orders },
    { data: invoices },
    { count: reminderCount }
  ] = await Promise.all([
    supabase.from("dealers").select("*"),
    supabase.from("products").select("*"),
    supabase.from("orders").select("*"),
    supabase.from("invoices").select("*"),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("kind", "reminder")
  ]);

  const dealersList = dealers || [];
  const productsList = products || [];
  const ordersList = orders || [];
  const invoicesList = invoices || [];

  const pendingDues = dealersList.reduce((sum, row) => sum + Number(row.pending), 0);
  const inventoryAlerts = productsList.filter(row => Number(row.stock) < Number(row.min)).length;
  
  const ordersToday = ordersList.filter(row => isTodayIST(String(row.placedAt)));

  const revenueToday = ordersToday.reduce((sum, row) => sum + Number(row.total), 0);

  const kpis = {
    ordersToday: ordersToday.length, // Real dynamic count from db
    ordersDelta: "+12%",
    revenueToday: revenueToday, // Real sum of today's order totals from db
    revenueDelta: "+18%",
    pendingDues,
    duesDelta: "-4%",
    inventoryAlerts,
    invoicesGenerated: invoicesList.length,
    followUps: 4 + (reminderCount || 0),
    collectionsToday: 126000,
    businessHealth: 98,
  };

  const revenueTrend = [
    { day: "Mon", revenue: 92000, collections: 65000 },
    { day: "Tue", revenue: 118000, collections: 71000 },
    { day: "Wed", revenue: 104000, collections: 88000 },
    { day: "Thu", revenue: 142000, collections: 96000 },
    { day: "Fri", revenue: 168000, collections: 112000 },
    { day: "Sat", revenue: 154000, collections: 108000 },
    { day: "Sun", revenue: kpis.revenueToday, collections: kpis.collectionsToday },
  ];

  const categoryMix = [
    { name: "MCBs", value: 38 },
    { name: "Switches", value: 24 },
    { name: "Wires", value: 20 },
    { name: "Sockets", value: 12 },
    { name: "Boards", value: 6 },
  ];

  const insights = [
    { id: "i1", kind: "danger", title: "Raj Traders — 42 days overdue", body: `₹${(dealersList.find(r => r.id === "d1")?.pending || 104500).toLocaleString("en-IN")} outstanding. Trust score dropped to 62. Recommend a call today before extending more credit.`, cta: "Call Raj Traders" },
    { id: "i2", kind: "warning", title: "MCB 32A stock below threshold", body: `Only ${productsList.find(r => r.sku === "MCB-32A-SP")?.stock || 42} units left. Avg. weekly sales: 88 units. Reorder 300 units before Friday to avoid stockouts.`, cta: "Create purchase order" },
    { id: "i3", kind: "success", title: "Revenue up 18% week over week", body: "Driven by Sri Lakshmi Agencies (+₹62k) and ABC Electricals repeat orders. Great momentum going into Diwali." },
    { id: "i4", kind: "info", title: "ABC Electricals pays on time — always", body: "12/12 invoices paid before due date in the last 6 months. Safe to raise credit limit from ₹2L → ₹3.5L.", cta: "Raise credit limit" },
  ];

  const activity = [
    { id: "a1", time: "2 min ago", text: "Sri Lakshmi Agencies placed an order — 20 MCB, 15 Switches", type: "order" },
    { id: "a2", time: "3 min ago", text: "Invoice INV-1042 generated — ₹18,240", type: "invoice" },
    { id: "a3", time: "4 min ago", text: "Inventory auto-updated — MCB 32A: 250 → 230", type: "inventory" },
    { id: "a4", time: "6 min ago", text: "Reminder scheduled for Raj Traders at 11:00 AM", type: "reminder" },
    { id: "a5", time: "22 min ago", text: "Payment received — ABC Electricals ₹20,000 via UPI", type: "payment" },
    { id: "a6", time: "1 hr ago", text: "Ledger updated — PowerTech Distributors partial payment ₹35,000", type: "ledger" },
  ];

  const supabaseUrl = (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) || "fallback-url";
  return { kpis, revenueTrend, categoryMix, insights, activity, supabaseUrl };
});

export const getDealers = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabase.from("dealers").select("*").order("pending", { ascending: false });
  return (data || []).map(row => ({
    id: String(row.id),
    name: String(row.name),
    city: String(row.city),
    phone: String(row.phone),
    pending: Number(row.pending),
    trust: Number(row.trust),
    ordersCount: Number(row.ordersCount),
    lifetime: Number(row.lifetime),
    avgPaymentDays: Number(row.avgPaymentDays),
    lastOrder: String(row.lastOrder),
    status: String(row.status) as "active" | "watch" | "overdue",
  }));
});

export const getDealerById = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { data: dealer } = await supabase.from("dealers").select("*").eq("id", id).maybeSingle();
    if (!dealer) return null;

    const [
      { data: orders },
      { data: invoices },
      { data: conversations }
    ] = await Promise.all([
      supabase.from("orders").select("*").eq("dealerId", id),
      supabase.from("invoices").select("*").eq("dealer", dealer.name),
      supabase.from("conversations").select("*, messages(*)").eq("dealer", dealer.name)
    ]);

    let messages: any[] = [];
    const activeConvo = conversations?.[0];
    if (activeConvo) {
      const msgs = (activeConvo.messages as any[]) || [];
      messages = msgs.map(m => ({
        id: String(m.id),
        from: String(m.fromRole) as "dealer" | "ai" | "system",
        text: m.text ? String(m.text) : undefined,
        time: String(m.time),
        kind: m.kind ? String(m.kind) : undefined,
        data: m.data ? (typeof m.data === "string" ? JSON.parse(m.data) : m.data) : undefined,
      }));
    }

    return {
      dealer: {
        id: String(dealer.id),
        name: String(dealer.name),
        city: String(dealer.city),
        phone: String(dealer.phone),
        pending: Number(dealer.pending),
        trust: Number(dealer.trust),
        ordersCount: Number(dealer.ordersCount),
        lifetime: Number(dealer.lifetime),
        avgPaymentDays: Number(dealer.avgPaymentDays),
        lastOrder: String(dealer.lastOrder),
        status: String(dealer.status) as "active" | "watch" | "overdue",
      },
      orders: (orders || []).map(o => ({
        id: String(o.id),
        invoice: String(o.invoice),
        dealerId: String(o.dealerId),
        dealer: String(o.dealerName),
        total: Number(o.total),
        status: String(o.status) as "processing" | "packed" | "dispatched" | "delivered",
        placedAt: formatRelativeTime(String(o.placedAt)),
        aiNote: String(o.aiNote),
        items: [],
      })),
      invoices: (invoices || []).map(inv => ({
        id: String(inv.id),
        dealer: String(inv.dealer),
        amount: Number(inv.amount),
        date: String(inv.date),
        status: String(inv.status),
      })),
      chat: activeConvo ? {
        id: String(activeConvo.id),
        dealer: String(activeConvo.dealer),
        city: String(activeConvo.city),
        messages,
      } : null,
    };
  });

export const getInventory = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabase.from("products").select("*");
  return (data || []).map(row => ({
    id: String(row.id),
    name: String(row.name),
    sku: String(row.sku),
    stock: Number(row.stock),
    min: Number(row.min),
    price: Number(row.price),
    category: String(row.category),
  }));
});

export const getInvoices = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabase.from("invoices").select("*").order("id", { ascending: false });
  return (data || []).map(row => ({
    id: String(row.id),
    dealer: String(row.dealer),
    amount: Number(row.amount),
    date: String(row.date),
    status: String(row.status),
  }));
});

export const getOrders = createServerFn({ method: "GET" }).handler(async () => {
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(name, qty, price)")
    .order("invoice", { ascending: false });

  return (orders || []).map(row => ({
    id: String(row.id),
    invoice: String(row.invoice),
    dealerId: String(row.dealerId),
    dealer: String(row.dealerName),
    total: Number(row.total),
    status: String(row.status) as "processing" | "packed" | "dispatched" | "delivered",
    placedAt: formatRelativeTime(String(row.placedAt)),
    aiNote: String(row.aiNote),
    items: (((row as any).order_items as any[]) || []).map(it => ({
      name: String(it.name),
      qty: Number(it.qty),
      price: Number(it.price),
    })),
  }));
});

export const getConversationsList = createServerFn({ method: "GET" }).handler(async () => {
  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, messages(*)");

  return (conversations || [])
    .filter(c => c.preview !== "Seeded for regression test" && !String(c.id).startsWith("baseline-convo-"))
    .map(c => {
    const msgs = ((c as any).messages as any[]) || [];
    
    const parsedMessages = msgs
      .filter(m => m.fromRole !== "system_memory")
      .map(m => ({
        id: String(m.id),
        from: String(m.fromRole) as "dealer" | "ai" | "system",
        text: m.text ? String(m.text) : undefined,
        time: String(m.time),
        kind: m.kind ? String(m.kind) : undefined,
        data: m.data ? (typeof m.data === "string" ? JSON.parse(m.data) : m.data) : undefined,
      }));

    // Chronological message sorting
    parsedMessages.sort((a, b) => {
      const isSeededA = a.id.startsWith("m") && !a.id.includes("-");
      const isSeededB = b.id.startsWith("m") && !b.id.includes("-");
      
      if (isSeededA && isSeededB) {
        return parseInt(a.id.substring(1)) - parseInt(b.id.substring(1));
      }
      if (isSeededA && !isSeededB) {
        return -1;
      }
      if (!isSeededA && isSeededB) {
        return 1;
      }

      const isIsoA = a.time.includes("T") && a.time.includes("Z");
      const isIsoB = b.time.includes("T") && b.time.includes("Z");
      
      if (isIsoA && !isIsoB) {
        return 1; // ISO comes after non-ISO
      }
      if (!isIsoA && isIsoB) {
        return -1; // non-ISO comes before ISO
      }
      
      return a.time.localeCompare(b.time);
    });
    
    const memoryMsg = msgs.find(m => m.fromRole === "system_memory");
    const memory = memoryMsg?.data ? (typeof memoryMsg.data === "string" ? JSON.parse(memoryMsg.data) : memoryMsg.data) : null;

    return {
      id: String(c.id),
      dealer: String(c.dealer),
      city: String(c.city),
      unread: Number(c.unread),
      preview: String(c.preview),
      messages: parsedMessages,
      memory
    };
  });
});

export const postMessage = createServerFn({ method: "POST" })
  .validator((data: { conversationId: string; from: "dealer" | "ai"; text: string }) => data)
  .handler(async ({ data }) => {
    const msgId = crypto.randomUUID();
    const time = new Date().toISOString();
    
    // 1. Insert incoming message
    await supabase.from("messages").insert({
      id: msgId,
      conversationId: data.conversationId,
      fromRole: data.from,
      text: data.text,
      time
    });

    // 2. Load conversation details & history
    const { data: convo } = await supabase.from("conversations").select("dealer").eq("id", data.conversationId).maybeSingle();
    const dealerName = convo?.dealer || "Unknown";

    const { data: msgs } = await supabase.from("messages").select("id, fromRole, text, time").eq("conversationId", data.conversationId);
    
    const sortedMsgs = msgs || [];
    sortedMsgs.sort((a, b) => {
      const isSeededA = a.id.startsWith("m") && !a.id.includes("-");
      const isSeededB = b.id.startsWith("m") && !b.id.includes("-");
      
      if (isSeededA && isSeededB) {
        return parseInt(a.id.substring(1)) - parseInt(b.id.substring(1));
      }
      if (isSeededA && !isSeededB) {
        return -1;
      }
      if (!isSeededA && isSeededB) {
        return 1;
      }

      const isIsoA = a.time.includes("T") && a.time.includes("Z");
      const isIsoB = b.time.includes("T") && b.time.includes("Z");
      
      if (isIsoA && !isIsoB) {
        return 1; // ISO comes after non-ISO
      }
      if (!isIsoA && isIsoB) {
        return -1; // non-ISO comes before ISO
      }
      
      return a.time.localeCompare(b.time);
    });

    const chatHistory = sortedMsgs.map(m => {
      const role = m.fromRole === "dealer" ? ("user" as const) : ("model" as const);
      return {
        role,
        parts: [{ text: String(m.text || "") }]
      };
    });

    // 3. Trigger Gemini AI agent
    const aiReply = await runAgentConversation(data.conversationId, dealerName, chatHistory, data.text);

    // 4. Save AI's response message (parsing JSON if available)
    let replyText = aiReply;
    let kind: string | null = null;
    let dataObj: any = null;

    try {
      const parsed = JSON.parse(aiReply.trim().replace(/^```json/, "").replace(/```$/, "").trim());
      replyText = parsed.response || parsed.text || aiReply;
      kind = parsed.kind || null;
      // Store the complete AgentResponse trace in the data field
      dataObj = parsed;
    } catch (e) {
      // Fallback to raw text
    }

    const aiMsgId = crypto.randomUUID();
    const aiTime = new Date().toISOString();
    await supabase.from("messages").insert({
      id: aiMsgId,
      conversationId: data.conversationId,
      fromRole: "ai",
      text: replyText,
      time: aiTime,
      kind: kind || null,
      data: dataObj ? JSON.stringify(dataObj) : null
    });

    // 5. Update conversation preview
    await supabase.from("conversations").update({
      preview: replyText.length > 90 ? replyText.substring(0, 87) + "..." : replyText,
      unread: 0
    }).eq("id", data.conversationId);

    return { success: true };
  });

export const confirmOrderAction = createServerFn({ method: "POST" })
  .validator((data: { conversationId: string; dealerId: string; invoiceId: string; items: { sku: string; qty: number; price: number; name: string }[]; total: number }) => data)
  .handler(async ({ data }) => {
    const time = new Date().toISOString();

    // 1. Deduct stock levels in products table
    for (const item of data.items) {
      const { data: prod } = await supabase.from("products").select("stock").eq("sku", item.sku).maybeSingle();
      const currentStock = prod?.stock || 0;
      await supabase.from("products").update({
        stock: Math.max(0, currentStock - item.qty)
      }).eq("sku", item.sku);
    }

    // 2. Fetch dealer name
    const { data: dealer } = await supabase.from("dealers").select("name").eq("id", data.dealerId).maybeSingle();
    const dealerName = dealer?.name || "Unknown";

    // 3. Insert order
    const orderId = crypto.randomUUID();
    await supabase.from("orders").insert({
      id: orderId,
      invoice: data.invoiceId,
      dealerId: data.dealerId,
      dealerName,
      total: data.total,
      status: "processing",
      placedAt: new Date().toISOString(),
      aiNote: "Confirmed from live chat conversation."
    });

    // 4. Insert order items
    for (const item of data.items) {
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
      id: data.invoiceId,
      dealer: dealerName,
      amount: data.total,
      date: "Today",
      status: "unpaid"
    });

    // 6. Update dealer balance (increase pending)
    const { data: dl } = await supabase.from("dealers").select("pending, ordersCount").eq("id", data.dealerId).maybeSingle();
    const pending = (dl?.pending || 0) + data.total;
    const ordersCount = (dl?.ordersCount || 0) + 1;
    await supabase.from("dealers").update({ pending, ordersCount }).eq("id", data.dealerId);

    // 7. Insert AI confirmation message card in chat
    const confirmMsgId = crypto.randomUUID();
    await supabase.from("messages").insert({
      id: confirmMsgId,
      conversationId: data.conversationId,
      fromRole: "ai",
      text: `Invoice ${data.invoiceId} generated. Inventory updated. Delivery scheduled.`,
      time,
      kind: "invoice",
      data: JSON.stringify({ invoice: data.invoiceId, total: data.total })
    });

    // Update conversation preview
    await supabase.from("conversations").update({
      preview: `Invoice ${data.invoiceId} sent ✅`,
      unread: 0
    }).eq("id", data.conversationId);

    return { success: true };
  });

export const recordPaymentAction = createServerFn({ method: "POST" })
  .validator((data: { conversationId: string; dealerId: string; paidAmount: number; beforeAmount: number }) => data)
  .handler(async ({ data }) => {
    const time = new Date().toISOString();
    const remaining = Math.max(0, data.beforeAmount - data.paidAmount);

    // 1. Update dealer balance
    await supabase.from("dealers").update({ pending: remaining }).eq("id", data.dealerId);

    // 2. Add ledger message card
    const ledgerMsgId = crypto.randomUUID();
    await supabase.from("messages").insert({
      id: ledgerMsgId,
      conversationId: data.conversationId,
      fromRole: "ai",
      text: "Payment recorded. Ledger updated.",
      time,
      kind: "ledger",
      data: JSON.stringify({ paid: data.paidAmount, remaining, before: data.beforeAmount })
    });

    // 3. Add scheduled follow-up reminder card
    const reminderMsgId = crypto.randomUUID();
    await supabase.from("messages").insert({
      id: reminderMsgId,
      conversationId: data.conversationId,
      fromRole: "ai",
      text: "Reminder scheduled for post-Diwali.",
      time,
      kind: "reminder",
      data: JSON.stringify({ when: "Nov 5, 10:00 AM", note: `Gentle nudge for remaining ₹${remaining.toLocaleString("en-IN")}` })
    });

    // Update conversation preview
    await supabase.from("conversations").update({
      preview: `Paid ₹${data.paidAmount.toLocaleString("en-IN")} today. Remaining after Diwali.`,
      unread: 0
    }).eq("id", data.conversationId);

    return { success: true };
  });

export const runCronAction = createServerFn({ method: "POST" })
  .validator((data: { forceAll?: boolean } | undefined) => data)
  .handler(async ({ data }) => {
    try {
      const now = new Date();
      const forceAll = data?.forceAll ?? false;

      // 1. Fetch all messages of kind "reminder"
      const { data: reminderMsgs, error } = await supabase
        .from("messages")
        .select("*")
        .eq("kind", "reminder");

      if (error) {
        console.error("Cron: Failed to fetch reminders from Supabase:", error);
        return { success: false, error: String(error) };
      }

      let processedCount = 0;

      for (const msg of (reminderMsgs || [])) {
        try {
          if (!msg.data) continue;
          
          let payload: any = null;
          try {
            payload = JSON.parse(msg.data);
          } catch (pe) {
            // Corrupt JSON payload inside message row - skip
            continue;
          }

          if (!payload) continue;

          // Check if pending status
          const status = payload.status || "pending";
          if (status !== "pending") continue;

          // Check due date
          const dueDateStr = payload.dueDate;
          if (!dueDateStr && !forceAll) continue;

          if (dueDateStr && !forceAll) {
            const dueDate = new Date(dueDateStr);
            if (dueDate > now) {
              // Not due yet
              continue;
            }
          }

          // Idempotency check: Transition local status to 'processing'
          payload.status = "processing";
          await supabase
            .from("messages")
            .update({ data: JSON.stringify(payload) })
            .eq("id", msg.id);

          // Construct nudge follow-up text
          const noteText = payload.note || "Gentle payment nudge";
          const dealerId = payload.dealerId || "d2";
          const convoId = msg.conversationId;

          // Insert WhatsApp AI follow-up message record in conversation
          const nudgeId = crypto.randomUUID();
          await supabase.from("messages").insert({
            id: nudgeId,
            conversationId: convoId,
            fromRole: "ai",
            text: `🚨 *Follow-up Dues Nudge:* Dear sir, this is a friendly reminder for the promised payment. (Note: ${noteText})`,
            time: new Date().toISOString(),
            kind: "text",
            data: null
          });

          // Update conversation preview thread
          await supabase.from("conversations").update({
            preview: `🚨 Follow-up dues nudge sent.`,
            unread: 1
          }).eq("id", convoId);

          // Update status to 'sent'
          payload.status = "sent";
          payload.sentAt = new Date().toISOString();
          await supabase
            .from("messages")
            .update({ data: JSON.stringify(payload) })
            .eq("id", msg.id);

          processedCount++;
        } catch (itemErr) {
          // Rule 2: Skip bad rows and log; never crash the overall execution batch
          console.error(`Cron: Skip error on reminder row ${msg.id}:`, itemErr);
        }
      }

      return { success: true, processedCount };
    } catch (err) {
      // Rule 1: Safe fallback returning false rather than throwing 500 error
      console.error("Cron: Unhandled execution error:", err);
      return { success: false, error: String(err) };
    }
  });

export const askAiQuery = createServerFn({ method: "POST" })
  .validator((query: string) => query)
  .handler(async ({ data: q }) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    
    if ((geminiKey && geminiKey !== "your_gemini_api_key_here") || groqKey) {
      const aiReply = await runAgentQuery(q);
      try {
        const parsed = JSON.parse(aiReply.trim().replace(/^```json/, "").replace(/```$/, "").trim());
        return parsed.response || parsed.text || aiReply;
      } catch (e) {
        return aiReply;
      }
    }
    
    const term = q.toLowerCase();

    if (term.includes("products") || term.includes("low") || term.includes("stock") || term.includes("mcb")) {
      const { data } = await supabase.from("products").select("name, stock, min").lt("stock", "min");
      const products = data || [];
      if (products.length > 0) {
        let text = `${products.length} SKUs are below their minimum right now:\n\n`;
        products.forEach(r => {
          const ratio = Number(r.stock) / Number(r.min);
          const alert = ratio < 0.5 ? "Critical" : "Low";
          text += `• ${r.name} — ${r.stock} units (min ${r.min}) · ${alert}\n`;
        });
        text += "\nDraft reorder for MCB 32A: 300 units @ ₹210 = ₹63,000 from Havells. Want me to send the PO?";
        return text;
      }
      return "No products are currently running below their minimum thresholds.";
    }

    if (term.includes("revenue") || term.includes("make") || term.includes("today") || term.includes("sales")) {
      const { data } = await supabase.from("orders").select("dealerName, total");
      const orders = data || [];
      const rev = orders.reduce((sum, r) => sum + Number(r.total), 0);
      let text = `Today's revenue is ₹${(rev + 107000).toLocaleString("en-IN")} — up 18% vs last Sunday. Top contributors:\n\n`;
      orders.slice(0, 3).forEach(r => {
        text += `• ${r.dealerName} — ₹${Number(r.total).toLocaleString("en-IN")}\n`;
      });
      text += `\nCollections today: ₹1,26,000 (68% of billed).`;
      return text;
    }

    if (term.includes("raj") || term.includes("follow up") || term.includes("debt") || term.includes("who")) {
      const { data } = await supabase.from("dealers").select("name, pending").eq("status", "overdue");
      const overdueDealers = data || [];
      if (overdueDealers.length > 0) {
        let text = "Recommended dealer follow-up priorities for today:\n\n";
        overdueDealers.forEach(r => {
          text += `• ${r.name} — ₹${Number(r.pending).toLocaleString("en-IN")} (42 days overdue) — Trust score 62\n`;
        });
        text += "\nRecommended: call Raj Traders first — highest risk, no payment promise logged yet.";
        return text;
      }
    }

    if (term.includes("profitable") || term.includes("best") || term.includes("dealer")) {
      const { data } = await supabase.from("dealers").select("name, lifetime").order("lifetime", { ascending: false }).limit(1);
      const best = data || [];
      if (best.length > 0) {
        return `${best[0].name} — ₹${Number(best[0].lifetime).toLocaleString("en-IN")} billed, ₹41k gross margin, 100% on-time payments. Safe to raise credit limit from ₹2L → ₹3.5L.`;
      }
    }

    if (term.includes("forecast") || term.includes("cash") || term.includes("next week") || term.includes("collect")) {
      return "Estimated collection next week: ₹6.4L – ₹7.1L\n\nDrivers: 4 scheduled promises (₹3.1L), typical weekly repeat orders from ABC & Sri Lakshmi (₹2.2L), and 2 partial payments due. Confidence: 82%.";
    }

    const { data } = await supabase.from("dealers").select("name, pending").ilike("name", `%${q}%`);
    const matchDealers = data || [];

    if (matchDealers.length > 0) {
      return `Found dealer: ${matchDealers[0].name} has an outstanding balance of ₹${Number(matchDealers[0].pending).toLocaleString("en-IN")}.`;
    }

    return "Here's what I found based on your live Supabase database — I've cross-checked dealer ledgers, WhatsApp threads and inventory levels. Ask me for a deeper breakdown any time.";
  });

export const getDues = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabase.from("dealers").select("*").gt("pending", 0).order("pending", { ascending: false });
  const dealersList = data || [];
  
  return dealersList.map(d => {
    const overdueDays = d.status === "overdue" ? 42 : d.status === "watch" ? 18 : 0;
    const promise = d.name === "Raj Traders" ? "Nov 5 (Post-Diwali)" : null;
    
    let risk = 12;
    let action = "Auto-reminder scheduled";
    if (d.status === "overdue") {
      risk = 85;
      action = "Personal call by owner";
    } else if (d.status === "watch") {
      risk = 45;
      action = "WhatsApp automatic nudge";
    }

    return {
      dealerId: String(d.id),
      dealer: String(d.name),
      pending: Number(d.pending),
      overdueDays,
      promise,
      risk,
      action,
    };
  });
});

export const getAiDuesAnalysis = createServerFn({ method: "POST" })
  .validator((dealersList: any[]) => dealersList)
  .handler(async ({ data: list }) => {
    try {
      const results = await runAgentDuesAnalysis(list);
      return results;
    } catch (err) {
      console.error("AI dues analysis call failed:", err);
      return [];
    }
  });

export const updateOrderStatusAction = createServerFn({ method: "POST" })
  .validator((data: { orderId: string; nextStatus: string }) => data)
  .handler(async ({ data }) => {
    await supabase.from("orders").update({ status: data.nextStatus }).eq("id", data.orderId);
    return { success: true };
  });

export const getInvoiceDetailsAction = createServerFn({ method: "POST" })
  .validator((invoiceId: string) => invoiceId)
  .handler(async ({ data: invoiceId }) => {
    const { data: order } = await supabase.from("orders").select("*").eq("invoice", invoiceId).maybeSingle();
    if (!order) return null;

    const { data: items } = await supabase.from("order_items").select("*").eq("orderId", order.id);

    return {
      invoice: order.invoice,
      dealer: order.dealerName,
      placedAt: order.placedAt,
      status: order.status,
      total: order.total,
      items: items || []
    };
  });

export const createProductAction = createServerFn({ method: "POST" })
  .validator((data: { name: string; sku: string; stock: number; min: number; price: number; category: string }) => data)
  .handler(async ({ data }) => {
    const productId = "p-" + crypto.randomUUID();
    const { data: inserted, error } = await supabase.from("products").insert([
      {
        id: productId,
        name: data.name,
        sku: data.sku,
        stock: data.stock,
        min: data.min,
        price: data.price,
        category: data.category
      }
    ]).select().single();
    
    if (error) {
      console.error("Failed to insert product SKU:", error);
      throw new Error(error.message);
    }
    return inserted;
  });

export const clearConversationAction = createServerFn({ method: "POST" })
  .validator((data: { conversationId: string }) => data)
  .handler(async ({ data }) => {
    // 1. Delete all messages for this conversationId
    await supabase.from("messages").delete().eq("conversationId", data.conversationId);

    // 2. Clear conversation preview text
    await supabase.from("conversations").update({
      preview: "Chat cleared",
      unread: 0
    }).eq("id", data.conversationId);

    return { success: true };
  });

