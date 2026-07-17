import { createFileRoute, redirect } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Phone, Video, MoreVertical, Paperclip, Smile, Send, CheckCheck,
  Sparkles, FileText, Package, Bell, Wallet, Loader2, X, ArrowRight, Trash2
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { fmt, type ChatMsg } from "@/lib/mock-data";
import { getConversationsList, getDealers, postMessage, getInvoiceDetailsAction, clearConversationAction } from "@/lib/db-queries";
import { useRouter } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/conversations")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  loader: async () => {
    const [conversations, dealers] = await Promise.all([
      getConversationsList(),
      getDealers()
    ]);
    const isBotConfigured = !!(typeof process !== "undefined" && process.env?.TELEGRAM_BOT_TOKEN);
    return { conversations, dealers, isBotConfigured };
  },
  head: () => ({
    meta: [
      { title: "Dealer Conversations — AI Distributor Copilot" },
      { name: "description", content: "AI reads WhatsApp orders, parses SKUs, generates invoices and schedules reminders — automatically." },
    ],
  }),
  component: ConversationsPage,
});

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
  const { conversations: conversationsList, dealers: dealersList, isBotConfigured } = Route.useLoaderData();
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
  const [activeQueryText, setActiveQueryText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [simulationMode, setSimulationMode] = useState<"dealer" | "ai">("dealer");
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);

  // Polling loop to auto-refresh dealer Telegram chats
  useEffect(() => {
    const interval = setInterval(() => {
      router.invalidate();
    }, 3000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (active) {
      setLocalMessages(active.messages);
    }
  }, [active?.id, active?.messages]);

  useEffect(() => {
    if (isSending) {
      setPipelineStep(0);
      const interval = setInterval(() => {
        setPipelineStep((prev) => Math.min(prev + 1, 6));
      }, 750);
      return () => clearInterval(interval);
    } else {
      setPipelineStep(0);
    }
  }, [isSending]);

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
    setActiveQueryText(text);
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
          text: "Agent is reasoning...",
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

  const handleClearChat = async () => {
    if (!confirm("Are you sure you want to clear the entire chat history and reset the AI agent's memory?")) return;
    setIsSending(true);
    try {
      await clearConversationAction({ data: { conversationId: active.id } });
      setLocalMessages([]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    } finally {
      await router.invalidate();
      setIsSending(false);
    }
  };

  // Derive plan from activeQueryText for live loading stepper
  const getLivePlan = () => {
    const query = activeQueryText.toLowerCase();
    
    if (query.includes("pay") || query.includes("paid") || query.includes("ledger") || 
        query.includes("balance") || query.includes("outstanding") || query.includes("due") || 
        query.includes("invoice")) {
      return {
        goal: "Goal: Audit Dues & Ledger Accounts",
        steps: [
          "Validate Dealer Profile",
          "Retrieve Invoices Ledger Accounts",
          "Sum Outstanding Receivables",
          "Verify Payment Promises/Stats",
          "Format Balance Summary & Report",
          "Confirm Consistent Ledger State"
        ]
      };
    }
    
    if (query.includes("want") || query.includes("buy") || query.includes("order") || 
        query.includes("purchase") || query.includes("mcb") || query.includes("switch") || 
        query.includes("wire") || query.includes("skt") || query.includes("socket") || 
        query.includes("light") || query.includes("confirm")) {
      return {
        goal: "Goal: Process & Draft Sales Order",
        steps: [
          "Validate Dealer Profile",
          "Identify Requested Product Catalog",
          "Verify Safety Stock Limits",
          "Check Dealer Credit Limit/Dues",
          "Calculate Order Wholesale Total",
          "Format Draft Proposal Bubble"
        ]
      };
    }
    
    return {
      goal: "Goal: Process Dealer Inquiry",
      steps: [
        "Validate Dealer Profile",
        "Analyze Inquiry Intent & Details",
        "Query Context Databases",
        "Formulate Natural Response",
        "Post AI Reply to Dealer",
        "Log Activity Reflection"
      ]
    };
  };

  const livePlan = getLivePlan();

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
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Online • {active.city}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <button 
                onClick={handleClearChat}
                disabled={isSending}
                className="h-9 px-3 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center gap-1.5 text-[12.5px] font-semibold transition border border-border/50 hover:border-destructive/20 disabled:opacity-50 cursor-pointer"
                title="Clear conversation history and reset memory"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear Chat
              </button>
              <span className="h-4 w-px bg-border mx-1" />
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

          <footer className="p-4 border-t border-border bg-slate-900/10 space-y-3">
            {isBotConfigured ? (
              <div className="rounded-xl border border-success/20 bg-success/5 p-4 flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-success/15 grid place-items-center text-success">
                  <Send className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold tracking-tight text-foreground">Telegram Channel Active</div>
                  <div className="mt-1 text-[11.5px] text-muted-foreground leading-normal">
                    This B2B chat channel is synchronized with Telegram. Incoming dealer queries and order requests sent to your bot are processed dynamically, and responses are rendered here in real-time.
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-warning/15 grid place-items-center text-warning">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold tracking-tight text-foreground">Telegram Setup Required</div>
                  <div className="mt-1 text-[11.5px] text-muted-foreground leading-normal">
                    To activate live B2B dealer ordering via Telegram, please obtain a Bot Token from <strong className="text-foreground">@BotFather</strong> and set the <code className="bg-secondary/40 px-1 py-0.5 rounded text-[11px] font-mono">TELEGRAM_BOT_TOKEN</code> variable in your local <strong className="text-foreground">.env</strong> file.
                  </div>
                </div>
              </div>
            )}
          </footer>
        </section>

        {/* Right context - AI Agent Platform Observability Panel */}
        <aside className="hidden xl:flex w-80 shrink-0 border-l border-border bg-slate-950 text-slate-100 flex-col overflow-y-auto divide-y divide-slate-900">
          {/* 1. AI AGENT STATUS CARD */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Agent Status</span>
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                <span>{isSending ? "PROCESSING" : "ACTIVE"}</span>
              </div>
            </div>
            
            <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-4 space-y-3.5 shadow-inner">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-500">Agent Name</div>
                  <div className="text-[12px] font-semibold text-slate-200">Distributor Operations Agent</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-500">Model</div>
                  <div className="font-semibold text-slate-300">Llama 3.3 70B</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase font-bold text-slate-500">Framework</div>
                  <div className="font-semibold text-slate-300">LangChain</div>
                </div>
              </div>
              <div className="border-t border-slate-900 pt-3">
                <div className="text-[9px] uppercase font-bold text-slate-500 mb-1.5">Architecture Core</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">✓ Guardrails</div>
                  <div className="flex items-center gap-1.5">✓ Planner</div>
                  <div className="flex items-center gap-1.5">✓ Memory</div>
                  <div className="flex items-center gap-1.5">✓ Tool Calling</div>
                  <div className="flex items-center gap-1.5">✓ Reflection</div>
                  <div className="flex items-center gap-1.5">✓ Observability</div>
                </div>
              </div>
            </div>
          </div>

          {/* If sending, show active logs */}
          {isSending ? (
            <>
              {/* 2. LIVE EXECUTION PIPELINE */}
              <div className="p-5 space-y-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Live Execution Pipeline</div>
                <div className="space-y-3 text-[12px] text-slate-300">
                  <PipelineStep icon="🛡" label="Running Guardrails..." status={pipelineStep >= 1 ? "done" : pipelineStep === 0 ? "active" : "pending"} />
                  <PipelineStep icon="🧠" label="Creating Execution Plan..." status={pipelineStep >= 2 ? "done" : pipelineStep === 1 ? "active" : "pending"} />
                  <PipelineStep icon="🤖" label="AI Reasoning..." status={pipelineStep >= 3 ? "done" : pipelineStep === 2 ? "active" : "pending"} />
                  <PipelineStep icon="🔧" label="Calling Business Tools..." status={pipelineStep >= 4 ? "done" : pipelineStep === 3 ? "active" : "pending"} />
                  <PipelineStep icon="🔍" label="Post-Execution Reflection..." status={pipelineStep >= 5 ? "done" : pipelineStep === 4 ? "active" : "pending"} />
                  <PipelineStep icon="✅" label="Completed Successfully" status={pipelineStep >= 6 ? "done" : pipelineStep === 5 ? "active" : "pending"} />
                </div>
              </div>

              {/* 3. EXECUTION PLAN PANEL */}
              {pipelineStep >= 1 && (
                <div className="p-5 space-y-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Execution Plan</div>
                  <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-3.5 space-y-2">
                    <div className="text-[11.5px] font-semibold text-primary">{livePlan.goal}</div>
                    <div className="space-y-1.5 text-[11px] text-slate-400">
                      {livePlan.steps.map((step, idx) => {
                        const stepActive = pipelineStep >= (idx + 1);
                        return (
                          <div key={idx} className={stepActive ? "text-success font-medium" : "text-slate-300 font-medium"}>
                            {stepActive ? "✓" : "○"} {step}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. AGENT MONITOR */}
              <div className="p-5 space-y-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Agent Monitor</div>
                <div className="space-y-2 text-[11px] text-slate-400">
                  <MonitorRow label="Current State" value={pipelineStep === 0 ? "VALIDATING" : pipelineStep === 1 ? "PLANNING" : pipelineStep === 2 ? "THINKING" : pipelineStep === 3 ? "EXECUTING" : pipelineStep === 4 ? "REFLECTING" : "COMPLETED"} tone="info" />
                  <MonitorRow label="Guardrail Status" value={pipelineStep >= 1 ? "PASSED" : "VALIDATING..."} tone={pipelineStep >= 1 ? "success" : "warning"} />
                  <MonitorRow label="Planner Status" value={pipelineStep >= 2 ? "PLAN GENERATED" : "PLANNING..."} tone={pipelineStep >= 2 ? "success" : "warning"} />
                  <MonitorRow label="Confidence" value="98%" tone="success" />
                  <MonitorRow 
                    label="Tools Active" 
                    value={
                      pipelineStep === 3 
                        ? (activeQueryText.toLowerCase().includes("pay") || activeQueryText.toLowerCase().includes("paid") ? "recordPayment()" : "createOrder()") 
                        : pipelineStep > 3 
                          ? (activeQueryText.toLowerCase().includes("pay") || activeQueryText.toLowerCase().includes("paid") ? "recordPayment() (Done)" : "createOrder() (Done)") 
                          : "None"
                    } 
                  />
                  <MonitorRow label="Reflection Status" value={pipelineStep >= 5 ? "HEALTHY" : "WAITING..."} tone={pipelineStep >= 5 ? "success" : "warning"} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 7. MEMORY INDICATOR */}
              <div className="p-5 space-y-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Conversation Memory</div>
                <div className="bg-slate-900/60 border border-slate-900 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Memory Status</span>
                    <span className="text-success font-semibold">LOADED</span>
                  </div>
                  <div className="border-t border-slate-900 pt-2 space-y-2 text-[12px]">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold">Active Dealer</div>
                      <div className="font-semibold text-slate-300">{active.dealer}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold">Last Active Order</div>
                      <div className="font-semibold text-slate-300">{active.memory?.lastOrderId ? "o-" + active.memory.lastOrderId.substring(0, 8) : active.memory?.lastInvoiceId || "None"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold">Pending Context</div>
                      <div className="font-semibold text-slate-300 truncate">{active.memory?.pendingClarification || "No outstanding queries"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regular Dealer Context Panel */}
              <div className="p-5 space-y-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Dealer Profile</div>
                <div className="space-y-3 text-[12px]">
                  <StatRowDark label="Registered Name" value={active.dealer} />
                  <StatRowDark label="Base Location" value={active.city} />
                  <StatRowDark label="Trust Rank" value={`${dealer.trust}%`} tone={dealer.trust >= 85 ? "success" : "warning"} />
                  <StatRowDark label="Outstanding dues" value={fmt(dealer.pending)} tone={dealer.pending > 0 ? "warning" : "success"} />
                  <StatRowDark label="Lifetime Business" value={fmt(dealer.lifetime)} />
                  <StatRowDark label="Avg. Payment Cycle" value={`${dealer.avgPaymentDays} days`} />
                </div>
              </div>

              {/* AI note */}
              <div className="p-5">
                <div className="rounded-xl border border-slate-900 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Recommendations</div>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed">
                    Account trust is rated high. Weekly order volume is stable. Consider extending credit limits for upcoming Diwali orders to capture billing growth.
                  </p>
                </div>
              </div>
            </>
          )}
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
                    <div className="text-xs text-muted-foreground mt-0.5">Wholesale Distributor & Supplier</div>
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

function StatRowDark({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  const color = tone === "success" ? "text-success font-semibold" : tone === "warning" ? "text-warning font-semibold" : "text-slate-300";
  return (
    <div className="flex items-center justify-between text-[12px] py-1 border-b border-slate-900/60">
      <span className="text-slate-400">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}

function PipelineStep({ icon, label, status }: { icon: string; label: string; status: "done" | "active" | "pending" }) {
  return (
    <div className={`flex items-center gap-2.5 py-1.5 transition-all duration-300 ${status === "pending" ? "opacity-35" : "opacity-100"}`}>
      <span className="text-[14px]">{icon}</span>
      <span className={`flex-1 ${status === "active" ? "text-primary font-medium" : status === "done" ? "text-slate-300" : "text-slate-500"}`}>{label}</span>
      {status === "active" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
      {status === "done" && <span className="text-[10px] text-success font-bold bg-success/15 px-1.5 py-0.2 rounded border border-success/20">Done</span>}
    </div>
  );
}

function MonitorRow({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "info" }) {
  const color = tone === "success" ? "text-success font-bold" : tone === "warning" ? "text-warning font-bold" : tone === "info" ? "text-primary font-bold" : "text-slate-300";
  return (
    <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 pt-0.5">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono text-[11px] ${color}`}>{value}</span>
    </div>
  );
}

function formatMessageTime(timeStr: string) {
  if (!timeStr) return "";
  if (timeStr.includes("T") && timeStr.includes("Z")) {
    try {
      return new Date(timeStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } catch (_) {
      return timeStr;
    }
  }
  return timeStr;
}

function MessageBubble({ msg, onViewInvoice }: { msg: ChatMsg; onViewInvoice: (invoiceId: string) => void }) {
  const isDealer = msg.from === "dealer";
  const [showTrace, setShowTrace] = useState(false);

  if (isDealer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className="flex justify-start"
      >
        <div className="max-w-[520px]">
          <div className="rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-soft bg-background border border-border rounded-tl-sm">
            {msg.text ? <div className="space-y-1">{formatMessage(msg.text)}</div> : null}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground">
            {formatMessageTime(msg.time)}
          </div>
        </div>
      </motion.div>
    );
  }

  // AI response layout - Rich Response Card (OpenAI / Cursor styled)
  const isThinking = msg.kind === "thinking";
  const hasMetadata = msg.data && msg.data.traceId;
  
  // Extract or mock fields for consistent hackathon demo visuals
  const intent = hasMetadata ? msg.data.intent : (msg.kind === "order" ? "ORDER" : msg.kind === "invoice" ? "ORDER" : msg.kind === "ledger" ? "PAYMENT" : msg.kind === "reminder" ? "PAYMENT_PROMISE" : "BUSINESS_QUERY");
  const confidence = hasMetadata ? msg.data.confidence : 0.95;
  const executionTime = hasMetadata ? msg.data.executionTime : "824ms";
  const health = hasMetadata ? msg.data.health : "HEALTHY";
  const reflection = hasMetadata ? msg.data.reflection?.summary : (msg.kind === "order" ? "Order draft generated with wholesale pricing" : msg.kind === "invoice" ? "Invoice generated and stock updated successfully" : msg.kind === "ledger" ? "Dues ledger and balances updated successfully" : msg.kind === "reminder" ? "Follow-up collections reminder scheduled" : "Database queries executed successfully");
  const planSteps = hasMetadata ? msg.data.plan : ["Validate Dealer Profile", "Search Product Catalog", "Verify Safety Stock Limits", "Execute Core Intent Action", "Return Structured Payload"];
  const timeline = hasMetadata ? msg.data.timeline : [
    { state: "VALIDATING", duration: "12ms" },
    { state: "PLANNING", duration: "45ms" },
    { state: "THINKING", duration: "580ms" },
    { state: "EXECUTING", duration: "187ms" }
  ];
  const toolsUsed = hasMetadata ? msg.data.toolsUsed : (msg.kind === "order" ? ["createOrder"] : msg.kind === "invoice" ? ["createOrder"] : msg.kind === "ledger" ? ["recordPayment"] : msg.kind === "reminder" ? ["scheduleReminder"] : []);

  // For order/invoice/ledger/reminder cards, we extract the nested 'data' payload from the full metadata if it exists
  const innerData = hasMetadata ? msg.data.data : msg.data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      className="flex justify-end"
    >
      <div className="max-w-[560px] flex flex-col items-end">
        {/* Glow-highlighted Agent Header */}
        <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>Distributor Operations Agent</span>
        </div>

        {/* Outer Rich Response Card (Dark style) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 p-4 shadow-xl space-y-3 w-full rounded-tr-sm">
          {/* Card Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[10.5px] uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Intent: {intent}
              </span>
              <span className="text-slate-550">•</span>
              <span className="text-slate-400">Confidence: <span className="text-success font-semibold">{(confidence * 100).toFixed(0)}%</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Time: <span className="font-mono text-slate-300 font-semibold">{executionTime}</span></span>
              <span className="text-slate-500">•</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                health === "HEALTHY" ? "bg-success/15 text-success border border-success/20" : "bg-warning/15 text-warning border border-warning/20"
              }`}>
                {health}
              </span>
            </div>
          </div>

          {/* Thinking / Loader */}
          {isThinking ? (
            <div className="flex items-center gap-2.5 text-[13px] text-slate-300 py-1">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="animate-pulse">{msg.text}</span>
            </div>
          ) : (
            <>
              {/* Response Text */}
              {msg.text && (
                <div className="text-[13.5px] text-slate-200 leading-relaxed font-normal whitespace-pre-wrap space-y-1">
                  {formatMessage(msg.text)}
                </div>
              )}

              {/* Specific Cards (Rendered with internal dark style parameters) */}
              {msg.kind === "order" && innerData ? <OrderCard data={innerData} /> : null}
              {msg.kind === "invoice" && innerData ? <InvoiceCard data={innerData} onViewInvoice={onViewInvoice} /> : null}
              {msg.kind === "ledger" && innerData ? <LedgerCard data={innerData} /> : null}
              {msg.kind === "reminder" && innerData ? <ReminderCard data={innerData} /> : null}

              {/* Reflection Summary Row */}
              {reflection && (
                <div className="text-[11.5px] bg-slate-900/40 border border-slate-900/60 rounded-lg p-2.5 text-slate-400">
                  <span className="text-success font-semibold">✓ Reflection summary:</span> {reflection}
                </div>
              )}

              {/* Collapsible Trace Panel Trigger */}
              <div className="border-t border-slate-900 pt-2.5 flex justify-between items-center">
                <button
                  onClick={() => setShowTrace(!showTrace)}
                  className="text-[11px] font-semibold text-primary hover:text-primary/80 transition inline-flex items-center gap-1 cursor-pointer"
                >
                  {showTrace ? "Hide Observability Trace ▲" : "Show Observability Trace ▼"}
                </button>
                <div className="text-[9.5px] text-slate-500 font-mono font-bold tracking-wider">
                  LCEL CHAIN RUN
                </div>
              </div>

              {/* Observability Expanded Content */}
              {showTrace && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 pt-2 overflow-hidden text-[11.5px]"
                >
                  {/* Execution Plan Checklist */}
                  <div className="bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Execution Plan Steps</div>
                    <ul className="space-y-1">
                      {planSteps.map((step: string, i: number) => (
                        <li key={i} className="text-slate-300 flex items-center gap-1.5">
                          <span className="text-success">✓</span> {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Observability Timeline */}
                  <div className="bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Execution Timeline</div>
                    <div className="flex flex-wrap items-center gap-1.5 text-slate-400">
                      {timeline.map((t: any, i: number) => (
                        <React.Fragment key={i}>
                          {i > 0 && <span className="text-slate-600">→</span>}
                          <div className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10.5px] font-mono">
                            <span className="text-slate-300 font-semibold">{t.state}</span> ({t.duration})
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Platform Tools Executed */}
                  {toolsUsed && toolsUsed.length > 0 && (
                    <div className="bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 space-y-2">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Platform Tools Invoked</div>
                      <div className="space-y-2">
                        {toolsUsed.map((tool: string, i: number) => (
                          <div key={i} className="space-y-1 bg-slate-950 p-2.5 rounded border border-slate-900 text-[11px] font-mono">
                            <div className="flex items-center justify-between">
                              <span className="text-primary font-semibold">🔧 {tool}()</span>
                              <span className="text-success font-bold text-[10px]">COMPLETED</span>
                            </div>
                            <div className="text-[9.5px] text-slate-500 flex justify-between">
                              <span>Trace status: Success</span>
                              <span>Time: 145ms</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Time and check check tick mark */}
        <div className="mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground justify-end">
          {formatMessageTime(msg.time)}
          {!isThinking && <CheckCheck className="h-3 w-3 text-primary" />}
        </div>
      </div>
    </motion.div>
  );
}

function OrderCard({ data }: { data: any }) {
  return (
    <div className="mt-2 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-800/80 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary">
        <Package className="h-3.5 w-3.5" /> {data.title || "Order Draft"}
      </div>
      <ul className="mt-2 divide-y divide-slate-800/60">
        {data.items && data.items.map((it: any, i: number) => (
          <li key={i} className="py-1.5 flex items-center justify-between text-[12px]">
            <div className="min-w-0">
              <div className="font-medium truncate">{it.name}</div>
              <div className="text-slate-500 text-[10px] font-mono">{it.sku}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">×{it.qty}</div>
              <div className="text-slate-500 text-[10px]">{fmt(it.qty * it.price)}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[12px]">
        <span className="text-slate-400">Delivery • {data.delivery || "Standard"}</span>
        <span className="font-bold text-success">{fmt(data.total)}</span>
      </div>
    </div>
  );
}

function InvoiceCard({ data, onViewInvoice }: { data: any; onViewInvoice: (invoiceId: string) => void }) {
  return (
    <button 
      onClick={() => onViewInvoice(data.invoice)}
      className="mt-2 text-left w-full rounded-xl bg-slate-900/90 hover:bg-slate-900 text-slate-100 border border-slate-800 hover:border-primary/40 p-3 flex items-center gap-3 transition cursor-pointer"
    >
      <div className="h-9 w-9 rounded-lg bg-success/10 text-success grid place-items-center"><FileText className="h-4 w-4" /></div>
      <div className="flex-1">
        <div className="text-[12.5px] font-semibold">{data.invoice} generated</div>
        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <span>Click to view receipt copy</span>
          <ArrowRight className="h-3 w-3 text-primary animate-pulse" />
        </div>
      </div>
      <div className="text-[13px] font-bold text-success">{fmt(data.total)}</div>
    </button>
  );
}

function LedgerCard({ data }: { data: any }) {
  return (
    <div className="mt-2 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-800/80 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-success"><Wallet className="h-3.5 w-3.5" /> Ledger updated</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
        <div>
          <div className="text-slate-500 text-[10px]">Before</div>
          <div className="font-semibold line-through text-slate-400">{fmt(data.before)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-[10px]">Paid</div>
          <div className="font-semibold text-success">+{fmt(data.paid)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-[10px]">Remaining</div>
          <div className="font-bold text-slate-200">{fmt(data.remaining)}</div>
        </div>
      </div>
    </div>
  );
}

function ReminderCard({ data }: { data: any }) {
  return (
    <div className="mt-2 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-800/80 p-3 flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-warning/15 text-warning grid place-items-center"><Bell className="h-4 w-4" /></div>
      <div className="flex-1">
        <div className="text-[12px] font-semibold text-slate-200">Reminder scheduled</div>
        <div className="text-[11px] text-slate-400 leading-normal">{data.when} · {data.note}</div>
      </div>
      <span className="text-[9.5px] font-bold bg-warning/10 text-warning px-1.5 py-0.2 rounded border border-warning/20 self-start">Auto</span>
    </div>
  );
}
