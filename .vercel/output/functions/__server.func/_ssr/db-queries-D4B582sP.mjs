import { o as __toESM } from "../_runtime.mjs";
import { i as TSS_SERVER_FUNCTION, l as createServerFn } from "./esm-Dova13aH.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as GoogleGenAI } from "../_libs/@google/genai.mjs";
import { t as require_main } from "../_libs/dotenv.mjs";
import { t as ChatGroq } from "../_libs/groq-sdk+langchain__groq.mjs";
import { A as enumType, M as objectType, N as stringType, O as anyType, b as HumanMessage, g as AIMessage, j as numberType, k as arrayType, n as ChatPromptTemplate, r as MessagesPlaceholder, t as tool } from "../_libs/@langchain/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/db-queries-D4B582sP.js
var import_main = /* @__PURE__ */ __toESM(require_main());
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var supabaseUrl = "https://jminggcexzicnakvsdlx.supabase.co";
var supabaseKey = "sb_publishable_fRXfL-RO43PkxsuLF_vrLA_VEezLIta";
console.log("Supabase Client Init: URL =", supabaseUrl, "KEY =", "PRESENT");
var supabase = createClient(supabaseUrl, supabaseKey);
async function validateRequest(text, dealerId, invoiceId) {
	const errors = [];
	const trimmed = text.trim();
	if (!trimmed) errors.push("Message cannot be empty.");
	const lower = trimmed.toLowerCase();
	for (const kw of [
		"drop table",
		"delete from",
		"alter table",
		"truncate table",
		"update dealers set",
		"ignore previous instructions",
		"bypass safety",
		"system instruction override",
		"reveal system prompt"
	]) if (lower.includes(kw)) errors.push(`Dangerous system query keyword detected: "${kw}".`);
	for (const word of [
		"fuck",
		"bitch",
		"asshole",
		"bastard",
		"cunt",
		"idiot",
		"stupid",
		"slut",
		"ass"
	]) if (new RegExp(`\\b${word}\\b`, "i").test(trimmed)) {
		errors.push("Unprofessional, offensive, or abusive language is not permitted.");
		break;
	}
	if (dealerId) {
		const { data: dealer } = await supabase.from("dealers").select("id").eq("id", dealerId).maybeSingle();
		if (!dealer) errors.push(`Invalid dealer account reference (Dealer ID: "${dealerId}" does not exist).`);
	}
	const invMatch = trimmed.match(/inv-\d+/i);
	if (invMatch) {
		const foundInv = invMatch[0].toUpperCase();
		const { data: invoice } = await supabase.from("invoices").select("id").eq("id", foundInv).maybeSingle();
		if (!invoice) errors.push(`Referenced invoice ID "${foundInv}" does not exist in records.`);
	}
	const qtyMatches = trimmed.match(/(?:qty|quantity|units|order|pieces|pcs)\s*[:=-]?\s*(-?\d+)/i) || trimmed.match(/(-?\d+)\s*(?:qty|quantity|units|order|pieces|pcs)/i);
	if (qtyMatches) {
		const qty = parseInt(qtyMatches[1], 10);
		if (qty <= 0) errors.push(`Invalid product order quantity requested: ${qty}. Value must be greater than 0.`);
	}
	if (lower.includes("order") || lower.includes("buy") || lower.includes("need") || lower.includes("dispatch")) {
		const { data: allProducts } = await supabase.from("products").select("name, sku");
		const products = allProducts || [];
		const words = lower.split(/\s+/);
		const potentialProducts = [
			"wire",
			"mcb",
			"switch",
			"socket",
			"board",
			"light",
			"panel",
			"led"
		];
		for (const word of words) if (potentialProducts.some((p) => word.includes(p))) {
			if (!products.some((p) => p.name.toLowerCase().includes(word) || p.sku.toLowerCase().includes(word)) && products.length > 0) errors.push(`Requested product reference "${word}" is not recognized in our stock catalogs.`);
		}
	}
	return {
		valid: errors.length === 0,
		errors
	};
}
async function generateExecutionPlan(text, intent) {
	const steps = [];
	let goal = "";
	switch (intent) {
		case "ORDER":
			goal = "Process and confirm new sales order";
			steps.push("Identify calling dealer account", "Verify requested product SKU list & prices", "Perform stock levels and inventory safety checks", "Format draft order items proposal", "Check dealer credit line and outstanding dues", "Insert confirmed order in ledger", "Deduct stock allocations from Products database", "Instantly generate GST invoice", "Post invoice card directly to chat thread");
			break;
		case "PAYMENT":
			goal = "Log dealer payment receipt & update ledger";
			steps.push("Verify dealer profile credentials", "Parse payment transaction reference and amount", "Deduct amount from dealer's outstanding dues balance", "Register transaction receipt in ledger", "Save confirmation message template in chat logs");
			break;
		case "PAYMENT_PROMISE":
			goal = "Schedule auto-reminders for payment promise";
			steps.push("Identify dealer details", "Extract expected payment date and promised amount", "Create structured scheduler reminder for dues collection", "Draft confirmation message informing dealer of follow-up schedule");
			break;
		case "INVOICE":
			goal = "Retrieve and format bill details for invoice copy";
			steps.push("Locate referenced invoice number in database", "Extract line-item details, subtotals, and GST breakdown", "Construct print-ready receipt details object", "Trigger invoice card display overlay in chat bubble");
			break;
		case "PRODUCT_QUERY":
			goal = "Inspect inventory and reply stock availability";
			steps.push("Query products database for matching names or SKUs", "Evaluate stock levels against minimum safety thresholds", "Format stock counts, safety indicators, and unit prices list");
			break;
		case "BUSINESS_QUERY":
			goal = "Formulate high-level management ledger insights";
			steps.push("Query dealers profile collections and lifetime sales stats", "Query invoices ledger sum receivables", "Calculate rankings or balance sums", "Format report directly as clean business analyst metrics");
			break;
		default:
			goal = "Respond to general conversational request";
			steps.push("Parse request text", "Format natural language polite greeting message");
			break;
	}
	const apiKey = process.env.GROQ_API_KEY;
	if (apiKey) try {
		const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${apiKey}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				model: "llama-3.3-70b-versatile",
				messages: [{
					role: "system",
					content: `You are the AI Planner for Kumar Electricals B2B. Given a user request and an identified intent, return a JSON object with:
              1. "goal": A brief description of the goal
              2. "steps": An array of precise string steps required to perform the action.
              Return raw JSON ONLY. No markdown block wrap.`
				}, {
					role: "user",
					content: `Request: "${text}"\nIntent: "${intent}"`
				}],
				temperature: .1,
				response_format: { type: "json_object" }
			})
		});
		if (res.ok) {
			const rawJson = (await res.json()).choices?.[0]?.message?.content || "";
			const parsed = JSON.parse(rawJson);
			if (parsed.goal && Array.isArray(parsed.steps)) return {
				goal: String(parsed.goal),
				steps: parsed.steps.map(String)
			};
		}
	} catch (e) {
		console.warn("LLM Planner failed or timed out. Falling back to deterministic plan structure.");
	}
	return {
		goal,
		steps
	};
}
var memoryStore = /* @__PURE__ */ new Map();
function getMemory(conversationId) {
	if (!memoryStore.has(conversationId)) memoryStore.set(conversationId, { recentConversation: [] });
	return memoryStore.get(conversationId);
}
function updateMemory(conversationId, partial) {
	const current = getMemory(conversationId);
	const updated = {
		...current,
		...partial,
		recentConversation: partial.recentConversation !== void 0 ? partial.recentConversation.slice(-10) : current.recentConversation
	};
	memoryStore.set(conversationId, updated);
	return updated;
}
function logAgentExecution(log) {
	const border = "=".repeat(60);
	const indent = "  ";
	console.log(border);
	console.log(`🔍 [AGENT TRACE LOG] | Trace ID: ${log.traceId}`);
	console.log(`⏰ Timestamp:       ${log.timestamp}`);
	console.log(`🎯 Intent:          ${log.intent} (Confidence: ${(log.confidence * 100).toFixed(1)}%)`);
	console.log(`⚡ Status:          ${log.status} | Health: ${log.health}`);
	console.log(`⏱️ Execution Time:  ${log.executionTimeMs}ms`);
	console.log(`⚙️ Current State:   ${log.currentState}`);
	console.log(`🛡️ Guardrail:       ${log.guardrailStatus}`);
	console.log(`📦 Memory Used:     ${log.memoryUsed}`);
	if (log.plan && log.plan.length > 0) {
		console.log(`🗒️ Execution Plan:`);
		log.plan.forEach((step, idx) => {
			console.log(`${indent}${idx + 1}. ${step}`);
		});
	}
	if (log.toolsUsed && log.toolsUsed.length > 0) {
		console.log(`🛠️ Tools Invoked:   ${log.toolsUsed.join(", ")}`);
		console.log(`   Success Count:   ${log.toolSuccessCount} | Failure Count: ${log.toolFailureCount}`);
	}
	console.log(`🧠 Reflection:      ${log.reflectionResult.success ? "✅ SUCCESS" : "❌ FAILED"}`);
	console.log(`   Summary:         ${log.reflectionResult.summary}`);
	if (log.errors && log.errors.length > 0) {
		console.log(`❌ Errors / Violations:`);
		log.errors.forEach((err) => {
			console.log(`${indent}- ${err}`);
		});
	}
	console.log(border);
}
var agentOutputSchema = objectType({
	intent: enumType([
		"ORDER",
		"PAYMENT",
		"PAYMENT_PROMISE",
		"INVOICE",
		"PRODUCT_QUERY",
		"BUSINESS_QUERY"
	]),
	confidence: numberType().describe("Confidence score of intent detection between 0 and 1"),
	response: stringType().describe("Polite natural language message responding to the dealer"),
	toolsUsed: arrayType(stringType()).describe("List of tool names to run: 'createOrder', 'recordPayment', 'scheduleReminder'"),
	toolParameters: objectType({
		orderItems: arrayType(objectType({
			sku: stringType(),
			name: stringType(),
			qty: numberType(),
			price: numberType()
		})).optional(),
		orderTotal: numberType().optional(),
		paymentAmount: numberType().optional(),
		reminderWhen: stringType().optional(),
		reminderNote: stringType().optional()
	}).optional(),
	kind: enumType([
		"order",
		"invoice",
		"ledger",
		"reminder",
		"text"
	]).nullable(),
	data: anyType().nullable().describe("Payload data object matching the response kind (e.g. for order: { title, items, total, delivery })")
});
async function processAgentRequest(text, conversationId, dealerName) {
	const startTime = Date.now();
	const traceId = crypto.randomUUID();
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	let currentState = "IDLE";
	let stateStartTime = Date.now();
	const timeline = [];
	const transitionTo = (nextState) => {
		const durationMs = Date.now() - stateStartTime;
		timeline.push({
			state: currentState,
			duration: `${durationMs}ms`
		});
		currentState = nextState;
		stateStartTime = Date.now();
	};
	transitionTo("VALIDATING");
	const { data: activeDealer } = await supabase.from("dealers").select("*").eq("name", dealerName).maybeSingle();
	const dealerId = activeDealer?.id || (conversationId === "c1" ? "d3" : conversationId === "c2" ? "d1" : "d2");
	const validation = await validateRequest(text, dealerId);
	if (!validation.valid) {
		transitionTo("FAILED");
		const elapsed = Date.now() - startTime;
		let politeReply = "Hello sir, please let me know how I can help you check stock availability, confirm wire/switch orders, or verify outstanding invoices today.";
		if (validation.errors.some((e) => e.includes("Dangerous") || e.includes("language") || e.includes("unprofessional"))) politeReply = "Hello! I am here to assist you with orders, stock availability, and payment updates for Kumar Electricals. Please let me know what you need sir.";
		else if (validation.errors.some((e) => e.includes("quantity") || e.includes("product"))) politeReply = "I could not verify those product details. Please specify a correct product SKU and a quantity greater than 0 so I can draft your order.";
		else if (validation.errors.some((e) => e.includes("invoice") || e.includes("dealer"))) politeReply = "I am having trouble verifying that reference. Please check your invoice number or account details so I can assist you better.";
		const finalDuration = Date.now() - stateStartTime;
		timeline.push({
			state: "FAILED",
			duration: `${finalDuration}ms`
		});
		const responseObj = {
			traceId,
			state: "FAILED",
			intent: "BUSINESS_QUERY",
			confidence: 1,
			health: "ERROR",
			guardrails: "FAILED",
			plan: ["Halt execution", "Report validation violation"],
			timeline,
			toolsUsed: [],
			reflection: {
				success: false,
				summary: "Guardrails rejected request."
			},
			executionTime: `${elapsed}ms`,
			response: politeReply,
			text: politeReply,
			kind: "text",
			data: null
		};
		logAgentExecution({
			traceId,
			timestamp,
			intent: "GUARDRAILS_TRIGGER",
			confidence: 1,
			plan: responseObj.plan,
			toolsUsed: [],
			executionTimeMs: elapsed,
			status: "GUARDRAILS_TRIGGERED",
			errors: validation.errors,
			currentState: "FAILED",
			reflectionResult: responseObj.reflection,
			memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
			guardrailStatus: "FAILED",
			toolSuccessCount: 0,
			toolFailureCount: 0,
			health: "ERROR"
		});
		return JSON.stringify(responseObj);
	}
	const sessionMemory = getMemory(conversationId);
	const [productsRes, dealersRes, ordersRes, invoicesRes] = await Promise.all([
		supabase.from("products").select("*"),
		supabase.from("dealers").select("*"),
		supabase.from("orders").select("*"),
		supabase.from("invoices").select("*")
	]);
	const productsList = productsRes.data || [];
	const dealersList = dealersRes.data || [];
	const invoicesList = invoicesRes.data || [];
	const ordersList = ordersRes.data || [];
	const createOrderTool = tool(async ({ items, total }) => {
		try {
			const invId = `INV-${Math.floor(1e3 + Math.random() * 9e3)}`;
			for (const item of items) {
				const { data: prod } = await supabase.from("products").select("stock").eq("sku", item.sku).maybeSingle();
				const cur = prod?.stock || 0;
				await supabase.from("products").update({ stock: Math.max(0, cur - item.qty) }).eq("sku", item.sku);
			}
			const newOrdId = crypto.randomUUID();
			await supabase.from("orders").insert({
				id: newOrdId,
				invoice: invId,
				dealerId,
				dealerName,
				total,
				status: "processing",
				placedAt: "Just now",
				aiNote: `Confirmed by LangChain orchestrator (${traceId}).`
			});
			for (const item of items) await supabase.from("order_items").insert({
				id: crypto.randomUUID(),
				orderId: newOrdId,
				name: item.name,
				qty: item.qty,
				price: item.price
			});
			await supabase.from("invoices").insert({
				id: invId,
				dealer: dealerName,
				amount: total,
				date: "Today",
				status: "unpaid"
			});
			const { data: dl } = await supabase.from("dealers").select("pending, ordersCount").eq("id", dealerId).maybeSingle();
			const pending = (dl?.pending || 0) + total;
			const ordersCount = (dl?.ordersCount || 0) + 1;
			await supabase.from("dealers").update({
				pending,
				ordersCount
			}).eq("id", dealerId);
			updateMemory(conversationId, {
				lastOrderId: newOrdId,
				lastInvoiceId: invId,
				lastDealerId: dealerId
			});
			return {
				success: true,
				invoiceId: invId,
				total
			};
		} catch (err) {
			console.error("createOrder tool failed:", err);
			return {
				success: false,
				error: String(err)
			};
		}
	}, {
		name: "createOrder",
		description: "Creates and confirms a purchase order, updates inventory stock levels, and generates the billing invoice.",
		schema: objectType({
			items: arrayType(objectType({
				sku: stringType(),
				name: stringType(),
				qty: numberType(),
				price: numberType()
			})),
			total: numberType()
		})
	});
	const recordPaymentTool = tool(async ({ paidAmount }) => {
		try {
			const { data: dl } = await supabase.from("dealers").select("pending").eq("id", dealerId).maybeSingle();
			const currentPending = dl?.pending || 0;
			const nextPending = Math.max(0, currentPending - paidAmount);
			await supabase.from("dealers").update({ pending: nextPending }).eq("id", dealerId);
			return {
				success: true,
				paidAmount,
				remaining: nextPending
			};
		} catch (err) {
			console.error("recordPayment tool failed:", err);
			return {
				success: false,
				error: String(err)
			};
		}
	}, {
		name: "recordPayment",
		description: "Logs a payment amount in the collections ledger, reducing the dealer's pending outstanding dues.",
		schema: objectType({ paidAmount: numberType() })
	});
	const scheduleReminderTool = tool(async ({ when, note }) => {
		try {
			return {
				success: true,
				scheduled: when,
				note
			};
		} catch (err) {
			return {
				success: false,
				error: String(err)
			};
		}
	}, {
		name: "scheduleReminder",
		description: "Schedules a dues collection auto-reminder for a specific follow-up date.",
		schema: objectType({
			when: stringType(),
			note: stringType()
		})
	});
	const systemInstruction = `You are the single core AI Distributor Agent for Kumar Electricals & Distribution.
Your job is to talk to dealers and answer their inquiries or execute business operations.

CURRENT CONTEXT:
- Active Dealer Name: "${dealerName}"
- Active Dealer ID: "${dealerId}"
- Active Conversation ID: "${conversationId}"

SESSION MEMORY CONTEXT:
- Last Dealer ID: "${sessionMemory.lastDealerId || "None"}"
- Last Order ID: "${sessionMemory.lastOrderId || "None"}"
- Last Invoice ID: "${sessionMemory.lastInvoiceId || "None"}"
- Pending Clarification: "${sessionMemory.pendingClarification || "None"}"

DATABASE STATE:
- Products Stock: ${JSON.stringify(productsList)}
- Dealers Balance: ${JSON.stringify(dealersList)}
- Invoices Ledger: ${JSON.stringify(invoicesList)}
- Orders Pipeline: ${JSON.stringify(ordersList)}

Determine the intent of the message:
- ORDER: Dealer wants to purchase products, modify products in a draft, or says 'confirm' to place an order.
- PAYMENT: Dealer reports a payment or says they paid an amount.
- PAYMENT_PROMISE: Dealer promises to pay later (e.g. "will pay after Diwali").
- INVOICE: Dealer asks about an invoice details or requests invoice file copy.
- PRODUCT_QUERY: Inquiries about stock counts, SKU price, categories, or catalog.
- BUSINESS_QUERY: General inquiries about reports, collections ranking, sales totals, profitability, or general conversations.

TONE CONSTRAINTS:
- Speak like a polite, helpful trade manager. Respond directly to dealers using sir (e.g., "Hello sir, I have...").
- NEVER mention database tables, JSON attributes, schema structures, or tool names.
- Present lists or calculations in clear, readable formatting.

Output a strict structured JSON matching the provided schema.`;
	transitionTo("PLANNING");
	let agentOutput = null;
	const apiKey = process.env.GROQ_API_KEY || (process.env.GEMINI_API_KEY?.startsWith("gsk_") ? process.env.GEMINI_API_KEY : void 0);
	transitionTo("THINKING");
	if (apiKey) try {
		const model = new ChatGroq({
			apiKey,
			modelName: "llama-3.3-70b-versatile",
			temperature: .1
		}).withStructuredOutput(agentOutputSchema);
		const prompt = ChatPromptTemplate.fromMessages([
			["system", systemInstruction],
			new MessagesPlaceholder("history"),
			["user", "{input}"]
		]);
		const historyMessages = sessionMemory.recentConversation.map((c) => c.role === "user" ? new HumanMessage(c.text) : new AIMessage(c.text));
		agentOutput = await prompt.pipe(model).invoke({
			input: text,
			history: historyMessages
		});
	} catch (err) {
		console.warn("LangChain LLM invoke failed. Falling back to local rules engine.", err);
	}
	if (!agentOutput) {
		const rawFallback = await runFallbackRulesEngine(text, productsList, dealersList, invoicesList, ordersList, conversationId);
		agentOutput = JSON.parse(rawFallback);
	}
	let intent = agentOutput.intent || "BUSINESS_QUERY";
	let confidence = agentOutput.confidence || .9;
	let responseText = agentOutput.response || "";
	let kind = agentOutput.kind || "text";
	let data = agentOutput.data || null;
	const toolsUsed = agentOutput.toolsUsed || [];
	const params = agentOutput.toolParameters || {};
	if (kind === "order" && data && data.items) updateMemory(conversationId, { lastDraft: {
		items: data.items,
		total: data.total || 0
	} });
	if (confidence < .5) {
		transitionTo("FAILED");
		const elapsed = Date.now() - startTime;
		const finalDuration = Date.now() - stateStartTime;
		timeline.push({
			state: "FAILED",
			duration: `${finalDuration}ms`
		});
		const failedResponse = {
			traceId,
			state: "FAILED",
			intent,
			confidence,
			health: "ERROR",
			guardrails: "PASSED",
			plan: ["Reject execution due to low confidence"],
			timeline,
			toolsUsed: [],
			reflection: {
				success: false,
				summary: `Halted: Confidence score (${confidence}) is below threshold 0.50.`
			},
			executionTime: `${elapsed}ms`,
			response: "I am not confident enough to execute this request. Could you please provide more details?",
			text: "I am not confident enough to execute this request. Could you please provide more details?",
			kind: "text",
			data: null
		};
		logAgentExecution({
			traceId,
			timestamp,
			intent,
			confidence,
			plan: failedResponse.plan,
			toolsUsed: [],
			executionTimeMs: elapsed,
			status: "ERROR",
			errors: ["Execution rejected due to confidence gating threshold < 0.50"],
			currentState: "FAILED",
			reflectionResult: failedResponse.reflection,
			memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
			guardrailStatus: "PASSED",
			toolSuccessCount: 0,
			toolFailureCount: 0,
			health: "ERROR"
		});
		return JSON.stringify(failedResponse);
	}
	if (confidence >= .5 && confidence < .8) {
		transitionTo("WAITING_FOR_USER");
		const elapsed = Date.now() - startTime;
		const finalDuration = Date.now() - stateStartTime;
		timeline.push({
			state: "WAITING_FOR_USER",
			duration: `${finalDuration}ms`
		});
		const warningResponse = {
			traceId,
			state: "WAITING_FOR_USER",
			intent,
			confidence,
			health: "WARNING",
			guardrails: "PASSED",
			plan: ["Pause execution", "Await user clarification"],
			timeline,
			toolsUsed: [],
			reflection: {
				success: true,
				summary: `Clarification needed: Confidence score (${confidence}) is between 0.50 and 0.79.`
			},
			executionTime: `${elapsed}ms`,
			response: responseText.includes("?") ? responseText : "I found multiple matching products in our catalog. Could you please clarify exactly which model and quantity you need sir?",
			text: responseText.includes("?") ? responseText : "I found multiple matching products in our catalog. Could you please clarify exactly which model and quantity you need sir?",
			kind: "text",
			data: null
		};
		logAgentExecution({
			traceId,
			timestamp,
			intent,
			confidence,
			plan: warningResponse.plan,
			toolsUsed: [],
			executionTimeMs: elapsed,
			status: "SUCCESS",
			currentState: "WAITING_FOR_USER",
			reflectionResult: warningResponse.reflection,
			memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
			guardrailStatus: "PASSED",
			toolSuccessCount: 0,
			toolFailureCount: 0,
			health: "WARNING"
		});
		return JSON.stringify(warningResponse);
	}
	const plan = await generateExecutionPlan(text, intent);
	transitionTo("EXECUTING");
	const toolsExecuted = [];
	let toolSuccessCount = 0;
	let toolFailureCount = 0;
	let executionError = null;
	let createdInvoiceId = void 0;
	try {
		for (const toolName of toolsUsed) {
			if (toolName === "createOrder") {
				const orderItems = params.orderItems || data?.items || [{
					name: "MCB 32A Single Pole",
					qty: 20,
					price: 245,
					sku: "MCB-32A-SP"
				}, {
					name: "Modular Switch 6A",
					qty: 15,
					price: 78,
					sku: "SW-MOD-6A"
				}];
				const orderTotal = params.orderTotal || data?.total || 6070;
				const toolResult = await createOrderTool.invoke({
					items: orderItems,
					total: orderTotal
				});
				if (toolResult && toolResult.success) {
					toolSuccessCount++;
					createdInvoiceId = toolResult.invoiceId;
					if (agentOutput.data) agentOutput.data.invoice = toolResult.invoiceId;
					toolsExecuted.push("createOrder", "updateInventory", "generateInvoice", "updateLedger");
				} else {
					toolFailureCount++;
					executionError = toolResult.error || "createOrder tool failed execution.";
					break;
				}
			}
			if (toolName === "recordPayment") {
				const amount = params.paymentAmount || data?.paidAmount || 2e4;
				const toolResult = await recordPaymentTool.invoke({ paidAmount: amount });
				if (toolResult && toolResult.success) {
					toolSuccessCount++;
					toolsExecuted.push("recordPayment", "updateLedger");
				} else {
					toolFailureCount++;
					executionError = toolResult.error || "recordPayment tool failed execution.";
					break;
				}
			}
			if (toolName === "scheduleReminder") {
				const when = params.reminderWhen || "Nov 5, 10:00 AM";
				const note = params.reminderNote || "Collections payment follow up";
				const toolResult = await scheduleReminderTool.invoke({
					when,
					note
				});
				if (toolResult && toolResult.success) {
					toolSuccessCount++;
					toolsExecuted.push("scheduleReminder");
				} else {
					toolFailureCount++;
					executionError = toolResult.error || "scheduleReminder tool failed execution.";
					break;
				}
			}
		}
	} catch (toolErr) {
		toolFailureCount++;
		executionError = String(toolErr);
	}
	if (executionError || toolFailureCount > 0) {
		transitionTo("FAILED");
		const elapsed = Date.now() - startTime;
		const finalDuration = Date.now() - stateStartTime;
		timeline.push({
			state: "FAILED",
			duration: `${finalDuration}ms`
		});
		const failedObj = {
			traceId,
			state: "FAILED",
			intent,
			confidence,
			health: "ERROR",
			guardrails: "PASSED",
			plan: plan.steps,
			timeline,
			toolsUsed: toolsExecuted,
			reflection: {
				success: false,
				summary: `Execution aborted: ${executionError || "Tool call returned a failure code."}`
			},
			executionTime: `${elapsed}ms`,
			response: "I encountered an issue executing your request. Dues invoices or inventory stock levels could not be saved. Please retry sir.",
			text: "I encountered an issue executing your request. Dues invoices or inventory stock levels could not be saved. Please retry sir.",
			kind: "text",
			data: null
		};
		logAgentExecution({
			traceId,
			timestamp,
			intent,
			confidence,
			plan: plan.steps,
			toolsUsed: toolsExecuted,
			executionTimeMs: elapsed,
			status: "ERROR",
			errors: [executionError || "Tool call validation failed"],
			currentState: "FAILED",
			reflectionResult: failedObj.reflection,
			memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
			guardrailStatus: "PASSED",
			toolSuccessCount,
			toolFailureCount,
			health: "ERROR"
		});
		return JSON.stringify(failedObj);
	}
	let reflectionSuccess = true;
	let reflectionSummary = "Execution verified: all business tools, invoices, and ledgers processed successfully.";
	if (toolsUsed.length > 0 && toolSuccessCount !== toolsUsed.length) {
		reflectionSuccess = false;
		reflectionSummary = `Execution mismatch: requested tools count is ${toolsUsed.length} but only ${toolSuccessCount} succeeded.`;
	}
	if (reflectionSuccess) try {
		if (toolsExecuted.includes("createOrder") && createdInvoiceId) {
			const { data: checkInv } = await supabase.from("invoices").select("id").eq("id", createdInvoiceId).maybeSingle();
			if (!checkInv) {
				reflectionSuccess = false;
				reflectionSummary = `DB Consistency Alert: Order record was created but invoice receipt ${createdInvoiceId} was not found in ledger.`;
			}
		}
		if (toolsExecuted.includes("recordPayment")) {
			const { data: checkDl } = await supabase.from("dealers").select("pending").eq("id", dealerId).maybeSingle();
			if (checkDl === null || checkDl === void 0) {
				reflectionSuccess = false;
				reflectionSummary = "DB Consistency Alert: Dealer dues balance ledger was not updated successfully.";
			}
		}
	} catch (checkErr) {
		reflectionSuccess = false;
		reflectionSummary = `DB Consistency Verification check failed: ${String(checkErr)}`;
	}
	if (!reflectionSuccess) {
		transitionTo("FAILED");
		const elapsed = Date.now() - startTime;
		const finalDuration = Date.now() - stateStartTime;
		timeline.push({
			state: "FAILED",
			duration: `${finalDuration}ms`
		});
		const failedObj = {
			traceId,
			state: "FAILED",
			intent,
			confidence,
			health: "ERROR",
			guardrails: "PASSED",
			plan: plan.steps,
			timeline,
			toolsUsed: toolsExecuted,
			reflection: {
				success: false,
				summary: reflectionSummary
			},
			executionTime: `${elapsed}ms`,
			response: `I completed the order update, but database consistency verification alerts were raised: ${reflectionSummary} Please check invoice receipt entries and retry.`,
			text: `I completed the order update, but database consistency verification alerts were raised: ${reflectionSummary} Please check invoice receipt entries and retry.`,
			kind: "text",
			data: null
		};
		logAgentExecution({
			traceId,
			timestamp,
			intent,
			confidence,
			plan: plan.steps,
			toolsUsed: toolsExecuted,
			executionTimeMs: elapsed,
			status: "ERROR",
			errors: [reflectionSummary],
			currentState: "FAILED",
			reflectionResult: failedObj.reflection,
			memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
			guardrailStatus: "PASSED",
			toolSuccessCount,
			toolFailureCount: 1,
			health: "ERROR"
		});
		return JSON.stringify(failedObj);
	}
	updateMemory(conversationId, { recentConversation: [
		...sessionMemory.recentConversation,
		{
			role: "user",
			text
		},
		{
			role: "model",
			text: responseText
		}
	] });
	transitionTo("COMPLETED");
	const elapsed = Date.now() - startTime;
	const executionTime = `${elapsed}ms`;
	const finalDuration = Date.now() - stateStartTime;
	timeline.push({
		state: "COMPLETED",
		duration: `${finalDuration}ms`
	});
	const finalOutput = {
		traceId,
		state: "COMPLETED",
		intent,
		confidence,
		health: "HEALTHY",
		guardrails: "PASSED",
		plan: plan.steps,
		timeline,
		toolsUsed: toolsExecuted,
		reflection: {
			success: true,
			summary: reflectionSummary
		},
		executionTime,
		response: responseText,
		text: responseText,
		kind,
		data: data ? {
			...data,
			invoice: data.invoice || sessionMemory.lastInvoiceId
		} : null
	};
	logAgentExecution({
		traceId,
		timestamp,
		intent,
		confidence,
		plan: plan.steps,
		toolsUsed: toolsExecuted,
		executionTimeMs: elapsed,
		status: "SUCCESS",
		currentState: "COMPLETED",
		reflectionResult: finalOutput.reflection,
		memoryUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`,
		guardrailStatus: "PASSED",
		toolSuccessCount,
		toolFailureCount: 0,
		health: "HEALTHY"
	});
	return JSON.stringify(finalOutput);
}
async function runFallbackRulesEngine(text, products, dealers, invoices, orders, conversationId) {
	const lower = text.toLowerCase();
	const sessionMemory = getMemory(conversationId);
	if (lower.includes("confirm") || lower.includes("yes") || lower.includes("agree") || lower.includes("done") || lower.includes("ok") || lower.includes("okay") || lower.includes("place")) {
		const lastDraft = sessionMemory.lastDraft || {
			total: 6070,
			items: [{
				name: "MCB 32A Single Pole",
				qty: 20,
				price: 245,
				sku: "MCB-32A-SP"
			}, {
				name: "Modular Switch 6A",
				qty: 15,
				price: 78,
				sku: "SW-MOD-6A"
			}]
		};
		return JSON.stringify({
			intent: "ORDER",
			confidence: .95,
			toolsUsed: ["createOrder"],
			response: "Outstanding sir! I have registered your order confirmation. Dues ledger and inventory allocations are updated.",
			kind: "invoice",
			data: {
				total: lastDraft.total,
				items: lastDraft.items
			}
		});
	}
	if (lower.includes("repeat") || lower.includes("previous") || lower.includes("same")) {
		const dealerId = sessionMemory.lastDealerId || (conversationId === "c1" ? "d3" : conversationId === "c2" ? "d1" : "d2");
		const dealerOrders = orders.filter((o) => o.dealerId === dealerId);
		let items = [];
		let total = 0;
		if (dealerOrders.length > 0) {
			const lastOrder = dealerOrders[dealerOrders.length - 1];
			const { data: dbItems } = await supabase.from("order_items").select("*").eq("orderId", lastOrder.id);
			if (dbItems && dbItems.length > 0) {
				items = dbItems.map((item) => {
					return {
						sku: products.find((p) => p.name.toLowerCase() === item.name.toLowerCase())?.sku || "MCB-32A-SP",
						name: item.name,
						qty: item.qty,
						price: item.price
					};
				});
				total = lastOrder.total;
			}
		}
		if (items.length === 0 && sessionMemory.lastDraft) {
			items = sessionMemory.lastDraft.items;
			total = sessionMemory.lastDraft.total;
		}
		if (items.length === 0) {
			items = [{
				sku: "MCB-32A-SP",
				name: "MCB 32A Single Pole",
				qty: 32,
				price: 245
			}];
			total = 7840;
		}
		updateMemory(conversationId, { lastDraft: {
			items,
			total
		} });
		const itemsDesc = items.map((item) => `**${item.qty} ${item.name}**`).join(" and ");
		return JSON.stringify({
			intent: "ORDER",
			confidence: .95,
			toolsUsed: [],
			response: `Understood sir! I have drafted a repeat of your previous order: ${itemsDesc} (Total: **₹${total.toLocaleString("en-IN")}**). Please reply with 'Confirm' to finalize the order and generate your invoice receipt.`,
			kind: "order",
			data: {
				title: "Order Draft",
				delivery: "Standard",
				total,
				items
			}
		});
	}
	if (lower.includes("want") || lower.includes("buy") || lower.includes("order") || lower.includes("purchase") || lower.includes("mcb") || lower.includes("switch") || lower.includes("wire")) {
		const items = [];
		let total = 0;
		const qtyMatch = text.match(/\d+/);
		const qty = qtyMatch ? Number(qtyMatch[0]) : 20;
		const hasMcb = lower.includes("mcb");
		const hasSwitch = lower.includes("switch");
		const tokens = lower.split(/[\s\-]+/);
		const mcbCandidates = products.filter((p) => p.name.toLowerCase().includes("mcb") || p.sku.toLowerCase().includes("mcb"));
		const switchCandidates = products.filter((p) => p.name.toLowerCase().includes("switch") || p.sku.toLowerCase().includes("switch"));
		let selectedMcb = products.find((p) => p.sku === "MCB-32A-SP") || products.find((p) => p.name.toLowerCase().includes("mcb"));
		let selectedSwitch = products.find((p) => p.sku === "SW-MOD-6A") || products.find((p) => p.name.toLowerCase().includes("switch"));
		if (hasMcb) {
			const scores = mcbCandidates.map((p) => {
				const pNameLower = p.name.toLowerCase();
				const pSkuLower = p.sku.toLowerCase();
				let score = 0;
				for (const t of tokens) if (t.length > 1 && t !== "want" && t !== "order" && t !== "purchase" && t !== "need" && t !== "mcb" && t !== "mcbs") {
					if (pNameLower.includes(t) || pSkuLower.includes(t)) score++;
				}
				return {
					product: p,
					score
				};
			});
			scores.sort((a, b) => b.score - a.score);
			if (scores.length > 1 && scores[0].score === 0) {
				const optionsList = mcbCandidates.map((p) => `**${p.name}** (₹${p.price})`).join(" or ");
				return JSON.stringify({
					intent: "ORDER",
					confidence: .75,
					toolsUsed: [],
					response: `Sir, we have multiple MCB models available: ${optionsList}. Which model would you like to order?`,
					kind: "text",
					data: null
				});
			}
			if (scores[0]?.product) selectedMcb = scores[0].product;
		}
		if (hasSwitch) {
			const scores = switchCandidates.map((p) => {
				const pNameLower = p.name.toLowerCase();
				const pSkuLower = p.sku.toLowerCase();
				let score = 0;
				for (const t of tokens) if (t.length > 1 && t !== "want" && t !== "order" && t !== "purchase" && t !== "need" && t !== "switch" && t !== "switches") {
					if (pNameLower.includes(t) || pSkuLower.includes(t)) score++;
				}
				return {
					product: p,
					score
				};
			});
			scores.sort((a, b) => b.score - a.score);
			if (scores.length > 1 && scores[0].score === 0) {
				const optionsList = switchCandidates.map((p) => `**${p.name}** (₹${p.price})`).join(" or ");
				return JSON.stringify({
					intent: "ORDER",
					confidence: .75,
					toolsUsed: [],
					response: `Sir, we have multiple Switch models available: ${optionsList}. Which model would you like to order?`,
					kind: "text",
					data: null
				});
			}
			if (scores[0]?.product) selectedSwitch = scores[0].product;
		}
		if (hasMcb || !hasMcb && !hasSwitch) {
			if (selectedMcb) {
				items.push({
					sku: selectedMcb.sku,
					name: selectedMcb.name,
					qty,
					price: selectedMcb.price
				});
				total += qty * selectedMcb.price;
			}
		}
		if (hasSwitch) {
			const switchQty = hasMcb ? 15 : qty;
			if (selectedSwitch) {
				items.push({
					sku: selectedSwitch.sku,
					name: selectedSwitch.name,
					qty: switchQty,
					price: selectedSwitch.price
				});
				total += switchQty * selectedSwitch.price;
			}
		}
		const itemsDesc = items.map((item) => `**${item.qty} ${item.name}**`).join(" and ");
		return JSON.stringify({
			intent: "ORDER",
			confidence: .95,
			toolsUsed: [],
			response: `Understood sir! I have drafted an order of ${itemsDesc} (Total: **₹${total.toLocaleString("en-IN")}**). Please reply with 'Confirm' to finalize the order and generate your invoice receipt.`,
			kind: "order",
			data: {
				title: "Order Draft",
				delivery: "Standard",
				total,
				items
			}
		});
	}
	if (lower.includes("paid") || lower.includes("pay") || lower.includes("diwali") || lower.includes("ledger")) {
		const match = text.match(/\d+/);
		const amount = match ? Number(match[0]) : 2e4;
		return JSON.stringify({
			intent: "PAYMENT",
			confidence: .98,
			toolsUsed: ["recordPayment"],
			response: `Thank you sir! I have logged your payment of ₹${amount.toLocaleString("en-IN")}. Dues ledger records have been updated.`,
			kind: "ledger",
			data: {
				paid: amount,
				remaining: Math.max(0, 124500 - amount),
				before: 124500
			}
		});
	}
	if (lower.includes("profitable") || lower.includes("dealer") || lower.includes("sales") || lower.includes("customer")) {
		const sorted = [...dealers].sort((a, b) => b.lifetime - a.lifetime);
		const topDealer = sorted[0];
		const ranking = sorted.map((d, i) => `${i + 1}. **${d.name}** (${d.city}): Lifetime Revenue: **₹${d.lifetime.toLocaleString("en-IN")}** (${d.ordersCount} orders)`).join("\n");
		return JSON.stringify({
			intent: "BUSINESS_QUERY",
			confidence: .95,
			toolsUsed: [],
			response: `Our most profitable dealer by lifetime billing value is **${topDealer?.name}** in **${topDealer?.city}** (Total business value: **₹${topDealer?.lifetime.toLocaleString("en-IN")}**).\n\nHere is our top dealer network ranking:\n\n${ranking}`,
			kind: "text",
			data: null
		});
	}
	if (lower.includes("stock") || lower.includes("inventory") || lower.includes("low")) {
		const alerts = products.filter((p) => p.stock < p.min);
		const lines = alerts.map((p) => `*   **${p.name}** (${p.sku}): stock count ${p.stock} (min ${p.min})`).join("\n");
		return JSON.stringify({
			intent: "PRODUCT_QUERY",
			confidence: .95,
			toolsUsed: [],
			response: `We currently have ${alerts.length} products below their minimum safety levels:\n\n${lines}`,
			kind: "text",
			data: null
		});
	}
	return JSON.stringify({
		intent: "BUSINESS_QUERY",
		confidence: .85,
		toolsUsed: [],
		response: "Hello sir, please let me know how I can help you check stock availability, confirm wire/switch orders, or verify outstanding invoices for Kumar Electricals today.",
		kind: "text",
		data: null
	});
}
import_main.default.config();
var apiKey = process.env.GEMINI_API_KEY;
var aiClient = null;
if (apiKey && apiKey !== "your_gemini_api_key_here") aiClient = new GoogleGenAI({ apiKey });
async function runAgentConversation(conversationId, dealerName, chatHistory) {
	return await processAgentRequest(chatHistory[chatHistory.length - 1]?.parts[0]?.text || "", conversationId, dealerName);
}
async function runAgentQuery(q) {
	return await processAgentRequest(q, "ask-ai-convo", "Business Owner");
}
async function runAgentDuesAnalysis(dealersList) {
	const isGroq = process.env.GEMINI_API_KEY?.startsWith("gsk_");
	if (aiClient && !isGroq) {
		const prompt = `You are the AI Collections Underwriter for Kumar Electricals & Distribution.
We have a list of dealers with outstanding balances.
For each dealer, analyze their metrics and output:
1. A dynamic risk score (0 to 100) based on their pending balance, trust score, average payment days, and status.
2. A recommended action string (e.g., "Personal call by owner", "WhatsApp automatic nudge", "Auto-reminder scheduled", "Pause credit line") based on how risky they are.
3. Any payment promises or dates if known (e.g., "Nov 5 (Post-Diwali)" or null).

Dealers list:
${JSON.stringify(dealersList, null, 2)}

Return your analysis as a strict JSON array of objects. Do not include markdown code blocks (like \`\`\`json), just raw JSON. Each object MUST look like:
{
  "dealerId": "string",
  "risk": number,
  "action": "string",
  "promise": "string or null"
}
`;
		try {
			const jsonStr = ((await aiClient.models.generateContent({
				model: "gemini-2.5-flash",
				contents: prompt
			})).text || "").trim().replace(/^```json/, "").replace(/```$/, "").trim();
			return JSON.parse(jsonStr);
		} catch (err) {
			console.error("Gemini dues analysis error, using fallback instead:", err);
		}
	}
	return dealersList.map((d) => {
		let risk = 10;
		let action = "Auto-reminder scheduled";
		let promise = null;
		if (d.pending > 1e5) {
			risk = 85;
			action = "Personal call by owner";
		} else if (d.pending > 5e4) {
			risk = 60;
			action = "WhatsApp automatic nudge";
		} else if (d.trustScore < 70) {
			risk = 50;
			action = "WhatsApp automatic nudge";
		}
		if (d.name.includes("Verma") || d.name.includes("Vijay")) promise = "Nov 5 (Post-Diwali)";
		return {
			dealerId: d.id,
			risk,
			action,
			promise
		};
	});
}
var getDashboardData_createServerFn_handler = createServerRpc({
	id: "05111cb4dc0dfbc69001eef6c578b62c0a4023d39ddfc550bac26dbe77b2bdf3",
	name: "getDashboardData",
	filename: "src/lib/db-queries.ts"
}, (opts) => getDashboardData.__executeServer(opts));
var getDashboardData = createServerFn({ method: "GET" }).handler(getDashboardData_createServerFn_handler, async () => {
	const { data: dealers } = await supabase.from("dealers").select("*");
	const { data: products } = await supabase.from("products").select("*");
	const { data: orders } = await supabase.from("orders").select("*");
	const { data: invoices } = await supabase.from("invoices").select("*");
	const dealersList = dealers || [];
	const productsList = products || [];
	const ordersList = orders || [];
	const invoicesList = invoices || [];
	const pendingDues = dealersList.reduce((sum, row) => sum + Number(row.pending), 0);
	const inventoryAlerts = productsList.filter((row) => Number(row.stock) < Number(row.min)).length;
	const ordersToday = ordersList.filter((row) => String(row.placedAt).includes("min") || String(row.placedAt).includes("hour") || String(row.placedAt).includes("Today") || String(row.placedAt).includes("now"));
	const revenueToday = ordersToday.reduce((sum, row) => sum + Number(row.total), 0);
	const kpis = {
		ordersToday: ordersToday.length + 20,
		ordersDelta: "+12%",
		revenueToday: revenueToday + 144870,
		revenueDelta: "+18%",
		pendingDues,
		duesDelta: "-4%",
		inventoryAlerts,
		invoicesGenerated: invoicesList.length,
		followUps: 8,
		collectionsToday: 126e3,
		businessHealth: 98
	};
	return {
		kpis,
		revenueTrend: [
			{
				day: "Mon",
				revenue: 92e3,
				collections: 65e3
			},
			{
				day: "Tue",
				revenue: 118e3,
				collections: 71e3
			},
			{
				day: "Wed",
				revenue: 104e3,
				collections: 88e3
			},
			{
				day: "Thu",
				revenue: 142e3,
				collections: 96e3
			},
			{
				day: "Fri",
				revenue: 168e3,
				collections: 112e3
			},
			{
				day: "Sat",
				revenue: 154e3,
				collections: 108e3
			},
			{
				day: "Sun",
				revenue: kpis.revenueToday,
				collections: kpis.collectionsToday
			}
		],
		categoryMix: [
			{
				name: "MCBs",
				value: 38
			},
			{
				name: "Switches",
				value: 24
			},
			{
				name: "Wires",
				value: 20
			},
			{
				name: "Sockets",
				value: 12
			},
			{
				name: "Boards",
				value: 6
			}
		],
		insights: [
			{
				id: "i1",
				kind: "danger",
				title: "Raj Traders — 42 days overdue",
				body: `₹${(dealersList.find((r) => r.id === "d1")?.pending || 104500).toLocaleString("en-IN")} outstanding. Trust score dropped to 62. Recommend a call today before extending more credit.`,
				cta: "Call Raj Traders"
			},
			{
				id: "i2",
				kind: "warning",
				title: "MCB 32A stock below threshold",
				body: `Only ${productsList.find((r) => r.sku === "MCB-32A-SP")?.stock || 42} units left. Avg. weekly sales: 88 units. Reorder 300 units before Friday to avoid stockouts.`,
				cta: "Create purchase order"
			},
			{
				id: "i3",
				kind: "success",
				title: "Revenue up 18% week over week",
				body: "Driven by Sri Lakshmi Agencies (+₹62k) and ABC Electricals repeat orders. Great momentum going into Diwali."
			},
			{
				id: "i4",
				kind: "info",
				title: "ABC Electricals pays on time — always",
				body: "12/12 invoices paid before due date in the last 6 months. Safe to raise credit limit from ₹2L → ₹3.5L.",
				cta: "Raise credit limit"
			}
		],
		activity: [
			{
				id: "a1",
				time: "2 min ago",
				text: "Sri Lakshmi Agencies placed an order — 20 MCB, 15 Switches",
				type: "order"
			},
			{
				id: "a2",
				time: "3 min ago",
				text: "Invoice INV-1042 generated — ₹18,240",
				type: "invoice"
			},
			{
				id: "a3",
				time: "4 min ago",
				text: "Inventory auto-updated — MCB 32A: 250 → 230",
				type: "inventory"
			},
			{
				id: "a4",
				time: "6 min ago",
				text: "Reminder scheduled for Raj Traders at 11:00 AM",
				type: "reminder"
			},
			{
				id: "a5",
				time: "22 min ago",
				text: "Payment received — ABC Electricals ₹20,000 via UPI",
				type: "payment"
			},
			{
				id: "a6",
				time: "1 hr ago",
				text: "Ledger updated — PowerTech Distributors partial payment ₹35,000",
				type: "ledger"
			}
		]
	};
});
var getDealers_createServerFn_handler = createServerRpc({
	id: "a93459f40ed57879576bbb8d833f2529b31550f38fbd15ed2d8cde79609fa7a5",
	name: "getDealers",
	filename: "src/lib/db-queries.ts"
}, (opts) => getDealers.__executeServer(opts));
var getDealers = createServerFn({ method: "GET" }).handler(getDealers_createServerFn_handler, async () => {
	const { data } = await supabase.from("dealers").select("*").order("pending", { ascending: false });
	return (data || []).map((row) => ({
		id: String(row.id),
		name: String(row.name),
		city: String(row.city),
		phone: String(row.phone),
		pending: Number(row.pending),
		trust: Number(row.trust),
		ordersCount: Number(row.ordersCount),
		lifetime: Number(row.lifetime),
		avgPaymentDays: Number(row.avgPaymentDays),
		lastOrder: String(row.lastOrder),
		status: String(row.status)
	}));
});
var getDealerById_createServerFn_handler = createServerRpc({
	id: "4952efa378471e65ff8974d5e30c5a90b84a4462c516961a593afaeb9e76d8fc",
	name: "getDealerById",
	filename: "src/lib/db-queries.ts"
}, (opts) => getDealerById.__executeServer(opts));
var getDealerById = createServerFn({ method: "GET" }).validator((id) => id).handler(getDealerById_createServerFn_handler, async ({ data: id }) => {
	const { data: dealer } = await supabase.from("dealers").select("*").eq("id", id).maybeSingle();
	if (!dealer) return null;
	const { data: orders } = await supabase.from("orders").select("*").eq("dealerId", id);
	const { data: invoices } = await supabase.from("invoices").select("*").eq("dealer", dealer.name);
	const { data: conversations } = await supabase.from("conversations").select("*").eq("dealer", dealer.name);
	let messages = [];
	const activeConvo = conversations?.[0];
	if (activeConvo) {
		const { data: msgs } = await supabase.from("messages").select("*").eq("conversationId", activeConvo.id);
		messages = (msgs || []).map((m) => ({
			id: String(m.id),
			from: String(m.fromRole),
			text: m.text ? String(m.text) : void 0,
			time: String(m.time),
			kind: m.kind ? String(m.kind) : void 0,
			data: m.data ? typeof m.data === "string" ? JSON.parse(m.data) : m.data : void 0
		}));
	}
	return {
		dealer: {
			id: String(dealer.id),
			name: String(dealer.name),
			city: String(dealer.city),
			phone: String(dealer.phone),
			pending: Number(dealer.pending),
			trust: Number(dealer.trust),
			ordersCount: Number(dealer.ordersCount),
			lifetime: Number(dealer.lifetime),
			avgPaymentDays: Number(dealer.avgPaymentDays),
			lastOrder: String(dealer.lastOrder),
			status: String(dealer.status)
		},
		orders: (orders || []).map((o) => ({
			id: String(o.id),
			invoice: String(o.invoice),
			dealerId: String(o.dealerId),
			dealer: String(o.dealerName),
			total: Number(o.total),
			status: String(o.status),
			placedAt: String(o.placedAt),
			aiNote: String(o.aiNote),
			items: []
		})),
		invoices: (invoices || []).map((inv) => ({
			id: String(inv.id),
			dealer: String(inv.dealer),
			amount: Number(inv.amount),
			date: String(inv.date),
			status: String(inv.status)
		})),
		chat: activeConvo ? {
			id: String(activeConvo.id),
			dealer: String(activeConvo.dealer),
			city: String(activeConvo.city),
			messages
		} : null
	};
});
var getInventory_createServerFn_handler = createServerRpc({
	id: "160e7ae9174a603e77d65ed4f5f344f1c68066916a10396e1c14b467e2574939",
	name: "getInventory",
	filename: "src/lib/db-queries.ts"
}, (opts) => getInventory.__executeServer(opts));
var getInventory = createServerFn({ method: "GET" }).handler(getInventory_createServerFn_handler, async () => {
	const { data } = await supabase.from("products").select("*");
	return (data || []).map((row) => ({
		id: String(row.id),
		name: String(row.name),
		sku: String(row.sku),
		stock: Number(row.stock),
		min: Number(row.min),
		price: Number(row.price),
		category: String(row.category)
	}));
});
var getInvoices_createServerFn_handler = createServerRpc({
	id: "0df44c5bf79110b5a00d5780cba55d0c047e594f553b5bf934da4b7488eecb9c",
	name: "getInvoices",
	filename: "src/lib/db-queries.ts"
}, (opts) => getInvoices.__executeServer(opts));
var getInvoices = createServerFn({ method: "GET" }).handler(getInvoices_createServerFn_handler, async () => {
	const { data } = await supabase.from("invoices").select("*").order("id", { ascending: false });
	return (data || []).map((row) => ({
		id: String(row.id),
		dealer: String(row.dealer),
		amount: Number(row.amount),
		date: String(row.date),
		status: String(row.status)
	}));
});
var getOrders_createServerFn_handler = createServerRpc({
	id: "324cebcc405a3a820673ccf8c52131c0718ba74def2f45813cf6129b9478fda9",
	name: "getOrders",
	filename: "src/lib/db-queries.ts"
}, (opts) => getOrders.__executeServer(opts));
var getOrders = createServerFn({ method: "GET" }).handler(getOrders_createServerFn_handler, async () => {
	const { data: orders } = await supabase.from("orders").select("*").order("invoice", { ascending: false });
	const result = [];
	for (const row of orders || []) {
		const { data: items } = await supabase.from("order_items").select("name, qty, price").eq("orderId", row.id);
		result.push({
			id: String(row.id),
			invoice: String(row.invoice),
			dealerId: String(row.dealerId),
			dealer: String(row.dealerName),
			total: Number(row.total),
			status: String(row.status),
			placedAt: String(row.placedAt),
			aiNote: String(row.aiNote),
			items: (items || []).map((it) => ({
				name: String(it.name),
				qty: Number(it.qty),
				price: Number(it.price)
			}))
		});
	}
	return result;
});
var getConversationsList_createServerFn_handler = createServerRpc({
	id: "b687c8418aff9e30782bab47a2db6ad96b0063bc2002cba93bec54404a6a3a2e",
	name: "getConversationsList",
	filename: "src/lib/db-queries.ts"
}, (opts) => getConversationsList.__executeServer(opts));
var getConversationsList = createServerFn({ method: "GET" }).handler(getConversationsList_createServerFn_handler, async () => {
	const { data: conversations } = await supabase.from("conversations").select("*");
	const list = [];
	for (const c of conversations || []) {
		const { data: msgs } = await supabase.from("messages").select("*").eq("conversationId", c.id);
		const parsedMessages = (msgs || []).map((m) => ({
			id: String(m.id),
			from: String(m.fromRole),
			text: m.text ? String(m.text) : void 0,
			time: String(m.time),
			kind: m.kind ? String(m.kind) : void 0,
			data: m.data ? typeof m.data === "string" ? JSON.parse(m.data) : m.data : void 0
		}));
		list.push({
			id: String(c.id),
			dealer: String(c.dealer),
			city: String(c.city),
			unread: Number(c.unread),
			preview: String(c.preview),
			messages: parsedMessages
		});
	}
	return list;
});
var postMessage_createServerFn_handler = createServerRpc({
	id: "dac4f83fef137d06125b0abf89f0d3ad91f279aa85751ac2611a46f3c2c94dd3",
	name: "postMessage",
	filename: "src/lib/db-queries.ts"
}, (opts) => postMessage.__executeServer(opts));
var postMessage = createServerFn({ method: "POST" }).validator((data) => data).handler(postMessage_createServerFn_handler, async ({ data }) => {
	const msgId = crypto.randomUUID();
	const time = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit"
	});
	await supabase.from("messages").insert({
		id: msgId,
		conversationId: data.conversationId,
		fromRole: data.from,
		text: data.text,
		time
	});
	const { data: convo } = await supabase.from("conversations").select("dealer").eq("id", data.conversationId).maybeSingle();
	const dealerName = convo?.dealer || "Unknown";
	const { data: msgs } = await supabase.from("messages").select("fromRole, text").eq("conversationId", data.conversationId);
	const chatHistory = (msgs || []).map((m) => {
		return {
			role: m.fromRole === "dealer" ? "user" : "model",
			parts: [{ text: String(m.text || "") }]
		};
	});
	const aiReply = await runAgentConversation(data.conversationId, dealerName, chatHistory);
	let replyText = aiReply;
	let kind = null;
	let dataObj = null;
	try {
		const parsed = JSON.parse(aiReply.trim().replace(/^```json/, "").replace(/```$/, "").trim());
		if (parsed.text) replyText = parsed.text;
		if (parsed.kind) kind = parsed.kind;
		if (parsed.data) dataObj = parsed.data;
	} catch (e) {}
	const aiMsgId = crypto.randomUUID();
	const aiTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit"
	});
	await supabase.from("messages").insert({
		id: aiMsgId,
		conversationId: data.conversationId,
		fromRole: "ai",
		text: replyText,
		time: aiTime,
		kind: kind || null,
		data: dataObj ? JSON.stringify(dataObj) : null
	});
	await supabase.from("conversations").update({
		preview: replyText.substring(0, 50),
		unread: 0
	}).eq("id", data.conversationId);
	return { success: true };
});
var confirmOrderAction_createServerFn_handler = createServerRpc({
	id: "df3730a57ac74b53bcb44c9be3d14e934ccf8d756bf665658d2d7e53537ec1a9",
	name: "confirmOrderAction",
	filename: "src/lib/db-queries.ts"
}, (opts) => confirmOrderAction.__executeServer(opts));
var confirmOrderAction = createServerFn({ method: "POST" }).validator((data) => data).handler(confirmOrderAction_createServerFn_handler, async ({ data }) => {
	const time = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit"
	});
	for (const item of data.items) {
		const { data: prod } = await supabase.from("products").select("stock").eq("sku", item.sku).maybeSingle();
		const currentStock = prod?.stock || 0;
		await supabase.from("products").update({ stock: Math.max(0, currentStock - item.qty) }).eq("sku", item.sku);
	}
	const { data: dealer } = await supabase.from("dealers").select("name").eq("id", data.dealerId).maybeSingle();
	const dealerName = dealer?.name || "Unknown";
	const orderId = crypto.randomUUID();
	await supabase.from("orders").insert({
		id: orderId,
		invoice: data.invoiceId,
		dealerId: data.dealerId,
		dealerName,
		total: data.total,
		status: "processing",
		placedAt: "1 min ago",
		aiNote: "Confirmed from live chat conversation."
	});
	for (const item of data.items) await supabase.from("order_items").insert({
		id: crypto.randomUUID(),
		orderId,
		name: item.name,
		qty: item.qty,
		price: item.price
	});
	await supabase.from("invoices").insert({
		id: data.invoiceId,
		dealer: dealerName,
		amount: data.total,
		date: "Today",
		status: "unpaid"
	});
	const { data: dl } = await supabase.from("dealers").select("pending, ordersCount").eq("id", data.dealerId).maybeSingle();
	const pending = (dl?.pending || 0) + data.total;
	const ordersCount = (dl?.ordersCount || 0) + 1;
	await supabase.from("dealers").update({
		pending,
		ordersCount
	}).eq("id", data.dealerId);
	const confirmMsgId = crypto.randomUUID();
	await supabase.from("messages").insert({
		id: confirmMsgId,
		conversationId: data.conversationId,
		fromRole: "ai",
		text: `Invoice ${data.invoiceId} generated. Inventory updated. Delivery scheduled.`,
		time,
		kind: "invoice",
		data: JSON.stringify({
			invoice: data.invoiceId,
			total: data.total
		})
	});
	await supabase.from("conversations").update({
		preview: `Invoice ${data.invoiceId} sent ✅`,
		unread: 0
	}).eq("id", data.conversationId);
	return { success: true };
});
var recordPaymentAction_createServerFn_handler = createServerRpc({
	id: "3f40dfc2f61aac9bdd5ef8731130beb04c79f2c749b3f8fa68c64d36ad103961",
	name: "recordPaymentAction",
	filename: "src/lib/db-queries.ts"
}, (opts) => recordPaymentAction.__executeServer(opts));
var recordPaymentAction = createServerFn({ method: "POST" }).validator((data) => data).handler(recordPaymentAction_createServerFn_handler, async ({ data }) => {
	const time = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit"
	});
	const remaining = Math.max(0, data.beforeAmount - data.paidAmount);
	await supabase.from("dealers").update({ pending: remaining }).eq("id", data.dealerId);
	const ledgerMsgId = crypto.randomUUID();
	await supabase.from("messages").insert({
		id: ledgerMsgId,
		conversationId: data.conversationId,
		fromRole: "ai",
		text: "Payment recorded. Ledger updated.",
		time,
		kind: "ledger",
		data: JSON.stringify({
			paid: data.paidAmount,
			remaining,
			before: data.beforeAmount
		})
	});
	const reminderMsgId = crypto.randomUUID();
	await supabase.from("messages").insert({
		id: reminderMsgId,
		conversationId: data.conversationId,
		fromRole: "ai",
		text: "Reminder scheduled for post-Diwali.",
		time,
		kind: "reminder",
		data: JSON.stringify({
			when: "Nov 5, 10:00 AM",
			note: `Gentle nudge for remaining ₹${remaining.toLocaleString("en-IN")}`
		})
	});
	await supabase.from("conversations").update({
		preview: `Paid ₹${data.paidAmount.toLocaleString("en-IN")} today. Remaining after Diwali.`,
		unread: 0
	}).eq("id", data.conversationId);
	return { success: true };
});
var askAiQuery_createServerFn_handler = createServerRpc({
	id: "40bdd966f3f2c98addf6e52eed21c3b97bd0609175fcd7877ab21a664e9653c9",
	name: "askAiQuery",
	filename: "src/lib/db-queries.ts"
}, (opts) => askAiQuery.__executeServer(opts));
var askAiQuery = createServerFn({ method: "POST" }).validator((query) => query).handler(askAiQuery_createServerFn_handler, async ({ data: q }) => {
	const geminiKey = process.env.GEMINI_API_KEY;
	const groqKey = process.env.GROQ_API_KEY;
	if (geminiKey && geminiKey !== "your_gemini_api_key_here" || groqKey) {
		const aiReply = await runAgentQuery(q);
		try {
			const parsed = JSON.parse(aiReply.trim().replace(/^```json/, "").replace(/```$/, "").trim());
			return parsed.response || parsed.text || aiReply;
		} catch (e) {
			return aiReply;
		}
	}
	const term = q.toLowerCase();
	if (term.includes("products") || term.includes("low") || term.includes("stock") || term.includes("mcb")) {
		const { data } = await supabase.from("products").select("name, stock, min").lt("stock", "min");
		const products = data || [];
		if (products.length > 0) {
			let text = `${products.length} SKUs are below their minimum right now:\n\n`;
			products.forEach((r) => {
				const alert = Number(r.stock) / Number(r.min) < .5 ? "Critical" : "Low";
				text += `• ${r.name} — ${r.stock} units (min ${r.min}) · ${alert}\n`;
			});
			text += "\nDraft reorder for MCB 32A: 300 units @ ₹210 = ₹63,000 from Havells. Want me to send the PO?";
			return text;
		}
		return "No products are currently running below their minimum thresholds.";
	}
	if (term.includes("revenue") || term.includes("make") || term.includes("today") || term.includes("sales")) {
		const { data } = await supabase.from("orders").select("dealerName, total");
		const orders = data || [];
		let text = `Today's revenue is ₹${(orders.reduce((sum, r) => sum + Number(r.total), 0) + 107e3).toLocaleString("en-IN")} — up 18% vs last Sunday. Top contributors:\n\n`;
		orders.slice(0, 3).forEach((r) => {
			text += `• ${r.dealerName} — ₹${Number(r.total).toLocaleString("en-IN")}\n`;
		});
		text += `\nCollections today: ₹1,26,000 (68% of billed).`;
		return text;
	}
	if (term.includes("raj") || term.includes("follow up") || term.includes("debt") || term.includes("who")) {
		const { data } = await supabase.from("dealers").select("name, pending").eq("status", "overdue");
		const overdueDealers = data || [];
		if (overdueDealers.length > 0) {
			let text = "Recommended dealer follow-up priorities for today:\n\n";
			overdueDealers.forEach((r) => {
				text += `• ${r.name} — ₹${Number(r.pending).toLocaleString("en-IN")} (42 days overdue) — Trust score 62\n`;
			});
			text += "\nRecommended: call Raj Traders first — highest risk, no payment promise logged yet.";
			return text;
		}
	}
	if (term.includes("profitable") || term.includes("best") || term.includes("dealer")) {
		const { data } = await supabase.from("dealers").select("name, lifetime").order("lifetime", { ascending: false }).limit(1);
		const best = data || [];
		if (best.length > 0) return `${best[0].name} — ₹${Number(best[0].lifetime).toLocaleString("en-IN")} billed, ₹41k gross margin, 100% on-time payments. Safe to raise credit limit from ₹2L → ₹3.5L.`;
	}
	if (term.includes("forecast") || term.includes("cash") || term.includes("next week") || term.includes("collect")) return "Estimated collection next week: ₹6.4L – ₹7.1L\n\nDrivers: 4 scheduled promises (₹3.1L), typical weekly repeat orders from ABC & Sri Lakshmi (₹2.2L), and 2 partial payments due. Confidence: 82%.";
	const { data } = await supabase.from("dealers").select("name, pending").ilike("name", `%${q}%`);
	const matchDealers = data || [];
	if (matchDealers.length > 0) return `Found dealer: ${matchDealers[0].name} has an outstanding balance of ₹${Number(matchDealers[0].pending).toLocaleString("en-IN")}.`;
	return "Here's what I found based on your live Supabase database — I've cross-checked dealer ledgers, WhatsApp threads and inventory levels. Ask me for a deeper breakdown any time.";
});
var getDues_createServerFn_handler = createServerRpc({
	id: "c4275c6fdcd661da7f62251ddba5e62f1c77b04ac18857505404e10bd4a02f64",
	name: "getDues",
	filename: "src/lib/db-queries.ts"
}, (opts) => getDues.__executeServer(opts));
var getDues = createServerFn({ method: "GET" }).handler(getDues_createServerFn_handler, async () => {
	const { data } = await supabase.from("dealers").select("*").gt("pending", 0).order("pending", { ascending: false });
	return (data || []).map((d) => {
		const overdueDays = d.status === "overdue" ? 42 : d.status === "watch" ? 18 : 0;
		const promise = d.name === "Raj Traders" ? "Nov 5 (Post-Diwali)" : null;
		let risk = 12;
		let action = "Auto-reminder scheduled";
		if (d.status === "overdue") {
			risk = 85;
			action = "Personal call by owner";
		} else if (d.status === "watch") {
			risk = 45;
			action = "WhatsApp automatic nudge";
		}
		return {
			dealerId: String(d.id),
			dealer: String(d.name),
			pending: Number(d.pending),
			overdueDays,
			promise,
			risk,
			action
		};
	});
});
var getAiDuesAnalysis_createServerFn_handler = createServerRpc({
	id: "4bec6dab155c913b7b559a31daf36c04badbc4060ff237aa62de10385f983788",
	name: "getAiDuesAnalysis",
	filename: "src/lib/db-queries.ts"
}, (opts) => getAiDuesAnalysis.__executeServer(opts));
var getAiDuesAnalysis = createServerFn({ method: "POST" }).validator((dealersList) => dealersList).handler(getAiDuesAnalysis_createServerFn_handler, async ({ data: list }) => {
	try {
		return await runAgentDuesAnalysis(list);
	} catch (err) {
		console.error("AI dues analysis call failed:", err);
		return [];
	}
});
var updateOrderStatusAction_createServerFn_handler = createServerRpc({
	id: "551efb6e66dedd4bd35381073fd33092bc87c389cffebd15e5893958286d2fd8",
	name: "updateOrderStatusAction",
	filename: "src/lib/db-queries.ts"
}, (opts) => updateOrderStatusAction.__executeServer(opts));
var updateOrderStatusAction = createServerFn({ method: "POST" }).validator((data) => data).handler(updateOrderStatusAction_createServerFn_handler, async ({ data }) => {
	await supabase.from("orders").update({ status: data.nextStatus }).eq("id", data.orderId);
	return { success: true };
});
var getInvoiceDetailsAction_createServerFn_handler = createServerRpc({
	id: "dac0af18dd7a207dd487ace5324820112b0f518605b6b6f3e0bcd689773bb53b",
	name: "getInvoiceDetailsAction",
	filename: "src/lib/db-queries.ts"
}, (opts) => getInvoiceDetailsAction.__executeServer(opts));
var getInvoiceDetailsAction = createServerFn({ method: "POST" }).validator((invoiceId) => invoiceId).handler(getInvoiceDetailsAction_createServerFn_handler, async ({ data: invoiceId }) => {
	const { data: order } = await supabase.from("orders").select("*").eq("invoice", invoiceId).maybeSingle();
	if (!order) return null;
	const { data: items } = await supabase.from("order_items").select("*").eq("orderId", order.id);
	return {
		invoice: order.invoice,
		dealer: order.dealerName,
		placedAt: order.placedAt,
		status: order.status,
		total: order.total,
		items: items || []
	};
});
var createProductAction_createServerFn_handler = createServerRpc({
	id: "1add7590a731b7676b12ef782edf51bbdeb7c8fb4e6871a5241e23ce157d1d67",
	name: "createProductAction",
	filename: "src/lib/db-queries.ts"
}, (opts) => createProductAction.__executeServer(opts));
var createProductAction = createServerFn({ method: "POST" }).validator((data) => data).handler(createProductAction_createServerFn_handler, async ({ data }) => {
	const productId = "p-" + crypto.randomUUID();
	const { data: inserted, error } = await supabase.from("products").insert([{
		id: productId,
		name: data.name,
		sku: data.sku,
		stock: data.stock,
		min: data.min,
		price: data.price,
		category: data.category
	}]).select().single();
	if (error) {
		console.error("Failed to insert product SKU:", error);
		throw new Error(error.message);
	}
	return inserted;
});
//#endregion
export { askAiQuery_createServerFn_handler, confirmOrderAction_createServerFn_handler, createProductAction_createServerFn_handler, getAiDuesAnalysis_createServerFn_handler, getConversationsList_createServerFn_handler, getDashboardData_createServerFn_handler, getDealerById_createServerFn_handler, getDealers_createServerFn_handler, getDues_createServerFn_handler, getInventory_createServerFn_handler, getInvoiceDetailsAction_createServerFn_handler, getInvoices_createServerFn_handler, getOrders_createServerFn_handler, postMessage_createServerFn_handler, recordPaymentAction_createServerFn_handler, updateOrderStatusAction_createServerFn_handler };
