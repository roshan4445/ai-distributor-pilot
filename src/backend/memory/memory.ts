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

export async function getMemory(conversationId: string): Promise<ConversationMemory> {
  try {
    const { data } = await supabase
      .from("messages")
      .select("data")
      .eq("id", `mem-${conversationId}`)
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
      id: `mem-${conversationId}`,
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
    await supabase.from("messages").delete().eq("id", `mem-${conversationId}`);
  } catch (e) {
    console.error("Failed to clear persistent memory from database:", e);
  }
}
