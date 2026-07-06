import { g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { A as FileText, D as LayoutDashboard, F as ChevronDown, R as Bell, S as MessageSquare, U as Activity, a as Users, b as Package, d as Sparkles, h as Search, p as ShoppingCart, r as Wallet, t as Zap } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-CdYrK2n7.js
var import_jsx_runtime = require_jsx_runtime();
var nav = [
	{
		to: "/",
		label: "Mission Control",
		icon: LayoutDashboard,
		end: true
	},
	{
		to: "/conversations",
		label: "Dealer Conversations",
		icon: MessageSquare,
		badge: 3
	},
	{
		to: "/orders",
		label: "Orders",
		icon: ShoppingCart
	},
	{
		to: "/inventory",
		label: "Inventory",
		icon: Package
	},
	{
		to: "/invoices",
		label: "Invoices",
		icon: FileText
	},
	{
		to: "/dealers",
		label: "Dealers",
		icon: Users
	},
	{
		to: "/dues",
		label: "Dues",
		icon: Wallet,
		badge: 5
	},
	{
		to: "/ask",
		label: "Ask AI",
		icon: Sparkles
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const isActive = (to, end) => end ? pathname === to : pathname === to || pathname.startsWith(to + "/");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen w-full bg-surface text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-screen",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-background sticky top-0 h-screen",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 px-5 h-16 border-b border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground shadow-glow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
								className: "h-4.5 w-4.5",
								strokeWidth: 2.5
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[13px] font-semibold tracking-tight",
								children: "Distributor"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-muted-foreground -mt-0.5",
								children: "AI Copilot"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex-1 p-3 space-y-0.5 overflow-y-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
							children: "Workspace"
						}), nav.map((item) => {
							const active = isActive(item.to, item.end);
							const Icon = item.icon;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: item.to,
								className: `group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${active ? "bg-accent text-accent-foreground" : "text-foreground/75 hover:bg-secondary hover:text-foreground"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}` }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "flex-1",
										children: item.label
									}),
									item.badge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground",
										children: item.badge
									}) : null
								]
							}, item.to);
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-3 border-t border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl p-3 gradient-hero border border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-[12px] font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), "AI Health"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-[11px] text-muted-foreground",
									children: "Overnight scan complete. 4 new insights."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/ask",
									className: "mt-2 inline-flex text-[11px] font-semibold text-primary hover:underline",
									children: "Review insights →"
								})
							]
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0 flex flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 h-16 flex items-center gap-3 px-5 md:px-8 border-b border-border bg-background/85 backdrop-blur",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1 max-w-xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									placeholder: "Search dealers, orders, invoices, SKUs…",
									className: "w-full h-10 pl-9 pr-16 rounded-xl bg-secondary text-[13.5px] placeholder:text-muted-foreground border border-transparent focus:border-primary/40 focus:bg-background focus:outline-none focus:ring-4 focus:ring-primary/10 transition"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
									className: "hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 h-6 px-1.5 rounded-md border border-border bg-background text-[10px] font-medium text-muted-foreground",
									children: "⌘K"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden md:flex items-center gap-2 h-10 px-3 rounded-xl bg-success/10 text-success",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[12px] font-semibold",
									children: "Business Health"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[13px] font-bold",
									children: "98%"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "relative h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4.5 w-4.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-xl hover:bg-secondary transition",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[11px] font-bold",
									children: "R"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden md:flex flex-col leading-tight items-start",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[12px] font-semibold",
										children: "Roshan"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground",
										children: "Owner"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 text-muted-foreground" })
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 min-w-0",
					children
				})]
			})]
		})
	});
}
//#endregion
export { AppShell as t };
