import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getConversationsList, c as getDealers } from "./db-queries-D4xYwou2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations-CUOXIJUP.js
var $$splitComponentImporter = () => import("./conversations-Bilonhjs.mjs");
var Route = createFileRoute("/conversations")({
	loader: async () => {
		return {
			conversations: await getConversationsList(),
			dealers: await getDealers()
		};
	},
	head: () => ({ meta: [{ title: "Dealer Conversations — AI Distributor Copilot" }, {
		name: "description",
		content: "AI reads WhatsApp orders, parses SKUs, generates invoices and schedules reminders — automatically."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
