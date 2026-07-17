import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jminggcexzicnakvsdlx.supabase.co";
const supabaseKey = "sb_publishable_fRXfL-RO43PkxsuLF_vrLA_VEezLIta";
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const convoId = "c0000000-0000-0000-0000-000000000001";
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("id", `mem-${convoId}`)
    .maybeSingle();

  if (error) {
    console.error("Error fetching memory from Supabase:", error);
  } else {
    console.log("Memory in Supabase:", data ? JSON.parse(data.data) : "No memory row found");
  }
}

main();
