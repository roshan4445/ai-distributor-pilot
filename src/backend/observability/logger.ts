export interface AgentLog {
  traceId: string;
  timestamp: string;
  intent: string;
  confidence: number;
  plan: string[];
  toolsUsed: string[];
  executionTimeMs: number;
  status: "SUCCESS" | "ERROR" | "GUARDRAILS_TRIGGERED";
  errors?: string[];
  
  // Observability++ extensions
  currentState: string;
  reflectionResult: { success: boolean; summary: string };
  memoryUsed: string;
  guardrailStatus: "PASSED" | "FAILED";
  toolSuccessCount: number;
  toolFailureCount: number;
  health: "HEALTHY" | "WARNING" | "ERROR";
  
  // Token Monitoring
  promptTokens?: number;
  responseTokens?: number;
  totalTokens?: number;
  tokenSavingsLog?: string;
}

export function logAgentExecution(log: AgentLog) {
  const border = "=".repeat(60);
  const indent = "  ";

  console.log(border);
  console.log(`🔍 [AGENT TRACE LOG] | Trace ID: ${log.traceId}`);
  console.log(`⏰ Timestamp:       ${log.timestamp}`);
  console.log(`🎯 Intent:          ${log.intent} (Confidence: ${(log.confidence * 100).toFixed(1)}%)`);
  console.log(`⚡ Status:          ${log.status} | Health: ${log.health}`);
  console.log(`⏱️ Execution Time:  ${log.executionTimeMs}ms`);
  console.log(`⚙️ Current State:   ${log.currentState}`);
  console.log(`🛡️ Guardrail:       ${log.guardrailStatus}`);
  console.log(`📦 Memory Used:     ${log.memoryUsed}`);
  if (log.totalTokens !== undefined) {
    console.log(`🪙 Tokens Used:     Prompt: ${log.promptTokens} | Response: ${log.responseTokens} | Total: ${log.totalTokens}`);
  }
  if (log.tokenSavingsLog) {
    console.log(`💡 Token Savings:   ${log.tokenSavingsLog}`);
  }

  if (log.plan && log.plan.length > 0) {
    console.log(`🗒️ Execution Plan:`);
    log.plan.forEach((step, idx) => {
      console.log(`${indent}${idx + 1}. ${step}`);
    });
  }

  if (log.toolsUsed && log.toolsUsed.length > 0) {
    console.log(`🛠️ Tools Invoked:   ${log.toolsUsed.join(", ")}`);
    console.log(`   Success Count:   ${log.toolSuccessCount} | Failure Count: ${log.toolFailureCount}`);
  }

  console.log(`🧠 Reflection:      ${log.reflectionResult.success ? "✅ SUCCESS" : "❌ FAILED"}`);
  console.log(`   Summary:         ${log.reflectionResult.summary}`);

  if (log.errors && log.errors.length > 0) {
    console.log(`❌ Errors / Violations:`);
    log.errors.forEach(err => {
      console.log(`${indent}- ${err}`);
    });
  }
  console.log(border);
}
