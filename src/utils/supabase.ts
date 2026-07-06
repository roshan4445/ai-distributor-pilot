import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env?.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || "";

console.log("Supabase Client Init: URL =", supabaseUrl || "MISSING", "KEY =", supabaseKey ? "PRESENT" : "MISSING");

export const supabase = createClient(supabaseUrl, supabaseKey);
