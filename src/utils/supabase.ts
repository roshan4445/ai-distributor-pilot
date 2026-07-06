import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) || 
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) || 
  "https://jminggcexzicnakvsdlx.supabase.co";

const supabaseKey = 
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_KEY) || 
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_KEY) || 
  "sb_publishable_fRXfL-RO43PkxsuLF_vrLA_VEezLIta";

console.log("Supabase Client Init: URL =", supabaseUrl || "MISSING", "KEY =", supabaseKey ? "PRESENT" : "MISSING");

export const supabase = createClient(supabaseUrl, supabaseKey);
