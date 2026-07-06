import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as getAiDuesAnalysis } from "./db-queries-D3jRyzSM.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { S as MessageCircle, _ as PhoneCall, c as TrendingUp, r as Wallet, s as TriangleAlert, w as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { r as fmt } from "./mock-data-qUJ_xzNA.mjs";
import { t as Pill } from "./badges-Cs8n-29R.mjs";
import { t as PageHeader } from "./inventory-B9E3uGnk.mjs";
import { t as Route } from "./dues-BzQljBT1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dues-B0aghHsj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var riskTone = (r) => r >= 70 ? "danger" : r >= 40 ? "warning" : "success";
var riskLabel = (r) => r >= 70 ? "High" : r >= 40 ? "Medium" : "Low";
function DuesPage() {
	const initialDues = Route.useLoaderData();
	const [dues, setDues] = (0, import_react.useState)(initialDues);
	const [isAnalyzing, setIsAnalyzing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setIsAnalyzing(true);
		getAiDuesAnalysis({ data: initialDues }).then((aiResults) => {
			if (aiResults && aiResults.length > 0) setDues((currentDues) => currentDues.map((d) => {
				const aiItem = aiResults.find((x) => x.dealerId === d.dealerId);
				if (aiItem) return {
					...d,
					risk: Number(aiItem.risk),
					action: aiItem.action,
					promise: aiItem.promise || d.promise
				};
				return d;
			}));
		}).catch((err) => console.error("Error loading AI dues analysis:", err)).finally(() => setIsAnalyzing(false));
	}, [initialDues]);
	const total = dues.reduce((s, d) => s + d.pending, 0);
	const critical = dues.filter((d) => d.overdueDays > 30).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
						eyebrow: "Dues",
						title: "Outstanding dealers",
						subtitle: "AI-prioritised by risk, overdue days and payment behaviour"
					}),
					isAnalyzing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 text-[12px] font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full h-fit animate-pulse",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AI Copilot auditing risk..." })]
					}),
					!isAnalyzing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1.5 text-[12px] font-semibold text-success bg-success/10 border border-success/20 px-3 py-1.5 rounded-full h-fit",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5 w-1.5 rounded-full bg-success animate-ping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "AI Audit active" })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }), " Total outstanding"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[26px] font-semibold tracking-tight",
								children: fmt(total)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-[11.5px] text-muted-foreground",
								children: [
									"across ",
									dues.length,
									" dealers"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-destructive text-[11px] font-semibold uppercase tracking-wider",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5" }), " Critical (30+ days)"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[26px] font-semibold tracking-tight text-destructive",
								children: critical
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] text-muted-foreground",
								children: "requires call today"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-success text-[11px] font-semibold uppercase tracking-wider",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3.5 w-3.5" }), " Collection rate"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[26px] font-semibold tracking-tight text-success",
								children: "92%"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11.5px] text-muted-foreground",
								children: "last 30 days"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "card-surface overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-[13px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground bg-surface-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-5 py-3",
									children: "Dealer"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Pending"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Overdue"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Promise"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Risk"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-3",
									children: "Recommended action"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: dues.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-secondary/60 transition",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-5 py-3.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/dealers/$id",
											params: { id: d.dealerId },
											className: "font-semibold hover:text-primary",
											children: d.dealer
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3.5 font-semibold",
										children: fmt(d.pending)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `font-semibold ${d.overdueDays > 30 ? "text-destructive" : d.overdueDays > 14 ? "text-warning" : "text-foreground"}`,
											children: [d.overdueDays, " days"]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3.5 text-muted-foreground",
										children: d.promise
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-20 h-1.5 rounded-full bg-secondary overflow-hidden",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: `h-full ${d.risk >= 70 ? "bg-destructive" : d.risk >= 40 ? "bg-warning" : "bg-success"}`,
													style: { width: `${d.risk}%` }
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
												tone: riskTone(d.risk),
												children: [
													riskLabel(d.risk),
													" · ",
													d.risk
												]
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3.5 text-[12.5px]",
										children: d.action
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3.5",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "h-8 w-8 rounded-lg border border-border hover:bg-secondary grid place-items-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneCall, { className: "h-3.5 w-3.5" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-3.5 w-3.5" })
											})]
										})
									})
								]
							}, d.dealerId))
						})]
					})
				})
			})
		]
	}) });
}
//#endregion
export { DuesPage as component };
