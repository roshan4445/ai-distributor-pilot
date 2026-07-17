import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getConversationsList, c as getDealers } from "./db-queries-B-DUktQC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations-Blj719w2.js
var $$splitComponentImporter = () => import("./conversations-JacaeawY.mjs");
var Route = createFileRoute("/conversations")({
	loader: async () => {
		const [conversations, dealers] = await Promise.all([getConversationsList(), getDealers()]);
		return {
			conversations,
			dealers
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
