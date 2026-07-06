-- Supabase SQL Schema & Seed Data
-- Paste this script into the SQL Editor of your Supabase dashboard (https://supabase.com) to initialize your database!

-- Drop tables if they exist
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "conversations" CASCADE;
DROP TABLE IF EXISTS "invoices" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "dealers" CASCADE;

-- Create dealers table
CREATE TABLE "dealers" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "pending" DOUBLE PRECISION NOT NULL,
  "trust" INTEGER NOT NULL,
  "ordersCount" INTEGER NOT NULL,
  "lifetime" DOUBLE PRECISION NOT NULL,
  "avgPaymentDays" INTEGER NOT NULL,
  "lastOrder" TEXT NOT NULL,
  "status" TEXT NOT NULL
);
ALTER TABLE "dealers" DISABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE "products" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "sku" TEXT UNIQUE NOT NULL,
  "stock" INTEGER NOT NULL,
  "min" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL
);
ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE "orders" (
  "id" TEXT PRIMARY KEY,
  "invoice" TEXT UNIQUE NOT NULL,
  "dealerId" TEXT NOT NULL,
  "dealerName" TEXT NOT NULL,
  "total" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL,
  "placedAt" TEXT NOT NULL,
  "aiNote" TEXT NOT NULL
);
ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;

-- Create order_items table
CREATE TABLE "order_items" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "qty" INTEGER NOT NULL,
  "price" DOUBLE PRECISION NOT NULL
);
ALTER TABLE "order_items" DISABLE ROW LEVEL SECURITY;

-- Create invoices table
CREATE TABLE "invoices" (
  "id" TEXT PRIMARY KEY,
  "dealer" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "date" TEXT NOT NULL,
  "status" TEXT NOT NULL
);
ALTER TABLE "invoices" DISABLE ROW LEVEL SECURITY;

-- Create conversations table
CREATE TABLE "conversations" (
  "id" TEXT PRIMARY KEY,
  "dealer" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "unread" INTEGER NOT NULL,
  "preview" TEXT NOT NULL
);
ALTER TABLE "conversations" DISABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE "messages" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "fromRole" TEXT NOT NULL,
  "text" TEXT,
  "time" TEXT NOT NULL,
  "kind" TEXT,
  "data" TEXT
);
ALTER TABLE "messages" DISABLE ROW LEVEL SECURITY;

-- Seed dealers
INSERT INTO "dealers" ("id", "name", "city", "phone", "pending", "trust", "ordersCount", "lifetime", "avgPaymentDays", "lastOrder", "status") VALUES
('d1', 'Raj Traders', 'Bengaluru', '+91 98450 12345', 124500.0, 62, 14, 824000.0, 22, '3 days ago', 'overdue'),
('d2', 'ABC Electricals', 'Bengaluru', '+91 98801 23456', 0.0, 94, 28, 2450000.0, 11, 'Just now', 'active'),
('d3', 'Sri Lakshmi Agencies', 'Mysuru', '+91 99002 34567', 88400.0, 88, 19, 1120000.0, 14, '1 day ago', 'active'),
('d4', 'PowerTech Distributors', 'Hubballi', '+91 94480 45678', 35600.0, 78, 9, 435000.0, 18, '5 days ago', 'active'),
('d5', 'Mahesh Hardware & Electricals', 'Tumakuru', '+91 98441 56789', 92000.0, 55, 11, 560000.0, 28, '2 days ago', 'watch'),
('d6', 'Venkateshwara Enterprises', 'Bengaluru', '+91 99860 67890', 12000.0, 85, 7, 180000.0, 15, '12 days ago', 'active'),
('d7', 'National Wires & Cables', 'Mangaluru', '+91 94800 78901', 0.0, 90, 15, 980000.0, 12, '8 days ago', 'active');

-- Seed products
INSERT INTO "products" ("id", "name", "sku", "stock", "min", "price", "category") VALUES
('p1', 'MCB 32A Single Pole', 'MCB-32A-SP', 42, 120, 245.0, 'MCBs'),
('p2', 'Modular Switch 6A', 'SW-MOD-6A', 1840, 500, 78.0, 'Switches'),
('p3', '3-Pin Socket 16A', 'SKT-16A-3P', 96, 300, 110.0, 'Sockets'),
('p4', 'Distribution Board 8-way', 'DB-8W', 34, 40, 1250.0, 'Boards'),
('p5', 'Copper Wire 1.5 sq mm (90m)', 'WIRE-1.5CU', 245, 100, 1450.0, 'Wires'),
('p6', 'Copper Wire 2.5 sq mm (90m)', 'WIRE-2.5CU', 180, 80, 2150.0, 'Wires'),
('p7', 'LED Panel Light 12W', 'LED-PL-12W', 320, 150, 320.0, 'Lighting');

