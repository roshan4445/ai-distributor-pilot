import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as getDealers } from "./db-queries-D4xYwou2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dealers.index-D8YyvOcB.js
var $$splitComponentImporter = () => import("./dealers.index-Da8s5uJ3.mjs");
var Route = createFileRoute("/dealers/")({
	loader: () => getDealers(),
	head: () => ({ meta: [{ title: "Dealers — AI Distributor Copilot" }, {
		name: "description",
		content: "Every dealer, scored by AI on payment behaviour, order health, and lifetime value."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
