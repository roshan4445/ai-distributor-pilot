import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";
import { fmt } from "@/lib/mock-data";

const CHART_COLORS = ["#2563EB", "#7c3aed", "#0ea5e9", "#22c55e", "#f59e0b"];

interface DashboardChartsProps {
  revenueTrend: any[];
  categoryMix: any[];
}

export default function DashboardCharts({ revenueTrend, categoryMix }: DashboardChartsProps) {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Revenue Area Chart */}
      <div className="card-surface p-5 xl:col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">This week</div>
            <div className="text-[17px] font-semibold tracking-tight">Revenue vs Collections</div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Revenue
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" /> Collections
            </span>
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

      {/* Category Mix Pie Chart */}
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
                {categoryMix.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
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
  );
}
