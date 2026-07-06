import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowUpRight, ArrowDownRight, Sparkles, AlertTriangle, TrendingUp, Lightbulb,
  ShoppingCart, FileText, Package, Bell, Wallet, IndianRupee, CheckCircle2, PhoneCall,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { owner, fmt } from "@/lib/mock-data";
import { getDashboardData } from "@/lib/db-queries";

export const Route = createFileRoute("/")({
  loader: () => getDashboardData(),
  head: () => ({
    meta: [
      { title: "Mission Control — AI Distributor Copilot" },
      { name: "description", content: "The AI brain that runs your distribution business — orders, inventory, invoices, and dealer dues in one calm dashboard." },
      { property: "og:title", content: "AI Distributor Copilot — Mission Control" },
      { property: "og:description", content: "Orders parsed, invoices generated, dealers followed up — automatically." },
    ],
  }),
  component: MissionControl,
});

const tintBg: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning/15 text-[color-mix(in_oklab,var(--warning)_45%,black)]",
  info: "bg-indigo-50 text-indigo-600",
};

const insightIcon = {
  danger: AlertTriangle,
  warning: AlertTriangle,
  success: TrendingUp,
  info: Lightbulb,
} as const;

const insightTone = {
  danger: "border-destructive/20 bg-destructive/5",
  warning: "border-warning/30 bg-warning/5",
  success: "border-success/25 bg-success/5",
  info: "border-primary/20 bg-primary/5",
} as const;

const insightIconBg = {
  danger: "bg-destructive/10 text-destructive",
  warning: "bg-warning/20 text-[color-mix(in_oklab,var(--warning)_40%,black)]",
  success: "bg-success/10 text-success",
  info: "bg-primary/10 text-primary",
} as const;

const activityIcon: Record<string, any> = {
  order: ShoppingCart, invoice: FileText, inventory: Package, reminder: Bell, payment: CheckCircle2, ledger: Wallet,
};

const CHART_COLORS = ["#2563EB", "#7c3aed", "#0ea5e9", "#22c55e", "#f59e0b"];

