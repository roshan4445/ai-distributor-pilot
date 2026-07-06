import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as getOrders } from "./db-queries-D4xYwou2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-Cll7rlOL.js
var $$splitComponentImporter = () => import("./orders-D3iqllaf.mjs");
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
