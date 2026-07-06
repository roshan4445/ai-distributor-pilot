import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createProductAction } from "./db-queries-D4xYwou2.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Package, d as Sparkles, g as Plus, h as Search, k as Funnel, l as TrendingDown, n as X, s as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { a as productRecommendation, r as fmt } from "./mock-data-qUJ_xzNA.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as Pill } from "./badges-Cs8n-29R.mjs";
import { n as Route } from "./inventory-CsSxolp-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-CJ2-v_mH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var recTone = {
	critical: "danger",
	warning: "warning",
	watch: "info",
	ok: "success"
};
function InventoryPage() {
	const products = Route.useLoaderData();
	const router = useRouter();
	const [search, setSearch] = (0, import_react.useState)("");
	const [stockFilter, setStockFilter] = (0, import_react.useState)("all");
	const [showAddModal, setShowAddModal] = (0, import_react.useState)(false);
	const [newName, setNewName] = (0, import_react.useState)("");
	const [newSku, setNewSku] = (0, import_react.useState)("");
	const [newCategory, setNewCategory] = (0, import_react.useState)("MCBs");
	const [newPrice, setNewPrice] = (0, import_react.useState)("250");
	const [newStock, setNewStock] = (0, import_react.useState)("100");
	const [newMin, setNewMin] = (0, import_react.useState)("30");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)("");
	const handleCreateProduct = async (e) => {
		e.preventDefault();
		if (!newName || !newSku) {
			setErrorMsg("Product Name and SKU code are required.");
			return;
		}
		setSubmitting(true);
		setErrorMsg("");
		try {
			await createProductAction({ data: {
				name: newName,
				sku: newSku,
				category: newCategory,
				price: Number(newPrice) || 0,
				stock: Number(newStock) || 0,
				min: Number(newMin) || 0
			} });
			setShowAddModal(false);
			setNewName("");
			setNewSku("");
			setNewCategory("MCBs");
			setNewPrice("250");
			setNewStock("100");
			setNewMin("30");
			router.invalidate();
		} catch (err) {
			console.error(err);
			setErrorMsg(err.message || "Failed to create SKU. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};
	const total = products.reduce((s, p) => s + p.stock * p.price, 0);
	const critical = products.filter((p) => p.stock < p.min * .5).length;
	const warning = products.filter((p) => p.stock < p.min && p.stock >= p.min * .5).length;
	const filtered = products.filter((p) => {
		const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
		let matchesStock = true;
		if (stockFilter === "critical") matchesStock = p.stock < p.min * .5;
		else if (stockFilter === "warning") matchesStock = p.stock < p.min && p.stock >= p.min * .5;
		return matchesSearch && matchesStock;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Inventory",
				title: "Live stock & AI restock",
				subtitle: "Every SKU. Every level. Every recommendation.",
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "h-9 px-3 rounded-lg border border-border text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-secondary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Funnel, { className: "h-3.5 w-3.5" }), " Filter"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setShowAddModal(true),
					className: "h-9 px-3 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-glow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New SKU"]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setStockFilter("all"),
						className: "text-left w-full focus:outline-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
							label: "Inventory value",
							value: fmt(total),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" }),
							tone: "primary",
							active: stockFilter === "all"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setStockFilter("critical"),
						className: "text-left w-full focus:outline-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
							label: "Critical stockouts",
							value: critical,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }),
							tone: "danger",
							active: stockFilter === "critical"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setStockFilter("warning"),
						className: "text-left w-full focus:outline-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
							label: "Restock warnings",
							value: warning,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-4 w-4" }),
							tone: "warning",
							active: stockFilter === "warning"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
						label: "AI reorder drafts",
						value: 4,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }),
						tone: "info"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "card-surface overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 border-b border-border flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 max-w-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Search product or SKU…",
							className: "w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[11.5px] text-muted-foreground",
						children: [filtered.length, " SKUs"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-surface-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Product"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "SKU"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Stock"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Min. stock"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "AI recommendation"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: filtered.map((p) => {
								const rec = productRecommendation(p);
								const pct = Math.min(100, p.stock / p.min * 100);
								const barTone = rec.level === "critical" ? "bg-destructive" : rec.level === "warning" ? "bg-warning" : rec.level === "watch" ? "bg-indigo-500" : "bg-success";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-secondary/60 transition",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-5 py-3.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold",
												children: p.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[11.5px] text-muted-foreground",
												children: [
													p.category,
													" · ",
													fmt(p.price)
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5 font-mono text-[12px] text-muted-foreground",
											children: p.sku
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold",
												children: p.stock.toLocaleString("en-IN")
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1 h-1.5 w-32 rounded-full bg-secondary overflow-hidden",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: `h-full ${barTone}`,
													style: { width: `${pct}%` }
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5 text-muted-foreground",
											children: p.min
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
												tone: recTone[rec.level],
												children: rec.level === "ok" ? "Healthy" : rec.level === "watch" ? "Watch" : rec.level === "warning" ? "Low" : "Critical"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[12.5px] text-foreground/85",
													children: rec.text
												})]
											})
										})
									]
								}, p.id);
							})
						})]
					})
				})]
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showAddModal && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			initial: { opacity: 0 },
			animate: { opacity: 1 },
			exit: { opacity: 0 },
			onClick: () => setShowAddModal(false),
			className: "absolute inset-0 bg-background/80 backdrop-blur-sm"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				scale: .95,
				opacity: 0,
				y: 15
			},
			animate: {
				scale: 1,
				opacity: 1,
				y: 0
			},
			exit: {
				scale: .95,
				opacity: 0,
				y: 15
			},
			className: "relative w-full max-w-md overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-soft z-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-border pb-3 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-lg font-semibold",
						children: "Add New Product SKU"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setShowAddModal(false),
					className: "rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4.5 w-4.5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleCreateProduct,
				className: "space-y-4",
				children: [
					errorMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-3 text-[12.5px] rounded-lg bg-destructive/15 text-destructive font-medium",
						children: errorMsg
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-[11px] uppercase font-semibold text-muted-foreground mb-1",
									children: "Product Name"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "text",
									required: true,
									value: newName,
									onChange: (e) => setNewName(e.target.value),
									placeholder: "e.g. Polycab 3-Core Wire 100m",
									className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-[11px] uppercase font-semibold text-muted-foreground mb-1",
								children: "SKU Code"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								required: true,
								value: newSku,
								onChange: (e) => setNewSku(e.target.value.toUpperCase()),
								placeholder: "e.g. WR-POLY-3C",
								className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-[11px] uppercase font-semibold text-muted-foreground mb-1",
								children: "Category"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: newCategory,
								onChange: (e) => setNewCategory(e.target.value),
								className: "w-full h-10 px-2 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20",
								children: [
									"MCBs",
									"Switches",
									"Wires",
									"Sockets",
									"Boards"
								].map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: cat,
									children: cat
								}, cat))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-[11px] uppercase font-semibold text-muted-foreground mb-1",
								children: "Price (₹)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "0",
								required: true,
								value: newPrice,
								onChange: (e) => setNewPrice(e.target.value),
								className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block text-[11px] uppercase font-semibold text-muted-foreground mb-1",
								children: "Initial Stock"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								min: "0",
								required: true,
								value: newStock,
								onChange: (e) => setNewStock(e.target.value),
								className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block text-[11px] uppercase font-semibold text-muted-foreground mb-1",
									children: "Minimum Safety Stock Level"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									min: "0",
									required: true,
									value: newMin,
									onChange: (e) => setNewMin(e.target.value),
									className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex items-center justify-end gap-2 border-t border-border pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowAddModal(false),
							className: "h-10 px-4 rounded-lg text-[13px] border border-border hover:bg-secondary font-semibold transition",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: submitting,
							className: "h-10 px-5 rounded-lg text-[13px] bg-primary text-primary-foreground font-semibold hover:opacity-95 transition inline-flex items-center gap-1.5 shadow-glow",
							children: submitting ? "Creating..." : "Create SKU"
						})]
					})
				]
			})]
		})]
	}) })] });
}
function PageHeader({ eyebrow, title, subtitle, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col md:flex-row md:items-end md:justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold uppercase tracking-wider text-primary",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-[26px] font-semibold tracking-tight",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13.5px] text-muted-foreground",
				children: subtitle
			})
		] }), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-2",
			children: actions
		})]
	});
}
function SummaryTile({ label, value, icon, tone, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `card-surface p-4 flex items-center gap-3 transition border ${active ? "border-primary shadow-soft bg-primary/[0.02]" : "border-border/40 hover:border-border/80"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `h-10 w-10 rounded-xl grid place-items-center ${{
				primary: "bg-primary/10 text-primary",
				success: "bg-success/10 text-success",
				warning: "bg-warning/15 text-[color-mix(in_oklab,var(--warning)_45%,black)]",
				danger: "bg-destructive/10 text-destructive",
				info: "bg-indigo-50 text-indigo-600"
			}[tone]}`,
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] uppercase tracking-wider text-muted-foreground font-semibold",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[20px] font-semibold tracking-tight",
			children: value
		})] })]
	});
}
//#endregion
export { PageHeader, InventoryPage as component };
