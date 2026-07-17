import { supabase } from "@/utils/supabase";

export interface ConversationMemory {
  lastDealerId?: string;
  lastOrderId?: string;
  lastInvoiceId?: string;
  pendingClarification?: string;
  recentConversation: { role: "user" | "model"; text: string }[];
  lastDraft?: {
    items: { sku: string; name: string; qty: number; price: number }[];
    total: number;
  };
}

function getMemoryRowId(conversationId: string): string {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId);
  if (isUuid) {
    const firstChar = conversationId[0].toLowerCase();
    const newFirst = firstChar === 'e' ? 'f' : 'e';
    return newFirst + conversationId.slice(1);
  }
  // Fallback for seed IDs like 'c1', 'c2'
  let hash = 0;
  for (let i = 0; i < conversationId.length; i++) {
    hash = (hash << 5) - hash + conversationId.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  const fullHex = (hex + hex + hex + hex).substring(0, 32);
  return `${fullHex.substring(0, 8)}-${fullHex.substring(8, 12)}-${fullHex.substring(12, 16)}-${fullHex.substring(16, 20)}-${fullHex.substring(20, 32)}`;
}

export async function getMemory(conversationId: string): Promise<ConversationMemory> {
  try {
    const { data } = await supabase
      .from("messages")
      .select("data")
      .eq("id", getMemoryRowId(conversationId))
      .maybeSingle();

    if (data?.data) {
      const parsed = typeof data.data === "string" ? JSON.parse(data.data) : data.data;
      if (parsed) return parsed;
    }
  } catch (e) {
    console.error("Failed to load persistent memory from database:", e);
  }

  return {
    recentConversation: []
  };
}

export async function updateMemory(
  conversationId: string,
  partial: Partial<ConversationMemory>
): Promise<ConversationMemory> {
  const current = await getMemory(conversationId);
  const updated = {
    ...current,
    ...partial,
    recentConversation: partial.recentConversation !== undefined 
      ? partial.recentConversation.slice(-10) // Keep last 10 messages for context
      : current.recentConversation
  };

  try {
    await supabase.from("messages").upsert({
      id: getMemoryRowId(conversationId),
      conversationId: conversationId,
      fromRole: "system_memory",
      text: "system_memory_state",
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      data: JSON.stringify(updated)
    });
  } catch (e) {
    console.error("Failed to persist memory to database:", e);
  }

  return updated;
}

export async function clearMemory(conversationId: string): Promise<void> {
  try {
    await supabase.from("messages").delete().eq("id", getMemoryRowId(conversationId));
  } catch (e) {
    console.error("Failed to clear persistent memory from database:", e);
  }
}
