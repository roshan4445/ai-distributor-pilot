import { _ as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { t as Route$3 } from "./conversations-BLV2ATi4.mjs";
import { t as Route$4 } from "./dealers._id-4RZysFez.mjs";
import { n as Route$5 } from "./inventory-BLUwYBLE.mjs";
import { t as Route$6 } from "./dealers.index-BBOIMHAE.mjs";
import { t as Route$7 } from "./dues-BdTMs-UZ.mjs";
import { t as Route$8 } from "./invoices-CWzzTiyF.mjs";
import { t as Route$9 } from "./orders-cZOlzTfU.mjs";
import { t as Route$10 } from "./routes-COporEDy.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CrvW_946.js
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-fONdnSaf.css";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-2xl w-full text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 p-4 text-left bg-red-950/20 border border-red-500/30 rounded-md overflow-auto max-h-60 text-xs text-red-400 font-mono",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-bold",
						children: [
							error?.name || "Error",
							": ",
							error?.message || String(error)
						]
					}), error?.stack && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-2 whitespace-pre-wrap opacity-80",
						children: error.stack
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$2 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "AI Distributor Copilot" },
			{
				name: "description",
				content: "The AI brain that manages orders, inventory, invoices and dealer dues for distributors."
			},
			{
				property: "og:title",
				content: "AI Distributor Copilot"
			},
			{
				property: "og:description",
				content: "An AI-first operating system for distributors — parses WhatsApp orders, updates ledgers, and follows up on dues automatically."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$2.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
var $$splitComponentImporter$1 = () => import("./dealers-Cd7Gw3Or.mjs");
var Route$1 = createFileRoute("/dealers")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./ask-CKmkc2tl.mjs");
var Route = createFileRoute("/ask")({
	head: () => ({ meta: [{ title: "Ask AI — AI Distributor Copilot" }, {
		name: "description",
		content: "Ask your business anything. The AI knows every dealer, invoice, and SKU."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var OrdersRoute = Route$9.update({
	id: "/orders",
	path: "/orders",
	getParentRoute: () => Route$2
});
var InvoicesRoute = Route$8.update({
	id: "/invoices",
	path: "/invoices",
	getParentRoute: () => Route$2
});
var InventoryRoute = Route$5.update({
	id: "/inventory",
	path: "/inventory",
	getParentRoute: () => Route$2
});
var DuesRoute = Route$7.update({
	id: "/dues",
	path: "/dues",
	getParentRoute: () => Route$2
});
var DealersRoute = Route$1.update({
	id: "/dealers",
	path: "/dealers",
	getParentRoute: () => Route$2
});
var ConversationsRoute = Route$3.update({
	id: "/conversations",
	path: "/conversations",
	getParentRoute: () => Route$2
});
var AskRoute = Route.update({
	id: "/ask",
	path: "/ask",
	getParentRoute: () => Route$2
});
var IndexRoute = Route$10.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$2
});
var DealersIndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => DealersRoute
});
var DealersRouteChildren = {
	DealersIdRoute: Route$4.update({
		id: "/$id",
		path: "/$id",
		getParentRoute: () => DealersRoute
	}),
	DealersIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AskRoute,
	ConversationsRoute,
	DealersRoute: DealersRoute._addFileChildren(DealersRouteChildren),
	DuesRoute,
	InventoryRoute,
	InvoicesRoute,
	OrdersRoute
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
