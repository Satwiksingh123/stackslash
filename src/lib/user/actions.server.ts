import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/supabase/middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (!data) {
      const email = (claims as { email?: string })?.email ?? null;
      const { data: inserted, error: insertErr } = await supabase
        .from("profiles")
        .insert({ user_id: userId, email, display_name: email?.split("@")[0] ?? null })
        .select("*")
        .single();
      if (insertErr) throw new Error(insertErr.message);
      return inserted;
    }
    return data;
  });

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(120).nullable().optional(),
  company: z.string().max(120).nullable().optional(),
  role: z.string().max(80).nullable().optional(),
  avatar_url: z.string().url().max(500).nullable().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateProfileSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("profiles")
      .update(data)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getMyAudits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("audits")
      .select("id, slug, stage, team_size, total_monthly_spend, total_monthly_savings, optimization_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((a) => ({
      id: a.id as string,
      slug: a.slug as string,
      stage: a.stage as string | null,
      teamSize: a.team_size as number,
      totalMonthlySpend: Number(a.total_monthly_spend),
      totalMonthlySavings: Number(a.total_monthly_savings),
      optimizationScore: a.optimization_score as number,
      createdAt: a.created_at as string,
    }));
  });
