import type { AuditInput, AuditResult } from "./engine";
import { buildFallbackSummary } from "./engine";
import { getTool } from "./catalog";

const GEMINI_MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 8_000;

const SYSTEM_PROMPT =
  "You are a senior finance partner at a fast-growing startup. You write crisp, defensible spend analysis. You never inflate numbers, never hedge, never use marketing language.";

type SummaryResult = { text: string; source: "ai" | "fallback" };

export async function generateAiSummary(
  input: AuditInput,
  result: AuditResult,
): Promise<SummaryResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallback = (): SummaryResult => ({
    text: buildFallbackSummary(input, result),
    source: "fallback",
  });

  if (!apiKey) return fallback();

  const prompt = buildPrompt(input, result);

  try {
    const text = await callGemini(apiKey, prompt);
    return text ? { text, source: "ai" } : fallback();
  } catch (err) {
    console.error("[ai-summary] error:", err);
    return fallback();
  }
}

function buildPrompt(input: AuditInput, result: AuditResult): string {
  const items = input.items.map((i) => ({
    tool: getTool(i.toolId)?.name ?? i.toolId,
    plan: i.plan,
    seats: i.seats,
    monthlyCost: i.monthlyCost,
  }));
  const recs = result.recommendations.slice(0, 4).map((r) => ({
    tool: getTool(r.toolId)?.name ?? r.toolId,
    type: r.type,
    title: r.title,
    monthlySavings: r.monthlySavings,
  }));

  return [
    `Team: ${input.teamSize} people, stage ${input.stage ?? "unknown"}.`,
    input.useCase ? `Use case: ${input.useCase}.` : null,
    `Current monthly AI spend: $${result.totalMonthlySpend}.`,
    `Identified monthly savings: $${result.totalMonthlySavings} (${result.optimizationScore}% of spend).`,
    `Stack: ${JSON.stringify(items)}.`,
    `Top recommendations: ${JSON.stringify(recs)}.`,
    ``,
    `Write a 2–3 sentence executive summary for a startup founder. Be specific, finance-aware, and confident. Mention the single biggest lever by name. Do not invent numbers. No emojis, no headings, no bullet points.`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function callGemini(apiKey: string, prompt: string): Promise<string | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 240 },
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error("[ai-summary] gemini non-200:", res.status, await safeText(res));
      return null;
    }
    const data: {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    } = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
    return text || null;
  } finally {
    clearTimeout(t);
  }
}

async function safeText(r: Response) {
  try {
    return await r.text();
  } catch {
    return "";
  }
}
