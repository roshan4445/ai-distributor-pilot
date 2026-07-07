export const owner = { name: "Roshan", business: "Kumar Electricals & Distribution" };

export const kpis = {
  ordersToday: 24,
  ordersDelta: "+12%",
  revenueToday: 184500,
  revenueDelta: "+18%",
  pendingDues: 842300,
  duesDelta: "-4%",
  inventoryAlerts: 6,
  invoicesGenerated: 19,
  followUps: 8,
  collectionsToday: 126000,
  businessHealth: 98,
};

export const revenueTrend = [
  { day: "Mon", revenue: 92000, collections: 65000 },
  { day: "Tue", revenue: 118000, collections: 71000 },
  { day: "Wed", revenue: 104000, collections: 88000 },
  { day: "Thu", revenue: 142000, collections: 96000 },
  { day: "Fri", revenue: 168000, collections: 112000 },
  { day: "Sat", revenue: 154000, collections: 108000 },
  { day: "Sun", revenue: 184500, collections: 126000 },
];

export const categoryMix = [
  { name: "MCBs", value: 38 },
  { name: "Switches", value: 24 },
  { name: "Wires", value: 20 },
  { name: "Sockets", value: 12 },
  { name: "Boards", value: 6 },
];

export type Insight = {
  id: string;
  kind: "danger" | "warning" | "success" | "info";
  title: string;
  body: string;
  cta?: string;
};

export const insights: Insight[] = [
  { id: "i1", kind: "danger", title: "Raj Traders — 42 days overdue", body: "₹1,24,500 outstanding. Trust score dropped to 62. Recommend a call today before extending more credit.", cta: "Call Raj Traders" },
  { id: "i2", kind: "warning", title: "MCB 32A stock below threshold", body: "Only 42 units left. Avg. weekly sales: 88 units. Reorder 300 units before Friday to avoid stockouts.", cta: "Create purchase order" },
  { id: "i3", kind: "success", title: "Revenue up 18% week over week", body: "Driven by Sri Lakshmi Agencies (+₹62k) and ABC Electricals repeat orders. Great momentum going into Diwali." },
  { id: "i4", kind: "info", title: "ABC Electricals pays on time — always", body: "12/12 invoices paid before due date in the last 6 months. Safe to raise credit limit from ₹2L → ₹3.5L." , cta: "Raise credit limit" },
];

export const activity = [
  { id: "a1", time: "2 min ago", text: "Sri Lakshmi Agencies placed an order — 20 MCB, 15 Switches", type: "order" },
  { id: "a2", time: "3 min ago", text: "Invoice INV-1042 generated — ₹18,240", type: "invoice" },
  { id: "a3", time: "4 min ago", text: "Inventory auto-updated — MCB 32A: 250 → 230", type: "inventory" },
  { id: "a4", time: "6 min ago", text: "Reminder scheduled for Raj Traders at 11:00 AM", type: "reminder" },
  { id: "a5", time: "22 min ago", text: "Payment received — ABC Electricals ₹20,000 via UPI", type: "payment" },
  { id: "a6", time: "1 hr ago", text: "Ledger updated — PowerTech Distributors partial payment ₹35,000", type: "ledger" },
];

export type Product = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min: number;
  price: number;
  category: string;
};

export const products: Product[] = [
  { id: "p1", name: "MCB 32A Single Pole", sku: "MCB-32A-SP", stock: 42, min: 120, price: 245, category: "MCBs" },
  { id: "p2", name: "MCB 63A Double Pole", sku: "MCB-63A-DP", stock: 230, min: 250, price: 620, category: "MCBs" },
  { id: "p3", name: "Modular Switch 6A", sku: "SW-MOD-6A", stock: 1840, min: 800, price: 78, category: "Switches" },
  { id: "p4", name: "3-Pin Socket 16A", sku: "SK-3P-16A", stock: 96, min: 300, price: 156, category: "Sockets" },
  { id: "p5", name: "House Wire 2.5mm (90m)", sku: "WR-2.5-90", stock: 512, min: 200, price: 1980, category: "Wires" },
  { id: "p6", name: "House Wire 4.0mm (90m)", sku: "WR-4.0-90", stock: 88, min: 150, price: 3120, category: "Wires" },
  { id: "p7", name: "Distribution Board 8-way", sku: "DB-8W", stock: 34, min: 40, price: 2450, category: "Boards" },
  { id: "p8", name: "Distribution Board 12-way", sku: "DB-12W", stock: 61, min: 30, price: 3480, category: "Boards" },
  { id: "p9", name: "LED Indicator Switch", sku: "SW-LED-IND", stock: 720, min: 400, price: 145, category: "Switches" },
  { id: "p10", name: "USB Socket Module", sku: "SK-USB-2", stock: 210, min: 200, price: 890, category: "Sockets" },
];

