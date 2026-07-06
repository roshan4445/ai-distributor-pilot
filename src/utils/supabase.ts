import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jminggcexzicnakvsdlx.supabase.co";
const supabaseKey = import.meta.env?.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || "sb_publishable_fRXfL-RO43PkxsuLF_vrLA_VEezLIta";

console.log("Supabase Client Init: URL =", supabaseUrl || "MISSING", "KEY =", supabaseKey ? "PRESENT" : "MISSING");

export const supabase = createClient(supabaseUrl, supabaseKey);
