import { createClient } from "@libsql/client";

const db = createClient({
  url: "file:local.db",
});

async function main() {
  try {
    const res = await db.execute("SELECT * FROM conversations");
    console.log("Conversations in SQLite:", res.rows);
    
    const dealers = await db.execute("SELECT * FROM dealers");
    console.log("Dealers in SQLite:", dealers.rows.length);
  } catch (err) {
    console.error("Error querying SQLite:", err);
  }
}

main();