function MissionControl() {
  const { kpis, revenueTrend, categoryMix, insights, activity } = Route.useLoaderData();

  const kpiCards = [
    { key: "orders", label: "Today's Orders", value: kpis.ordersToday, delta: kpis.ordersDelta, up: true, icon: ShoppingCart, tint: "primary" as const },
    { key: "rev", label: "Today's Revenue", value: fmt(kpis.revenueToday), delta: kpis.revenueDelta, up: true, icon: IndianRupee, tint: "success" as const },
    { key: "dues", label: "Pending Dues", value: fmt(kpis.pendingDues), delta: kpis.duesDelta, up: false, icon: Wallet, tint: "danger" as const },
    { key: "inv", label: "Inventory Alerts", value: kpis.inventoryAlerts, delta: "3 critical", up: false, icon: Package, tint: "warning" as const },
    { key: "invc", label: "Invoices Generated", value: kpis.invoicesGenerated, delta: "auto", up: true, icon: FileText, tint: "info" as const },
    { key: "fu", label: "Dealer Follow-ups", value: kpis.followUps, delta: "AI-scheduled", up: true, icon: Bell, tint: "primary" as const },
    { key: "col", label: "Collections Today", value: fmt(kpis.collectionsToday), delta: "+22%", up: true, icon: CheckCircle2, tint: "success" as const },
  ];
  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-8">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-border gradient-hero px-6 md:px-10 py-8 md:py-10"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" /> Overnight AI Report
              </div>
              <h1 className="mt-4 text-3xl md:text-[40px] font-semibold tracking-tight leading-tight">
                Good morning, <span className="text-gradient">{owner.name}</span> 👋
              </h1>
              <p className="mt-2 text-[15px] text-muted-foreground max-w-xl">
                Your AI monitored the business overnight — parsed 6 WhatsApp orders, sent 3 reminders, and
                flagged 2 dealers to call today.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/conversations" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-glow hover:opacity-95">
                  Open conversations <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/ask" className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-background border border-border text-[13px] font-semibold hover:bg-secondary">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Ask the AI
                </Link>
              </div>
            </div>

            <HealthRing value={kpis.businessHealth} />
          </div>
        </motion.section>

        {/* KPIs */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {kpiCards.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div
                  key={k.key}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i, duration: 0.3 }}
                  className="card-surface p-4 hover:shadow-elevate transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className={`h-8 w-8 rounded-lg grid place-items-center ${tintBg[k.tint]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`inline-flex items-center gap-0.5 text-[10.5px] font-semibold ${k.up ? "text-success" : "text-destructive"}`}>
                      {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {k.delta}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{k.label}</div>
                    <div className="mt-0.5 text-[22px] font-semibold tracking-tight">{k.value}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Middle grid: chart + AI insights */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="card-surface p-5 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">This week</div>
                <div className="text-[17px] font-semibold tracking-tight">Revenue vs Collections</div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Revenue</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-success" /> Collections</span>
              </div>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer>
                <AreaChart data={revenueTrend} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="col" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }}
                    formatter={(v: number) => fmt(v)}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#rev)" />
                  <Area type="monotone" dataKey="collections" stroke="#22c55e" strokeWidth={2.5} fill="url(#col)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sales mix</div>
                <div className="text-[17px] font-semibold tracking-tight">Category share</div>
              </div>
            </div>
            <div className="h-40 mt-2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryMix} dataKey="value" innerRadius={44} outerRadius={64} paddingAngle={3}>
                    {categoryMix.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categoryMix.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-[12px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-semibold">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Insights */}
        <section className="card-surface p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">AI Insights</div>
                <div className="text-[17px] font-semibold tracking-tight">4 recommendations for today</div>
              </div>
            </div>
            <Link to="/ask" className="text-[12px] font-semibold text-primary hover:underline">Ask follow-up →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((ins) => {
              const Icon = insightIcon[ins.kind];
              return (
                <div key={ins.id} className={`rounded-xl border p-4 ${insightTone[ins.kind]}`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 shrink-0 rounded-lg grid place-items-center ${insightIconBg[ins.kind]}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold tracking-tight">{ins.title}</div>
                      <div className="mt-1 text-[13px] text-muted-foreground leading-relaxed">{ins.body}</div>
                      {ins.cta ? (
                        <button className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline">
                          <PhoneCall className="h-3.5 w-3.5" /> {ins.cta}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Activity timeline */}
        <section className="card-surface p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Live</div>
              <div className="text-[17px] font-semibold tracking-tight">Recent activity</div>
            </div>
            <Pill tone="success" icon={<span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />}>AI is active</Pill>
          </div>
          <ol className="relative border-l border-border ml-3 space-y-4">
            {activity.map((a) => {
              const Icon = activityIcon[a.type] ?? Sparkles;
              return (
                <li key={a.id} className="pl-6 relative">
                  <span className="absolute -left-[13px] top-0.5 h-6 w-6 rounded-full bg-background border border-border grid place-items-center">
                    <Icon className="h-3 w-3 text-primary" />
                  </span>
                  <div className="text-[13.5px] font-medium">{a.text}</div>
                  <div className="text-[11.5px] text-muted-foreground">{a.time}</div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </AppShell>
  );
}

function HealthRing({ value }: { value: number }) {
  const r = 44, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-4 self-start md:self-auto">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle cx="50" cy="50" r={r} strokeWidth="8" className="stroke-border" fill="none" />
          <motion.circle
            cx="50" cy="50" r={r} strokeWidth="8" fill="none"
            className="stroke-primary" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-2xl font-semibold tracking-tight">{value}%</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Health</div>
          </div>
        </div>
      </div>
      <div className="hidden md:flex flex-col text-[12px]">
        <span className="font-semibold text-success">Excellent</span>
        <span className="text-muted-foreground">Cash flow strong</span>
        <span className="text-muted-foreground">Dues under control</span>
      </div>
    </div>
  );
}
