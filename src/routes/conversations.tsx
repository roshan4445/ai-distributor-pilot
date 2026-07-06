import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Phone, Video, MoreVertical, Paperclip, Smile, Send, CheckCheck,
  Sparkles, FileText, Package, Bell, Wallet, Loader2, X, ArrowRight
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { fmt, type ChatMsg } from "@/lib/mock-data";
import { getConversationsList, getDealers, postMessage, getInvoiceDetailsAction } from "@/lib/db-queries";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/conversations")({
  loader: async () => {
    const conversations = await getConversationsList();
    const dealers = await getDealers();
    return { conversations, dealers };
  },
  head: () => ({
    meta: [
      { title: "Dealer Conversations — AI Distributor Copilot" },
      { name: "description", content: "AI reads WhatsApp orders, parses SKUs, generates invoices and schedules reminders — automatically." },
    ],
  }),
  component: ConversationsPage,
});

import { AlertTriangle } from "lucide-react";

function formatMessage(text: string) {
  const lines = text.split("\n");
  const resultElements: React.ReactNode[] = [];
  let inList = false;
  let currentListItems: React.ReactNode[] = [];

  const formatBold = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold">{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const cleanLine = line.trim();
    if (!cleanLine) {
      if (inList) {
        resultElements.push(
          <ul key={`list-${idx}`} className="list-disc pl-5 my-2 space-y-1">
            {currentListItems}
          </ul>
        );
        currentListItems = [];
        inList = false;
      }
      resultElements.push(<div key={`br-${idx}`} className="h-1.5" />);
      return;
    }

    const listMatch = line.match(/^[\*\-]\s+(.*)$/);
    if (listMatch) {
      inList = true;
      currentListItems.push(
        <li key={`li-${idx}`} className="text-[13.5px] leading-relaxed opacity-95 pl-0.5">
          {formatBold(listMatch[1])}
        </li>
      );
    } else {
      if (inList) {
        resultElements.push(
          <ul key={`list-${idx}`} className="list-disc pl-5 my-2 space-y-1">
            {currentListItems}
          </ul>
        );
        currentListItems = [];
        inList = false;
      }
      resultElements.push(
        <p key={`p-${idx}`} className="text-[13.5px] leading-relaxed my-1">
          {formatBold(line)}
        </p>
      );
    }
  });

  if (inList && currentListItems.length > 0) {
    resultElements.push(
      <ul key="list-final" className="list-disc pl-5 my-2 space-y-1">
        {currentListItems}
      </ul>
    );
  }

  return resultElements;
}