export const productRecommendation = (p: Product) => {
  const ratio = p.stock / p.min;
  if (ratio < 0.5) return { level: "critical" as const, text: "Restock urgently — will run out this week." };
  if (ratio < 1) return { level: "warning" as const, text: "Restock before Friday to avoid stockout." };
  if (ratio < 1.5) return { level: "watch" as const, text: "Monitor — trending down." };
  return { level: "ok" as const, text: "Healthy stock levels." };
};

export type Dealer = {
  id: string;
  name: string;
  city: string;
  phone: string;
  pending: number;
  trust: number;
  ordersCount: number;
  lifetime: number;
  avgPaymentDays: number;
  lastOrder: string;
  status: "active" | "watch" | "overdue";
};

export const dealers: Dealer[] = [
  { id: "d1", name: "Raj Traders", city: "Coimbatore", phone: "+91 98765 12340", pending: 124500, trust: 62, ordersCount: 87, lifetime: 1840000, avgPaymentDays: 38, lastOrder: "12 days ago", status: "overdue" },
  { id: "d2", name: "ABC Electricals", city: "Chennai", phone: "+91 98432 66211", pending: 42000, trust: 96, ordersCount: 142, lifetime: 3620000, avgPaymentDays: 9, lastOrder: "2 hours ago", status: "active" },
  { id: "d3", name: "Sri Lakshmi Agencies", city: "Madurai", phone: "+91 90032 41889", pending: 88400, trust: 88, ordersCount: 96, lifetime: 2410000, avgPaymentDays: 14, lastOrder: "18 min ago", status: "active" },
  { id: "d4", name: "PowerTech Distributors", city: "Bengaluru", phone: "+91 97402 55190", pending: 218000, trust: 74, ordersCount: 63, lifetime: 1520000, avgPaymentDays: 22, lastOrder: "4 hours ago", status: "watch" },
  { id: "d5", name: "Mahesh Hardware", city: "Salem", phone: "+91 98844 71203", pending: 36900, trust: 84, ordersCount: 51, lifetime: 890000, avgPaymentDays: 16, lastOrder: "1 day ago", status: "active" },
  { id: "d6", name: "Vinayaka Electricals", city: "Trichy", phone: "+91 99442 30012", pending: 172000, trust: 68, ordersCount: 44, lifetime: 1120000, avgPaymentDays: 31, lastOrder: "6 days ago", status: "watch" },
  { id: "d7", name: "Sundaram & Co.", city: "Erode", phone: "+91 90325 78411", pending: 0, trust: 92, ordersCount: 38, lifetime: 720000, avgPaymentDays: 11, lastOrder: "3 days ago", status: "active" },
];

export type Order = {
  id: string;
  invoice: string;
  dealerId: string;
  dealer: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "processing" | "packed" | "dispatched" | "delivered";
  placedAt: string;
  aiNote: string;
};

