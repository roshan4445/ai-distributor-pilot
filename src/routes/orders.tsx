import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Package, Clock, ArrowRight, CheckCircle2, Truck, Boxes, PackageCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { PageHeader } from "./inventory";
import { orders, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/orders")({
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
  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <PageHeader eyebrow="Orders" title="Live order pipeline" subtitle="24 orders today · 6 parsed by AI from WhatsApp this hour" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {orders.map((o) => {
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
                  <button className="text-[12.5px] font-semibold text-primary inline-flex items-center gap-1 hover:underline">
                    View invoice <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex gap-2">
                    <button className="h-8 px-3 text-[12px] font-semibold rounded-lg border border-border hover:bg-secondary">Print</button>
                    <button className="h-8 px-3 text-[12px] font-semibold rounded-lg bg-foreground text-background">Update status</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
