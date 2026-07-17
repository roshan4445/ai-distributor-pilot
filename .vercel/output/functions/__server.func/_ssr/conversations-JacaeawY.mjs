import { o as __toESM } from "../_runtime.mjs";
import { r as fmt } from "./mock-data-BPkAbplP.mjs";
import { v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as getInvoiceDetailsAction, m as postMessage, n as clearConversationAction } from "./db-queries-B-DUktQC.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { A as FileText, B as ArrowRight, I as CheckCheck, R as Bell, T as LoaderCircle, _ as Phone, b as Package, d as Sparkles, f as Smile, h as Search, i as Video, j as EllipsisVertical, m as Send, n as X, r as Wallet, s as TriangleAlert, u as Trash2, y as Paperclip } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as Route } from "./conversations-Blj719w2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations-JacaeawY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatMessage(text) {
	const lines = text.split("\n");
	const resultElements = [];
	let inList = false;
	let currentListItems = [];
	const formatBold = (str) => {
		return str.split(/\*\*([^*]+)\*\*/g).map((part, i) => {
			if (i % 2 === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
				className: "font-semibold",
				children: part
			}, i);
			return part;
		});
	};
	lines.forEach((line, idx) => {
		if (!line.trim()) {
			if (inList) {
				resultElements.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5 my-2 space-y-1",
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
				className: "text-[13.5px] leading-relaxed opacity-95 pl-0.5",
				children: formatBold(listMatch[1])
			}, `li-${idx}`));
		} else {
			if (inList) {
				resultElements.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "list-disc pl-5 my-2 space-y-1",
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
		className: "list-disc pl-5 my-2 space-y-1",
		children: currentListItems
	}, "list-final"));
	return resultElements;
}
function ConversationsPage() {
	const { conversations: conversationsList, dealers: dealersList } = Route.useLoaderData();
	const router = useRouter();
	if (conversationsList.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-[calc(100vh-64px)] grid place-items-center bg-surface",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center space-y-4 max-w-md p-6 card-surface",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-10 w-10 text-warning mx-auto animate-bounce" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-[17px] font-semibold tracking-tight",
					children: "Database Schema Required"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[13.5px] text-muted-foreground leading-relaxed",
					children: [
						"Your Supabase cloud database is connected successfully but contains no tables yet.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"Please run the query from ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
							className: "bg-secondary px-1.5 py-0.5 rounded text-primary font-mono text-[12px]",
							children: "supabase-schema.sql"
						}),
						" in your Supabase SQL Editor."
					]
				})
			]
		})
	}) });
	const [activeId, setActiveId] = (0, import_react.useState)(conversationsList[0]?.id || "");
	const active = conversationsList.find((c) => c.id === activeId);
	const [typingInput, setTypingInput] = (0, import_react.useState)("");
	const [activeQueryText, setActiveQueryText] = (0, import_react.useState)("");
	const [isSending, setIsSending] = (0, import_react.useState)(false);
	const [simulationMode, setSimulationMode] = (0, import_react.useState)("dealer");
	const [localMessages, setLocalMessages] = (0, import_react.useState)([]);
	const [activeInvoice, setActiveInvoice] = (0, import_react.useState)(null);
	const [isLoadingInvoice, setIsLoadingInvoice] = (0, import_react.useState)(false);
	const [pipelineStep, setPipelineStep] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (active) setLocalMessages(active.messages);
	}, [active?.id, active?.messages]);
	(0, import_react.useEffect)(() => {
		if (isSending) {
			setPipelineStep(0);
			const interval = setInterval(() => {
				setPipelineStep((prev) => Math.min(prev + 1, 6));
			}, 750);
			return () => clearInterval(interval);
		} else setPipelineStep(0);
	}, [isSending]);
	const handleViewInvoice = async (invoiceId) => {
		setIsLoadingInvoice(true);
		try {
			const res = await getInvoiceDetailsAction({ data: invoiceId });
			if (res) setActiveInvoice(res);
			else alert("Invoice details not found in active records.");
		} catch (err) {
			console.error("Error loading invoice:", err);
		} finally {
			setIsLoadingInvoice(false);
		}
	};
	const dealer = dealersList.find((d) => d.name === active.dealer) || {
		id: "d1",
		name: active.dealer,
		city: active.city,
		phone: "",
		pending: 0,
		trust: 80,
		lifetime: 0,
		avgPaymentDays: 15
	};
	const handleSend = async () => {
		const text = typingInput.trim();
		if (!text || isSending) return;
		setIsSending(true);
		setActiveQueryText(text);
		setTypingInput("");
		const nowStr = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit"
		});
		const userTempId = crypto.randomUUID();
		const optimisticUserMsg = {
			id: userTempId,
			from: simulationMode,
			text,
			time: nowStr
		};
		setLocalMessages((prev) => {
			const list = [...prev, optimisticUserMsg];
			if (simulationMode === "dealer") list.push({
				id: "thinking-bubble",
				from: "ai",
				kind: "thinking",
				text: "Agent is reasoning...",
				time: ""
			});
			return list;
		});
		try {
			await postMessage({ data: {
				conversationId: active.id,
				from: simulationMode,
				text
			} });
		} catch (err) {
			console.error("Error sending message:", err);
			setLocalMessages((prev) => prev.filter((m) => m.id !== userTempId && m.id !== "thinking-bubble"));
		} finally {
			await router.invalidate();
			setIsSending(false);
		}
	};
	const handleClearChat = async () => {
		if (!confirm("Are you sure you want to clear the entire chat history and reset the AI agent's memory?")) return;
		setIsSending(true);
		try {
			await clearConversationAction({ data: { conversationId: active.id } });
			setLocalMessages([]);
		} catch (err) {
			console.error("Failed to clear chat:", err);
		} finally {
			await router.invalidate();
			setIsSending(false);
		}
	};
	const getLivePlan = () => {
		const query = activeQueryText.toLowerCase();
		if (query.includes("pay") || query.includes("paid") || query.includes("ledger") || query.includes("balance") || query.includes("outstanding") || query.includes("due") || query.includes("invoice")) return {
			goal: "Goal: Audit Dues & Ledger Accounts",
			steps: [
				"Validate Dealer Profile",
				"Retrieve Invoices Ledger Accounts",
				"Sum Outstanding Receivables",
				"Verify Payment Promises/Stats",
				"Format Balance Summary & Report",
				"Confirm Consistent Ledger State"
			]
		};
		if (query.includes("want") || query.includes("buy") || query.includes("order") || query.includes("purchase") || query.includes("mcb") || query.includes("switch") || query.includes("wire") || query.includes("skt") || query.includes("socket") || query.includes("light") || query.includes("confirm")) return {
			goal: "Goal: Process & Draft Sales Order",
			steps: [
				"Validate Dealer Profile",
				"Identify Requested Product Catalog",
				"Verify Safety Stock Limits",
				"Check Dealer Credit Limit/Dues",
				"Calculate Order Wholesale Total",
				"Format Draft Proposal Bubble"
			]
		};
		return {
			goal: "Goal: Process Dealer Inquiry",
			steps: [
				"Validate Dealer Profile",
				"Analyze Inquiry Intent & Details",
				"Query Context Databases",
				"Formulate Natural Response",
				"Post AI Reply to Dealer",
				"Log Activity Reflection"
			]
		};
	};
	const livePlan = getLivePlan();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "h-[calc(100vh-64px)] flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "w-80 shrink-0 border-r border-border bg-background flex flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 border-b border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
								children: "Inbox"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[17px] font-semibold tracking-tight",
								children: "Dealer chats"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative mt-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									placeholder: "Search chats…",
									className: "w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 overflow-y-auto",
						children: conversationsList.map((c) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setActiveId(c.id),
								className: `w-full text-left px-4 py-3 flex items-start gap-3 border-b border-border/70 transition ${c.id === activeId ? "bg-accent" : "hover:bg-secondary"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { name: c.dealer }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[13.5px] font-semibold truncate",
												children: c.dealer
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10.5px] text-muted-foreground shrink-0 ml-2",
												children: c.messages.length > 0 ? c.messages[c.messages.length - 1].time : ""
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[12px] text-muted-foreground truncate",
											children: c.preview
										})]
									}),
									c.unread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 text-[10px] font-bold h-4 min-w-4 px-1 grid place-items-center rounded-full bg-primary text-primary-foreground",
										children: c.unread
									}) : null
								]
							}, c.id);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex-1 min-w-0 flex flex-col bg-surface",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "h-16 px-5 flex items-center gap-3 border-b border-border bg-background",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, { name: active.dealer }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[14px] font-semibold tracking-tight",
										children: active.dealer
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-[11.5px] text-muted-foreground flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-success animate-pulse" }),
											" Online • ",
											active.city
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: handleClearChat,
											disabled: isSending,
											className: "h-9 px-3 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center gap-1.5 text-[12.5px] font-semibold transition border border-border/50 hover:border-destructive/20 disabled:opacity-50 cursor-pointer",
											title: "Clear conversation history and reset memory",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), "Clear Chat"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-4 w-px bg-border mx-1" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "h-9 w-9 rounded-lg hover:bg-secondary grid place-items-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "h-9 w-9 rounded-lg hover:bg-secondary grid place-items-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Video, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "h-9 w-9 rounded-lg hover:bg-secondary grid place-items-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4" })
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex-1 overflow-y-auto px-6 py-6 space-y-4",
							style: {
								backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.045) 1px, transparent 0)",
								backgroundSize: "18px 18px"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
								initial: false,
								children: localMessages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, {
									msg: m,
									onViewInvoice: handleViewInvoice
								}, m.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
							className: "p-4 border-t border-border bg-background space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1 bg-secondary p-1 rounded-xl text-[12px] h-8",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setSimulationMode("dealer"),
											className: `px-3 py-1 rounded-lg font-semibold transition inline-flex items-center gap-1 ${simulationMode === "dealer" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
											children: "👤 Act as Dealer"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setSimulationMode("ai"),
											className: `px-3 py-1 rounded-lg font-semibold transition inline-flex items-center gap-1 ${simulationMode === "ai" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
											children: "🏢 Act as Distributor"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] text-muted-foreground font-semibold",
										children: simulationMode === "dealer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-primary animate-pulse",
											children: "Simulating Dealer Mobile WhatsApp Chat"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-foreground/80",
											children: "Simulating Distributor Admin Override Reply"
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "h-10 w-10 rounded-xl hover:bg-secondary grid place-items-center text-muted-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "h-4.5 w-4.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											className: "h-10 w-10 rounded-xl hover:bg-secondary grid place-items-center text-muted-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4.5 w-4.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: typingInput,
											onChange: (e) => setTypingInput(e.target.value),
											onKeyDown: (e) => {
												if (e.key === "Enter" && !e.shiftKey) {
													e.preventDefault();
													handleSend();
												}
											},
											placeholder: simulationMode === "dealer" ? `Type as ${active.dealer} (AI agent will reply)…` : "Type manual message from Kumar Electricals (No AI reply)…",
											className: "flex-1 h-10 px-3 rounded-xl bg-secondary text-[13.5px] focus:outline-none focus:ring-2 focus:ring-primary/20",
											disabled: isSending
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: handleSend,
											disabled: isSending,
											className: "h-10 px-4 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold shadow-glow inline-flex items-center gap-1.5 disabled:opacity-50",
											children: [isSending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Send"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-[11px] text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3 text-primary animate-pulse" }), " AI Agent runs autonomously on user message."]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden xl:flex w-80 shrink-0 border-l border-border bg-slate-950 text-slate-100 flex-col overflow-y-auto divide-y divide-slate-900",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-5 space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400",
								children: "Agent Status"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold text-success",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-success animate-ping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isSending ? "PROCESSING" : "ACTIVE" })]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-slate-900/60 border border-slate-900 rounded-xl p-4 space-y-3.5 shadow-inner",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-2 rounded-full bg-success animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[9px] uppercase font-bold text-slate-500",
										children: "Agent Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[12px] font-semibold text-slate-200",
										children: "Distributor Operations Agent"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 text-[11px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[9px] uppercase font-bold text-slate-500",
										children: "Model"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold text-slate-300",
										children: "Llama 3.3 70B"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[9px] uppercase font-bold text-slate-500",
										children: "Framework"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold text-slate-300",
										children: "LangChain"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-slate-900 pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[9px] uppercase font-bold text-slate-500 mb-1.5",
										children: "Architecture Core"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-1.5",
												children: "✓ Guardrails"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-1.5",
												children: "✓ Planner"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-1.5",
												children: "✓ Memory"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-1.5",
												children: "✓ Tool Calling"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-1.5",
												children: "✓ Reflection"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-1.5",
												children: "✓ Observability"
											})
										]
									})]
								})
							]
						})]
					}), isSending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400",
								children: "Live Execution Pipeline"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 text-[12px] text-slate-300",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
										icon: "🛡",
										label: "Running Guardrails...",
										status: pipelineStep >= 1 ? "done" : pipelineStep === 0 ? "active" : "pending"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
										icon: "🧠",
										label: "Creating Execution Plan...",
										status: pipelineStep >= 2 ? "done" : pipelineStep === 1 ? "active" : "pending"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
										icon: "🤖",
										label: "AI Reasoning...",
										status: pipelineStep >= 3 ? "done" : pipelineStep === 2 ? "active" : "pending"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
										icon: "🔧",
										label: "Calling Business Tools...",
										status: pipelineStep >= 4 ? "done" : pipelineStep === 3 ? "active" : "pending"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
										icon: "🔍",
										label: "Post-Execution Reflection...",
										status: pipelineStep >= 5 ? "done" : pipelineStep === 4 ? "active" : "pending"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
										icon: "✅",
										label: "Completed Successfully",
										status: pipelineStep >= 6 ? "done" : pipelineStep === 5 ? "active" : "pending"
									})
								]
							})]
						}),
						pipelineStep >= 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400",
								children: "Execution Plan"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-slate-900/60 border border-slate-900 rounded-xl p-3.5 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11.5px] font-semibold text-primary",
									children: livePlan.goal
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-1.5 text-[11px] text-slate-400",
									children: livePlan.steps.map((step, idx) => {
										const stepActive = pipelineStep >= idx + 1;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: stepActive ? "text-success font-medium" : "text-slate-300 font-medium",
											children: [
												stepActive ? "✓" : "○",
												" ",
												step
											]
										}, idx);
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400",
								children: "Agent Monitor"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 text-[11px] text-slate-400",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorRow, {
										label: "Current State",
										value: pipelineStep === 0 ? "VALIDATING" : pipelineStep === 1 ? "PLANNING" : pipelineStep === 2 ? "THINKING" : pipelineStep === 3 ? "EXECUTING" : pipelineStep === 4 ? "REFLECTING" : "COMPLETED",
										tone: "info"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorRow, {
										label: "Guardrail Status",
										value: pipelineStep >= 1 ? "PASSED" : "VALIDATING...",
										tone: pipelineStep >= 1 ? "success" : "warning"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorRow, {
										label: "Planner Status",
										value: pipelineStep >= 2 ? "PLAN GENERATED" : "PLANNING...",
										tone: pipelineStep >= 2 ? "success" : "warning"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorRow, {
										label: "Confidence",
										value: "98%",
										tone: "success"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorRow, {
										label: "Tools Active",
										value: pipelineStep === 3 ? activeQueryText.toLowerCase().includes("pay") || activeQueryText.toLowerCase().includes("paid") ? "recordPayment()" : "createOrder()" : pipelineStep > 3 ? activeQueryText.toLowerCase().includes("pay") || activeQueryText.toLowerCase().includes("paid") ? "recordPayment() (Done)" : "createOrder() (Done)" : "None"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonitorRow, {
										label: "Reflection Status",
										value: pipelineStep >= 5 ? "HEALTHY" : "WAITING...",
										tone: pipelineStep >= 5 ? "success" : "warning"
									})
								]
							})]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400",
								children: "Conversation Memory"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-slate-900/60 border border-slate-900 rounded-xl p-4 space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-[11px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-slate-500",
										children: "Memory Status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-success font-semibold",
										children: "LOADED"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-t border-slate-900 pt-2 space-y-2 text-[12px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[9px] text-slate-500 uppercase font-bold",
											children: "Active Dealer"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-slate-300",
											children: active.dealer
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[9px] text-slate-500 uppercase font-bold",
											children: "Last Active Order"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-slate-300",
											children: active.memory?.lastOrderId ? "o-" + active.memory.lastOrderId.substring(0, 8) : active.memory?.lastInvoiceId || "None"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[9px] text-slate-500 uppercase font-bold",
											children: "Pending Context"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-slate-300 truncate",
											children: active.memory?.pendingClarification || "No outstanding queries"
										})] })
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-semibold uppercase tracking-wider text-slate-400",
								children: "Dealer Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3 text-[12px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRowDark, {
										label: "Registered Name",
										value: active.dealer
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRowDark, {
										label: "Base Location",
										value: active.city
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRowDark, {
										label: "Trust Rank",
										value: `${dealer.trust}%`,
										tone: dealer.trust >= 85 ? "success" : "warning"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRowDark, {
										label: "Outstanding dues",
										value: fmt(dealer.pending),
										tone: dealer.pending > 0 ? "warning" : "success"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRowDark, {
										label: "Lifetime Business",
										value: fmt(dealer.lifetime)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRowDark, {
										label: "Avg. Payment Cycle",
										value: `${dealer.avgPaymentDays} days`
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-slate-900 bg-slate-900/40 p-4 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-[11px] font-bold text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), " Recommendations"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11.5px] text-slate-400 leading-relaxed",
									children: "Account trust is rated high. Weekly order volume is stable. Consider extending credit limits for upcoming Diwali orders to capture billing growth."
								})]
							})
						})
					] })]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: activeInvoice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					scale: .95
				},
				animate: {
					opacity: 1,
					scale: 1
				},
				exit: {
					opacity: 0,
					scale: .95
				},
				className: "bg-background border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6 border-b border-border flex items-center justify-between bg-secondary/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-lg font-bold tracking-tight",
							children: "Invoice Details"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Generated by AI Copilot"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveInvoice(null),
							className: "h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center font-bold text-muted-foreground text-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-8 flex-1 overflow-y-auto space-y-6 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xl font-bold tracking-tight text-primary",
										children: "KUMAR ELECTRICALS"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: "Wholesale Distributor & Supplier"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: "Bengaluru, Karnataka"
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[17px] font-bold text-foreground",
											children: activeInvoice.invoice
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground mt-0.5",
											children: ["Status: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `font-semibold ${activeInvoice.status === "delivered" ? "text-success" : "text-warning"}`,
												children: activeInvoice.status ? activeInvoice.status.toUpperCase() : "PROCESSING"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-muted-foreground",
											children: ["Date: ", activeInvoice.placedAt || "Today"]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border pt-4 grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Billed To"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold text-foreground mt-1",
										children: activeInvoice.dealer
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-muted-foreground",
										children: "Registered Dealer Profile"
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Source Channel"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-semibold text-primary mt-1 inline-flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " WhatsApp AI Agent"]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border border-border rounded-xl overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "bg-secondary/50 text-left font-semibold uppercase tracking-wider text-muted-foreground border-b border-border",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-2.5",
												children: "Item"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-2.5 text-center",
												children: "Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-2.5 text-right",
												children: "Price"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-2.5 text-right",
												children: "Total"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y divide-border",
										children: activeInvoice.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-secondary/20",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 font-medium",
													children: it.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 text-center",
													children: it.qty
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 text-right",
													children: fmt(it.price)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-4 py-3 text-right font-medium",
													children: fmt(it.qty * it.price)
												})
											]
										}, i))
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border pt-4 space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmt(activeInvoice.total / 1.18) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "GST (18%)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmt(activeInvoice.total - activeInvoice.total / 1.18) })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between text-base font-bold text-foreground border-t border-border pt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Amount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: fmt(activeInvoice.total) })]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6 border-t border-border flex justify-end gap-3 bg-secondary/50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => window.print(),
							className: "h-9 px-4 text-xs font-semibold rounded-xl border border-border bg-background hover:bg-secondary transition",
							children: "Print Receipt"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setActiveInvoice(null),
							className: "h-9 px-4 text-xs font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition",
							children: "Close"
						})]
					})
				]
			})
		}) }),
		isLoadingInvoice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-background border border-border px-5 py-4 rounded-xl flex items-center gap-3 shadow-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13px] font-semibold",
					children: "Generating live receipt copy..."
				})]
			})
		})
	] });
}
function Avatar({ name }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 text-primary-foreground grid place-items-center text-[12px] font-bold shrink-0",
		children: name.split(" ").map((w) => w[0]).slice(0, 2).join("")
	});
}
function StatRowDark({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-[12px] py-1 border-b border-slate-900/60",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-slate-400",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: tone === "success" ? "text-success font-semibold" : tone === "warning" ? "text-warning font-semibold" : "text-slate-300",
			children: value
		})]
	});
}
function PipelineStep({ icon, label, status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex items-center gap-2.5 py-1.5 transition-all duration-300 ${status === "pending" ? "opacity-35" : "opacity-100"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[14px]",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `flex-1 ${status === "active" ? "text-primary font-medium" : status === "done" ? "text-slate-300" : "text-slate-500"}`,
				children: label
			}),
			status === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-primary" }),
			status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] text-success font-bold bg-success/15 px-1.5 py-0.2 rounded border border-success/20",
				children: "Done"
			})
		]
	});
}
function MonitorRow({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between border-b border-slate-900 pb-1.5 pt-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-slate-500",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-mono text-[11px] ${tone === "success" ? "text-success font-bold" : tone === "warning" ? "text-warning font-bold" : tone === "info" ? "text-primary font-bold" : "text-slate-300"}`,
			children: value
		})]
	});
}
function formatMessageTime(timeStr) {
	if (!timeStr) return "";
	if (timeStr.includes("T") && timeStr.includes("Z")) try {
		return new Date(timeStr).toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit"
		});
	} catch (_) {
		return timeStr;
	}
	return timeStr;
}
function MessageBubble({ msg, onViewInvoice }) {
	const isDealer = msg.from === "dealer";
	const [showTrace, setShowTrace] = (0, import_react.useState)(false);
	if (isDealer) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 6
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .2 },
		className: "flex justify-start",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-[520px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-soft bg-background border border-border rounded-tl-sm",
				children: msg.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-1",
					children: formatMessage(msg.text)
				}) : null
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground",
				children: formatMessageTime(msg.time)
			})]
		})
	});
	const isThinking = msg.kind === "thinking";
	const hasMetadata = msg.data && msg.data.traceId;
	const intent = hasMetadata ? msg.data.intent : msg.kind === "order" ? "ORDER" : msg.kind === "invoice" ? "ORDER" : msg.kind === "ledger" ? "PAYMENT" : msg.kind === "reminder" ? "PAYMENT_PROMISE" : "BUSINESS_QUERY";
	const confidence = hasMetadata ? msg.data.confidence : .95;
	const executionTime = hasMetadata ? msg.data.executionTime : "824ms";
	const health = hasMetadata ? msg.data.health : "HEALTHY";
	const reflection = hasMetadata ? msg.data.reflection?.summary : msg.kind === "order" ? "Order draft generated with wholesale pricing" : msg.kind === "invoice" ? "Invoice generated and stock updated successfully" : msg.kind === "ledger" ? "Dues ledger and balances updated successfully" : msg.kind === "reminder" ? "Follow-up collections reminder scheduled" : "Database queries executed successfully";
	const planSteps = hasMetadata ? msg.data.plan : [
		"Validate Dealer Profile",
		"Search Product Catalog",
		"Verify Safety Stock Limits",
		"Execute Core Intent Action",
		"Return Structured Payload"
	];
	const timeline = hasMetadata ? msg.data.timeline : [
		{
			state: "VALIDATING",
			duration: "12ms"
		},
		{
			state: "PLANNING",
			duration: "45ms"
		},
		{
			state: "THINKING",
			duration: "580ms"
		},
		{
			state: "EXECUTING",
			duration: "187ms"
		}
	];
	const toolsUsed = hasMetadata ? msg.data.toolsUsed : msg.kind === "order" ? ["createOrder"] : msg.kind === "invoice" ? ["createOrder"] : msg.kind === "ledger" ? ["recordPayment"] : msg.kind === "reminder" ? ["scheduleReminder"] : [];
	const innerData = hasMetadata ? msg.data.data : msg.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			opacity: 0,
			y: 6
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: { duration: .2 },
		className: "flex justify-end",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-[560px] flex flex-col items-end",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Distributor Operations Agent" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 p-4 shadow-xl space-y-3 w-full rounded-tr-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2.5 text-[11px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-bold text-[10.5px] uppercase tracking-wider text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded",
									children: ["Intent: ", intent]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-slate-550",
									children: "•"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-slate-400",
									children: ["Confidence: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-success font-semibold",
										children: [(confidence * 100).toFixed(0), "%"]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-slate-400",
									children: ["Time: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-slate-300 font-semibold",
										children: executionTime
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-slate-500",
									children: "•"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-flex items-center gap-1 px-1.5 py-0.2 rounded font-semibold text-[10px] ${health === "HEALTHY" ? "bg-success/15 text-success border border-success/20" : "bg-warning/15 text-warning border border-warning/20"}`,
									children: health
								})
							]
						})]
					}), isThinking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5 text-[13px] text-slate-300 py-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "animate-pulse",
							children: msg.text
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						msg.text && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[13.5px] text-slate-200 leading-relaxed font-normal whitespace-pre-wrap space-y-1",
							children: formatMessage(msg.text)
						}),
						msg.kind === "order" && innerData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderCard, { data: innerData }) : null,
						msg.kind === "invoice" && innerData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceCard, {
							data: innerData,
							onViewInvoice
						}) : null,
						msg.kind === "ledger" && innerData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerCard, { data: innerData }) : null,
						msg.kind === "reminder" && innerData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderCard, { data: innerData }) : null,
						reflection && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11.5px] bg-slate-900/40 border border-slate-900/60 rounded-lg p-2.5 text-slate-400",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-success font-semibold",
									children: "✓ Reflection summary:"
								}),
								" ",
								reflection
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-slate-900 pt-2.5 flex justify-between items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowTrace(!showTrace),
								className: "text-[11px] font-semibold text-primary hover:text-primary/80 transition inline-flex items-center gap-1 cursor-pointer",
								children: showTrace ? "Hide Observability Trace ▲" : "Show Observability Trace ▼"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[9.5px] text-slate-500 font-mono font-bold tracking-wider",
								children: "LCEL CHAIN RUN"
							})]
						}),
						showTrace && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								height: 0
							},
							animate: {
								opacity: 1,
								height: "auto"
							},
							className: "space-y-3 pt-2 overflow-hidden text-[11.5px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase font-bold text-slate-500",
										children: "Execution Plan Steps"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-1",
										children: planSteps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "text-slate-300 flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-success",
													children: "✓"
												}),
												" ",
												step
											]
										}, i))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase font-bold text-slate-500",
										children: "Execution Timeline"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex flex-wrap items-center gap-1.5 text-slate-400",
										children: timeline.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [i > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-slate-600",
											children: "→"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10.5px] font-mono",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-slate-300 font-semibold",
													children: t.state
												}),
												" (",
												t.duration,
												")"
											]
										})] }, i))
									})]
								}),
								toolsUsed && toolsUsed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase font-bold text-slate-500",
										children: "Platform Tools Invoked"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "space-y-2",
										children: toolsUsed.map((tool, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1 bg-slate-950 p-2.5 rounded border border-slate-900 text-[11px] font-mono",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-primary font-semibold",
													children: [
														"🔧 ",
														tool,
														"()"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-success font-bold text-[10px]",
													children: "COMPLETED"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[9.5px] text-slate-500 flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Trace status: Success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Time: 145ms" })]
											})]
										}, i))
									})]
								})
							]
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground justify-end",
					children: [formatMessageTime(msg.time), !isThinking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3 w-3 text-primary" })]
				})
			]
		})
	});
}
function OrderCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-800/80 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 text-[11px] font-bold text-primary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }),
					" ",
					data.title || "Order Draft"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 divide-y divide-slate-800/60",
				children: data.items && data.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-1.5 flex items-center justify-between text-[12px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium truncate",
							children: it.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-slate-500 text-[10px] font-mono",
							children: it.sku
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-semibold",
							children: ["×", it.qty]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-slate-500 text-[10px]",
							children: fmt(it.qty * it.price)
						})]
					})]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[12px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-slate-400",
					children: ["Delivery • ", data.delivery || "Standard"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-bold text-success",
					children: fmt(data.total)
				})]
			})
		]
	});
}
function InvoiceCard({ data, onViewInvoice }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => onViewInvoice(data.invoice),
		className: "mt-2 text-left w-full rounded-xl bg-slate-900/90 hover:bg-slate-900 text-slate-100 border border-slate-800 hover:border-primary/40 p-3 flex items-center gap-3 transition cursor-pointer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-9 w-9 rounded-lg bg-success/10 text-success grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[12.5px] font-semibold",
					children: [data.invoice, " generated"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[11px] text-slate-400 flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Click to view receipt copy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3 text-primary animate-pulse" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[13px] font-bold text-success",
				children: fmt(data.total)
			})
		]
	});
}
function LedgerCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-800/80 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 text-[11px] font-semibold text-success",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }), " Ledger updated"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 grid grid-cols-3 gap-2 text-[12px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-slate-500 text-[10px]",
					children: "Before"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold line-through text-slate-400",
					children: fmt(data.before)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-slate-500 text-[10px]",
					children: "Paid"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-semibold text-success",
					children: ["+", fmt(data.paid)]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-slate-500 text-[10px]",
					children: "Remaining"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-bold text-slate-200",
					children: fmt(data.remaining)
				})] })
			]
		})]
	});
}
function ReminderCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-xl bg-slate-900/90 text-slate-100 border border-slate-800/80 p-3 flex items-start gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-9 w-9 rounded-lg bg-warning/15 text-warning grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12px] font-semibold text-slate-200",
					children: "Reminder scheduled"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[11px] text-slate-400 leading-normal",
					children: [
						data.when,
						" · ",
						data.note
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[9.5px] font-bold bg-warning/10 text-warning px-1.5 py-0.2 rounded border border-warning/20 self-start",
				children: "Auto"
			})
		]
	});
}
//#endregion
export { ConversationsPage as component };
