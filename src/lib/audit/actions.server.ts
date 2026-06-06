import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireSupabaseAuth } from "@/lib/supabase/middleware";
import { runAudit, type AuditInput } from "./engine";
import { generateAiSummary } from "./summary.server";
import { generateSlug } from "./slug";
import { createAuditSchema, captureLeadSchema } from "./schemas";

export const createAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createAuditSchema.parse(input))
  .handler(async ({ data, context }) => {
    const auditInput: AuditInput = {
      teamSize: data.teamSize,
      stage: data.stage,
      useCase: data.useCase,
      items: data.items,
    };

    const result = runAudit(auditInput);
    const slug = generateSlug(data.stage);

    const { data: auditRow, error: auditErr } = await supabaseAdmin
      .from("audits")
      .insert({
        slug,
        team_size: data.teamSize,
        stage: data.stage ?? null,
        use_case: data.useCase ?? null,
        total_monthly_spend: result.totalMonthlySpend,
        total_monthly_savings: result.totalMonthlySavings,
        optimization_score: result.optimizationScore,
        efficiency_score: result.efficiencyScore,
        user_id: context.userId,
      })
      .select("id, slug")
      .single();

    if (auditErr || !auditRow) {
      console.error("[createAudit] insert failed:", auditErr);
      throw new Error("Failed to create audit");
    }

    const [{ error: itemsErr }, { error: recsErr }] = await Promise.all([
      supabaseAdmin.from("audit_items").insert(
        data.items.map((i) => ({
          audit_id: auditRow.id,
          tool_id: i.toolId,
          plan: i.plan,
          seats: i.seats,
          monthly_cost: i.monthlyCost,
          use_case: i.useCase ?? null,
        })),
      ),
      supabaseAdmin.from("audit_recommendations").insert(
        result.recommendations.map((r, idx) => ({
          audit_id: auditRow.id,
          tool_id: r.toolId,
          rec_type: r.type,
          impact: r.impact,
          title: r.title,
          detail: r.detail,
          reasoning: r.reasoning,
          monthly_savings: r.monthlySavings,
          confidence: r.confidence,
          rank: idx,
        })),
      ),
    ]);

    if (itemsErr) console.error("[createAudit] items insert failed:", itemsErr);
    if (recsErr) console.error("[createAudit] recs insert failed:", recsErr);

    try {
      const summary = await generateAiSummary(auditInput, result);
      await supabaseAdmin
        .from("audits")
        .update({ ai_summary: summary.text, ai_summary_source: summary.source })
        .eq("id", auditRow.id);
    } catch (err) {
      console.error("[createAudit] summary failed:", err);
    }

    return { id: auditRow.id, slug: auditRow.slug };
  });

export const getAuditById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => ({ id: String(input.id) }))
  .handler(async ({ data }) => {
    return loadAuditByColumn("id", data.id);
  });

export const getReportBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug).slice(0, 80) }))
  .handler(async ({ data }) => {
    const full = await loadAuditByColumn("slug", data.slug);
    if (!full) return null;
    return {
      slug: full.slug,
      stage: full.stage,
      teamSize: full.teamSize,
      totalMonthlySpend: full.totalMonthlySpend,
      totalMonthlySavings: full.totalMonthlySavings,
      optimizationScore: full.optimizationScore,
      efficiencyScore: full.efficiencyScore,
      aiSummary: full.aiSummary,
      items: full.items,
      recommendations: full.recommendations,
      createdAt: full.createdAt,
    };
  });

const leadEmailLastSeen = new Map<string, number>();
const LEAD_THROTTLE_MS = 10_000;

export const captureLead = createServerFn({ method: "POST" })
  .inputValidator((input) => captureLeadSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website && data.website.length > 0) return { ok: true };

    const key = data.email.toLowerCase();
    const now = Date.now();
    if (now - (leadEmailLastSeen.get(key) ?? 0) < LEAD_THROTTLE_MS) return { ok: true };
    leadEmailLastSeen.set(key, now);

    const { error } = await supabaseAdmin.from("leads").insert({
      audit_id: data.auditId ?? null,
      email: key,
      company: data.company ?? null,
      role: data.role ?? null,
      team_size: data.teamSize ?? null,
    });
    if (error) {
      console.error("[captureLead] insert failed:", error);
      throw new Error("Failed to save lead");
    }
    return { ok: true };
  });

async function loadAuditByColumn(column: "id" | "slug", value: string) {
  const { data: audit, error } = await supabaseAdmin
    .from("audits")
    .select("*")
    .eq(column, value)
    .maybeSingle();

  if (error) {
    console.error("[loadAudit] query failed:", error);
    throw new Error("Failed to load audit");
  }
  if (!audit) return null;

  const [{ data: items }, { data: recs }] = await Promise.all([
    supabaseAdmin
      .from("audit_items")
      .select("*")
      .eq("audit_id", audit.id)
      .order("monthly_cost", { ascending: false }),
    supabaseAdmin
      .from("audit_recommendations")
      .select("*")
      .eq("audit_id", audit.id)
      .order("rank", { ascending: true }),
  ]);

  return {
    id: audit.id as string,
    slug: audit.slug as string,
    stage: audit.stage as string | null,
    teamSize: audit.team_size as number,
    useCase: audit.use_case as string | null,
    totalMonthlySpend: Number(audit.total_monthly_spend),
    totalMonthlySavings: Number(audit.total_monthly_savings),
    optimizationScore: audit.optimization_score as number,
    efficiencyScore: audit.efficiency_score as number,
    aiSummary: audit.ai_summary as string | null,
    aiSummarySource: audit.ai_summary_source as string | null,
    createdAt: audit.created_at as string,
    items: (items ?? []).map((r) => ({
      toolId: r.tool_id as string,
      plan: r.plan as string,
      seats: r.seats as number,
      monthlyCost: Number(r.monthly_cost),
      useCase: r.use_case as string | null,
    })),
    recommendations: (recs ?? []).map((r) => ({
      toolId: r.tool_id as string,
      type: r.rec_type as "consolidate" | "downgrade" | "switch" | "rightsize",
      impact: r.impact as "high" | "medium" | "low",
      title: r.title as string,
      detail: r.detail as string,
      reasoning: r.reasoning as string | null,
      monthlySavings: Number(r.monthly_savings),
      confidence: Number(r.confidence),
    })),
  };
}

export type FullAudit = NonNullable<Awaited<ReturnType<typeof loadAuditByColumn>>>;
export type PublicReport = NonNullable<Awaited<ReturnType<typeof getReportBySlug>>>;
