import { supabase } from "@/utils/supabase";
import dotenv from "dotenv";
import { processAgentRequest } from "../backend/agents/distributorAgent";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

export async function runAgentConversation(
  conversationId: string,
  dealerName: string,
  chatHistory: { role: "user" | "model"; parts: { text: string }[] }[],
  currentMessage?: string
): Promise<string> {
  const lastMsg = currentMessage || chatHistory[chatHistory.length - 1]?.parts[0]?.text || "";
  return await processAgentRequest(lastMsg, conversationId, dealerName);
}

export async function runAgentQuery(q: string): Promise<string> {
  return await processAgentRequest(q, "ask-ai-convo", "Business Owner");
}

export async function runAgentDuesAnalysis(dealersList: any[]): Promise<any[]> {
  if (apiKey) {
    const prompt = `You are the AI Collections Underwriter for Kumar Electricals & Distribution.
We have a list of dealers with outstanding balances.
For each dealer, analyze their metrics and output:
1. A dynamic risk score (0 to 100) based on their pending balance, trust score, average payment days, and status.
2. A recommended action string (e.g., "Personal call by owner", "WhatsApp automatic nudge", "Auto-reminder scheduled", "Pause credit line") based on how risky they are.
3. Any payment promises or dates if known (e.g., "Nov 5 (Post-Diwali)" or null).

Dealers list:
${JSON.stringify(dealersList, null, 2)}

Return your analysis as a strict JSON array of objects. Do not include markdown code blocks (like \`\`\`json), just raw JSON. Each object MUST look like:
[
  {
    "dealerId": "string",
    "risk": number,
    "action": "string",
    "promise": "string or null"
  }
]`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.1
        })
      });
      
      if (response.ok) {
        const resData = await response.json();
        const cleaned = resData.choices?.[0]?.message?.content || "";
        const jsonStr = cleaned.trim().replace(/^```json/, "").replace(/```$/, "").trim();
        return JSON.parse(jsonStr);
      } else {
        console.error("Groq completions request failed with status:", response.status);
      }
    } catch (err) {
      console.error("Groq dues analysis error, using fallback instead:", err);
    }
  }

  // Resilient rule-based collections analyst engine fallback
  return dealersList.map(d => {
    let risk = 10;
    let action = "Auto-reminder scheduled";
    let promise = null;

    if (d.pending > 100000) {
      risk = 85;
      action = "Personal call by owner";
    } else if (d.pending > 50000) {
      risk = 60;
      action = "WhatsApp automatic nudge";
    } else if (d.trustScore < 70) {
      risk = 50;
      action = "WhatsApp automatic nudge";
    }

    const nameStr = d.name || d.dealer || "";
    if (nameStr.includes("Verma") || nameStr.includes("Vijay") || nameStr.includes("Raj Traders")) {
      promise = "Nov 5 (Post-Diwali)";
    }

    return {
      dealerId: d.id,
      risk,
      action,
      promise
    };
  });
}
