import { useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell, Pie, PieChart } from "recharts";
import { ArrowDownRight, Brain, Download, Share2, Sparkles, TrendingDown, Zap, Loader2 } from "lucide-react";
import { z } from "zod";
import { Nav } from "@/components/app/Nav";
import { Footer } from "@/components/app/Footer";
import { AmbientBackground } from "@/components/app/Background";
import { AnimatedCounter } from "@/components/app/AnimatedCounter";
import { ToolGlyph } from "@/components/app/ToolGlyph";
import { TOOLS } from "@/lib/audit/demo";
import { getAuditById, type FullAudit } from "@/lib/audit/actions.server";

const searchSchema = z.object({ id: z.string().uuid().optional() });

export const Route = createFileRoute("/_authenticated/results")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Your AI spend audit — Stackslash" },
      { name: "description", content: "See exactly where your team is overpaying for AI tools and how to fix it." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { id } = Route.useSearch();
  const fetchAudit = useServerFn(getAuditById);
  const { data: audit, isLoading, error } = useQuery({
    queryKey: ["audit", id],
    queryFn: () => fetchAudit({ data: { id: id! } }),
    enabled: !!id,
    staleTime: 60_000,
  });

  if (!id) {
    return (
      <EmptyState
        title="No audit selected"
        body="Run a free audit to see your results here."
      />
    );
  }
  if (isLoading) return <LoadingState />;
  if (error || !audit) {
    return (
      <EmptyState
        title="Couldn't load this audit"
        body="It may have been removed or the link is invalid."
      />
    );
  }

  return <ResultsView audit={audit} />;
}

