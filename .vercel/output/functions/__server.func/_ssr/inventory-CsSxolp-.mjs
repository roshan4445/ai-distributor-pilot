import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as getInventory } from "./db-queries-D4xYwou2.mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-CsSxolp-.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("./inventory-CJ2-v_mH.mjs");
var Route = createFileRoute("/inventory")({
	loader: () => getInventory(),
	head: () => ({ meta: [{ title: "Inventory — AI Distributor Copilot" }, {
		name: "description",
		content: "Live stock, minimums, and AI restock recommendations for every SKU."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
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
//#endregion
export { Route as n, PageHeader as t };
