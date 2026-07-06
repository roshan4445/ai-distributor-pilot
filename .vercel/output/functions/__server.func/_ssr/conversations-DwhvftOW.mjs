import { o as __toESM } from "../_runtime.mjs";
import { _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { p as postMessage, u as getInvoiceDetailsAction } from "./db-queries-D3jRyzSM.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { A as EllipsisVertical, F as CheckCheck, L as Bell, d as Smile, g as Phone, i as Video, k as FileText, m as Search, n as X, p as Send, r as Wallet, s as TriangleAlert, u as Sparkles, v as Paperclip, w as LoaderCircle, y as Package, z as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./app-shell-CdYrK2n7.mjs";
import { r as fmt } from "./mock-data-qUJ_xzNA.mjs";
import { n as AnimatePresence } from "../_libs/framer-motion.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as Route } from "./conversations-D6mgKmmJ.mjs";
import { t as Pill } from "./badges-Cs8n-29R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/conversations-DwhvftOW.js
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
	const [isSending, setIsSending] = (0, import_react.useState)(false);
	const [simulationMode, setSimulationMode] = (0, import_react.useState)("dealer");
	const [localMessages, setLocalMessages] = (0, import_react.useState)([]);
	const [activeInvoice, setActiveInvoice] = (0, import_react.useState)(null);
	const [isLoadingInvoice, setIsLoadingInvoice] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (active) setLocalMessages(active.messages);
	}, [active?.id, active?.messages]);
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
				text: "Thinking through your ledgers…",
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
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-success" }),
											" Online • ",
											active.city
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 text-muted-foreground",
									children: [
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3 text-primary animate-pulse" }), " AI Copilot is listening — orders, payments and promises are auto-detected."]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden xl:flex w-72 shrink-0 border-l border-border bg-background flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5 border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Dealer context"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-[15px] font-semibold tracking-tight",
									children: active.dealer
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[12px] text-muted-foreground",
									children: active.city
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-5 space-y-4 text-[13px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
									label: "Trust score",
									value: String(dealer.trust),
									tone: dealer.trust >= 85 ? "success" : "warning"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
									label: "Pending",
									value: fmt(dealer.pending),
									tone: dealer.pending > 0 ? "warning" : "success"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
									label: "Lifetime",
									value: fmt(dealer.lifetime)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
									label: "Avg. payment",
									value: `${dealer.avgPaymentDays} days`
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 pb-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border p-3 bg-primary/5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1.5 text-[12px] font-semibold text-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), " AI note"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[12px] text-muted-foreground leading-relaxed",
									children: "Reliable payer. Orders spike every Monday. Consider offering a standing weekly order."
								})]
							})
						})
					]
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
										children: "Wholesale Wholesaler & Distributor"
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
function StatRow({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `font-semibold ${tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground"}`,
			children: value
		})]
	});
}
function MessageBubble({ msg, onViewInvoice }) {
	const isDealer = msg.from === "dealer";
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
		className: `flex ${isDealer ? "justify-start" : "justify-end"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `max-w-[520px] ${isDealer ? "" : "flex flex-col items-end"}`,
			children: [
				!isDealer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3 w-3" }), " AI Copilot"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-soft ${isDealer ? "bg-background border border-border rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"}`,
					children: [
						msg.kind === "thinking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2 text-[12.5px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: msg.text })]
						}) : msg.text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-1",
							children: formatMessage(msg.text)
						}) : null,
						msg.kind === "order" && msg.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderCard, { data: msg.data }) : null,
						msg.kind === "invoice" && msg.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceCard, {
							data: msg.data,
							onViewInvoice
						}) : null,
						msg.kind === "ledger" && msg.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerCard, { data: msg.data }) : null,
						msg.kind === "reminder" && msg.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReminderCard, { data: msg.data }) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `mt-1 flex items-center gap-1 text-[10.5px] text-muted-foreground ${isDealer ? "" : "justify-end"}`,
					children: [msg.time, !isDealer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3 w-3 text-primary" })]
				})
			]
		})
	});
}
function OrderCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-xl bg-background/95 text-foreground border border-border/40 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 text-[11px] font-semibold text-primary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5" }),
					" ",
					data.title
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 divide-y divide-border/70",
				children: data.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "py-1.5 flex items-center justify-between text-[12.5px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium truncate",
							children: it.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted-foreground text-[10.5px]",
							children: it.sku
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-semibold",
							children: ["×", it.qty]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-muted-foreground text-[10.5px]",
							children: fmt(it.qty * it.price)
						})]
					})]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 pt-2 border-t border-border/70 flex items-center justify-between text-[12.5px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: ["Delivery • ", data.delivery]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: fmt(data.total)
				})]
			})
		]
	});
}
function InvoiceCard({ data, onViewInvoice }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => onViewInvoice(data.invoice),
		className: "mt-2 text-left w-full rounded-xl bg-background/95 hover:bg-background/90 text-foreground border border-border/40 hover:border-primary/40 p-3 flex items-center gap-3 transition cursor-pointer",
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
					className: "text-[11px] text-muted-foreground flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Click to view receipt copy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3 text-primary animate-pulse" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[13px] font-semibold",
				children: fmt(data.total)
			})
		]
	});
}
function LedgerCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-xl bg-background/95 text-foreground border border-border/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1.5 text-[11px] font-semibold text-success",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }), " Ledger updated"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 grid grid-cols-3 gap-2 text-[12px]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-muted-foreground text-[10.5px]",
					children: "Before"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold line-through text-muted-foreground",
					children: fmt(data.before)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-muted-foreground text-[10.5px]",
					children: "Paid"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-semibold text-success",
					children: ["+", fmt(data.paid)]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-muted-foreground text-[10.5px]",
					children: "Remaining"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold",
					children: fmt(data.remaining)
				})] })
			]
		})]
	});
}
function ReminderCard({ data }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-xl bg-background/95 text-foreground border border-border/40 p-3 flex items-start gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-9 w-9 rounded-lg bg-warning/15 text-warning grid place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[12.5px] font-semibold",
					children: "Reminder scheduled"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[11px] text-muted-foreground",
					children: [
						data.when,
						" · ",
						data.note
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				tone: "warning",
				children: "Auto"
			})
		]
	});
}
//#endregion
export { ConversationsPage as component };
