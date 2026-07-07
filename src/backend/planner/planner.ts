export interface ExecutionPlan {
  goal: string;
  steps: string[];
}

export async function generateExecutionPlan(
  text: string,
  intent: string
): Promise<ExecutionPlan> {
  const steps: string[] = [];
  let goal = "";

  // Determinisic fallback plans depending on target intent
  switch (intent) {
    case "ORDER":
      goal = "Process and confirm new sales order";
      steps.push(
        "Identify calling dealer account",
        "Verify requested product SKU list & prices",
        "Perform stock levels and inventory safety checks",
        "Format draft order items proposal",
        "Check dealer credit line and outstanding dues",
        "Insert confirmed order in ledger",
        "Deduct stock allocations from Products database",
        "Instantly generate GST invoice",
        "Post invoice card directly to chat thread"
      );
      break;

    case "PAYMENT":
      goal = "Log dealer payment receipt & update ledger";
      steps.push(
        "Verify dealer profile credentials",
        "Parse payment transaction reference and amount",
        "Deduct amount from dealer's outstanding dues balance",
        "Register transaction receipt in ledger",
        "Save confirmation message template in chat logs"
      );
      break;

    case "PAYMENT_PROMISE":
      goal = "Schedule auto-reminders for payment promise";
      steps.push(
        "Identify dealer details",
        "Extract expected payment date and promised amount",
        "Create structured scheduler reminder for dues collection",
        "Draft confirmation message informing dealer of follow-up schedule"
      );
      break;

    case "INVOICE":
      goal = "Retrieve and format bill details for invoice copy";
      steps.push(
        "Locate referenced invoice number in database",
        "Extract line-item details, subtotals, and GST breakdown",
        "Construct print-ready receipt details object",
        "Trigger invoice card display overlay in chat bubble"
      );
      break;

    case "PRODUCT_QUERY":
      goal = "Inspect inventory and reply stock availability";
      steps.push(
        "Query products database for matching names or SKUs",
        "Evaluate stock levels against minimum safety thresholds",
        "Format stock counts, safety indicators, and unit prices list"
      );
      break;

    case "BUSINESS_QUERY":
      goal = "Formulate high-level management ledger insights";
      steps.push(
        "Query dealers profile collections and lifetime sales stats",
        "Query invoices ledger sum receivables",
        "Calculate rankings or balance sums",
        "Format report directly as clean business analyst metrics"
      );
      break;

    default:
      goal = "Respond to general conversational request";
      steps.push("Parse request text", "Format natural language polite greeting message");
      break;
  }

  // If GROQ_API_KEY is configured, we can optimize the steps using the LLM for custom inputs
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ [Planner] GROQ_API_KEY is missing from environment variables! Using deterministic fallback plans.");
  }
  if (apiKey) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are the AI Planner for Kumar Electricals B2B. Given a user request and an identified intent, return a JSON object with:
              1. "goal": A brief description of the goal
              2. "steps": An array of precise string steps required to perform the action.
              Return raw JSON ONLY. No markdown block wrap.`
            },
            {
              role: "user",
              content: `Request: "${text}"\nIntent: "${intent}"`
            }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (res.ok) {
        const body = await res.json();
        const rawJson = body.choices?.[0]?.message?.content || "";
        const parsed = JSON.parse(rawJson);
        if (parsed.goal && Array.isArray(parsed.steps)) {
          return {
            goal: String(parsed.goal),
            steps: parsed.steps.map(String)
          };
        }
      }
    } catch (e) {
      console.warn("LLM Planner failed or timed out. Falling back to deterministic plan structure.");
    }
  }

  return { goal, steps };
}
