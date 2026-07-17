import { supabase } from "@/utils/supabase";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export async function validateRequest(
  text: string,
  dealerId?: string,
  invoiceId?: string
): Promise<ValidationResult> {
  const errors: string[] = [];
  const trimmed = text.trim();

  // 1. Validate empty message
  if (!trimmed) {
    errors.push("Message cannot be empty.");
  }

  const lower = trimmed.toLowerCase();

  // 2. Validate dangerous requests (SQL injections or prompt injection attempts)
  const dangerKeywords = [
    "drop table",
    "delete from",
    "alter table",
    "truncate table",
    "update dealers set",
    "ignore previous instructions",
    "bypass safety",
    "system instruction override",
    "reveal system prompt"
  ];
  for (const kw of dangerKeywords) {
    if (lower.includes(kw)) {
      errors.push(`Dangerous system query keyword detected: "${kw}".`);
    }
  }

  // 2b. Validate unprofessional or abusive requests
  const abuseKeywords = ["fuck", "bitch", "asshole", "bastard", "cunt", "idiot", "stupid", "slut", "ass"];
  for (const word of abuseKeywords) {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(trimmed)) {
      errors.push("Unprofessional, offensive, or abusive language is not permitted.");
      break;
    }
  }

  // 3. Validate dealer existence if provided
  if (dealerId) {
    const { data: dealer } = await supabase
      .from("dealers")
      .select("id")
      .eq("id", dealerId)
      .maybeSingle();
    if (!dealer) {
      errors.push(`Invalid dealer account reference (Dealer ID: "${dealerId}" does not exist).`);
    }
  }

  // 4. Validate invoice existence if invoice ID is mentioned (e.g. INV-1042)
  const invMatch = trimmed.match(/inv-\d+/i);
  if (invMatch) {
    const foundInv = invMatch[0].toUpperCase();
    const { data: invoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("id", foundInv)
      .maybeSingle();
    if (!invoice) {
      errors.push(`Referenced invoice ID "${foundInv}" does not exist in records.`);
    }
  }

  // 5. Validate invalid quantity references (e.g., "-5 units", "0 quantity", "qty 0")
  const qtyMatches = trimmed.match(/(?:qty|quantity|units|order|pieces|pcs)\s*[:=-]?\s*(-?\d+)/i) || 
                     trimmed.match(/(-?\d+)\s*(?:qty|quantity|units|order|pieces|pcs)/i);
  if (qtyMatches) {
    const qty = parseInt(qtyMatches[1], 10);
    if (qty <= 0) {
      errors.push(`Invalid product order quantity requested: ${qty}. Value must be greater than 0.`);
    }
  }

  // 6. Validate unknown products requested by name/SKU if they appear to be order requests
  // (We check if they name key electrical words that do not match our product listings)
  if (lower.includes("order") || lower.includes("buy") || lower.includes("need") || lower.includes("dispatch")) {
    const { data: allProducts } = await supabase.from("products").select("name, sku");
    const products = allProducts || [];
    
    // Look for common request patterns, e.g. "order 10 MCB", "need Modular Switch"
    // We check if a dealer specifies a product word but none of our product names or SKUs matches it
    const words = lower.split(/\s+/).map(w => w.replace(/[^\w\-]/g, "")).filter(Boolean);
    const potentialProducts = ["wire", "mcb", "switch", "socket", "board", "light", "panel", "led"];
    
    for (const word of words) {
      if (potentialProducts.some(p => word.includes(p))) {
        // Look for match in database
        const hasMatch = products.some(p => {
          const pNameLower = p.name.toLowerCase();
          const pSkuLower = p.sku.toLowerCase();
          return pNameLower.includes(word) || 
                 word.includes(pNameLower) ||
                 pSkuLower.includes(word) || 
                 word.includes(pSkuLower) ||
                 (word.endsWith("s") && (
                   pNameLower.includes(word.slice(0, -1)) ||
                   pSkuLower.includes(word.slice(0, -1))
                 ));
        });
        if (!hasMatch && products.length > 0) {
          errors.push(`Requested product reference "${word}" is not recognized in our stock catalogs.`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
