import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Phone, Video, MoreVertical, Paperclip, Smile, Send, CheckCheck,
  Sparkles, FileText, Package, Bell, Wallet, Loader2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { conversations, fmt, type ChatMsg } from "@/lib/mock-data";

export const Route = createFileRoute("/conversations")({
  head: () => ({
    meta: [
      { title: "Dealer Conversations — AI Distributor Copilot" },
      { name: "description", content: "AI reads WhatsApp orders, parses SKUs, generates invoices and schedules reminders — automatically." },
    ],
  }),
  component: ConversationsPage,
});

function ConversationsPage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const active = conversations.find((c) => c.id === activeId)!;

  return (
    <AppShell>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Conversation list */}
        <aside className="w-80 shrink-0 border-r border-border bg-background flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Inbox</div>
            <div className="text-[17px] font-semibold tracking-tight">Dealer chats</div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Search chats…" className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-border/70 transition ${active ? "bg-accent" : "hover:bg-secondary"}`}
                >
                  <Avatar name={c.dealer} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13.5px] font-semibold truncate">{c.dealer}</span>
                      <span className="text-[10.5px] text-muted-foreground shrink-0 ml-2">{c.messages[c.messages.length - 1].time}</span>
                    </div>
                    <div className="text-[12px] text-muted-foreground truncate">{c.preview}</div>
                  </div>
                  {c.unread ? <span className="mt-1 text-[10px] font-bold h-4 min-w-4 px-1 grid place-items-center rounded-full bg-primary text-primary-foreground">{c.unread}</span> : null}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat pane */}
        <section className="flex-1 min-w-0 flex flex-col bg-surface">
          <header className="h-16 px-5 flex items-center gap-3 border-b border-border bg-background">
            <Avatar name={active.dealer} />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold tracking-tight">{active.dealer}</div>
              <div className="text-[11.5px] text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Online • {active.city}
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button className="h-9 w-9 rounded-lg hover:bg-secondary grid place-items-center"><Phone className="h-4 w-4" /></button>
              <button className="h-9 w-9 rounded-lg hover:bg-secondary grid place-items-center"><Video className="h-4 w-4" /></button>
              <button className="h-9 w-9 rounded-lg hover:bg-secondary grid place-items-center"><MoreVertical className="h-4 w-4" /></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.045) 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          >
            <AnimatePresence initial={false}>
              {active.messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
            </AnimatePresence>
          </div>

          <footer className="p-3 border-t border-border bg-background">
            <div className="flex items-center gap-2">
              <button className="h-10 w-10 rounded-xl hover:bg-secondary grid place-items-center text-muted-foreground"><Smile className="h-4.5 w-4.5" /></button>
              <button className="h-10 w-10 rounded-xl hover:bg-secondary grid place-items-center text-muted-foreground"><Paperclip className="h-4.5 w-4.5" /></button>
              <input placeholder="Type a message… AI will assist" className="flex-1 h-10 px-3 rounded-xl bg-secondary text-[13.5px] focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-glow inline-flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> AI Copilot is listening — orders, payments and promises are auto-detected.
            </div>
          </footer>
        </section>

        {/* Right context */}
        <aside className="hidden xl:flex w-72 shrink-0 border-l border-border bg-background flex-col">
          <div className="p-5 border-b border-border">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Dealer context</div>
            <div className="mt-1 text-[15px] font-semibold tracking-tight">{active.dealer}</div>
            <div className="text-[12px] text-muted-foreground">{active.city}</div>
          </div>
          <div className="p-5 space-y-4 text-[13px]">
            <StatRow label="Trust score" value="88" tone="success" />
            <StatRow label="Pending" value={fmt(88400)} tone="warning" />
            <StatRow label="Lifetime" value={fmt(2410000)} />
            <StatRow label="Avg. payment" value="14 days" />
          </div>
          <div className="px-5 pb-5">
            <div className="rounded-xl border border-border p-3 bg-primary/5">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> AI note</div>
              <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">
                Reliable payer. Orders spike every Monday. Consider offering a standing weekly order.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[12px] font-bold shrink-0">
      {initials}
    </div>
  );
}

