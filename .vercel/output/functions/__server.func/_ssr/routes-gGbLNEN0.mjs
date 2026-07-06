import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getDashboardData } from "./db-queries-DsP94wQJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-gGbLNEN0.js
var $$splitComponentImporter = () => import("./routes-CEAGfArq.mjs");
var Route = createFileRoute("/")({
	loader: () => getDashboardData(),
	head: () => ({ meta: [
		{ title: "Mission Control — AI Distributor Copilot" },
		{
			name: "description",
			content: "The AI brain that runs your distribution business — orders, inventory, invoices, and dealer dues in one calm dashboard."
		},
		{
			property: "og:title",
			content: "AI Distributor Copilot — Mission Control"
		},
		{
			property: "og:description",
			content: "Orders parsed, invoices generated, dealers followed up — automatically."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