-- Seed orders
INSERT INTO "orders" ("id", "invoice", "dealerId", "dealerName", "total", "status", "placedAt", "aiNote") VALUES
('o1', 'INV-1042', 'd3', 'Sri Lakshmi Agencies', 18240.0, 'processing', '2 min ago', 'Parsed from WhatsApp audio: 20x MCB 32A, 15x Modular Switch. Double-checked prices.'),
('o2', 'INV-1041', 'd2', 'ABC Electricals', 33560.0, 'delivered', 'Yesterday', 'Auto-processed repeat order.'),
('o3', 'INV-1039', 'd5', 'Mahesh Hardware & Electricals', 62400.0, 'dispatched', '2 days ago', 'Held initially due to dues, released after partial payment promise.');

-- Seed order_items
INSERT INTO "order_items" ("id", "orderId", "name", "qty", "price") VALUES
('oi1', 'o1', 'MCB 32A Single Pole', 20, 245.0),
('oi2', 'o1', 'Modular Switch 6A', 15, 78.0),
('oi3', 'o2', 'Copper Wire 1.5 sq mm (90m)', 10, 1450.0),
('oi4', 'o2', 'Copper Wire 2.5 sq mm (90m)', 5, 2150.0),
('oi5', 'o2', 'LED Panel Light 12W', 25, 320.0),
('oi6', 'o3', 'Copper Wire 2.5 sq mm (90m)', 20, 2150.0),
('oi7', 'o3', 'Distribution Board 8-way', 10, 1250.0),
('oi8', 'o3', '3-Pin Socket 16A', 60, 110.0);

-- Seed invoices
INSERT INTO "invoices" ("id", "dealer", "amount", "date", "status") VALUES
('INV-1042', 'Sri Lakshmi Agencies', 18240.0, 'Today', 'unpaid'),
('INV-1041', 'ABC Electricals', 33560.0, 'Yesterday', 'paid'),
('INV-1040', 'Raj Traders', 48500.0, '3 days ago', 'unpaid'),
('INV-1039', 'Mahesh Hardware & Electricals', 62400.0, '4 days ago', 'unpaid'),
('INV-1038', 'Raj Traders', 76000.0, '12 days ago', 'unpaid');

-- Seed conversations
INSERT INTO "conversations" ("id", "dealer", "city", "unread", "preview") VALUES
('c1', 'Sri Lakshmi Agencies', 'Mysuru', 1, 'Sure sir, please dispatch by evening.'),
('c2', 'Raj Traders', 'Bengaluru', 0, 'Paid ₹20,000 today via UPI. Remaining after Diwali sir.'),
('c3', 'ABC Electricals', 'Bengaluru', 0, 'Invoice received, making payment.');

-- Seed messages
INSERT INTO "messages" ("id", "conversationId", "fromRole", "text", "time", "kind", "data") VALUES
('m1', 'c1', 'dealer', 'Sir, order 20 MCB (32A Single Pole) and 15 Modular Switches (6A). Standard delivery please.', '10:14 AM', NULL, NULL),
('m2', 'c1', 'ai', 'Got it! I found both items in stock. Here is the order draft with wholesale pricing:', '10:15 AM', 'order', '{"title":"Order draft","items":[{"name":"MCB 32A Single Pole","qty":20,"price":245,"sku":"MCB-32A-SP"},{"name":"Modular Switch 6A","qty":15,"price":78,"sku":"SW-MOD-6A"}],"total":6070,"delivery":"Tomorrow, 11:00 AM"}'),
('m3', 'c1', 'dealer', 'Confirm this.', '10:17 AM', NULL, NULL),
('m4', 'c1', 'ai', 'Order confirmed and invoice generated. Stock has been deducted.', '10:18 AM', 'invoice', '{"invoice":"INV-1042","total":18240}'),
('m5', 'c1', 'dealer', 'Sure sir, please dispatch by evening.', '10:20 AM', NULL, NULL),

('m6', 'c2', 'dealer', 'Sir, overdue invoice of ₹76,000 details please.', 'Yesterday', NULL, NULL),
('m7', 'c2', 'ai', 'Here is the current dues report for Raj Traders. Total outstanding: ₹1,24,500.', 'Yesterday', 'invoice', '{"invoice":"INV-1038","total":76000}'),
('m8', 'c2', 'dealer', 'Paid ₹20,000 today via UPI. Remaining after Diwali sir.', '9:30 AM', NULL, NULL),
('m9', 'c2', 'ai', 'Thank you! Received ₹20,000. Outstanding balance has been updated in the ledger:', '9:31 AM', 'ledger', '{"paid":20000,"remaining":104500,"before":124500}'),
('m10', 'c2', 'ai', 'I have scheduled a follow-up reminder for the remaining balance.', '9:31 AM', 'reminder', '{"when":"Nov 5, 10:00 AM","note":"Gentle payment nudge for Raj Traders (₹1,04,500)"}'),

('m11', 'c3', 'dealer', 'Send last invoice copy.', '2 days ago', NULL, NULL),
('m12', 'c3', 'ai', 'Here is the generated invoice copy for ABC Electricals:', '2 days ago', 'invoice', '{"invoice":"INV-1041","total":33560}'),
('m13', 'c3', 'dealer', 'Invoice received, making payment.', 'Yesterday', NULL, NULL);
