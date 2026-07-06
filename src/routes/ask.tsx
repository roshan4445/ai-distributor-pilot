import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, ArrowUpRight, User, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { askAiSuggestions, askAiSeedChat } from "@/lib/mock-data";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Ask AI — AI Distributor Copilot" },
      { name: "description", content: "Ask your business anything. The AI knows every dealer, invoice, and SKU." },
    ],
  }),
  component: AskAiPage,
});

type Msg = { id: string; role: "user" | "ai"; text: string; thinking?: boolean };

const initial: Msg[] = [
  { id: "s0", role: "user", text: askAiSeedChat[0].q },
  { id: "s1", role: "ai", text: askAiSeedChat[0].a },
];

const canned: Record<string, string> = {
  "Which products are running low?":
    "3 SKUs are below their minimum right now:\n\n• MCB 32A Single Pole — 42 units (min 120) · Critical\n• 3-Pin Socket 16A — 96 units (min 300) · Low\n• Distribution Board 8-way — 34 units (min 40) · Watch\n\nDraft reorder for MCB 32A: 300 units @ ₹210 = ₹63,000 from Havells. Want me to send the PO?",
  "How much revenue did we make today?":
    "Today's revenue is ₹1,84,500 — up 18% vs last Sunday. Top contributors:\n\n• Sri Lakshmi Agencies — ₹62,400\n• ABC Electricals — ₹33,560\n• PowerTech Distributors — ₹28,900\n\nCollections today: ₹1,26,000 (68% of billed).",
  "Which dealer should I follow up with today?":
    "Raj Traders — highest priority.\n\n₹1,24,500 outstanding for 42 days, no payment promise, trust score dropped from 78 → 62 this quarter. Recommend a personal call before 12 PM.",
  "Which dealer is most profitable this month?":
    "ABC Electricals — ₹3.62L billed, ₹41k gross margin, 100% on-time payments. Safe to raise credit limit from ₹2L → ₹3.5L.",
  "Forecast next week's cash collection.":
    "Estimated collection next week: ₹6.4L – ₹7.1L\n\nDrivers: 4 scheduled promises (₹3.1L), typical weekly repeat orders from ABC & Sri Lakshmi (₹2.2L), and 2 partial payments due. Confidence: 82%.",
};

function AskAiPage() {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");

  const send = (raw?: string) => {
    const q = (raw ?? input).trim();
    if (!q) return;
    const uid = crypto.randomUUID();
    const aid = crypto.randomUUID();
    setMessages((m) => [...m, { id: uid, role: "user", text: q }, { id: aid, role: "ai", text: "", thinking: true }]);
    setInput("");
    setTimeout(() => {
      const answer = canned[q] ?? "Here's what I found based on your live data — I've cross-checked dealer ledgers, WhatsApp threads and inventory levels. Ask me for a deeper breakdown any time.";
      setMessages((m) => m.map((x) => x.id === aid ? { ...x, text: answer, thinking: false } : x));
    }, 900);
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 pb-6">
            {messages.length <= 2 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" /> Ask AI
                </div>
                <h1 className="mt-3 text-[32px] font-semibold tracking-tight">
                  Ask your <span className="text-gradient">business</span> anything.
                </h1>
                <p className="mt-2 text-[14px] text-muted-foreground">
                  The AI has read every WhatsApp message, every invoice, and every ledger entry.
                </p>
              </motion.div>
            )}

            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                    {m.role === "user" ? (
                      <div className="flex items-start gap-3 justify-end">
                        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-2.5 text-[13.5px] leading-relaxed">
                          {m.text}
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[11px] font-bold shrink-0">R</div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0"><Sparkles className="h-4 w-4" /></div>
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-2 border border-border px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line">
                          {m.thinking ? (
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking through your ledgers…
                            </span>
                          ) : m.text}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {messages.length <= 2 && (
              <div className="mt-10">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Try asking</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {askAiSuggestions.map((q) => (
                    <button key={q} onClick={() => send(q)}
                      className="group text-left rounded-xl border border-border bg-background p-3.5 hover:border-primary/40 hover:shadow-elevate transition">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[13px] font-medium">{q}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background/80 backdrop-blur">
          <div className="max-w-3xl mx-auto px-5 md:px-8 py-4">
            <div className="rounded-2xl border border-border bg-background p-2 flex items-end gap-2 shadow-soft focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition">
              <textarea
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1} placeholder="Ask your business anything…"
                className="flex-1 resize-none bg-transparent px-3 py-2 text-[14px] focus:outline-none max-h-40"
              />
              <button onClick={() => send()} className="h-10 px-3.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-glow">
                <Send className="h-3.5 w-3.5" /> Ask
              </button>
            </div>
            <div className="mt-2 text-[11px] text-muted-foreground text-center">
              Grounded on your live data — orders, invoices, ledgers, WhatsApp conversations.
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
