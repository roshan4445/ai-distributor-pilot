import { createClient } from "@libsql/client";

const isBrowser = typeof window !== "undefined";
const isVercel = !isBrowser && (process.env.VERCEL === "1" || process.env.NOW_REGION !== undefined);
const dbUrl = isBrowser ? "http://localhost" : (isVercel ? "file:/tmp/local.db" : "file:local.db");

export const db = createClient({
  url: dbUrl,
});

let initPromise: Promise<void> | null = null;

export async function ensureDb() {
  if (!initPromise) {
    initPromise = (async () => {
      if (isVercel) {
        try {
          const fs = await import("node:fs");
          const path = await import("node:path");
          const srcPath = path.resolve(process.cwd(), "local.db");
          const destPath = "/tmp/local.db";
          if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
            console.log(`Copying database from ${srcPath} to ${destPath}`);
            fs.copyFileSync(srcPath, destPath);
          }
        } catch (e) {
          console.error("Failed to copy SQLite database to /tmp:", e);
        }
      }
      await initDb();
    })();
  }
  return initPromise;
}

async function initDb() {
  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dealers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      phone TEXT NOT NULL,
      pending REAL NOT NULL,
      trust INTEGER NOT NULL,
      ordersCount INTEGER NOT NULL,
      lifetime REAL NOT NULL,
      avgPaymentDays INTEGER NOT NULL,
      lastOrder TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      stock INTEGER NOT NULL,
      min INTEGER NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      invoice TEXT UNIQUE NOT NULL,
      dealerId TEXT NOT NULL,
      dealerName TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      placedAt TEXT NOT NULL,
      aiNote TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      dealer TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      dealer TEXT NOT NULL,
      city TEXT NOT NULL,
      unread INTEGER NOT NULL,
      preview TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversationId TEXT NOT NULL,
      fromRole TEXT NOT NULL,
      text TEXT,
      time TEXT NOT NULL,
      kind TEXT,
      data TEXT,
      FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS conversation_state (
      conversation_id TEXT PRIMARY KEY,
      last_activity_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS stock_alerts (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL,
      requested_qty INTEGER NOT NULL,
      available_stock INTEGER NOT NULL,
      dealer_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS payment_promises (
      id TEXT PRIMARY KEY,
      dealer_id TEXT NOT NULL,
      promised_amount REAL NOT NULL,
      promised_date TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Check if seeding is needed (check dealers count)
  const result = await db.execute("SELECT COUNT(*) as count FROM dealers");
  const count = Number(result.rows[0].count);

  if (count === 0) {
    console.log("Database is empty. Seeding mock data...");

    // Seeding Dealers
    const seedDealers = [
      { id: "d1", name: "Raj Traders", city: "Coimbatore", phone: "+91 98765 12340", pending: 124500, trust: 62, ordersCount: 87, lifetime: 1840000, avgPaymentDays: 38, lastOrder: "12 days ago", status: "overdue" },
      { id: "d2", name: "ABC Electricals", city: "Chennai", phone: "+91 98432 66211", pending: 42000, trust: 96, ordersCount: 142, lifetime: 3620000, avgPaymentDays: 9, lastOrder: "2 hours ago", status: "active" },
      { id: "d3", name: "Sri Lakshmi Agencies", city: "Madurai", phone: "+91 90032 41889", pending: 88400, trust: 88, ordersCount: 96, lifetime: 2410000, avgPaymentDays: 14, lastOrder: "18 min ago", status: "active" },
      { id: "d4", name: "PowerTech Distributors", city: "Bengaluru", phone: "+91 97402 55190", pending: 218000, trust: 74, ordersCount: 63, lifetime: 1520000, avgPaymentDays: 22, lastOrder: "4 hours ago", status: "watch" },
      { id: "d5", name: "Mahesh Hardware", city: "Salem", phone: "+91 98844 71203", pending: 36900, trust: 84, ordersCount: 51, lifetime: 890000, avgPaymentDays: 16, lastOrder: "1 day ago", status: "active" },
      { id: "d6", name: "Vinayaka Electricals", city: "Trichy", phone: "+91 99442 30012", pending: 172000, trust: 68, ordersCount: 44, lifetime: 1120000, avgPaymentDays: 31, lastOrder: "6 days ago", status: "watch" },
      { id: "d7", name: "Sundaram & Co.", city: "Erode", phone: "+91 90325 78411", pending: 0, trust: 92, ordersCount: 38, lifetime: 720000, avgPaymentDays: 11, lastOrder: "3 days ago", status: "active" },
    ];

    for (const d of seedDealers) {
      await db.execute({
        sql: `INSERT INTO dealers (id, name, city, phone, pending, trust, ordersCount, lifetime, avgPaymentDays, lastOrder, status)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [d.id, d.name, d.city, d.phone, d.pending, d.trust, d.ordersCount, d.lifetime, d.avgPaymentDays, d.lastOrder, d.status],
      });
    }

    // Seeding Products
    const seedProducts = [
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

    for (const p of seedProducts) {
      await db.execute({
        sql: `INSERT INTO products (id, name, sku, stock, min, price, category)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [p.id, p.name, p.sku, p.stock, p.min, p.price, p.category],
      });
    }

    // Seeding Orders & Order Items
    const seedOrders = [
      {
        id: "o1", invoice: "INV-1042", dealerId: "d3", dealerName: "Sri Lakshmi Agencies",
        total: 6070, status: "processing", placedAt: "18 min ago",
        aiNote: "Parsed from WhatsApp. Dealer requested delivery tomorrow — matched to route SLM-2.",
        items: [ { name: "MCB 32A Single Pole", qty: 20, price: 245 }, { name: "Modular Switch 6A", qty: 15, price: 78 } ],
      },
      {
        id: "o2", invoice: "INV-1041", dealerId: "d2", dealerName: "ABC Electricals",
        total: 33560, status: "dispatched", placedAt: "2 hours ago",
        aiNote: "Repeat order — 4th time this month. Auto-applied loyalty discount of ₹840.",
        items: [ { name: "House Wire 2.5mm (90m)", qty: 12, price: 1980 }, { name: "Distribution Board 8-way", qty: 4, price: 2450 } ],
      },
      {
        id: "o3", invoice: "INV-1040", dealerId: "d5", dealerName: "Mahesh Hardware",
        total: 9865, status: "packed", placedAt: "5 hours ago",
        aiNote: "Cross-sell suggestion sent: USB Socket Module (accepted). Added ₹1,780 to cart.",
        items: [ { name: "3-Pin Socket 16A", qty: 40, price: 156 }, { name: "LED Indicator Switch", qty: 25, price: 145 } ],
      },
      {
        id: "o4", invoice: "INV-1039", dealerId: "d4", dealerName: "PowerTech Distributors",
        total: 37320, status: "delivered", placedAt: "Yesterday",
        aiNote: "Credit check passed. Flagged for follow-up in 12 days.",
        items: [ { name: "MCB 63A Double Pole", qty: 30, price: 620 }, { name: "House Wire 4.0mm (90m)", qty: 6, price: 3120 } ],
      },
    ];

    for (const o of seedOrders) {
      await db.execute({
        sql: `INSERT INTO orders (id, invoice, dealerId, dealerName, total, status, placedAt, aiNote)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [o.id, o.invoice, o.dealerId, o.dealerName, o.total, o.status, o.placedAt, o.aiNote],
      });
      for (const item of o.items) {
        await db.execute({
          sql: `INSERT INTO order_items (id, orderId, name, qty, price)
                VALUES (?, ?, ?, ?, ?)`,
          args: [crypto.randomUUID(), o.id, item.name, item.qty, item.price],
        });
      }
    }

    // Seeding Invoices
    const seedInvoices = [
      { id: "INV-1042", dealer: "Sri Lakshmi Agencies", amount: 6070, date: "Today", status: "unpaid" },
      { id: "INV-1041", dealer: "ABC Electricals", amount: 33560, date: "Today", status: "paid" },
      { id: "INV-1040", dealer: "Mahesh Hardware", amount: 9865, date: "Today", status: "partial" },
      { id: "INV-1039", dealer: "PowerTech Distributors", amount: 37320, date: "Yesterday", status: "unpaid" },
      { id: "INV-1038", dealer: "ABC Electricals", amount: 18240, date: "Yesterday", status: "paid" },
      { id: "INV-1037", dealer: "Raj Traders", amount: 22450, date: "2 days ago", status: "overdue" },
      { id: "INV-1036", dealer: "Sundaram & Co.", amount: 14760, date: "2 days ago", status: "paid" },
      { id: "INV-1035", dealer: "Vinayaka Electricals", amount: 41200, date: "3 days ago", status: "overdue" },
    ];

    for (const inv of seedInvoices) {
      await db.execute({
        sql: `INSERT INTO invoices (id, dealer, amount, date, status)
              VALUES (?, ?, ?, ?, ?)`,
        args: [inv.id, inv.dealer, inv.amount, inv.date, inv.status],
      });
    }

    // Seeding Conversations & Messages
    const seedConversations = [
      {
        id: "c1", dealer: "Sri Lakshmi Agencies", city: "Madurai", unread: 0, preview: "Invoice INV-1042 sent ✅",
        messages: [
          { id: "m1", fromRole: "dealer", time: "10:12 AM", text: "Need\n20 MCB 32A\n15 Modular Switches\nNeed tomorrow please 🙏" },
          { id: "m2", fromRole: "ai", time: "10:12 AM", kind: "thinking", text: "Parsing order… matching SKUs… checking stock…" },
          { id: "m3", fromRole: "ai", time: "10:12 AM", kind: "order", data: JSON.stringify({
            title: "Order draft",
            items: [
              { name: "MCB 32A Single Pole", qty: 20, price: 245, sku: "MCB-32A-SP" },
              { name: "Modular Switch 6A", qty: 15, price: 78, sku: "SW-MOD-6A" },
            ], total: 6070, delivery: "Tomorrow, 11:00 AM",
          }), text: "Here's your order — confirm to proceed." },
          { id: "m4", fromRole: "dealer", time: "10:13 AM", text: "Confirm 👍" },
          { id: "m5", fromRole: "ai", time: "10:13 AM", kind: "invoice", data: JSON.stringify({ invoice: "INV-1042", total: 6070 }), text: "Invoice INV-1042 generated. Inventory updated. Delivery scheduled." },
        ],
      },
      {
        id: "c2", dealer: "Raj Traders", city: "Coimbatore", unread: 2, preview: "Paid ₹20,000 today. Remaining after Diwali.",
        messages: [
          { id: "m1", fromRole: "dealer", time: "9:42 AM", text: "Paid ₹20,000 today via UPI.\nRemaining after Diwali sir." },
          { id: "m2", fromRole: "ai", time: "9:42 AM", kind: "thinking", text: "Verifying UPI reference… updating ledger…" },
          { id: "m3", fromRole: "ai", time: "9:42 AM", kind: "ledger", data: JSON.stringify({ paid: 20000, remaining: 104500, before: 124500 }), text: "Payment recorded. Ledger updated." },
          { id: "m4", fromRole: "ai", time: "9:42 AM", kind: "reminder", data: JSON.stringify({ when: "Nov 5, 10:00 AM", note: "Gentle nudge for remaining ₹1,04,500" }), text: "Reminder scheduled for post-Diwali." },
        ],
      },
      {
        id: "c3", dealer: "ABC Electricals", city: "Chennai", unread: 0, preview: "Loyalty discount applied ✨",
        messages: [
          { id: "m1", fromRole: "dealer", time: "Yesterday", text: "Same order as last week please." },
          { id: "m2", fromRole: "ai", time: "Yesterday", kind: "order", data: JSON.stringify({
            title: "Repeat order",
            items: [
              { name: "House Wire 2.5mm (90m)", qty: 12, price: 1980, sku: "WR-2.5-90" },
              { name: "Distribution Board 8-way", qty: 4, price: 2450, sku: "DB-8W" },
            ], total: 33560, delivery: "Today, 4:00 PM",
          }), text: "Repeat order ready. Loyalty discount ₹840 applied." },
        ],
      },
      {
        id: "c4", dealer: "Mahesh Hardware", city: "Salem", unread: 0, preview: "USB sockets added to order",
        messages: [
          { id: "m1", fromRole: "dealer", time: "2 days ago", text: "40 3-pin sockets, 25 LED switches" },
          { id: "m2", fromRole: "ai", time: "2 days ago", text: "Cross-sell tip: USB Socket Module is trending — 62% of similar dealers added it last month. Want me to add 2?" },
          { id: "m3", fromRole: "dealer", time: "2 days ago", text: "Yes add 2." },
        ],
      },
    ];

    for (const c of seedConversations) {
      await db.execute({
        sql: `INSERT INTO conversations (id, dealer, city, unread, preview)
              VALUES (?, ?, ?, ?, ?)`,
        args: [c.id, c.dealer, c.city, c.unread, c.preview],
      });
      for (const m of c.messages) {
        await db.execute({
          sql: `INSERT INTO messages (id, conversationId, fromRole, text, time, kind, data)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [m.id, c.id, m.fromRole, m.text, m.time, m.kind || null, m.data || null],
        });
      }
    }
  }
}
