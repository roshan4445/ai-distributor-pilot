import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { B as ArrowLeft, C as MapPin, c as TrendingUp, f as ShoppingCart, g as Phone, k as FileText, r as Wallet, u as Sparkles, x as MessageSquare } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { r as fmt } from "./mock-data-qUJ_xzNA.mjs";
import { t as Pill } from "./badges-Cs8n-29R.mjs";
import { t as Route } from "./dealers._id-eOrsgMi1.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, r as BarChart, s as CartesianGrid } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dealers._id-DLLH7BnL.js
var import_jsx_runtime = require_jsx_runtime();
var trend = [
	{
		m: "May",
		v: 82e3
	},
	{
		m: "Jun",
		v: 91e3
	},
	{
		m: "Jul",
		v: 118e3
	},
	{
		m: "Aug",
		v: 104e3
	},
	{
		m: "Sep",
		v: 142e3
	},
	{
		m: "Oct",
		v: 168e3
	}
];
function DealerProfile() {
	const { dealer: d, orders: dOrders, invoices: dInvoices, chat } = Route.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/dealers",
				className: "inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Back to dealers"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card-surface p-6 md:p-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col md:flex-row md:items-start gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[20px] font-bold shrink-0",
							children: d.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 flex-wrap",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "text-[24px] font-semibold tracking-tight",
										children: d.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
										tone: d.status === "overdue" ? "danger" : d.status === "watch" ? "warning" : "success",
										children: d.status
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }),
												" ",
												d.city
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }),
												" ",
												d.phone
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Last order · ", d.lastOrder] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 grid grid-cols-2 md:grid-cols-4 gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Trust score",
											value: String(d.trust),
											tone: d.trust >= 85 ? "success" : d.trust >= 70 ? "warning" : "danger"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Pending",
											value: fmt(d.pending),
											tone: d.pending > 1e5 ? "danger" : d.pending > 0 ? "warning" : "success"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Lifetime",
											value: fmt(d.lifetime)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
											label: "Avg. payment",
											value: `${d.avgPaymentDays} days`
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2 md:min-w-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/conversations",
								className: "h-10 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-glow",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5" }), " Open chat"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "h-10 rounded-xl border border-border text-[13px] font-semibold hover:bg-secondary",
								children: "Send reminder"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card-surface p-5 md:p-6 border-primary/25 bg-primary/5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-10 w-10 rounded-xl bg-primary text-primary-foreground grid place-items-center shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4.5 w-4.5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-primary",
								children: "AI Summary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-[14px] leading-relaxed",
								children: [
									d.name,
									" has been a ",
									d.status === "active" ? "reliable" : d.status === "watch" ? "moderate-risk" : "high-risk",
									" account over the last 6 months. Average payment cycle is ",
									d.avgPaymentDays,
									" days, with a lifetime value of ",
									fmt(d.lifetime),
									". ",
									d.trust >= 85 ? "Safe to raise credit limit — behaviour is consistent." : d.trust >= 70 ? "Monitor closely; two invoices slipped past due this quarter." : "Escalate to a call today — overdue balance is growing faster than order volume."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
										tone: "info",
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3 w-3" }),
										children: "Orders trending +14%"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
										tone: "success",
										children: "Loyal · 6+ months"
									}),
									d.status === "overdue" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
										tone: "danger",
										children: "Escalate collection"
									})
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface p-5 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
							children: "6 months"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[16px] font-semibold tracking-tight",
							children: "Order value trend"
						})] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56 mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: trend,
							margin: {
								left: -12,
								right: 8,
								top: 8,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "#eef1f5",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "m",
									tickLine: false,
									axisLine: false,
									tick: {
										fontSize: 11,
										fill: "#64748b"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: {
										borderRadius: 12,
										border: "1px solid #e5e7eb",
										fontSize: 12
									},
									formatter: (v) => fmt(v)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "v",
									fill: "#2563EB",
									radius: [
										8,
										8,
										0,
										0
									]
								})
							]
						}) })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Recent payments"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-3",
						children: [
							{
								d: "Nov 3",
								a: 2e4,
								mode: "UPI"
							},
							{
								d: "Oct 22",
								a: 45e3,
								mode: "Bank"
							},
							{
								d: "Oct 8",
								a: 32e3,
								mode: "UPI"
							},
							{
								d: "Sep 27",
								a: 18500,
								mode: "Cash"
							}
						].map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between text-[13px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-8 w-8 rounded-lg bg-success/10 text-success grid place-items-center",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: fmt(p.a)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11px] text-muted-foreground",
									children: [
										p.d,
										" · ",
										p.mode
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: "success",
								children: "Paid"
							})]
						}, i))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 lg:grid-cols-3 gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[15px] font-semibold tracking-tight",
								children: "Order history"
							})]
						}), dOrders.length ? dOrders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-2.5 border-b border-border last:border-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between text-[13px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: o.invoice
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: fmt(o.total)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11.5px] text-muted-foreground",
								children: [
									o.placedAt,
									" · ",
									o.items.length,
									" items"
								]
							})]
						}, o.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[12.5px] text-muted-foreground",
							children: "No recent orders."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[15px] font-semibold tracking-tight",
								children: "Invoices"
							})]
						}), dInvoices.length ? dInvoices.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-2.5 border-b border-border last:border-0 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[13px] font-semibold",
								children: i.id
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] text-muted-foreground",
								children: i.date
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13px] font-semibold",
									children: fmt(i.amount)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									tone: i.status === "paid" ? "success" : i.status === "overdue" ? "danger" : "warning",
									children: i.status
								})]
							})]
						}, i.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[12.5px] text-muted-foreground",
							children: "No invoices yet."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[15px] font-semibold tracking-tight",
								children: "Conversation"
							})]
						}), chat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [chat.messages.slice(0, 4).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `rounded-lg px-3 py-2 text-[12.5px] ${m.from === "dealer" ? "bg-secondary" : "bg-primary/10 text-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[10.5px] font-semibold text-muted-foreground",
									children: [
										m.from === "dealer" ? d.name : "AI Copilot",
										" · ",
										m.time
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-0.5 whitespace-pre-line line-clamp-3",
									children: m.text
								})]
							}, m.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/conversations",
								className: "mt-1 inline-block text-[12px] font-semibold text-primary hover:underline",
								children: "Open full chat →"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[12.5px] text-muted-foreground",
							children: "No chat yet."
						})]
					})
				]
			})
		]
	}) });
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface-2 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `text-[18px] font-semibold tracking-tight ${tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "danger" ? "text-destructive" : "text-foreground"}`,
			children: value
		})]
	});
}
//#endregion
export { DealerProfile as component };
