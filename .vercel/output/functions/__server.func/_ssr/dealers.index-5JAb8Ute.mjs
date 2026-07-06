import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as getDealers } from "./db-queries-CknIf0h-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dealers.index-5JAb8Ute.js
var $$splitComponentImporter = () => import("./dealers.index-B0ElJXzm.mjs");
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
