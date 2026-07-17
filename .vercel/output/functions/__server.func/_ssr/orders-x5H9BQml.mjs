import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as getOrders } from "./db-queries-B-DUktQC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-x5H9BQml.js
var $$splitComponentImporter = () => import("./orders-CZLWeiWf.mjs");
var Route = createFileRoute("/orders")({
	loader: () => getOrders(),
	head: () => ({ meta: [{ title: "Orders — AI Distributor Copilot" }, {
		name: "description",
		content: "Every order — parsed from WhatsApp, priced, invoiced and dispatched with AI oversight."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
