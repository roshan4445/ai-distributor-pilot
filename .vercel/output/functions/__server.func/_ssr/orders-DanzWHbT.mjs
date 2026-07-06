import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as updateOrderStatusAction } from "./db-queries-D3jRyzSM.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { I as Boxes, M as Clock, N as CircleCheck, b as PackageCheck, m as Search, n as X, o as Truck, u as Sparkles, y as Package, z as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { r as fmt } from "./mock-data-qUJ_xzNA.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as Pill } from "./badges-Cs8n-29R.mjs";
import { t as PageHeader } from "./inventory-B9E3uGnk.mjs";
import { t as Route } from "./orders-xsGBSsx5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-DanzWHbT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var statusMap = {
	processing: {
		tone: "warning",
		label: "Processing",
		icon: Clock
	},
	packed: {
		tone: "info",
		label: "Packed",
		icon: Boxes
	},
	dispatched: {
		tone: "primary",
		label: "Dispatched",
		icon: Truck
	},
	delivered: {
		tone: "success",
		label: "Delivered",
		icon: PackageCheck
	}
};
var stages = [
	"processing",
	"packed",
	"dispatched",
	"delivered"
];
function OrdersPage() {
	const orders = Route.useLoaderData();
	const router = useRouter();
	const [activeInvoice, setActiveInvoice] = (0, import_react.useState)(null);
	const [search, setSearch] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("All");
	const handleUpdateStatus = async (orderId, currentStatus) => {
		const stages = [
			"processing",
			"packed",
			"dispatched",
			"delivered"
		];
		const idx = stages.indexOf(currentStatus);
		if (idx === -1 || idx === stages.length - 1) return;
		const nextStatus = stages[idx + 1];
		await updateOrderStatusAction({ data: {
			orderId,
			nextStatus
		} });
		router.invalidate();
	};
	const filtered = orders.filter((o) => {
		const matchesSearch = o.invoice.toLowerCase().includes(search.toLowerCase()) || o.dealer.toLowerCase().includes(search.toLowerCase());
		const matchesFilter = filter === "All" || o.status.toLowerCase() === filter.toLowerCase();
		return matchesSearch && matchesFilter;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Orders",
				title: "Live order pipeline",
				subtitle: "24 orders today · 6 parsed by AI from WhatsApp this hour"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search order or dealer…",
						className: "w-full h-10 pl-9 pr-3 rounded-xl bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden md:flex gap-2",
					children: [
						"All",
						"Processing",
						"Packed",
						"Dispatched",
						"Delivered"
					].map((t) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setFilter(t),
							className: `h-9 px-3 rounded-lg text-[12.5px] font-semibold border transition ${filter === t ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary text-muted-foreground"}`,
							children: t
						}, t);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 lg:grid-cols-2 gap-5",
				children: filtered.map((o) => {
					const s = statusMap[o.status];
					const stageIdx = stages.indexOf(o.status);
					const Icon = s.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5 hover:shadow-elevate transition",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
											children: o.invoice
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											tone: s.tone,
											icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3 w-3" }),
											children: s.label
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/dealers/$id",
										params: { id: o.dealerId },
										className: "mt-1 block text-[17px] font-semibold tracking-tight hover:text-primary transition",
										children: o.dealer
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[12px] text-muted-foreground",
										children: ["Placed ", o.placedAt]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Total"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[20px] font-semibold tracking-tight",
										children: fmt(o.total)
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 space-y-2",
								children: o.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between text-[13px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium truncate",
											children: it.name
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-muted-foreground shrink-0",
										children: [
											"×",
											it.qty,
											" · ",
											fmt(it.qty * it.price)
										]
									})]
								}, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center justify-between",
									children: stages.map((st, i) => {
										const done = i <= stageIdx;
										const Icon2 = statusMap[st].icon;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 flex items-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `h-7 w-7 rounded-full grid place-items-center border-2 ${done ? "bg-primary border-primary text-primary-foreground" : "bg-background border-border text-muted-foreground"}`,
												children: i < stageIdx ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon2, { className: "h-3.5 w-3.5" })
											}), i < stages.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `flex-1 h-0.5 mx-1.5 ${i < stageIdx ? "bg-primary" : "bg-border"}` })]
										}, st);
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1.5 flex justify-between text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground",
									children: stages.map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: statusMap[st].label }, st))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-xl bg-primary/5 border border-primary/15 p-3 flex items-start gap-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[12.5px] leading-relaxed",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: "AI note · "
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground/80",
										children: o.aiNote
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setActiveInvoice(o),
									className: "text-[12.5px] font-semibold text-primary inline-flex items-center gap-1 hover:underline",
									children: ["View invoice ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "h-8 px-3 text-[12px] font-semibold rounded-lg border border-border hover:bg-secondary",
										children: "Print"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => handleUpdateStatus(o.id, o.status),
										disabled: o.status === "delivered",
										className: `h-8 px-3 text-[12px] font-semibold rounded-lg transition ${o.status === "delivered" ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-foreground text-background hover:bg-foreground/90"}`,
										children: o.status === "delivered" ? "Delivered" : "Update status"
									})]
								})]
							})
						]
					}, o.id);
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: activeInvoice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				opacity: 0,
				scale: .95
			},
			animate: {
				opacity: 1,
				scale: 1
			},
			exit: {
				opacity: 0,
				scale: .95
			},
			className: "bg-background border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 border-b border-border flex items-center justify-between bg-secondary/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-bold tracking-tight",
						children: "Invoice Details"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Generated by AI Copilot"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveInvoice(null),
						className: "h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center font-bold text-muted-foreground text-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-8 flex-1 overflow-y-auto space-y-6 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold tracking-tight text-primary",
									children: "KUMAR ELECTRICALS"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: "Wholesale Wholesaler & Distributor"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Bengaluru, Karnataka"
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[17px] font-bold text-foreground",
										children: activeInvoice.invoice
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: ["Status: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `font-semibold ${activeInvoice.status === "delivered" ? "text-success" : "text-warning"}`,
											children: activeInvoice.status.toUpperCase()
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: ["Date: ", activeInvoice.placedAt]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border pt-4 grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Billed To"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold text-foreground mt-1",
									children: activeInvoice.dealer
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: "Registered Dealer Profile"
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Source Channel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-semibold text-primary mt-1 inline-flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " WhatsApp AI Agent"]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "border border-border rounded-xl overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "bg-secondary/50 text-left font-semibold uppercase tracking-wider text-muted-foreground border-b border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2.5",
											children: "Item"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2.5 text-center",
											children: "Qty"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2.5 text-right",
											children: "Price"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2.5 text-right",
											children: "Total"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border",
									children: activeInvoice.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-secondary/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 font-medium",
												children: it.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-center",
												children: it.qty
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-right",
												children: fmt(it.price)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-4 py-3 text-right font-medium",
												children: fmt(it.qty * it.price)
											})
										]
									}, i))
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end pt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "w-64 space-y-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Subtotal"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: fmt(activeInvoice.total)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "GST (Included 18%)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: fmt(activeInvoice.total * .18)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "border-t border-border pt-2 flex justify-between text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold",
											children: "Total (INR)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-primary",
											children: fmt(activeInvoice.total)
										})]
									})
								]
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-t border-border bg-secondary/30 flex justify-end gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveInvoice(null),
						className: "h-9 px-4 text-xs font-semibold rounded-xl border border-border hover:bg-secondary",
						children: "Close"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							alert("Invoice sent to printer!");
							setActiveInvoice(null);
						},
						className: "h-9 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground shadow-glow",
						children: "Print Invoice"
					})]
				})
			]
		})
	}) })] });
}
//#endregion
export { OrdersPage as component };