export const orders: Order[] = [
  {
    id: "o1", invoice: "INV-1042", dealerId: "d3", dealer: "Sri Lakshmi Agencies",
    items: [ { name: "MCB 32A Single Pole", qty: 20, price: 245 }, { name: "Modular Switch 6A", qty: 15, price: 78 } ],
    total: 6070, status: "processing", placedAt: "18 min ago",
    aiNote: "Parsed from WhatsApp. Dealer requested delivery tomorrow — matched to route SLM-2.",
  },
  {
    id: "o2", invoice: "INV-1041", dealerId: "d2", dealer: "ABC Electricals",
    items: [ { name: "House Wire 2.5mm (90m)", qty: 12, price: 1980 }, { name: "Distribution Board 8-way", qty: 4, price: 2450 } ],
    total: 33560, status: "dispatched", placedAt: "2 hours ago",
    aiNote: "Repeat order — 4th time this month. Auto-applied loyalty discount of ₹840.",
  },
  {
    id: "o3", invoice: "INV-1040", dealerId: "d5", dealer: "Mahesh Hardware",
    items: [ { name: "3-Pin Socket 16A", qty: 40, price: 156 }, { name: "LED Indicator Switch", qty: 25, price: 145 } ],
    total: 9865, status: "packed", placedAt: "5 hours ago",
    aiNote: "Cross-sell suggestion sent: USB Socket Module (accepted). Added ₹1,780 to cart.",
  },
  {
    id: "o4", invoice: "INV-1039", dealerId: "d4", dealer: "PowerTech Distributors",
    items: [ { name: "MCB 63A Double Pole", qty: 30, price: 620 }, { name: "House Wire 4.0mm (90m)", qty: 6, price: 3120 } ],
    total: 37320, status: "delivered", placedAt: "Yesterday",
    aiNote: "Credit check passed. Flagged for follow-up in 12 days.",
  },
];

export type Dues = {
  dealerId: string;
  dealer: string;
  pending: number;
  overdueDays: number;
  promise: string;
  risk: number;
  action: string;
};

export const dues: Dues[] = [
  { dealerId: "d1", dealer: "Raj Traders", pending: 124500, overdueDays: 42, promise: "Awaiting", risk: 82, action: "Call today — escalate" },
  { dealerId: "d6", dealer: "Vinayaka Electricals", pending: 172000, overdueDays: 21, promise: "Nov 12", risk: 64, action: "Confirm promise on WhatsApp" },
  { dealerId: "d4", dealer: "PowerTech Distributors", pending: 218000, overdueDays: 14, promise: "Post-Diwali", risk: 52, action: "Send gentle reminder" },
  { dealerId: "d3", dealer: "Sri Lakshmi Agencies", pending: 88400, overdueDays: 6, promise: "This week", risk: 24, action: "On track — no action" },
  { dealerId: "d5", dealer: "Mahesh Hardware", pending: 36900, overdueDays: 3, promise: "Tomorrow", risk: 12, action: "Auto-reminder scheduled" },
];

export const invoices = [
  { id: "INV-1042", dealer: "Sri Lakshmi Agencies", amount: 6070, date: "Today", status: "unpaid" },
  { id: "INV-1041", dealer: "ABC Electricals", amount: 33560, date: "Today", status: "paid" },
  { id: "INV-1040", dealer: "Mahesh Hardware", amount: 9865, date: "Today", status: "partial" },
  { id: "INV-1039", dealer: "PowerTech Distributors", amount: 37320, date: "Yesterday", status: "unpaid" },
  { id: "INV-1038", dealer: "ABC Electricals", amount: 18240, date: "Yesterday", status: "paid" },
  { id: "INV-1037", dealer: "Raj Traders", amount: 22450, date: "2 days ago", status: "overdue" },
  { id: "INV-1036", dealer: "Sundaram & Co.", amount: 14760, date: "2 days ago", status: "paid" },
  { id: "INV-1035", dealer: "Vinayaka Electricals", amount: 41200, date: "3 days ago", status: "overdue" },
];

export type ChatMsg = {
  id: string;
  from: "dealer" | "ai" | "system";
  text?: string;
  time: string;
  kind?: "text" | "thinking" | "order" | "invoice" | "ledger" | "reminder";
  data?: any;
};

