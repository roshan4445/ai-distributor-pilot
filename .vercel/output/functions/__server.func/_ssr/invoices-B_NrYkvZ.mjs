import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as getInvoices } from "./db-queries-D4xYwou2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoices-B_NrYkvZ.js
var $$splitComponentImporter = () => import("./invoices-Ces0gUgs.mjs");
var Route = createFileRoute("/invoices")({
	loader: () => getInvoices(),
	head: () => ({ meta: [{ title: "Invoices — AI Distributor Copilot" }, {
		name: "description",
		content: "Auto-generated invoices sent to dealers over WhatsApp with a single click."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