function ResultsView({ audit }: { audit: FullAudit }) {
  const annualSavings = Math.round(audit.totalMonthlySavings * 12);
  const annualSpend = Math.round(audit.totalMonthlySpend * 12);
  const optimizedAnnual = annualSpend - annualSavings;
  const pct = audit.optimizationScore;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/report/${audit.slug}` : `/report/${audit.slug}`;

  // Build a 6-month synthetic trend from the audit totals — actual is flat
  // (current spend), optimized ramps from actual down to the engine's target.
  const baseSpend = Math.round(audit.totalMonthlySpend);
  const targetSpend = Math.max(0, baseSpend - Math.round(audit.totalMonthlySavings));
  const trend = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((m, i) => ({
    m,
    spend: baseSpend,
    optimized: i < 2 ? baseSpend : Math.round(baseSpend - ((baseSpend - targetSpend) * (i - 1)) / 4),
  }));

  const toolMeta = useCallback((toolId: string) => TOOLS.find((t) => t.id === toolId), []);

  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />

      <main className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                Audit complete · {audit.stage ?? "Team"} · {new Date(audit.createdAt).toLocaleDateString()}
              </div>
              <h1 className="font-display text-4xl md:text-5xl mt-2 leading-[1.05]">
                Your AI spend audit.
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(shareUrl)}
                className="rounded-full glass px-4 py-2.5 text-sm hover:bg-white/5 transition inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Copy link
              </button>
              <Link
                to="/report/$slug"
                params={{ slug: audit.slug }}
                className="rounded-full bg-primary text-primary-foreground font-medium px-4 py-2.5 shadow-glow-mint hover:scale-[1.02] transition-transform inline-flex items-center gap-2 text-sm"
              >
                <Share2 className="w-4 h-4" /> Share report
              </Link>
            </div>
          </motion.div>

          {/* Hero savings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative glass-strong rounded-3xl p-8 md:p-12 shadow-glow-soft overflow-hidden"
          >
            <div className="absolute -inset-1 -z-10 rounded-3xl opacity-50 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="relative grid md:grid-cols-[1.5fr_1fr] gap-10 items-end">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Annualized savings opportunity
                </div>
                <div className="mt-3 flex items-end gap-4 flex-wrap">
                  <span className="font-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] text-gradient-aurora">
                    $<AnimatedCounter to={annualSavings} duration={2.2} />
                  </span>
                  <span className="text-primary inline-flex items-center gap-1 mb-4 font-mono text-sm bg-primary/10 border border-primary/30 px-2.5 py-1 rounded-full">
                    <TrendingDown className="w-3.5 h-3.5" /> −{pct}%
                  </span>
                </div>
                <p className="mt-3 text-muted-foreground max-w-lg">
                  You're spending <span className="font-mono text-foreground">${annualSpend.toLocaleString()}</span>/yr on AI tools.
                  Stackslash identified <span className="text-primary font-medium">{audit.recommendations.length} optimizations</span> across your stack —
                  no productivity loss, no team disruption.
                </p>
              </div>
              <div className="space-y-3">
                <MiniMetric label="Current monthly" value={`$${Math.round(audit.totalMonthlySpend).toLocaleString()}`} tone="muted" />
                <MiniMetric label="Optimized monthly" value={`$${Math.round(audit.totalMonthlySpend - audit.totalMonthlySavings).toLocaleString()}`} tone="mint" />
                <MiniMetric label="Optimized annual" value={`$${optimizedAnnual.toLocaleString()}`} tone="muted" />
              </div>
            </div>
          </motion.div>

          {/* AI summary */}
          {audit.aiSummary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="glass rounded-3xl p-6 md:p-8 shadow-glow-soft relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl grid place-items-center bg-primary/10 border border-primary/30 text-primary shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
                    {audit.aiSummarySource === "ai" ? "AI-generated summary" : "Audit summary"}
                  </div>
                  <p className="mt-2 font-display text-2xl md:text-3xl leading-snug">
                    {audit.aiSummary}
                  </p>
                  <div className="mt-3 text-xs font-mono text-muted-foreground inline-flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Stackslash Intelligence · v0.4
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Trend chart + breakdown */}
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="glass rounded-3xl p-6 shadow-glow-soft"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">6-month projection</div>
                  <div className="font-display text-2xl mt-1">Actual vs optimized spend</div>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <Legend color="oklch(0.66 0.018 250)" label="Actual" />
                  <Legend color="oklch(0.86 0.18 155)" label="Optimized" />
                </div>
              </div>
              <div className="h-72 mt-6 -mx-2">
                <ResponsiveContainer>
                  <AreaChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.66 0.018 250)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="oklch(0.66 0.018 250)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gOpt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.86 0.18 155)" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="oklch(0.86 0.18 155)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                    <XAxis dataKey="m" stroke="oklch(0.66 0.018 250)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.66 0.018 250)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.17 0.014 250)",
                        border: "1px solid oklch(1 0 0 / 0.1)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: any) => `$${Number(v).toLocaleString()}`}
                    />
                    <Area type="monotone" dataKey="spend" stroke="oklch(0.66 0.018 250)" strokeWidth={2} fill="url(#gActual)" />
                    <Area type="monotone" dataKey="optimized" stroke="oklch(0.86 0.18 155)" strokeWidth={2.5} fill="url(#gOpt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="glass rounded-3xl p-6 shadow-glow-soft"
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Spend distribution</div>
              <div className="font-display text-2xl mt-1">By tool</div>
              <div className="h-52 mt-4 relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={audit.items}
                      dataKey="monthlyCost"
                      nameKey="toolId"
                      innerRadius={55}
                      outerRadius={85}
                      strokeWidth={0}
                      paddingAngle={2}
                    >
                      {audit.items.map((e) => {
                        const t = toolMeta(e.toolId);
                        return <Cell key={e.toolId} fill={t?.color ?? "#888"} fillOpacity={0.85} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.17 0.014 250)",
                        border: "1px solid oklch(1 0 0 / 0.1)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: any, _n: any, p: any) => {
                        const t = toolMeta(p.payload.toolId);
                        return [`$${Number(v).toLocaleString()}/mo`, t?.name ?? p.payload.toolId];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Monthly</div>
                    <div className="font-display text-2xl">${Math.round(audit.totalMonthlySpend).toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {audit.items.slice(0, 4).map((e) => {
                  const t = toolMeta(e.toolId);
                  return (
                    <div key={e.toolId} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ background: t?.color ?? "#888" }} />
                      <span className="flex-1 truncate">{t?.name ?? e.toolId}</span>
                      <span className="font-mono text-muted-foreground">${Math.round(e.monthlyCost)}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Recommendations</div>
                <h2 className="font-display text-3xl mt-1">Ranked by impact</h2>
              </div>
              <div className="text-xs font-mono text-muted-foreground hidden sm:block">
                {audit.recommendations.length} actions · ${Math.round(audit.totalMonthlySavings).toLocaleString()}/mo total
              </div>
            </div>

            {audit.recommendations.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-muted-foreground">
                Your stack is already lean — no material savings detected.
              </div>
            ) : (
              <div className="space-y-3">
                {audit.recommendations.map((r, i) => {
                  const t = toolMeta(r.toolId);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className="group relative glass rounded-2xl p-5 hover:border-primary/40 transition overflow-hidden"
                    >
                      <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
                        <div className="flex items-center gap-3">
                          {t && <ToolGlyph tool={t} />}
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                              {r.type}
                            </div>
                            <div className="text-xs text-muted-foreground">{t?.name ?? r.toolId}</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-display text-lg leading-snug">{r.title}</div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.detail}</p>
                          {r.reasoning && (
                            <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed italic border-l border-primary/30 pl-3">
                              {r.reasoning}
                            </p>
                          )}
                          <div className="mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            Confidence {Math.round(r.confidence * 100)}%
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={`inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full mb-1 ${
                            r.impact === "high" ? "bg-primary/15 text-primary" :
                            r.impact === "medium" ? "bg-electric/15 text-[oklch(0.78_0.16_260)]" :
                            "bg-white/5 text-muted-foreground"
                          }`}>
                            {r.impact} impact
                          </div>
                          <div className="font-display text-3xl text-gradient-mint">
                            ${Math.round(r.monthlySavings)}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            per month
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Roi callout */}
          <div className="grid sm:grid-cols-3 gap-3">
            <RoiCard icon={ArrowDownRight} label="Monthly savings" value={`$${Math.round(audit.totalMonthlySavings).toLocaleString()}`} sub={`from ${audit.recommendations.length} actions`} />
            <RoiCard icon={TrendingDown} label="Annual savings" value={`$${annualSavings.toLocaleString()}`} sub={`${pct}% reduction`} />
            <RoiCard icon={Zap} label="Efficiency score" value={`${audit.efficiencyScore}/100`} sub="Lower = more savings left" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function MiniMetric({ label, value, tone }: { label: string; value: string; tone: "mint" | "muted" }) {
  return (
    <div className="rounded-xl border border-hairline bg-background/50 p-4 backdrop-blur">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl mt-1 ${tone === "mint" ? "text-gradient-mint" : ""}`}>{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} /> {label}
    </span>
  );
}

function RoiCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-glow-soft">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="mt-3 font-display text-3xl">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />
      <main className="pt-40 px-6 grid place-items-center">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Loading your audit…
        </div>
      </main>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />
      <main className="pt-40 px-6">
        <div className="mx-auto max-w-md text-center">
          <h1 className="font-display text-3xl">{title}</h1>
          <p className="mt-3 text-muted-foreground">{body}</p>
          <Link
            to="/audit"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium px-5 py-3 shadow-glow-mint"
          >
            Run a free audit
          </Link>
        </div>
      </main>
    </div>
  );
}
