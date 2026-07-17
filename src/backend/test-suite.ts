process.env.USE_SQLITE = "true";

let supabaseClient: any;

async function resetConvo(convoId: string) {
  await supabaseClient.from("conversation_state").delete().eq("conversation_id", convoId);
  await supabaseClient.from("messages").delete().eq("conversationId", convoId);
}

async function restoreDBState(dealerId: string, initialDues: number) {
  await supabaseClient.from("dealers").update({ pending: initialDues, trust: 88 }).eq("id", dealerId);
  await supabaseClient.from("products").update({ stock: 42 }).eq("sku", "MCB-32A-SP");
  await supabaseClient.from("products").update({ stock: 1840 }).eq("sku", "SW-MOD-6A");
  await supabaseClient.from("products").update({ stock: 15 }).eq("sku", "MCB-12A-SP");
  await supabaseClient.from("stock_alerts").delete().eq("dealer_id", dealerId);
  await supabaseClient.from("payment_promises").delete().eq("dealer_id", dealerId);
}

async function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function runTests() {
  const { db } = await import("../lib/db");
  await db.execute("DROP TABLE IF EXISTS conversation_state");
  await db.execute("DROP TABLE IF EXISTS stock_alerts");
  await db.execute("DROP TABLE IF EXISTS payment_promises");

  const { supabase: s } = await import("../utils/supabase");
  supabaseClient = s;

  const { processAgentRequest } = await import("./agents/distributorAgent");
  const { runCronLogic } = await import("../lib/db-queries");

  console.log("=================================================");
  console.log("🚀 STARTING EXTENDED AI DISTRIBUTOR REGRESSION SUITE");
  console.log("=================================================\n");

  const results: any[] = [];
  const startDues = 88400; // Sri Lakshmi Agencies initial dues

  // -------------------------------------------------------------
  // SCENARIO 1: Baseline draft & confirm
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 1: Baseline Draft & Confirm ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    const draftResStr = await processAgentRequest(
      "Sir, order 20 MCB-32A-SP and 15 SW-MOD-6A. Wholesale rate please.",
      convoId,
      dealerName
    );
    const draftRes = JSON.parse(draftResStr);
    const draftOk = draftRes.state === "COMPLETED" && draftRes.kind === "order" && draftRes.data?.total > 0;

    const confirmResStr = await processAgentRequest(
      "Please confirm the order sir.",
      convoId,
      dealerName
    );
    const confirmRes = JSON.parse(confirmResStr);
    const confirmOk = confirmRes.state === "COMPLETED" && confirmRes.kind === "invoice";

    const { data: dbInvoice } = await supabaseClient
      .from("invoices")
      .select("*")
      .eq("invoice_code", confirmRes.data?.invoice)
      .maybeSingle();
    const dbOk = dbInvoice !== null && Math.abs(dbInvoice.amount - confirmRes.data?.total) < 0.01;

    results.push({
      scenario: "1. Baseline Draft & Confirm",
      status: (draftOk && confirmOk && dbOk) ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 2: Draft -> Correction -> Confirm
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 2: Draft -> Correction -> Confirm ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    await processAgentRequest("Sir, order 20 MCB-32A-SP and 15 SW-MOD-6A.", convoId, dealerName);
    const correctResStr = await processAgentRequest(
      "Bhai MCB ki quantity change karke 25 pieces kar do switches same rehne do",
      convoId,
      dealerName
    );
    const correctRes = JSON.parse(correctResStr);
    const correctOk = correctRes.data?.items?.find((i: any) => i.sku === "MCB-32A-SP")?.qty === 25;

    const confirmResStr = await processAgentRequest("Confirm order now.", convoId, dealerName);
    const confirmRes = JSON.parse(confirmResStr);
    const confirmOk = confirmRes.state === "COMPLETED" && confirmRes.kind === "invoice";
    const itemsOk = confirmRes.data?.items?.find((i: any) => i.sku === "MCB-32A-SP")?.qty === 25;

    results.push({
      scenario: "2. Draft -> Correction -> Confirm",
      status: (correctOk && confirmOk && itemsOk) ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 3: Abandonment / Staleness Gating
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 3: Abandonment / Staleness Gating ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    await processAgentRequest("Sir, order 20 MCB-32A-SP and 15 SW-MOD-6A.", convoId, dealerName);

    const staleTime = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    await supabaseClient.from("conversation_state").update({ last_activity_at: staleTime }).eq("conversation_id", convoId);

    const confirmResStr = await processAgentRequest("Confirm this order sir.", convoId, dealerName);
    const confirmRes = JSON.parse(confirmResStr);
    const staleGated = confirmRes.state === "WAITING_FOR_USER" && confirmRes.response.includes("Are you confirming the order");

    results.push({
      scenario: "3. Abandonment / Staleness Gating",
      status: staleGated ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 4: Mixed Language / Vague SKU
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 4: Mixed Language / Vague SKU ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    const draftResStr = await processAgentRequest(
      "sir muje Havells wala switch 20 pieces de do",
      convoId,
      dealerName
    );
    const draftRes = JSON.parse(draftResStr);
    const item = draftRes.data?.items?.find((i: any) => i.sku === "SW-MOD-6A");
    const draftOk = draftRes.state === "COMPLETED" && item !== undefined && item.qty === 20;

    results.push({
      scenario: "4. Mixed Language / Vague SKU",
      status: draftOk ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 5: Insufficient Stock Handling
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 5: Insufficient Stock Handling ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvoConvo(convoId);
    async function resetConvoConvo(cid: string) {
      await resetConvo(cid);
    }
    await restoreDBState(dealerId, startDues);

    // Request 50 MCBs (limit is 42)
    const outOfStockResStr = await processAgentRequest(
      "Order 50 MCB-32A-SP and 10 SW-MOD-6A",
      convoId,
      dealerName
    );
    const oosRes = JSON.parse(outOfStockResStr);
    const stockGateOk = oosRes.state === "WAITING_FOR_USER" && oosRes.response.includes("We only have 42 units of");

    // Check stock alert log
    const { data: alerts } = await supabaseClient.from("stock_alerts").select("*").eq("sku", "MCB-32A-SP");
    const logOk = (alerts || []).length > 0 && alerts[0].requested_qty === 50;

    // Correct to 30 MCB-32A-SP
    const correctResStr = await processAgentRequest("ok give me 30 then", convoId, dealerName);
    const correctRes = JSON.parse(correctResStr);
    const correctOk = correctRes.state === "COMPLETED" && correctRes.data?.items?.find((i: any) => i.sku === "MCB-32A-SP")?.qty === 30;

    results.push({
      scenario: "5. Insufficient Stock Handling",
      status: (stockGateOk && logOk && correctOk) ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 6: Repeat Order Flow
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 6: Repeat Order Flow ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    const repeatResStr = await processAgentRequest("same as last order", convoId, dealerName);
    const repeatRes = JSON.parse(repeatResStr);
    const repeatDraftOk = repeatRes.state === "COMPLETED" && repeatRes.kind === "order" && repeatRes.data?.items?.length > 0;

    // Confirm
    const confirmResStr = await processAgentRequest("Confirm this", convoId, dealerName);
    const confirmRes = JSON.parse(confirmResStr);
    const confirmOk = confirmRes.state === "COMPLETED" && confirmRes.kind === "invoice";

    results.push({
      scenario: "6. Repeat Order Flow",
      status: (repeatDraftOk && confirmOk) ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 7: Ambiguous Usual Orders
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 7: Ambiguous Usual Orders ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    // Seed a second order to make it ambiguous
    const secondOrderId = crypto.randomUUID();
    await supabaseClient.from("orders").insert({
      id: secondOrderId,
      invoice: "INV-1043",
      dealerId: dealerId,
      dealerName: dealerName,
      total: 35000,
      status: "delivered",
      placedAt: "3 days ago",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      aiNote: "Mocked second order for ambiguity test."
    });

    const repeatUsualResStr = await processAgentRequest("sir repeat my usual order", convoId, dealerName);
    const repeatUsualRes = JSON.parse(repeatUsualResStr);
    const ambiguityOk = repeatUsualRes.state === "WAITING_FOR_USER" && repeatUsualRes.response.includes("you have multiple different recent orders");

    // Clean up mock order
    await supabaseClient.from("orders").delete().eq("id", secondOrderId);

    results.push({
      scenario: "7. Ambiguous Usual Orders",
      status: ambiguityOk ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 8: Payment Promise Tracking
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 8: Payment Promise Tracking ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    // 1. Dues promise without specifying amount
    const promiseClarifyResStr = await processAgentRequest("will pay outstanding dues on Nov 5", convoId, dealerName);
    const clarifyRes = JSON.parse(promiseClarifyResStr);
    const clarifyOk = clarifyRes.state === "WAITING_FOR_USER" && clarifyRes.response.includes("clarify the promised payment amount");

    // 2. Promise with amount
    const promiseResStr = await processAgentRequest("will pay 50000 tomorrow", convoId, dealerName);
    const promiseRes = JSON.parse(promiseResStr);
    const promiseOk = promiseRes.state === "COMPLETED" && promiseRes.kind === "reminder";

    // Verify promise was written to DB
    const { data: promises } = await supabaseClient.from("payment_promises").select("*").eq("dealer_id", dealerId).eq("status", "pending");
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const dbPromiseOk = (promises || []).length > 0 && promises[0].promised_amount === 50000 && promises[0].promised_date === tomorrowStr;

    // 3. Receive payment -> matches and transitions to kept
    const payResStr = await processAgentRequest("paid 50000 today via UPI", convoId, dealerName);
    const payRes = JSON.parse(payResStr);
    const payOk = payRes.state === "COMPLETED" && payRes.kind === "ledger";

    const { data: updatedPromises } = await supabaseClient.from("payment_promises").select("*").eq("dealer_id", dealerId);
    const promiseKeptOk = (updatedPromises || []).some(p => p.status === "kept");

    results.push({
      scenario: "8. Payment Promise Tracking",
      status: (clarifyOk && promiseOk && dbPromiseOk && payOk && promiseKeptOk) ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 9: Cron Job Promise Verification
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 9: Cron Job Promise Verification ---");
    const convoId = "c0000000-0000-0000-0000-000000000001";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    // Mock an expired promise (unpaid from yesterday)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    await supabaseClient.from("payment_promises").insert({
      id: crypto.randomUUID(),
      promised_date: yesterday,
      promised_amount: 10000,
      dealer_id: dealerId,
      status: "pending",
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    });

    // Run cron job
    const cronRes = await runCronLogic();
    const cronOk = cronRes.success;

    // Check status changed to 'broken' and trust score dropped from 88 to 80
    const { data: updatedPromises } = await supabaseClient.from("payment_promises").select("*").eq("dealer_id", dealerId);
    const promiseBrokenOk = (updatedPromises || []).some(p => p.status === "broken");

    const { data: dl } = await supabaseClient.from("dealers").select("trust").eq("id", dealerId).maybeSingle();
    const trustDropped = dl?.trust === 80;

    results.push({
      scenario: "9. Cron Job Promise Verification",
      status: (cronOk && promiseBrokenOk && trustDropped) ? "PASS" : "FAIL"
    });
  }


  // -------------------------------------------------------------
  // SCENARIO 10: Missing orderItems parse failure
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 10: Missing orderItems parse failure ---");
    const convoId = "c0000000-0000-0000-0000-000000000010";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    // Send a confirm message with NO prior draft in memory.
    // The fallback rules engine will attempt createOrder with no orderItems/orderTotal.
    // The agent must return FAILED state, not write a fake order to DB.
    const { data: ordersBefore } = await supabaseClient
      .from("orders")
      .select("id")
      .eq("dealerId", dealerId);
    const countBefore = (ordersBefore || []).length;

    const resStr = await processAgentRequest(
      "confirm order",
      convoId,
      dealerName
    );
    const res = JSON.parse(resStr);

    // Must NOT be COMPLETED — either FAILED or WAITING_FOR_USER (staleness check may fire)
    const didNotCompleteOrder = res.state !== "COMPLETED" || res.kind !== "invoice";

    // DB must NOT have a new order row
    const { data: ordersAfter } = await supabaseClient
      .from("orders")
      .select("id")
      .eq("dealerId", dealerId);
    const countAfter = (ordersAfter || []).length;
    const noNewOrder = countAfter === countBefore;

    results.push({
      scenario: "10. Missing orderItems parse failure",
      status: (didNotCompleteOrder && noNewOrder) ? "PASS" : "FAIL"
    });
  }

  // -------------------------------------------------------------
  // SCENARIO 11: Duplicate confirm idempotency guard
  // -------------------------------------------------------------
  {
    console.log("--- Scenario 11: Duplicate Confirm Idempotency ---");
    const convoId = "c0000000-0000-0000-0000-000000000011";
    const dealerName = "Sri Lakshmi Agencies";
    const dealerId = "00000000-0000-0000-0000-000000000003";

    await resetConvo(convoId);
    await restoreDBState(dealerId, startDues);

    // Ensure a conversation row exists (required for FK on messages table used by memory)
    await supabaseClient.from("conversations").upsert({
      id: convoId,
      dealer: dealerName,
      city: "Madurai",
      unread: 0,
      preview: "Idempotency test"
    });

    // Clear any stale idempotency state for this conversation
    await supabaseClient.from("conversation_state").delete().eq("conversation_id", convoId);

    // Step 1: Draft an order
    await processAgentRequest(
      "Order 10 MCB-32A-SP",
      convoId,
      dealerName
    );

    // Step 2: First confirm — should succeed and create an order
    const confirm1Str = await processAgentRequest(
      "confirm order",
      convoId,
      dealerName
    );
    const confirm1 = JSON.parse(confirm1Str);
    const firstOk = confirm1.state === "COMPLETED" && confirm1.kind === "invoice";

    // Debug: check what was stored
    const { data: storedState } = await supabaseClient
      .from("conversation_state")
      .select("*")
      .eq("conversation_id", convoId)
      .maybeSingle();
    console.log("[DEBUG] Stored idempotency state after first confirm:", JSON.stringify({
      hasKey: !!storedState?.last_idempotency_key,
      hasResponse: !!storedState?.last_response,
      key: storedState?.last_idempotency_key
    }));

    // Step 3: Immediately send the exact same confirm message (within 5-second bucket)
    // The idempotency guard should return the cached response without creating a new order.
    const { data: ordersMid } = await supabaseClient
      .from("orders")
      .select("id")
      .eq("dealerId", dealerId);
    const countAfterFirst = (ordersMid || []).length;

    const confirm2Str = await processAgentRequest(
      "confirm order",
      convoId,
      dealerName
    );
    const confirm2 = JSON.parse(confirm2Str);

    const { data: ordersAfter } = await supabaseClient
      .from("orders")
      .select("id")
      .eq("dealerId", dealerId);
    const countAfterSecond = (ordersAfter || []).length;

    // Second confirm must NOT create another order row
    const noDoubleOrder = countAfterSecond === countAfterFirst;
    // Second response should be same state as first (cached replay or also COMPLETED)
    const secondNotFailed = confirm2.state !== "FAILED" || confirm2.state === "COMPLETED";

    console.log(`[DEBUG] Scenario 11: firstOk=${firstOk}, noDoubleOrder=${noDoubleOrder} (${countAfterFirst} -> ${countAfterSecond}), secondState=${confirm2.state}, secondKind=${confirm2.kind}`);

    results.push({
      scenario: "11. Duplicate Confirm Idempotency",
      status: (firstOk && noDoubleOrder && secondNotFailed) ? "PASS" : "FAIL"
    });
  }

  console.log("\n=================================================");
  console.log("📊 REGRESSION TESTS SUMMARY TABLE");
  console.log("=================================================");
  console.log("| Scenario | Status |");
  console.log("|---|---|");
  for (const r of results) {
    console.log(`| ${r.scenario} | **${r.status}** |`);
  }
  console.log("=================================================\n");
}

runTests().catch(console.error);

