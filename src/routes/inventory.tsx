import { createFileRoute } from "@tanstack/react-router";
import { Search, Package, AlertTriangle, TrendingDown, Sparkles, Filter, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { products, productRecommendation, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — AI Distributor Copilot" },
      { name: "description", content: "Live stock, minimums, and AI restock recommendations for every SKU." },
    ],
  }),
  component: InventoryPage,
});

const recTone = {
  critical: "danger", warning: "warning", watch: "info", ok: "success",
} as const;

function InventoryPage() {
  const total = products.reduce((s, p) => s + p.stock * p.price, 0);
  const critical = products.filter((p) => p.stock < p.min * 0.5).length;
  const warning = products.filter((p) => p.stock < p.min && p.stock >= p.min * 0.5).length;

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <PageHeader
          eyebrow="Inventory"
          title="Live stock & AI restock"
          subtitle="Every SKU. Every level. Every recommendation."
          actions={
            <>
              <button className="h-9 px-3 rounded-lg border border-border text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-secondary">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
              <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-glow">
                <Plus className="h-3.5 w-3.5" /> New SKU
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryTile label="Inventory value" value={fmt(total)} icon={<Package className="h-4 w-4" />} tone="primary" />
          <SummaryTile label="Critical stockouts" value={critical} icon={<AlertTriangle className="h-4 w-4" />} tone="danger" />
          <SummaryTile label="Restock warnings" value={warning} icon={<TrendingDown className="h-4 w-4" />} tone="warning" />
          <SummaryTile label="AI reorder drafts" value={4} icon={<Sparkles className="h-4 w-4" />} tone="info" />
        </div>

        <div className="card-surface overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Search product or SKU…" className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="text-[11.5px] text-muted-foreground">{products.length} SKUs</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-surface-2">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Min. stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">AI recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const rec = productRecommendation(p);
                  const pct = Math.min(100, (p.stock / p.min) * 100);
                  const barTone = rec.level === "critical" ? "bg-destructive" : rec.level === "warning" ? "bg-warning" : rec.level === "watch" ? "bg-indigo-500" : "bg-success";
                  return (
                    <tr key={p.id} className="hover:bg-secondary/60 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-[11.5px] text-muted-foreground">{p.category} · {fmt(p.price)}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[12px] text-muted-foreground">{p.sku}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold">{p.stock.toLocaleString("en-IN")}</div>
                        <div className="mt-1 h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full ${barTone}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground">{p.min}</td>
                      <td className="px-4 py-3.5">
                        <Pill tone={recTone[rec.level]}>
                          {rec.level === "ok" ? "Healthy" : rec.level === "watch" ? "Watch" : rec.level === "warning" ? "Low" : "Critical"}
                        </Pill>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-[12.5px] text-foreground/85">{rec.text}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow: string; title: string; subtitle: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
        <h1 className="mt-1 text-[26px] font-semibold tracking-tight">{title}</h1>
        <p className="text-[13.5px] text-muted-foreground">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

function SummaryTile({ label, value, icon, tone }: { label: string; value: string | number; icon: React.ReactNode; tone: "primary" | "success" | "warning" | "danger" | "info" }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-[color-mix(in_oklab,var(--warning)_45%,black)]",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="card-surface p-4 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl grid place-items-center ${map[tone]}`}>{icon}</div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        <div className="text-[20px] font-semibold tracking-tight">{value}</div>
      </div>
    </div>
  );
}
