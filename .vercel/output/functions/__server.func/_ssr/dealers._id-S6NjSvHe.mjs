import { N as notFound, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as getDealerById } from "./db-queries-B-DUktQC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dealers._id-S6NjSvHe.js
var $$splitErrorComponentImporter = () => import("./dealers._id-BDkMArum.mjs");
var $$splitNotFoundComponentImporter = () => import("./dealers._id-tiHYcWCU.mjs");
var $$splitComponentImporter = () => import("./dealers._id-srRuTkMh.mjs");
var Route = createFileRoute("/dealers/$id")({
	loader: async ({ params }) => {
		const data = await getDealerById({ data: params.id });
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.dealer.name} — Dealer Profile` : "Dealer" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent")
});
//#endregion
export { Route as t };
