import { o as __toESM } from "../_runtime.mjs";
import { t as askAiQuery } from "./db-queries-D3jRyzSM.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { R as ArrowUpRight, p as Send, u as Sparkles, w as LoaderCircle } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { n as askAiSuggestions, t as askAiSeedChat } from "./mock-data-qUJ_xzNA.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ask-_2s8n2a4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var initial = [{
	id: "s0",
	role: "user",
	text: askAiSeedChat[0].q
}, {
	id: "s1",
	role: "ai",
	text: askAiSeedChat[0].a
}];
function formatMessage(text) {
	const lines = text.split("\n");
	const resultElements = [];
	let inList = false;
	let currentListItems = [];
	const formatBold = (str) => {
		return str.split(/\*\*([^*]+)\*\*/g).map((part, i) => {
			if (i % 2 === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				className: "font-semibold text-foreground",
				children: part
			}, i);
			return part;
		});
	};
	lines.forEach((line, idx) => {
		if (!line.trim()) {
			if (inList) {
				resultElements.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5 my-2 space-y-1.5",
					children: currentListItems
				}, `list-${idx}`));
				currentListItems = [];
				inList = false;
			}
			resultElements.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-1.5" }, `br-${idx}`));
			return;
		}
		const listMatch = line.match(/^[\*\-]\s+(.*)$/);
		if (listMatch) {
			inList = true;
			currentListItems.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-[13.5px] leading-relaxed text-muted-foreground pl-0.5",
				children: formatBold(listMatch[1])
			}, `li-${idx}`));
		} else {
			if (inList) {
				resultElements.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5 my-2 space-y-1.5",
					children: currentListItems
				}, `list-${idx}`));
				currentListItems = [];
				inList = false;
			}
			resultElements.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[13.5px] leading-relaxed my-1",
				children: formatBold(line)
			}, `p-${idx}`));
		}
	});
	if (inList && currentListItems.length > 0) resultElements.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "list-disc pl-5 my-2 space-y-1.5",
		children: currentListItems
	}, "list-final"));
	return resultElements;
}
function AskAiPage() {
	const [messages, setMessages] = (0, import_react.useState)(initial);
	const [input, setInput] = (0, import_react.useState)("");
	const send = async (raw) => {
		const q = (raw ?? input).trim();
		if (!q) return;
		const uid = crypto.randomUUID();
		const aid = crypto.randomUUID();
		setMessages((m) => [
			...m,
			{
				id: uid,
				role: "user",
				text: q
			},
			{
				id: aid,
				role: "ai",
				text: "",
				thinking: true
			}
		]);
		setInput("");
		try {
			const answer = await askAiQuery({ data: q });
			setMessages((m) => m.map((x) => x.id === aid ? {
				...x,
				text: answer,
				thinking: false
			} : x));
		} catch (e) {
			setMessages((m) => m.map((x) => x.id === aid ? {
				...x,
				text: "Sorry, I had trouble reading the database. Please try again.",
				thinking: false
			} : x));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "h-[calc(100vh-64px)] flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 overflow-y-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl mx-auto px-5 md:px-8 pt-10 pb-6",
				children: [
					messages.length <= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: {
							opacity: 0,
							y: 8
						},
						animate: {
							opacity: 1,
							y: 0
						},
						className: "mb-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " Ask AI"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "mt-3 text-[32px] font-semibold tracking-tight",
								children: [
									"Ask your ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient",
										children: "business"
									}),
									" anything."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[14px] text-muted-foreground",
								children: "The AI has read every WhatsApp message, every invoice, and every ledger entry."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
							initial: false,
							children: messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								initial: {
									opacity: 0,
									y: 6
								},
								animate: {
									opacity: 1,
									y: 0
								},
								transition: { duration: .25 },
								children: m.role === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3 justify-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "max-w-[80%] rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-2.5 text-[13.5px] leading-relaxed",
										children: m.text
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-8 w-8 rounded-full bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[11px] font-bold shrink-0",
										children: "R"
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-8 w-8 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "max-w-[85%] rounded-2xl rounded-tl-sm bg-surface-2 border border-border px-4 py-3 text-[13.5px] leading-relaxed",
										children: m.thinking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex items-center gap-2 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), " Thinking through your ledgers…"]
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-1",
											children: formatMessage(m.text)
										})
									})]
								})
							}, m.id))
						})
					}),
					messages.length <= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2",
							children: "Try asking"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid sm:grid-cols-2 gap-2",
							children: askAiSuggestions.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => send(q),
								className: "group text-left rounded-xl border border-border bg-background p-3.5 hover:border-primary/40 hover:shadow-elevate transition",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[13px] font-medium",
										children: q
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition" })]
								})
							}, q))
						})]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-border bg-background/80 backdrop-blur",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-3xl mx-auto px-5 md:px-8 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-background p-2 flex items-end gap-2 shadow-soft focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: input,
						onChange: (e) => setInput(e.target.value),
						onKeyDown: (e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								send();
							}
						},
						rows: 1,
						placeholder: "Ask your business anything…",
						className: "flex-1 resize-none bg-transparent px-3 py-2 text-[14px] focus:outline-none max-h-40"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => send(),
						className: "h-10 px-3.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-glow",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Ask"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 text-[11px] text-muted-foreground text-center",
					children: "Grounded on your live data — orders, invoices, ledgers, WhatsApp conversations."
				})]
			})
		})]
	}) });
}
//#endregion
export { AskAiPage as component };
