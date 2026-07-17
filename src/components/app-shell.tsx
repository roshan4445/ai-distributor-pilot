import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, MessageSquare, Package, ShoppingCart, FileText,
  Users, Wallet, Sparkles, Search, Bell, ChevronDown, Activity, Zap,
} from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Mission Control", icon: LayoutDashboard, end: true },
  { to: "/conversations", label: "Dealer Conversations", icon: MessageSquare, badge: 3 },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/dealers", label: "Dealers", icon: Users },
  { to: "/dues", label: "Dues", icon: Wallet, badge: 5 },
  { to: "/ask", label: "Ask AI", icon: Sparkles },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, end?: boolean) =>
    end ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="min-h-screen w-full bg-surface text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-background sticky top-0 h-screen">
          <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
            <div className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Zap className="h-4.5 w-4.5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold tracking-tight">Distributor</span>
              <span className="text-[11px] text-muted-foreground -mt-0.5">AI Copilot</span>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            <div className="px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Workspace</div>
            {nav.map((item) => {
              const active = isActive(item.to, item.end);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground">{item.badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <div className="rounded-xl p-3 gradient-hero border border-border">
              <div className="flex items-center gap-2 text-[12px] font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI Health
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Overnight scan complete. 4 new insights.</div>
              <Link to="/ask" className="mt-2 inline-flex text-[11px] font-semibold text-primary hover:underline">Review insights →</Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-5 md:px-8 border-b border-border bg-background/85 backdrop-blur">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search dealers, orders, invoices, SKUs…"
                className="w-full h-10 pl-9 pr-16 rounded-xl bg-secondary text-[13.5px] placeholder:text-muted-foreground border border-transparent focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
              />
              <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 h-6 px-1.5 rounded-md border border-border bg-background text-[10px] font-medium text-muted-foreground">⌘K</kbd>
            </div>

            <div className="hidden md:flex items-center gap-2 h-10 px-3 rounded-xl bg-success/10 text-success">
              <Activity className="h-4 w-4" />
              <span className="text-[12px] font-semibold">Business Health</span>
              <span className="text-[13px] font-bold">98%</span>
            </div>

            <button className="relative h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary transition">
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
            </button>

            <button 
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  localStorage.removeItem("isLoggedIn");
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-xl hover:bg-secondary transition cursor-pointer"
            >
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[11px] font-bold">R</div>
              <div className="hidden md:flex flex-col leading-tight items-start">
                <span className="text-[12px] font-semibold">Roshan</span>
                <span className="text-[10px] text-muted-foreground">Log out</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </header>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
