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

const memoryStore = new Map<string, ConversationMemory>();

export function getMemory(conversationId: string): ConversationMemory {
  if (!memoryStore.has(conversationId)) {
    memoryStore.set(conversationId, {
      recentConversation: []
    });
  }
  return memoryStore.get(conversationId)!;
}

export function updateMemory(
  conversationId: string,
  partial: Partial<ConversationMemory>
): ConversationMemory {
  const current = getMemory(conversationId);
  const updated = {
    ...current,
    ...partial,
    // Ensure we keep the conversation array clean if updating it
    recentConversation: partial.recentConversation !== undefined 
      ? partial.recentConversation.slice(-10) // Keep last 10 messages for context
      : current.recentConversation
  };
  memoryStore.set(conversationId, updated);
  return updated;
}

export function clearMemory(conversationId: string): void {
  memoryStore.delete(conversationId);
}
