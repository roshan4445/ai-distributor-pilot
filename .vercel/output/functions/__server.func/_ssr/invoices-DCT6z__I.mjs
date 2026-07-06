import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { j as Download, k as FileText, m as Search } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { r as fmt } from "./mock-data-qUJ_xzNA.mjs";
import { t as Pill } from "./badges-Cs8n-29R.mjs";
import { t as PageHeader } from "./inventory-BLUwYBLE.mjs";
import { t as Route } from "./invoices-CWzzTiyF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoices-DCT6z__I.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var statusTone = {
	paid: "success",
	unpaid: "warning",
	partial: "info",
	overdue: "danger"
};
var statusLabel = {
	paid: "Paid",
	unpaid: "Unpaid",
	partial: "Partial",
	overdue: "Overdue"
};
function InvoicesPage() {
	const invoices = Route.useLoaderData();
	const [search, setSearch] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("All");
	const filtered = invoices.filter((inv) => {
		const matchesSearch = inv.id.toLowerCase().includes(search.toLowerCase()) || inv.dealer.toLowerCase().includes(search.toLowerCase());
		const matchesFilter = filter === "All" || inv.status.toLowerCase() === filter.toLowerCase();
		return matchesSearch && matchesFilter;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Invoices",
				title: "Invoice ledger",
				subtitle: "19 invoices generated today · all auto-numbered and sent to dealers"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search invoice or dealer…",
						className: "w-full h-10 pl-9 pr-3 rounded-xl bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden md:flex gap-2",
					children: [
						"All",
						"Paid",
						"Unpaid",
						"Overdue"
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
				className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4",
				children: filtered.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "card-surface p-5 hover:shadow-elevate transition",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4.5 w-4.5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: statusTone[inv.status],
								children: statusLabel[inv.status]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
									children: inv.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[16px] font-semibold tracking-tight",
									children: inv.dealer
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11.5px] text-muted-foreground",
									children: inv.date
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 pt-4 border-t border-border flex items-end justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold",
								children: "Amount"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[22px] font-semibold tracking-tight",
								children: fmt(inv.amount)
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "h-9 px-3 rounded-lg bg-foreground text-background text-[12.5px] font-semibold inline-flex items-center gap-1.5 hover:opacity-90",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " PDF"]
							})]
						})
					]
				}, inv.id))
			})
		]
	}) });
}
//#endregion
export { InvoicesPage as component };
