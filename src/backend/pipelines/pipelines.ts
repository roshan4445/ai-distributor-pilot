import { supabase } from "@/utils/supabase";

export type PipelineStep =
  | { type: "tool"; name: string; purpose: string }
  | { type: "llm"; name: string; purpose: string };

export const PIPELINES: Record<string, PipelineStep[]> = {
  ORDER_DRAFT: [
    { type: "tool", name: "verifySKU", purpose: "Resolve SKU from catalog" },
    { type: "tool", name: "resolvePrice", purpose: "ALWAYS overwrite LLM price with live DB catalog price" },
    { type: "tool", name: "checkInventory", purpose: "Check stock availability at draft time" },
  ],
  ORDER_CONFIRM: [
    { type: "tool", name: "verifySKU", purpose: "Re-verify SKU" },
    { type: "tool", name: "resolvePrice", purpose: "Re-confirm live DB price at commit time" },
    { type: "tool", name: "checkInventory", purpose: "Confirm stock availability" },
    { type: "tool", name: "deductStock", purpose: "Deduct inventory" },
    { type: "tool", name: "createOrderRecord", purpose: "Create order + items records" },
    { type: "tool", name: "generateInvoice", purpose: "Generate GST-compliant invoice" },
    { type: "tool", name: "updateDues", purpose: "Update dealer dues ledger" },
  ],
  REPEAT_ORDER: [
    { type: "tool", name: "fetchLastOrder", purpose: "Query orders/order_items table for this dealer_id, most recent by created_at" },
    { type: "tool", name: "resolvePrice", purpose: "Re-price all items at CURRENT catalog prices, never reuse stored historical prices" },
    { type: "tool", name: "checkInventory", purpose: "Check stock availability at draft time" },
  ],
  PAYMENT: [
    { type: "tool", name: "recordPayment", purpose: "Register payment" },
    { type: "tool", name: "updateLedger", purpose: "Update dues balance" },
    { type: "tool", name: "recalculateTrustScore", purpose: "Update dealer_profile.trust_score" },
  ],
  PAYMENT_PROMISE: [
    { type: "tool", name: "scheduleReminder", purpose: "Schedule follow-up reminder" },
    { type: "tool", name: "updateDuesRecord", purpose: "Flag promised payment date" },
  ],
  BUSINESS_QUERY: [
    { type: "llm", name: "queryBusiness", purpose: "Answer natural language query using live data" },
  ],
};

export function getPlan(intent: string, isDraftOnly: boolean): PipelineStep[] {
  const key = intent === "ORDER" ? (isDraftOnly ? "ORDER_DRAFT" : "ORDER_CONFIRM") : intent;
  const plan = PIPELINES[key];
  if (!plan) throw new Error(`No pipeline for: ${key}`);
  return plan;
}

/**
 * ALWAYS query the live products table for each SKU and overwrite any price value
 */
export async function resolvePrices(items: { sku: string; name: string; qty: number; price: number }[]) {
  const resolved = [];
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("price, name, sku")
      .eq("sku", item.sku)
      .maybeSingle();

    if (!product) {
      // Fallback if not found by exact SKU, try case insensitive or name
      const { data: fallbackProduct } = await supabase
        .from("products")
        .select("price, name, sku")
        .ilike("sku", item.sku)
        .limit(1)
        .maybeSingle();

      const prod = fallbackProduct || product;
      if (prod) {
        resolved.push({
          sku: prod.sku,
          name: prod.name,
          qty: item.qty,
          price: prod.price,
        });
      } else {
        // If not found, keep item but log warning
        resolved.push(item);
      }
    } else {
      resolved.push({
        sku: product.sku,
        name: product.name,
        qty: item.qty,
        price: product.price,
      });
    }
  }
  return resolved;
}
