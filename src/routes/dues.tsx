import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PhoneCall, MessageCircle, AlertTriangle, TrendingUp, Wallet, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { PageHeader } from "./inventory";
import { fmt } from "@/lib/mock-data";
import { getDues, getAiDuesAnalysis } from "@/lib/db-queries";

export const Route = createFileRoute("/dues")({
  loader: () => getDues(),
  head: () => ({
    meta: [
      { title: "Outstanding Dues — AI Distributor Copilot" },
      { name: "description", content: "AI-scored risk on every outstanding invoice with recommended next action." },
    ],
  }),
  component: DuesPage,
});

const riskTone = (r: number) => r >= 70 ? "danger" : r >= 40 ? "warning" : "success";
const riskLabel = (r: number) => r >= 70 ? "High" : r >= 40 ? "Medium" : "Low";

function DuesPage() {
  const initialDues = Route.useLoaderData();
  const [dues, setDues] = useState(initialDues);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setIsAnalyzing(true);
    getAiDuesAnalysis({ data: initialDues })
      .then((aiResults) => {
        if (aiResults && aiResults.length > 0) {
          setDues((currentDues) =>
            currentDues.map((d) => {
              const aiItem = aiResults.find((x) => x.dealerId === d.dealerId);
              if (aiItem) {
                return {
                  ...d,
                  risk: Number(aiItem.risk),
                  action: aiItem.action,
                  promise: aiItem.promise || d.promise,
                };
              }
              return d;
            })
          );
        }
      })
      .catch((err) => console.error("Error loading AI dues analysis:", err))
      .finally(() => setIsAnalyzing(false));
  }, [initialDues]);

  const total = dues.reduce((s, d) => s + d.pending, 0);
  const critical = dues.filter((d) => d.overdueDays > 30).length;

  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
          <PageHeader eyebrow="Dues" title="Outstanding dealers" subtitle="AI-prioritised by risk, overdue days and payment behaviour" />
          {isAnalyzing && (
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full h-fit animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>AI Copilot auditing risk...</span>
            </div>
          )}
          {!isAnalyzing && (
            <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full h-fit">
              <div className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
              <span>AI Audit active</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider"><Wallet className="h-3.5 w-3.5" /> Total outstanding</div>
            <div className="mt-1 text-[26px] font-semibold tracking-tight">{fmt(total)}</div>
            <div className="text-[11.5px] text-muted-foreground">across {dues.length} dealers</div>
          </div>
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 text-destructive text-[11px] font-semibold uppercase tracking-wider"><AlertTriangle className="h-3.5 w-3.5" /> Critical (30+ days)</div>
            <div className="mt-1 text-[26px] font-semibold tracking-tight text-destructive">{critical}</div>
            <div className="text-[11.5px] text-muted-foreground">requires call today</div>
          </div>
          <div className="card-surface p-5">
            <div className="flex items-center gap-2 text-success text-[11px] font-semibold uppercase tracking-wider"><TrendingUp className="h-3.5 w-3.5" /> Collection rate</div>
            <div className="mt-1 text-[26px] font-semibold tracking-tight text-success">92%</div>
            <div className="text-[11.5px] text-muted-foreground">last 30 days</div>
          </div>
        </div>


        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-surface-2">
                  <th className="px-5 py-3">Dealer</th>
                  <th className="px-4 py-3">Pending</th>
                  <th className="px-4 py-3">Overdue</th>
                  <th className="px-4 py-3">Promise</th>
                  <th className="px-4 py-3">Risk</th>
                  <th className="px-4 py-3">Recommended action</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dues.map((d) => (
                  <tr key={d.dealerId} className="hover:bg-secondary/60 transition">
                    <td className="px-5 py-3.5">
                      <Link to="/dealers/$id" params={{ id: d.dealerId }} className="font-semibold hover:text-primary">{d.dealer}</Link>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">{fmt(d.pending)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`font-semibold ${d.overdueDays > 30 ? "text-destructive" : d.overdueDays > 14 ? "text-warning" : "text-foreground"}`}>{d.overdueDays} days</span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{d.promise}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div className={`h-full ${d.risk >= 70 ? "bg-destructive" : d.risk >= 40 ? "bg-warning" : "bg-success"}`} style={{ width: `${d.risk}%` }} />
                        </div>
                        <Pill tone={riskTone(d.risk)}>{riskLabel(d.risk)} · {d.risk}</Pill>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12.5px]">{d.action}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        <button className="h-8 w-8 rounded-lg border border-border hover:bg-secondary grid place-items-center"><PhoneCall className="h-3.5 w-3.5" /></button>
                        <button className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center"><MessageCircle className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
