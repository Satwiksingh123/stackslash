import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Nav, Logo } from "@/components/app/Nav";
import { Footer } from "@/components/app/Footer";
import { AmbientBackground } from "@/components/app/Background";
import { AnimatedCounter } from "@/components/app/AnimatedCounter";
import { ToolGlyph } from "@/components/app/ToolGlyph";
import { TOOLS } from "@/lib/audit/demo";
import { getReportBySlug } from "@/lib/audit/actions.server";

export const Route = createFileRoute("/report/$slug")({
  // Loader is safe here: getReportBySlug uses supabaseAdmin (no auth required).
  loader: async ({ params }) => {
    const report = await getReportBySlug({ data: { slug: params.slug } });
    if (!report) throw notFound();
    return report;
  },
  head: ({ loaderData, params }) => {
    const report = loaderData;
    const annualSavings = report ? Math.round(report.totalMonthlySavings * 12) : 0;
    const title = report
      ? `${report.stage ?? "This team"} can save $${annualSavings.toLocaleString()}/yr — Stackslash`
      : `${params.slug} · Stackslash report`;
    const desc = report
      ? `Stackslash audited their AI stack and found ${report.recommendations.length} ways to save $${annualSavings.toLocaleString()}/yr.`
      : "A public Stackslash AI-spend audit report.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />
      <main className="pt-40 px-6 text-center">
        <h1 className="font-display text-4xl">Report not found</h1>
        <p className="mt-3 text-muted-foreground">This link may have expired.</p>
        <Link to="/audit" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium px-5 py-3 shadow-glow-mint">
          Run your own audit
        </Link>
      </main>
    </div>
  ),
  errorComponent: () => (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />
      <main className="pt-40 px-6 text-center">
        <h1 className="font-display text-4xl">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">Please try again in a moment.</p>
      </main>
    </div>
  ),
  component: ReportPage,
});

function ReportPage() {
  const report = Route.useLoaderData();
  const { slug } = Route.useParams();
  const annualSavings = Math.round(report.totalMonthlySavings * 12);
  const pct = report.optimizationScore;
  const toolMeta = (id: string) => TOOLS.find((t) => t.id === id);

  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />

      <main className="pt-32 pb-16 px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground border border-hairline rounded-full px-3 py-1 bg-surface/40">
              <Logo size={14} /> Public Stackslash report · {slug}
            </div>
            <h1 className="mt-6 font-display text-5xl md:text-6xl leading-[1] tracking-tight">
              {report.stage ?? "This team"} can save
            </h1>
            <div className="mt-3 font-display text-[clamp(3.5rem,10vw,7rem)] leading-[0.9] text-gradient-aurora">
              $<AnimatedCounter to={annualSavings} duration={2.4} />
            </div>
            <div className="mt-3 text-muted-foreground">per year on their AI stack · <span className="text-primary">−{pct}%</span></div>
          </motion.div>

          {report.aiSummary && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-10 text-center font-display text-xl md:text-2xl leading-snug text-foreground/90 max-w-2xl mx-auto"
            >
              {report.aiSummary}
            </motion.p>
          )}

          {/* Quick stats */}
          <div className="mt-12 grid grid-cols-3 gap-3">
            <StatCard label="AI tools audited" value={`${report.items.length}`} />
            <StatCard label="Monthly spend" value={`$${Math.round(report.totalMonthlySpend).toLocaleString()}`} />
            <StatCard label="Actions found" value={`${report.recommendations.length}`} />
          </div>

          {/* Stack snapshot */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-10 glass-strong rounded-2xl p-6 shadow-glow-soft"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">The stack</div>
            <div className="mt-4 grid sm:grid-cols-2 gap-2">
              {report.items.map((e: typeof report.items[number]) => {
                const t = toolMeta(e.toolId);
                if (!t) return null;
                return (
                  <div key={e.toolId} className="flex items-center gap-3 rounded-xl border border-hairline bg-surface/40 px-3 py-2.5">
                    <ToolGlyph tool={t} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{e.plan} · {e.seats} seats</div>
                    </div>
                    <div className="font-mono text-xs">${Math.round(e.monthlyCost)}</div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Top wins */}
          {report.recommendations.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-6 glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-primary">
                <Sparkles className="w-3 h-3" /> Top wins
              </div>
              <div className="mt-4 space-y-3">
                {report.recommendations.slice(0, 3).map((r: typeof report.recommendations[number], i: number) => (
                  <div key={i} className="flex items-start gap-3 border-l-2 border-primary/40 pl-4 py-1">
                    <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{r.detail}</div>
                    </div>
                    <div className="font-display text-xl text-gradient-mint shrink-0">
                      ${Math.round(r.monthlySavings)}<span className="text-[10px] text-muted-foreground font-sans font-normal">/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="text-sm text-muted-foreground">Want a report like this for your team?</div>
            <Link
              to="/audit"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium px-6 py-3.5 shadow-glow-mint hover:scale-[1.02] transition-transform"
            >
              Run your free audit <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="mt-3 text-[11px] font-mono text-muted-foreground">60 seconds · no signup</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl">{value}</div>
    </div>
  );
}
