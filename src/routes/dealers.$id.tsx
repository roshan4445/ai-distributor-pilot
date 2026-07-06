import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft, MapPin, Phone, MessageSquare, Sparkles, TrendingUp, ShoppingCart, FileText, Wallet,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { dealers, orders, invoices, conversations, fmt } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/dealers/$id")({
  loader: ({ params }) => {
    const d = dealers.find((x) => x.id === params.id);
    if (!d) throw notFound();
    return { dealer: d };
  },
  head: ({ loaderData }) => ({
    meta: [{
      title: loaderData ? `${loaderData.dealer.name} — Dealer Profile` : "Dealer",
    }],
  }),
  component: DealerProfile,
  notFoundComponent: () => (
    <AppShell><div className="p-8 text-muted-foreground">Dealer not found.</div></AppShell>
  ),
  errorComponent: () => (
    <AppShell><div className="p-8 text-destructive">Couldn't load dealer.</div></AppShell>
  ),
});

const trend = [
  { m: "May", v: 82000 }, { m: "Jun", v: 91000 }, { m: "Jul", v: 118000 },
  { m: "Aug", v: 104000 }, { m: "Sep", v: 142000 }, { m: "Oct", v: 168000 },
];

function DealerProfile() {
  const { dealer: d } = Route.useLoaderData();
  const dOrders = orders.filter((o) => o.dealerId === d.id);
  const dInvoices = invoices.filter((i) => i.dealer === d.name);
  const chat = conversations.find((c) => c.dealer === d.name);

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <Link to="/dealers" className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dealers
        </Link>

        {/* Header */}
        <div className="card-surface p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[20px] font-bold shrink-0">
              {d.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[24px] font-semibold tracking-tight">{d.name}</h1>
                <Pill tone={d.status === "overdue" ? "danger" : d.status === "watch" ? "warning" : "success"}>{d.status}</Pill>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {d.city}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {d.phone}</span>
                <span>Last order · {d.lastOrder}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Trust score" value={String(d.trust)} tone={d.trust >= 85 ? "success" : d.trust >= 70 ? "warning" : "danger"} />
                <Stat label="Pending" value={fmt(d.pending)} tone={d.pending > 100000 ? "danger" : d.pending > 0 ? "warning" : "success"} />
                <Stat label="Lifetime" value={fmt(d.lifetime)} />
                <Stat label="Avg. payment" value={`${d.avgPaymentDays} days`} />
              </div>
            </div>
            <div className="flex flex-col gap-2 md:min-w-40">
              <Link to="/conversations" className="h-10 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-glow">
                <MessageSquare className="h-3.5 w-3.5" /> Open chat
              </Link>
              <button className="h-10 rounded-xl border border-border text-[13px] font-semibold hover:bg-secondary">Send reminder</button>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="card-surface p-5 md:p-6 border-primary/25 bg-primary/5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0"><Sparkles className="h-4.5 w-4.5" /></div>
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">AI Summary</div>
              <p className="mt-1 text-[14px] leading-relaxed">
                {d.name} has been a {d.status === "active" ? "reliable" : d.status === "watch" ? "moderate-risk" : "high-risk"} account over the last 6 months. Average payment cycle is {d.avgPaymentDays} days, with a lifetime value of {fmt(d.lifetime)}. {d.trust >= 85 ? "Safe to raise credit limit — behaviour is consistent." : d.trust >= 70 ? "Monitor closely; two invoices slipped past due this quarter." : "Escalate to a call today — overdue balance is growing faster than order volume."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="info" icon={<TrendingUp className="h-3 w-3" />}>Orders trending +14%</Pill>
                <Pill tone="success">Loyal · 6+ months</Pill>
                {d.status === "overdue" && <Pill tone="danger">Escalate collection</Pill>}
              </div>
            </div>
          </div>
        </div>

        {/* Trend + Payment history */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card-surface p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">6 months</div>
                <div className="text-[16px] font-semibold tracking-tight">Order value trend</div>
              </div>
            </div>
            <div className="h-56 mt-3">
              <ResponsiveContainer>
                <BarChart data={trend} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
                  <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="v" fill="#2563EB" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-surface p-5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recent payments</div>
            <ul className="mt-3 space-y-3">
              {[
                { d: "Nov 3", a: 20000, mode: "UPI" },
                { d: "Oct 22", a: 45000, mode: "Bank" },
                { d: "Oct 8", a: 32000, mode: "UPI" },
                { d: "Sep 27", a: 18500, mode: "Cash" },
              ].map((p, i) => (
                <li key={i} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-success/10 text-success grid place-items-center"><Wallet className="h-3.5 w-3.5" /></div>
                    <div>
                      <div className="font-semibold">{fmt(p.a)}</div>
                      <div className="text-[11px] text-muted-foreground">{p.d} · {p.mode}</div>
                    </div>
                  </div>
                  <Pill tone="success">Paid</Pill>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Orders + Invoices + Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <div className="text-[15px] font-semibold tracking-tight">Order history</div>
            </div>
            {dOrders.length ? dOrders.map((o) => (
              <div key={o.id} className="py-2.5 border-b border-border last:border-0">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold">{o.invoice}</span>
                  <span className="font-semibold">{fmt(o.total)}</span>
                </div>
                <div className="text-[11.5px] text-muted-foreground">{o.placedAt} · {o.items.length} items</div>
              </div>
            )) : <div className="text-[12.5px] text-muted-foreground">No recent orders.</div>}
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <div className="text-[15px] font-semibold tracking-tight">Invoices</div>
            </div>
            {dInvoices.length ? dInvoices.map((i) => (
              <div key={i.id} className="py-2.5 border-b border-border last:border-0 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold">{i.id}</div>
                  <div className="text-[11.5px] text-muted-foreground">{i.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-semibold">{fmt(i.amount)}</div>
                  <Pill tone={i.status === "paid" ? "success" : i.status === "overdue" ? "danger" : "warning"}>{i.status}</Pill>
                </div>
              </div>
            )) : <div className="text-[12.5px] text-muted-foreground">No invoices yet.</div>}
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div className="text-[15px] font-semibold tracking-tight">Conversation</div>
            </div>
            {chat ? (
              <div className="space-y-2">
                {chat.messages.slice(0, 4).map((m) => (
                  <div key={m.id} className={`rounded-lg px-3 py-2 text-[12.5px] ${m.from === "dealer" ? "bg-secondary" : "bg-primary/10 text-foreground"}`}>
                    <div className="text-[10.5px] font-semibold text-muted-foreground">{m.from === "dealer" ? d.name : "AI Copilot"} · {m.time}</div>
                    <div className="mt-0.5 whitespace-pre-line line-clamp-3">{m.text}</div>
                  </div>
                ))}
                <Link to="/conversations" className="mt-1 inline-block text-[12px] font-semibold text-primary hover:underline">Open full chat →</Link>
              </div>
            ) : <div className="text-[12.5px] text-muted-foreground">No chat yet.</div>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "danger" }) {
  const color = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <div className="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-[18px] font-semibold tracking-tight ${color}`}>{value}</div>
    </div>
  );
}
