import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Search, Package, AlertTriangle, TrendingDown, Sparkles, Filter, Plus, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { productRecommendation, fmt } from "@/lib/mock-data";
import { getInventory, createProductAction } from "@/lib/db-queries";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export const Route = createFileRoute("/inventory")({
  loader: () => getInventory(),
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
  const products = Route.useLoaderData();
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "critical" | "warning">("all");

  // Modal & form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newCategory, setNewCategory] = useState("MCBs");
  const [newPrice, setNewPrice] = useState("250");
  const [newStock, setNewStock] = useState("100");
  const [newMin, setNewMin] = useState("30");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSku) {
      setErrorMsg("Product Name and SKU code are required.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    try {
      await createProductAction({
        data: {
          name: newName,
          sku: newSku,
          category: newCategory,
          price: Number(newPrice) || 0,
          stock: Number(newStock) || 0,
          min: Number(newMin) || 0
        }
      });
      setShowAddModal(false);
      setNewName("");
      setNewSku("");
      setNewCategory("MCBs");
      setNewPrice("250");
      setNewStock("100");
      setNewMin("30");
      router.invalidate();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create SKU. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const total = products.reduce((s, p) => s + p.stock * p.price, 0);
  const critical = products.filter((p) => p.stock < p.min * 0.5).length;
  const warning = products.filter((p) => p.stock < p.min && p.stock >= p.min * 0.5).length;

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    let matchesStock = true;
    if (stockFilter === "critical") {
      matchesStock = p.stock < p.min * 0.5;
    } else if (stockFilter === "warning") {
      matchesStock = p.stock < p.min && p.stock >= p.min * 0.5;
    }

    return matchesSearch && matchesStock;
  });

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
              <button 
                onClick={() => setShowAddModal(true)}
                className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-glow"
              >
                <Plus className="h-3.5 w-3.5" /> New SKU
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => setStockFilter("all")} className="text-left w-full focus:outline-none">
            <SummaryTile label="Inventory value" value={fmt(total)} icon={<Package className="h-4 w-4" />} tone="primary" active={stockFilter === "all"} />
          </button>
          <button onClick={() => setStockFilter("critical")} className="text-left w-full focus:outline-none">
            <SummaryTile label="Critical stockouts" value={critical} icon={<AlertTriangle className="h-4 w-4" />} tone="danger" active={stockFilter === "critical"} />
          </button>
          <button onClick={() => setStockFilter("warning")} className="text-left w-full focus:outline-none">
            <SummaryTile label="Restock warnings" value={warning} icon={<TrendingDown className="h-4 w-4" />} tone="warning" active={stockFilter === "warning"} />
          </button>
          <SummaryTile label="AI reorder drafts" value={4} icon={<Sparkles className="h-4 w-4" />} tone="info" />
        </div>

        <div className="card-surface overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product or SKU…"
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="text-[11.5px] text-muted-foreground">{filtered.length} SKUs</div>
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
                {filtered.map((p) => {
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

      {/* New SKU Modal Overlay */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-soft z-10"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Add New Product SKU</h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-[12.5px] rounded-lg bg-destructive/15 text-destructive font-medium">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] uppercase font-semibold text-muted-foreground mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Polycab 3-Core Wire 100m"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-muted-foreground mb-1">SKU Code</label>
                    <input
                      type="text"
                      required
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value.toUpperCase())}
                      placeholder="e.g. WR-POLY-3C"
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-muted-foreground mb-1">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full h-10 px-2 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {["MCBs", "Switches", "Wires", "Sockets", "Boards"].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-muted-foreground mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase font-semibold text-muted-foreground mb-1">Initial Stock</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] uppercase font-semibold text-muted-foreground mb-1">Minimum Safety Stock Level</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newMin}
                      onChange={(e) => setNewMin(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-10 px-4 rounded-lg text-[13px] border border-border hover:bg-secondary font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-10 px-5 rounded-lg text-[13px] bg-primary text-primary-foreground font-semibold hover:opacity-95 transition inline-flex items-center gap-1.5 shadow-glow"
                  >
                    {submitting ? "Creating..." : "Create SKU"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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

function SummaryTile({ label, value, icon, tone, active }: { label: string; value: string | number; icon: React.ReactNode; tone: "primary" | "success" | "warning" | "danger" | "info"; active?: boolean }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-[color-mix(in_oklab,var(--warning)_45%,black)]",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className={`card-surface p-4 flex items-center gap-3 transition border ${active ? "border-primary shadow-soft bg-primary/[0.02]" : "border-border/40 hover:border-border/80"}`}>
      <div className={`h-10 w-10 rounded-xl grid place-items-center ${map[tone]}`}>{icon}</div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        <div className="text-[20px] font-semibold tracking-tight">{value}</div>
      </div>
    </div>
  );
}
