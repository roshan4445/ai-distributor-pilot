import type { ReactNode } from "react";

type Tone = "primary" | "success" | "warning" | "danger" | "muted" | "info";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary ring-primary/15",
  success: "bg-success/10 text-success ring-success/15",
  warning: "bg-warning/15 text-[color-mix(in_oklab,var(--warning)_45%,black)] ring-warning/25",
  danger: "bg-destructive/10 text-destructive ring-destructive/15",
  muted: "bg-secondary text-muted-foreground ring-border",
  info: "bg-indigo-50 text-indigo-700 ring-indigo-200",
};

export function Pill({ tone = "muted", icon, children }: { tone?: Tone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${toneClasses[tone]}`}>
      {icon}
      {children}
    </span>
  );
}

export function StatusDot({ tone = "muted" }: { tone?: Tone }) {
  const map: Record<Tone, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    muted: "bg-muted-foreground",
    info: "bg-indigo-500",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${map[tone]}`} />;
}