function StatRow({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  const color = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMsg }) {
  const isDealer = msg.from === "dealer";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      className={`flex ${isDealer ? "justify-start" : "justify-end"}`}
    >
      <div className={`max-w-[520px] ${isDealer ? "" : "flex flex-col items-end"}`}>
        {!isDealer && (
          <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold text-primary">
            <Sparkles className="h-3 w-3" /> AI Copilot
          </div>
        )}
        <div className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-soft ${
          isDealer
            ? "bg-background border border-border rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        }`}>
          {msg.kind === "thinking" ? (
            <span className="inline-flex items-center gap-2 text-[12.5px]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{msg.text}</span>
            </span>
          ) : msg.text ? (
            <span className="whitespace-pre-line">{msg.text}</span>
          ) : null}

          {msg.kind === "order" && msg.data ? <OrderCard data={msg.data} /> : null}
          {msg.kind === "invoice" && msg.data ? <InvoiceCard data={msg.data} /> : null}
          {msg.kind === "ledger" && msg.data ? <LedgerCard data={msg.data} /> : null}
          {msg.kind === "reminder" && msg.data ? <ReminderCard data={msg.data} /> : null}
        </div>
        <div className={`mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground ${isDealer ? "" : "justify-end"}`}>
          {msg.time}
          {!isDealer && <CheckCheck className="h-3 w-3 text-primary" />}
        </div>
      </div>
    </motion.div>
  );
}

function OrderCard({ data }: { data: any }) {
  return (
    <div className="mt-2 rounded-xl bg-background/95 text-foreground border border-border/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
        <Package className="h-3.5 w-3.5" /> {data.title}
      </div>
      <ul className="mt-2 divide-y divide-border/70">
        {data.items.map((it: any, i: number) => (
          <li key={i} className="py-1.5 flex items-center justify-between text-[12.5px]">
            <div className="min-w-0">
              <div className="font-medium truncate">{it.name}</div>
              <div className="text-muted-foreground text-[10.5px]">{it.sku}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">×{it.qty}</div>
              <div className="text-muted-foreground text-[10.5px]">{fmt(it.qty * it.price)}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 pt-2 border-t border-border/70 flex items-center justify-between text-[12.5px]">
        <span className="text-muted-foreground">Delivery • {data.delivery}</span>
        <span className="font-semibold">{fmt(data.total)}</span>
      </div>
    </div>
  );
}

function InvoiceCard({ data }: { data: any }) {
  return (
    <div className="mt-2 rounded-xl bg-background/95 text-foreground border border-border/40 p-3 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-success/10 text-success grid place-items-center"><FileText className="h-4 w-4" /></div>
      <div className="flex-1">
        <div className="text-[12.5px] font-semibold">{data.invoice} generated</div>
        <div className="text-[11px] text-muted-foreground">Inventory updated · WhatsApp copy sent</div>
      </div>
      <div className="text-[13px] font-semibold">{fmt(data.total)}</div>
    </div>
  );
}

function LedgerCard({ data }: { data: any }) {
  return (
    <div className="mt-2 rounded-xl bg-background/95 text-foreground border border-border/40 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-success"><Wallet className="h-3.5 w-3.5" /> Ledger updated</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
        <div>
          <div className="text-muted-foreground text-[10.5px]">Before</div>
          <div className="font-semibold line-through text-muted-foreground">{fmt(data.before)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10.5px]">Paid</div>
          <div className="font-semibold text-success">+{fmt(data.paid)}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-[10.5px]">Remaining</div>
          <div className="font-semibold">{fmt(data.remaining)}</div>
        </div>
      </div>
    </div>
  );
}

function ReminderCard({ data }: { data: any }) {
  return (
    <div className="mt-2 rounded-xl bg-background/95 text-foreground border border-border/40 p-3 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-warning/15 text-warning grid place-items-center"><Bell className="h-4 w-4" /></div>
      <div className="flex-1">
        <div className="text-[12.5px] font-semibold">Reminder scheduled</div>
        <div className="text-[11px] text-muted-foreground">{data.when} · {data.note}</div>
      </div>
      <Pill tone="warning">Auto</Pill>
    </div>
  );
}
