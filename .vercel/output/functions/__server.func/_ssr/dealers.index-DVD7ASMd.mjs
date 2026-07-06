import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { C as MapPin, R as ArrowUpRight, g as Phone, m as Search } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { r as fmt } from "./mock-data-qUJ_xzNA.mjs";
import { t as Pill } from "./badges-Cs8n-29R.mjs";
import { t as PageHeader } from "./inventory-BLUwYBLE.mjs";
import { t as Route } from "./dealers.index-BBOIMHAE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dealers.index-DVD7ASMd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var statusTone = {
	active: "success",
	watch: "warning",
	overdue: "danger"
};
var statusLabel = {
	active: "Active",
	watch: "Watch",
	overdue: "Overdue"
};
function DealersPage() {
	const dealers = Route.useLoaderData();
	const [search, setSearch] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("All");
	const filtered = dealers.filter((d) => {
		const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.city.toLowerCase().includes(search.toLowerCase());
		const matchesFilter = filter === "All" || d.status.toLowerCase() === filter.toLowerCase();
		return matchesSearch && matchesFilter;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 md:px-8 py-8 max-w-[1400px] mx-auto space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Dealers",
				title: "Dealer network",
				subtitle: "7 active dealers · AI-scored on trust, payment cadence and momentum"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1 max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search dealer or city…",
						className: "w-full h-10 pl-9 pr-3 rounded-xl bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden md:flex gap-2",
					children: [
						"All",
						"Active",
						"Watch",
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
				children: filtered.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dealers/$id",
					params: { id: d.id },
					className: "card-surface p-5 hover:shadow-elevate hover:border-primary/30 transition group",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[13px] font-bold",
									children: d.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[15px] font-semibold tracking-tight group-hover:text-primary transition",
									children: d.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-[11.5px] text-muted-foreground flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
										" ",
										d.city
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: statusTone[d.status],
								children: statusLabel[d.status]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 grid grid-cols-3 gap-3 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground",
									children: "Trust"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `text-[16px] font-semibold ${d.trust >= 85 ? "text-success" : d.trust >= 70 ? "text-warning" : "text-destructive"}`,
									children: d.trust
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground",
									children: "Pending"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[13px] font-semibold",
									children: fmt(d.pending)
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground",
									children: "Orders"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[16px] font-semibold",
									children: d.ordersCount
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 pt-4 border-t border-border flex items-center justify-between text-[12px] text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3 w-3" }),
									" ",
									d.phone
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-primary font-semibold inline-flex items-center gap-0.5",
								children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5" })]
							})]
						})
					]
				}, d.id))
			})
		]
	}) });
}
//#endregion
export { DealersPage as component };
