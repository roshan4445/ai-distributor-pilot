import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, ArrowUpRight, User, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { askAiSuggestions, askAiSeedChat } from "@/lib/mock-data";
import { askAiQuery } from "@/lib/db-queries";

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

function formatMessage(text: string) {
  const lines = text.split("\n");
  const resultElements: React.ReactNode[] = [];
  let inList = false;
  let currentListItems: React.ReactNode[] = [];

  const formatBold = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-semibold text-foreground">{part}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, idx) => {
    const cleanLine = line.trim();
    if (!cleanLine) {
      if (inList) {
        resultElements.push(
          <ul key={`list-${idx}`} className="list-disc pl-5 my-2 space-y-1.5">
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
        <li key={`li-${idx}`} className="text-[13.5px] leading-relaxed text-muted-foreground pl-0.5">
          {formatBold(listMatch[1])}
        </li>
      );
    } else {
      if (inList) {
        resultElements.push(
          <ul key={`list-${idx}`} className="list-disc pl-5 my-2 space-y-1.5">
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
      <ul key="list-final" className="list-disc pl-5 my-2 space-y-1.5">
        {currentListItems}
      </ul>
    );
  }

  return resultElements;
}

function AskAiPage() {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");

  const send = async (raw?: string) => {
    const q = (raw ?? input).trim();
    if (!q) return;
    const uid = crypto.randomUUID();
    const aid = crypto.randomUUID();
    setMessages((m) => [...m, { id: uid, role: "user", text: q }, { id: aid, role: "ai", text: "", thinking: true }]);
    setInput("");
    try {
      const answer = await askAiQuery({ data: q });
      setMessages((m) => m.map((x) => x.id === aid ? { ...x, text: answer, thinking: false } : x));
    } catch (e) {
      setMessages((m) => m.map((x) => x.id === aid ? { ...x, text: "Sorry, I had trouble reading the database. Please try again.", thinking: false } : x));
    }
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
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-2 border border-border px-4 py-3 text-[13.5px] leading-relaxed">
                          {m.thinking ? (
                            <span className="inline-flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking through your ledgers…
                            </span>
                          ) : (
                            <div className="space-y-1">{formatMessage(m.text)}</div>
                          )}
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
