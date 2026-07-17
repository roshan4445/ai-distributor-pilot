import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as getInvoices } from "./db-queries-B-DUktQC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoices-D1JmIxhu.js
var $$splitComponentImporter = () => import("./invoices-DOa4lPwr.mjs");
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
