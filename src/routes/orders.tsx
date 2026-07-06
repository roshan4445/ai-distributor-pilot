import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Package, Clock, ArrowRight, CheckCircle2, Truck, Boxes, PackageCheck, FileText, Printer, X, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { PageHeader } from "./inventory";
import { fmt } from "@/lib/mock-data";
import { getOrders, updateOrderStatusAction } from "@/lib/db-queries";

export const Route = createFileRoute("/orders")({
  loader: () => getOrders(),
  head: () => ({
    meta: [
      { title: "Orders — AI Distributor Copilot" },
      { name: "description", content: "Every order — parsed from WhatsApp, priced, invoiced and dispatched with AI oversight." },
    ],
  }),
  component: OrdersPage,
});

const statusMap = {
  processing: { tone: "warning" as const, label: "Processing", icon: Clock },
  packed: { tone: "info" as const, label: "Packed", icon: Boxes },
  dispatched: { tone: "primary" as const, label: "Dispatched", icon: Truck },
  delivered: { tone: "success" as const, label: "Delivered", icon: PackageCheck },
};

const stages = ["processing", "packed", "dispatched", "delivered"] as const;

function OrdersPage() {
  const orders = Route.useLoaderData();
  const router = useRouter();
  const [activeInvoice, setActiveInvoice] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const stages = ["processing", "packed", "dispatched", "delivered"] as const;
    const idx = stages.indexOf(currentStatus as any);
    if (idx === -1 || idx === stages.length - 1) return;
    const nextStatus = stages[idx + 1];
    
    await updateOrderStatusAction({ data: { orderId, nextStatus } });
    router.invalidate();
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.invoice.toLowerCase().includes(search.toLowerCase()) ||
      o.dealer.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      o.status.toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <PageHeader eyebrow="Orders" title="Live order pipeline" subtitle="24 orders today · 6 parsed by AI from WhatsApp this hour" />

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order or dealer…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="hidden md:flex gap-2">
            {["All", "Processing", "Packed", "Dispatched", "Delivered"].map((t) => {
              const active = filter === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`h-9 px-3 rounded-lg text-[12.5px] font-semibold border transition ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-secondary text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((o) => {
            const s = statusMap[o.status];
            const stageIdx = stages.indexOf(o.status);
            const Icon = s.icon;
            return (
              <div key={o.id} className="card-surface p-5 hover:shadow-elevate transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{o.invoice}</span>
                      <Pill tone={s.tone} icon={<Icon className="h-3 w-3" />}>{s.label}</Pill>
                    </div>
                    <Link to="/dealers/$id" params={{ id: o.dealerId }} className="mt-1 block text-[17px] font-semibold tracking-tight hover:text-primary transition">{o.dealer}</Link>
                    <div className="text-[12px] text-muted-foreground">Placed {o.placedAt}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total</div>
                    <div className="text-[20px] font-semibold tracking-tight">{fmt(o.total)}</div>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {o.items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0"><Package className="h-3.5 w-3.5" /></div>
                        <span className="font-medium truncate">{it.name}</span>
                      </div>
                      <div className="text-muted-foreground shrink-0">×{it.qty} · {fmt(it.qty * it.price)}</div>
                    </li>
                  ))}
                </ul>

                {/* Stage timeline */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    {stages.map((st, i) => {
                      const done = i <= stageIdx;
                      const Icon2 = statusMap[st].icon;
                      return (
                        <div key={st} className="flex-1 flex items-center">
                          <div className={`h-7 w-7 rounded-full grid place-items-center border-2 ${done ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"}`}>
                            {i < stageIdx ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon2 className="h-3.5 w-3.5" />}
                          </div>
                          {i < stages.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1.5 ${i < stageIdx ? "bg-primary" : "bg-border"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1.5 flex justify-between text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground">
                    {stages.map((st) => <span key={st}>{statusMap[st].label}</span>)}
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-[12.5px] leading-relaxed">
                    <span className="font-semibold">AI note · </span>
                    <span className="text-foreground/80">{o.aiNote}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setActiveInvoice(o)}
                    className="text-[12.5px] font-semibold text-primary inline-flex items-center gap-1 hover:underline"
                  >
                    View invoice <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex gap-2">
                    <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-border hover:bg-secondary">Print</button>
                    <button
                      onClick={() => handleUpdateStatus(o.id, o.status)}
                      disabled={o.status === "delivered"}
                      className={`h-8 px-3 text-[12px] font-semibold rounded-lg transition ${
                        o.status === "delivered"
                          ? "bg-secondary text-muted-foreground cursor-not-allowed"
                          : "bg-foreground text-background hover:bg-foreground/90"
                      }`}
                    >
                      {o.status === "delivered" ? "Delivered" : "Update status"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {activeInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
                    <div className="text-xs text-muted-foreground mt-0.5">Status: <span className={`font-semibold ${activeInvoice.status === "delivered" ? "text-success" : "text-warning"}`}>{activeInvoice.status.toUpperCase()}</span></div>
                    <div className="text-xs text-muted-foreground">Date: {activeInvoice.placedAt}</div>
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

                {/* Summary math */}
                <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{fmt(activeInvoice.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (Included 18%)</span>
                      <span className="font-semibold">{fmt(activeInvoice.total * 0.18)}</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between text-sm">
                      <span className="font-bold">Total (INR)</span>
                      <span className="font-bold text-primary">{fmt(activeInvoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-4 border-t border-border bg-secondary/30 flex justify-end gap-2">
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="h-9 px-4 text-xs font-semibold rounded-xl border border-border hover:bg-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert("Invoice sent to printer!");
                    setActiveInvoice(null);
                  }}
                  className="h-9 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-glow"
                >
                  Print Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
