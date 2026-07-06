import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Pill } from "@/components/badges";
import { PageHeader } from "./inventory";
import { dealers, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/dealers")({
  head: () => ({
    meta: [
      { title: "Dealers — AI Distributor Copilot" },
      { name: "description", content: "Every dealer, scored by AI on payment behaviour, order health, and lifetime value." },
    ],
  }),
  component: DealersPage,
});

const statusTone = { active: "success", watch: "warning", overdue: "danger" } as const;
const statusLabel = { active: "Active", watch: "Watch", overdue: "Overdue" } as const;

function DealersPage() {
  return (
    <AppShell>
      <div className="px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        <PageHeader eyebrow="Dealers" title="Dealer network" subtitle="7 active dealers · AI-scored on trust, payment cadence and momentum" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dealers.map((d) => (
            <Link
              key={d.id} to="/dealers/$id" params={{ id: d.id }}
              className="card-surface p-5 hover:shadow-elevate hover:border-primary/30 transition group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[13px] font-bold">
                    {d.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold tracking-tight group-hover:text-primary transition">{d.name}</div>
                    <div className="text-[11.5px] text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {d.city}</div>
                  </div>
                </div>
                <Pill tone={statusTone[d.status]}>{statusLabel[d.status]}</Pill>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground">Trust</div>
                  <div className={`text-[16px] font-semibold ${d.trust >= 85 ? "text-success" : d.trust >= 70 ? "text-warning" : "text-destructive"}`}>{d.trust}</div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground">Pending</div>
                  <div className="text-[13px] font-semibold">{fmt(d.pending)}</div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground">Orders</div>
                  <div className="text-[16px] font-semibold">{d.ordersCount}</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {d.phone}</span>
                <span className="text-primary font-semibold inline-flex items-center gap-0.5">Open <ArrowUpRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
