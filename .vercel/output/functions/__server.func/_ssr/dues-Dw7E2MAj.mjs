import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as getDues } from "./db-queries-DsP94wQJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dues-Dw7E2MAj.js
var $$splitComponentImporter = () => import("./dues-CRYLF_eM.mjs");
var Route = createFileRoute("/dues")({
	loader: () => getDues(),
	head: () => ({ meta: [{ title: "Outstanding Dues — AI Distributor Copilot" }, {
		name: "description",
		content: "AI-scored risk on every outstanding invoice with recommended next action."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
