import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useState, useEffect } from "react";
import {
  ArrowUpRight, ArrowDownRight, Sparkles, AlertTriangle, TrendingUp, Lightbulb,
  ShoppingCart, FileText, Package, Bell, Wallet, IndianRupee, CheckCircle2, PhoneCall,
  Loader2
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { owner, fmt } from "@/lib/mock-data";
import { getDashboardData, runCronAction } from "@/lib/db-queries";
import { toast } from "sonner";

const DashboardCharts = lazy(() => import("@/components/dashboard-charts"));

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 animate-pulse">
      <div className="card-surface p-5 xl:col-span-2 h-[354px] bg-secondary/10 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-5 w-48 bg-muted rounded" />
        </div>
        <div className="h-48 w-full bg-muted/40 rounded-xl" />
      </div>
      <div className="card-surface p-5 h-[354px] bg-secondary/10 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-5 w-32 bg-muted rounded" />
        </div>
        <div className="h-36 w-36 mx-auto rounded-full bg-muted/40" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-4 bg-muted/40 rounded" />
          <div className="h-4 bg-muted/40 rounded" />
        </div>
      </div>
    </div>
  );
}

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

function MissionControl() {
  const { kpis, revenueTrend, categoryMix, insights, activity, supabaseUrl } = Route.useLoaderData();
  const [isClient, setIsClient] = useState(false);
  const [isCronRunning, setIsCronRunning] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleTriggerCron = async () => {
    if (isCronRunning) return;
    setIsCronRunning(true);
    const toastId = toast.loading("Executing overnight AI reminders cron...");
    try {
      const result = await runCronAction({ forceAll: true });
      if (result.success) {
        toast.success(`AI Cron completed! Sent ${result.processedCount} payment reminders successfully.`, { id: toastId });
      } else {
        toast.error(`AI Cron failed: ${result.error}`, { id: toastId });
      }
    } catch (err) {
      toast.error(`AI Cron failed to execute: ${String(err)}`, { id: toastId });
    } finally {
      setIsCronRunning(false);
    }
  };

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
        <section
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
                <button
                  onClick={handleTriggerCron}
                  disabled={isCronRunning}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-955 text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  {isCronRunning ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-950" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-slate-955" />
                  )}
                  <span className="text-slate-950">Fast-Forward AI Reminders</span>
                </button>
              </div>
            </div>

            <HealthRing value={kpis.businessHealth} />
          </div>
        </section>

        {/* KPIs */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            {kpiCards.map((k) => {
              const Icon = k.icon;
              return (
                <div
                  key={k.key}
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
                </div>
              );
            })}
          </div>
        </section>

        {/* Middle grid: chart + AI insights */}
        <Suspense fallback={<ChartsSkeleton />}>
          {isClient ? (
            <DashboardCharts revenueTrend={revenueTrend} categoryMix={categoryMix} />
          ) : (
            <ChartsSkeleton />
          )}
        </Suspense>

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

        {/* Debug Info */}
        <div className="text-[10px] text-muted-foreground/35 text-center mt-4">
          Connected Supabase URL: {supabaseUrl}
        </div>
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
          <circle
            cx="50" cy="50" r={r} strokeWidth="8" fill="none"
            className="stroke-primary" strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={off}
            style={{
              transition: "stroke-dashoffset 1.2s ease-out",
            }}
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
