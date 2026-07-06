import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badges-Cs8n-29R.js
var import_jsx_runtime = require_jsx_runtime();
var toneClasses = {
	primary: "bg-primary/10 text-primary ring-primary/15",
	success: "bg-success/10 text-success ring-success/15",
	warning: "bg-warning/15 text-[color-mix(in_oklab,var(--warning)_45%,black)] ring-warning/25",
	danger: "bg-destructive/10 text-destructive ring-destructive/15",
	muted: "bg-secondary text-muted-foreground ring-border",
	info: "bg-indigo-50 text-indigo-700 ring-indigo-200"
};
function Pill({ tone = "muted", icon, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${toneClasses[tone]}`,
		children: [icon, children]
	});
}
//#endregion
export { Pill as t };
