import { supabase } from "../utils/supabase";
import { runAgentConversation } from "../lib/gemini";

let isPolling = false;
let lastUpdateId = 0;

async function initOffset(botToken: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=-1&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.result.length > 0) {
        lastUpdateId = data.result[0].update_id;
        console.log(`[TELEGRAM] Offset initialized to: ${lastUpdateId}`);
      }
    }
  } catch (e) {
    console.error("[TELEGRAM] Failed to initialize update offset:", e);
  }
}

async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown"
      })
    });
    if (!res.ok) {
      console.error(`[TELEGRAM] Failed to send message: ${res.statusText}`);
    }
  } catch (e) {
    console.error("[TELEGRAM] Error sending message:", e);
  }
}

function getUuidForChatId(chatId: string | number): string {
  const cleanId = String(chatId).replace(/\D/g, "");
  const padded = cleanId.padStart(12, "0").slice(-12);
  return `00000000-0000-0000-0000-${padded}`;
}

function getUuidForDealerId(dealerIdInput: string): string {
  const num = dealerIdInput.replace(/\D/g, "");
  const padded = num.padStart(12, "0").slice(-12);
  return `00000000-0000-0000-0000-${padded}`;
}

async function handleTelegramMessage(botToken: string, message: any) {
  const chatId = String(message.chat.id);
  const text = message.text || "";
  if (!text) return;

  const conversationId = getUuidForChatId(chatId);
  const cleanText = text.trim().toLowerCase();

  // Reset registration
  if (cleanText === "/reset") {
    await supabase.from("conversations").delete().eq("id", conversationId);
    await sendTelegramMessage(botToken, chatId, "🔄 *Registration Reset.*\n\nPlease reply with your registered *Phone Number* or *Dealer ID* (e.g., `d1`, `d2`, `d3`) to register again.");
    return;
  }

  // Switch dealer profile dynamically
  if (/^d\d+$/.test(cleanText)) {
    const uuidId = getUuidForDealerId(cleanText);
    const { data: matchedDealer } = await supabase
      .from("dealers")
      .select("*")
      .eq("id", uuidId)
      .maybeSingle();

    if (matchedDealer) {
      await supabase.from("conversations").upsert({
        id: conversationId,
        dealer: matchedDealer.name,
        city: matchedDealer.city,
        unread: 0,
        preview: "Registered via Telegram"
      });

      await sendTelegramMessage(
        botToken,
        chatId,
        `🎉 *Registration Successful!*\n\nYou are now linked as *${matchedDealer.name}* (${matchedDealer.city}) for Kumar Electricals.\n\nYou can now place orders (e.g. \`order 20 Copper Wire 2.5 sq mm\`) or check dues.`
      );
      return;
    }
  }

  // 1. Check if conversation already exists for this Telegram user
  const { data: convo } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (!convo) {
    // Self-registration workflow
    const cleanText = text.trim().toLowerCase();
    let matchedDealer: any = null;

    if (/^d\d+$/.test(cleanText)) {
      const uuidId = getUuidForDealerId(cleanText);
      const { data } = await supabase
        .from("dealers")
        .select("*")
        .eq("id", uuidId)
        .maybeSingle();
      matchedDealer = data;
    } else {
      // Check phone match
      const phoneClean = cleanText.replace(/\D+/g, "");
      const { data: dealers } = await supabase.from("dealers").select("*");
      if (dealers && phoneClean.length >= 8) {
        matchedDealer = dealers.find(d => {
          const dPhoneClean = d.phone.replace(/\D+/g, "");
          return dPhoneClean.includes(phoneClean) || phoneClean.includes(dPhoneClean);
        });
      }
    }

    if (matchedDealer) {
      // Register dealer and create a new conversation channel
      await supabase.from("conversations").insert({
        id: conversationId,
        dealer: matchedDealer.name,
        city: matchedDealer.city,
        unread: 0,
        preview: "Registered via Telegram"
      });

      // Greeting reply
      await sendTelegramMessage(
        botToken,
        chatId,
        `🎉 *Registration Successful!*\n\nWelcome *${matchedDealer.name}* (${matchedDealer.city}) to our B2B ordering portal.\n\nYou can now:\n• Place orders (e.g. \`order 20 Copper Wire 2.5 sq mm\`)\n• Ask about stock levels\n• Inquire about pending dues`
      );
    } else {
      // Prompt for registration info
      await sendTelegramMessage(
        botToken,
        chatId,
        `👋 *Welcome to the AI Distributor Copilot!*\n\nTo place B2B orders or view outstanding ledger dues, we need to link your Telegram account.\n\n*Please reply with your:*\n1. Registered Phone Number (e.g., \`9845012345\`)\nOR\n2. Dealer ID Code (e.g., \`d1\`, \`d2\`, \`d3\`)`
      );
    }
    return;
  }

  // 2. Save incoming user message to Supabase
  const msgId = crypto.randomUUID();
  await supabase.from("messages").insert({
    id: msgId,
    conversationId,
    fromRole: "dealer",
    text,
    time: new Date().toISOString()
  });

  // 3. Retrieve conversation history for agent context
  const { data: msgs } = await supabase
    .from("messages")
    .select("id, fromRole, text, time")
    .eq("conversationId", conversationId);

  const sortedMsgs = msgs || [];
  sortedMsgs.sort((a, b) => a.time.localeCompare(b.time));

  // Limit context to last 20 messages for prompt efficiency
  const history = sortedMsgs.slice(-20).map(m => {
    const role = m.fromRole === "dealer" ? ("user" as const) : ("model" as const);
    return {
      role,
      parts: [{ text: String(m.text || "") }]
    };
  });

  // 4. Run Gemini AI orchestrator
  const aiReply = await runAgentConversation(conversationId, convo.dealer, history, text);

  // 5. Parse reply structures (response card kinds, orders details)
  let replyText = aiReply;
  let kind: string | null = null;
  let dataObj: any = null;

  try {
    const parsed = JSON.parse(aiReply.trim().replace(/^```json/, "").replace(/```$/, "").trim());
    replyText = parsed.response || parsed.text || aiReply;
    kind = parsed.kind || null;
    dataObj = parsed;
  } catch (e) {
    // plain string fallback
  }

  // 6. Save AI reply message
  const aiMsgId = crypto.randomUUID();
  await supabase.from("messages").insert({
    id: aiMsgId,
    conversationId,
    fromRole: "ai",
    text: replyText,
    time: new Date().toISOString(),
    kind,
    data: dataObj ? JSON.stringify(dataObj) : null
  });

  // 7. Update conversation preview metadata
  await supabase.from("conversations").update({
    preview: replyText.length > 90 ? replyText.substring(0, 87) + "..." : replyText,
    unread: 0
  }).eq("id", conversationId);

  // 8. Push reply back to Telegram chat
  await sendTelegramMessage(botToken, chatId, replyText);
}

export function startTelegramBot(botToken: string) {
  const globalState = globalThis as any;
  if (globalState.isTelegramBotPolling || isPolling) {
    console.log("[TELEGRAM] Telegram Bot Polling already active on globalState. Skipping duplicate startup.");
    return;
  }
  globalState.isTelegramBotPolling = true;
  isPolling = true;
  console.log("[TELEGRAM] Background Telegram Bot Polling started...");

  async function poll() {
    try {
      if (lastUpdateId === 0) {
        await initOffset(botToken);
      }
      
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=5`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.result.length > 0) {
          for (const update of data.result) {
            lastUpdateId = update.update_id;
            if (update.message) {
              await handleTelegramMessage(botToken, update.message);
            }
          }
        }
      }
    } catch (e) {
      console.error("[TELEGRAM] Error fetching Telegram updates:", e);
    }
    // Continue polling loop
    setTimeout(poll, 1500);
  }

  poll();
}
