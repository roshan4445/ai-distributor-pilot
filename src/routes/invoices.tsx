import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { PageHeader } from "./inventory";
import { invoices, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — AI Distributor Copilot" },
      { name: "description", content: "Auto-generated invoices sent to dealers over WhatsApp with a single click." },
    ],
  }),
  component: InvoicesPage,
});

const statusTone: any = {
  paid: "success", unpaid: "warning", partial: "info", overdue: "danger",
};
const statusLabel: any = {
  paid: "Paid", unpaid: "Unpaid", partial: "Partial", overdue: "Overdue",
};

function InvoicesPage() {
  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <PageHeader eyebrow="Invoices" title="Invoice ledger" subtitle="19 invoices generated today · all auto-numbered and sent to dealers" />

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input placeholder="Search invoice or dealer…" className="w-full h-10 pl-9 pr-3 rounded-xl bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="hidden md:flex gap-2">
            {["All", "Paid", "Unpaid", "Overdue"].map((t, i) => (
              <button key={t} className={`h-9 px-3 rounded-lg text-[12.5px] font-semibold border transition ${i === 0 ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="card-surface p-5 hover:shadow-elevate transition">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <Pill tone={statusTone[inv.status]}>{statusLabel[inv.status]}</Pill>
              </div>
              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{inv.id}</div>
                <div className="text-[16px] font-semibold tracking-tight">{inv.dealer}</div>
                <div className="text-[11.5px] text-muted-foreground">{inv.date}</div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-end justify-between">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">Amount</div>
                  <div className="text-[22px] font-semibold tracking-tight">{fmt(inv.amount)}</div>
                </div>
                <button className="h-9 px-3 rounded-lg bg-foreground text-background text-[12.5px] font-semibold inline-flex items-center gap-1.5 hover:opacity-90">
                  <Download className="h-3.5 w-3.5" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