function ConversationsPage() {
  const { conversations: conversationsList, dealers: dealersList } = Route.useLoaderData();
  const router = useRouter();

  if (conversationsList.length === 0) {
    return (
      <AppShell>
        <div className="h-[calc(100vh-64px)] grid place-items-center bg-surface">
          <div className="text-center space-y-4 max-w-md p-6 card-surface">
            <AlertTriangle className="h-10 w-10 text-warning mx-auto animate-bounce" />
            <h2 className="text-[17px] font-semibold tracking-tight">Database Schema Required</h2>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed">
              Your Supabase cloud database is connected successfully but contains no tables yet.<br/><br/>
              Please run the query from <code className="bg-secondary px-1.5 py-0.5 rounded text-primary font-mono text-[12px]">supabase-schema.sql</code> in your Supabase SQL Editor.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const [activeId, setActiveId] = useState(conversationsList[0]?.id || "");
  const active = conversationsList.find((c) => c.id === activeId)!;

  const [typingInput, setTypingInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [simulationMode, setSimulationMode] = useState<"dealer" | "ai">("dealer");
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  useEffect(() => {
    if (active) {
      setLocalMessages(active.messages);
    }
  }, [active?.id, active?.messages]);

  const handleViewInvoice = async (invoiceId: string) => {
    setIsLoadingInvoice(true);
    try {
      const res = await getInvoiceDetailsAction({ data: invoiceId });
      if (res) {
        setActiveInvoice(res);
      } else {
        alert("Invoice details not found in active records.");
      }
    } catch (err) {
      console.error("Error loading invoice:", err);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const dealer = dealersList.find((d) => d.name === active.dealer) || {
    id: "d1",
    name: active.dealer,
    city: active.city,
    phone: "",
    pending: 0,
    trust: 80,
    lifetime: 0,
    avgPaymentDays: 15,
  };

  const handleSend = async () => {
    const text = typingInput.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setTypingInput("");

    // Appending optimistic message instantly
    const nowStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const userTempId = crypto.randomUUID();
    const optimisticUserMsg = {
      id: userTempId,
      from: simulationMode,
      text,
      time: nowStr
    };

    setLocalMessages((prev) => {
      const list = [...prev, optimisticUserMsg];
      if (simulationMode === "dealer") {
        list.push({
          id: "thinking-bubble",
          from: "ai",
          kind: "thinking",
          text: "Thinking through your ledgers…",
          time: ""
        });
      }
      return list;
    });

    try {
      await postMessage({
        data: {
          conversationId: active.id,
          from: simulationMode,
          text,
        }
      });
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove optimistic messages on failure
      setLocalMessages((prev) => prev.filter(m => m.id !== userTempId && m.id !== "thinking-bubble"));
    } finally {
      await router.invalidate();
      setIsSending(false);
    }
  };

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
            {conversationsList.map((c) => {
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
                      <span className="text-[10.5px] text-muted-foreground shrink-0 ml-2">{c.messages.length > 0 ? c.messages[c.messages.length - 1].time : ""}</span>
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
              {localMessages.map((m) => (
                <MessageBubble key={m.id} msg={m} onViewInvoice={handleViewInvoice} />
              ))}
            </AnimatePresence>
          </div>

          <footer className="p-4 border-t border-border bg-background space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl text-[12px] h-8">
                <button
                  onClick={() => setSimulationMode("dealer")}
                  className={`px-3 py-1 rounded-lg font-semibold transition inline-flex items-center gap-1 ${
                    simulationMode === "dealer"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  👤 Act as Dealer
                </button>
                <button
                  onClick={() => setSimulationMode("ai")}
                  className={`px-3 py-1 rounded-lg font-semibold transition inline-flex items-center gap-1 ${
                    simulationMode === "ai"
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🏢 Act as Distributor
                </button>
              </div>

              <div className="text-[11px] text-muted-foreground font-semibold">
                {simulationMode === "dealer" ? (
                  <span className="text-primary animate-pulse">Simulating Dealer Mobile WhatsApp Chat</span>
                ) : (
                  <span className="text-foreground/80">Simulating Distributor Admin Override Reply</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="h-10 w-10 rounded-xl hover:bg-secondary grid place-items-center text-muted-foreground"><Smile className="h-4.5 w-4.5" /></button>
              <button className="h-10 w-10 rounded-xl hover:bg-secondary grid place-items-center text-muted-foreground"><Paperclip className="h-4.5 w-4.5" /></button>
              <input 
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={simulationMode === "dealer" ? `Type as ${active.dealer} (AI agent will reply)…` : "Type manual message from Kumar Electricals (No AI reply)…"} 
                className="flex-1 h-10 px-3 rounded-xl bg-secondary text-[13.5px] focus:outline-none focus:ring-2 focus:ring-primary/20" 
                disabled={isSending}
              />
              <button 
                onClick={handleSend}
                disabled={isSending}
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-glow inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Send
              </button>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" /> AI Copilot is listening — orders, payments and promises are auto-detected.
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
            <StatRow label="Trust score" value={String(dealer.trust)} tone={dealer.trust >= 85 ? "success" : "warning"} />
            <StatRow label="Pending" value={fmt(dealer.pending)} tone={dealer.pending > 0 ? "warning" : "success"} />
            <StatRow label="Lifetime" value={fmt(dealer.lifetime)} />
            <StatRow label="Avg. payment" value={`${dealer.avgPaymentDays} days`} />
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
      <AnimatePresence>
        {activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-foreground">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/50">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Invoice Details</h3>
                  <p className="text-xs text-muted-foreground">Generated by AI Copilot</p>
                </div>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center font-bold text-muted-foreground text-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Invoice Content */}
              <div className="p-8 flex-1 overflow-y-auto space-y-6 text-sm">
                {/* Bill headers */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xl font-bold tracking-tight text-primary">KUMAR ELECTRICALS</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Wholesale Wholesaler & Distributor</div>
                    <div className="text-xs text-muted-foreground">Bengaluru, Karnataka</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[17px] font-bold text-foreground">{activeInvoice.invoice}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Status: <span className={`font-semibold ${activeInvoice.status === "delivered" ? "text-success" : "text-warning"}`}>{activeInvoice.status ? activeInvoice.status.toUpperCase() : "PROCESSING"}</span></div>
                    <div className="text-xs text-muted-foreground">Date: {activeInvoice.placedAt || "Today"}</div>
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Billed To</div>
                    <div className="font-semibold text-foreground mt-1">{activeInvoice.dealer}</div>
                    <div className="text-xs text-muted-foreground">Registered Dealer Profile</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Source Channel</div>
                    <div className="font-semibold text-primary mt-1 inline-flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> WhatsApp AI Agent
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary/50 text-left font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                        <th className="px-4 py-2.5">Item</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-right">Price</th>
                        <th className="px-4 py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeInvoice.items.map((it: any, i: number) => (
                        <tr key={i} className="hover:bg-secondary/20">
                          <td className="px-4 py-3 font-medium">{it.name}</td>
                          <td className="px-4 py-3 text-center">{it.qty}</td>
                          <td className="px-4 py-3 text-right">{fmt(it.price)}</td>
                          <td className="px-4 py-3 text-right font-medium">{fmt(it.qty * it.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{fmt(activeInvoice.total / 1.18)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>GST (18%)</span>
                    <span>{fmt(activeInvoice.total - (activeInvoice.total / 1.18))}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-2">
                    <span>Total Amount</span>
                    <span>{fmt(activeInvoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/50">
                <button
                  onClick={() => window.print()}
                  className="h-9 px-4 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-secondary transition"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="h-9 px-4 text-xs font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoadingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-background border border-border px-5 py-4 rounded-xl flex items-center gap-3 shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-[13px] font-semibold">Generating live receipt copy...</span>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("");
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

function MessageBubble({ msg, onViewInvoice }: { msg: ChatMsg; onViewInvoice: (invoiceId: string) => void }) {
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
            <div className="space-y-1">{formatMessage(msg.text)}</div>
          ) : null}

          {msg.kind === "order" && msg.data ? <OrderCard data={msg.data} /> : null}
          {msg.kind === "invoice" && msg.data ? <InvoiceCard data={msg.data} onViewInvoice={onViewInvoice} /> : null}
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

function InvoiceCard({ data, onViewInvoice }: { data: any; onViewInvoice: (invoiceId: string) => void }) {
  return (
    <button 
      onClick={() => onViewInvoice(data.invoice)}
      className="mt-2 text-left w-full rounded-xl bg-background/95 hover:bg-background/90 text-foreground border border-border/40 hover:border-primary/40 p-3 flex items-center gap-3 transition cursor-pointer"
    >
      <div className="h-9 w-9 rounded-lg bg-success/10 text-success grid place-items-center"><FileText className="h-4 w-4" /></div>
      <div className="flex-1">
        <div className="text-[12.5px] font-semibold">{data.invoice} generated</div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <span>Click to view receipt copy</span>
          <ArrowRight className="h-3 w-3 text-primary animate-pulse" />
        </div>
      </div>
      <div className="text-[13px] font-semibold">{fmt(data.total)}</div>
    </button>
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
