import { o as __toESM } from "../_runtime.mjs";
import { i as owner, r as fmt } from "./mock-data-BPkAbplP.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as runCronAction } from "./db-queries-B-DUktQC.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { A as FileText, E as Lightbulb, H as ArrowDownRight, O as IndianRupee, P as CircleCheck, R as Bell, T as LoaderCircle, b as Package, c as TrendingUp, d as Sparkles, p as ShoppingCart, r as Wallet, s as TriangleAlert, v as PhoneCall, z as ArrowUpRight } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { t as Pill } from "./badges-Cs8n-29R.mjs";
import { t as Route } from "./routes-BLKSuW1j.mjs";
import { t as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-fElsPNvF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DashboardCharts = (0, import_react.lazy)(() => import("./dashboard-charts-BKyrd8K2.mjs"));
function ChartsSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 xl:grid-cols-3 gap-5 animate-pulse",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface p-5 xl:col-span-2 h-[354px] bg-secondary/10 flex flex-col justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-16 bg-muted rounded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-48 bg-muted rounded" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 w-full bg-muted/40 rounded-xl" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card-surface p-5 h-[354px] bg-secondary/10 flex flex-col justify-between",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-16 bg-muted rounded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-32 bg-muted rounded" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-36 w-36 mx-auto rounded-full bg-muted/40" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 bg-muted/40 rounded" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 bg-muted/40 rounded" })]
				})
			]
		})]
	});
}
var tintBg = {
	primary: "bg-primary/10 text-primary",
	success: "bg-success/10 text-success",
	danger: "bg-destructive/10 text-destructive",
	warning: "bg-warning/15 text-[color-mix(in_oklab,var(--warning)_45%,black)]",
	info: "bg-indigo-50 text-indigo-600"
};
var insightIcon = {
	danger: TriangleAlert,
	warning: TriangleAlert,
	success: TrendingUp,
	info: Lightbulb
};
var insightTone = {
	danger: "border-destructive/20 bg-destructive/5",
	warning: "border-warning/30 bg-warning/5",
	success: "border-success/25 bg-success/5",
	info: "border-primary/20 bg-primary/5"
};
var insightIconBg = {
	danger: "bg-destructive/10 text-destructive",
	warning: "bg-warning/20 text-[color-mix(in_oklab,var(--warning)_40%,black)]",
	success: "bg-success/10 text-success",
	info: "bg-primary/10 text-primary"
};
var activityIcon = {
	order: ShoppingCart,
	invoice: FileText,
	inventory: Package,
	reminder: Bell,
	payment: CircleCheck,
	ledger: Wallet
};
function MissionControl() {
	const { kpis, revenueTrend, categoryMix, insights, activity } = Route.useLoaderData();
	const [isClient, setIsClient] = (0, import_react.useState)(false);
	const [isCronRunning, setIsCronRunning] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setIsClient(true);
	}, []);
	const handleTriggerCron = async () => {
		if (isCronRunning) return;
		setIsCronRunning(true);
		const toastId = toast.loading("Executing overnight AI reminders cron...");
		try {
			const result = await runCronAction({ forceAll: true });
			if (result.success) toast.success(`AI Cron completed! Sent ${result.processedCount} payment reminders successfully.`, { id: toastId });
			else toast.error(`AI Cron failed: ${result.error}`, { id: toastId });
		} catch (err) {
			toast.error(`AI Cron failed to execute: ${String(err)}`, { id: toastId });
		} finally {
			setIsCronRunning(false);
		}
	};
	const kpiCards = [
		{
			key: "orders",
			label: "Today's Orders",
			value: kpis.ordersToday,
			delta: kpis.ordersDelta,
			up: true,
			icon: ShoppingCart,
			tint: "primary"
		},
		{
			key: "rev",
			label: "Today's Revenue",
			value: fmt(kpis.revenueToday),
			delta: kpis.revenueDelta,
			up: true,
			icon: IndianRupee,
			tint: "success"
		},
		{
			key: "dues",
			label: "Pending Dues",
			value: fmt(kpis.pendingDues),
			delta: kpis.duesDelta,
			up: false,
			icon: Wallet,
			tint: "danger"
		},
		{
			key: "inv",
			label: "Inventory Alerts",
			value: kpis.inventoryAlerts,
			delta: "3 critical",
			up: false,
			icon: Package,
			tint: "warning"
		},
		{
			key: "invc",
			label: "Invoices Generated",
			value: kpis.invoicesGenerated,
			delta: "auto",
			up: true,
			icon: FileText,
			tint: "info"
		},
		{
			key: "fu",
			label: "Dealer Follow-ups",
			value: kpis.followUps,
			delta: "AI-scheduled",
			up: true,
			icon: Bell,
			tint: "primary"
		},
		{
			key: "col",
			label: "Collections Today",
			value: fmt(kpis.collectionsToday),
			delta: "+22%",
			up: true,
			icon: CircleCheck,
			tint: "success"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "relative overflow-hidden rounded-3xl border border-border gradient-hero px-6 md:px-10 py-8 md:py-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col md:flex-row md:items-end md:justify-between gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " Overnight AI Report"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-4 text-3xl md:text-[40px] font-semibold tracking-tight leading-tight",
							children: [
								"Good morning, ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gradient",
									children: owner.name
								}),
								" 👋"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[15px] text-muted-foreground max-w-xl",
							children: "Your AI monitored the business overnight — parsed 6 WhatsApp orders, sent 3 reminders, and flagged 2 dealers to call today."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/conversations",
									className: "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-glow hover:opacity-95",
									children: ["Open conversations ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/ask",
									className: "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-background border border-border text-[13px] font-semibold hover:bg-secondary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), " Ask the AI"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: handleTriggerCron,
									disabled: isCronRunning,
									className: "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-955 text-[13px] font-semibold transition-colors cursor-pointer",
									children: [isCronRunning ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-slate-950" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-slate-955" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-slate-950",
										children: "Fast-Forward AI Reminders"
									})]
								})
							]
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthRing, { value: kpis.businessHealth })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3",
				children: kpiCards.map((k) => {
					const Icon = k.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-4 hover:shadow-elevate transition-shadow",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `h-8 w-8 rounded-lg grid place-items-center ${tintBg[k.tint]}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `inline-flex items-center gap-0.5 text-[10.5px] font-semibold ${k.up ? "text-success" : "text-destructive"}`,
								children: [k.up ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, { className: "h-3 w-3" }), k.delta]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold",
								children: k.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-[22px] font-semibold tracking-tight",
								children: k.value
							})]
						})]
					}, k.key);
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsSkeleton, {}),
				children: isClient ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCharts, {
					revenueTrend,
					categoryMix
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartsSkeleton, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "card-surface p-5 md:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4.5 w-4.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
							children: "AI Insights"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[17px] font-semibold tracking-tight",
							children: "4 recommendations for today"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/ask",
						className: "text-[12px] font-semibold text-primary hover:underline",
						children: "Ask follow-up →"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-3",
					children: insights.map((ins) => {
						const Icon = insightIcon[ins.kind];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `rounded-xl border p-4 ${insightTone[ins.kind]}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-9 w-9 shrink-0 rounded-lg grid place-items-center ${insightIconBg[ins.kind]}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4.5 w-4.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[14px] font-semibold tracking-tight",
											children: ins.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 text-[13px] text-muted-foreground leading-relaxed",
											children: ins.body
										}),
										ins.cta ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											className: "mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary hover:underline",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneCall, { className: "h-3.5 w-3.5" }),
												" ",
												ins.cta
											]
										}) : null
									]
								})]
							})
						}, ins.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "card-surface p-5 md:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Live"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[17px] font-semibold tracking-tight",
						children: "Recent activity"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: "success",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-success animate-pulse" }),
						children: "AI is active"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "relative border-l border-border ml-3 space-y-4",
					children: activity.map((a) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "pl-6 relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -left-[13px] top-0.5 h-6 w-6 rounded-full bg-background border border-border grid place-items-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(activityIcon[a.type] ?? Sparkles, { className: "h-3 w-3 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13.5px] font-medium",
									children: a.text
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11.5px] text-muted-foreground",
									children: a.time
								})
							]
						}, a.id);
					})
				})]
			})
		]
	}) });
}
function HealthRing({ value }) {
	const r = 44, c = 2 * Math.PI * r;
	const off = c - value / 100 * c;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-4 self-start md:self-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative h-28 w-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 100 100",
				className: "h-28 w-28 -rotate-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "50",
					cy: "50",
					r,
					strokeWidth: "8",
					className: "stroke-border",
					fill: "none"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "50",
					cy: "50",
					r,
					strokeWidth: "8",
					fill: "none",
					className: "stroke-primary",
					strokeLinecap: "round",
					strokeDasharray: c,
					strokeDashoffset: off,
					style: { transition: "stroke-dashoffset 1.2s ease-out" }
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-2xl font-semibold tracking-tight",
						children: [value, "%"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-wider text-muted-foreground font-semibold",
						children: "Health"
					})]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "hidden md:flex flex-col text-[12px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-success",
					children: "Excellent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Cash flow strong"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Dues under control"
				})
			]
		})]
	});
}
//#endregion
export { MissionControl as component };