export const conversations = [
  {
    id: "c1", dealer: "Sri Lakshmi Agencies", city: "Madurai", unread: 0, preview: "Invoice INV-1042 sent ✅",
    messages: [
      { id: "m1", from: "dealer", time: "10:12 AM", text: "Need\n20 MCB 32A\n15 Modular Switches\nNeed tomorrow please 🙏" },
      { id: "m2", from: "ai", time: "10:12 AM", kind: "thinking", text: "Parsing order… matching SKUs… checking stock…" },
      { id: "m3", from: "ai", time: "10:12 AM", kind: "order", data: {
        title: "Order draft",
        items: [
          { name: "MCB 32A Single Pole", qty: 20, price: 245, sku: "MCB-32A-SP" },
          { name: "Modular Switch 6A", qty: 15, price: 78, sku: "SW-MOD-6A" },
        ], total: 6070, delivery: "Tomorrow, 11:00 AM",
      }, text: "Here's your order — confirm to proceed." },
      { id: "m4", from: "dealer", time: "10:13 AM", text: "Confirm 👍" },
      { id: "m5", from: "ai", time: "10:13 AM", kind: "invoice", data: { invoice: "INV-1042", total: 6070 }, text: "Invoice INV-1042 generated. Inventory updated. Delivery scheduled." },
    ] as ChatMsg[],
  },
  {
    id: "c2", dealer: "Raj Traders", city: "Coimbatore", unread: 2, preview: "Paid ₹20,000 today. Remaining after Diwali.",
    messages: [
      { id: "m1", from: "dealer", time: "9:42 AM", text: "Paid ₹20,000 today via UPI.\nRemaining after Diwali sir." },
      { id: "m2", from: "ai", time: "9:42 AM", kind: "thinking", text: "Verifying UPI reference… updating ledger…" },
      { id: "m3", from: "ai", time: "9:42 AM", kind: "ledger", data: { paid: 20000, remaining: 104500, before: 124500 }, text: "Payment recorded. Ledger updated." },
      { id: "m4", from: "ai", time: "9:42 AM", kind: "reminder", data: { when: "Nov 5, 10:00 AM", note: "Gentle nudge for remaining ₹1,04,500" }, text: "Reminder scheduled for post-Diwali." },
    ] as ChatMsg[],
  },
  {
    id: "c3", dealer: "ABC Electricals", city: "Chennai", unread: 0, preview: "Loyalty discount applied ✨",
    messages: [
      { id: "m1", from: "dealer", time: "Yesterday", text: "Same order as last week please." },
      { id: "m2", from: "ai", time: "Yesterday", kind: "order", data: {
        title: "Repeat order",
        items: [
          { name: "House Wire 2.5mm (90m)", qty: 12, price: 1980, sku: "WR-2.5-90" },
          { name: "Distribution Board 8-way", qty: 4, price: 2450, sku: "DB-8W" },
        ], total: 33560, delivery: "Today, 4:00 PM",
      }, text: "Repeat order ready. Loyalty discount ₹840 applied." },
    ] as ChatMsg[],
  },
  {
    id: "c4", dealer: "Mahesh Hardware", city: "Salem", unread: 0, preview: "USB sockets added to order",
    messages: [
      { id: "m1", from: "dealer", time: "2 days ago", text: "40 3-pin sockets, 25 LED switches" },
      { id: "m2", from: "ai", time: "2 days ago", text: "Cross-sell tip: USB Socket Module is trending — 62% of similar dealers added it last month. Want me to add 2?" },
      { id: "m3", from: "dealer", time: "2 days ago", text: "Yes add 2." },
    ] as ChatMsg[],
  },
];

export const askAiSuggestions = [
  "Who hasn't paid in 30 days?",
  "Which dealer should I follow up with today?",
  "Which products are running low?",
  "How much revenue did we make today?",
  "Which dealer is most profitable this month?",
  "Forecast next week's cash collection.",
];

export const askAiSeedChat = [
  {
    q: "Who hasn't paid in 30 days?",
    a: "3 dealers have crossed 30 days overdue:\n\n• Raj Traders — ₹1,24,500 (42 days) — Trust score 62\n• Vinayaka Electricals — ₹1,72,000 (21 days) — promise for Nov 12\n• PowerTech Distributors — ₹2,18,000 (14 days) — Post-Diwali promise\n\nRecommended: call Raj Traders first — highest risk, no payment promise yet.",
  },
];

export const fmt = (n: number) =>
  typeof n === "number" && !isNaN(n) ? "₹" + n.toLocaleString("en-IN") : "₹0";
