import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, TrendingDown, Shield, Zap, FileBarChart, Brain, Share2 } from "lucide-react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { AmbientBackground } from "./Background";
import { DashboardPreview } from "./DashboardPreview";
import { SectionHeading, SectionLabel } from "./Section";
import { AnimatedCounter } from "./AnimatedCounter";
import { TOOLS } from "@/lib/audit/demo";
import { ToolGlyph } from "./ToolGlyph";

export function Landing() {
  return (
    <div className="relative noise">
      <AmbientBackground />
      <Nav />

      {/* HERO */}
      <section className="relative pt-40 pb-28 px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <SectionLabel>Now scanning · 1,284 AI stacks audited this month</SectionLabel>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 font-display text-center text-[clamp(2.6rem,7vw,5.6rem)] leading-[0.98] tracking-tight"
          >
            Your AI stack is{" "}
            <span className="relative inline-block">
              <span className="text-gradient-aurora italic">bleeding</span>
              <motion.svg
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 w-full h-[0.18em] overflow-visible"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
              >
                <motion.path
                  d="M2 8 Q 50 2, 100 6 T 198 4"
                  fill="none"
                  stroke="oklch(0.86 0.18 155)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.9, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.svg>
            </span>
            <br />
            <span className="text-gradient-aurora italic">money.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 text-center max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed"
          >
            Stackslash audits every AI tool your team pays for — ChatGPT, Claude, Cursor, Copilot, API spend —
            and surfaces the exact dollars you're wasting. In 60 seconds. Without a sales call.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center"
          >
            <Link
              to="/audit"
              className="group relative inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium px-6 py-3.5 shadow-glow-mint hover:scale-[1.02] transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              Run a free audit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link
              to="/report/acme"
              className="inline-flex items-center gap-2 rounded-full glass px-6 py-3.5 text-sm hover:bg-white/5 transition"
            >
              See a live report
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground font-mono"
          >
            <span className="inline-flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" /> SOC 2 in progress</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary" /> Avg. report in 47s</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 flex justify-center"
          >
            <div className="glass rounded-2xl px-5 py-3 flex items-center gap-4 shadow-glow-soft">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Savings unlocked this month
              </span>
              <span className="font-display text-2xl text-gradient-mint">
                $<AnimatedCounter to={4218904} duration={2.4} />
              </span>
            </div>
          </motion.div>

          <div className="mt-24">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="px-6 py-20 border-t border-hairline">
        <div className="mx-auto max-w-6xl">
          <div className="text-center text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Engineering teams optimizing their stack with Stackslash
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-6 items-center justify-items-center">
            {["Linear", "Vercel", "Ramp", "Notion", "Retool", "Replicate"].map((n) => (
              <div key={n} className="font-display text-xl text-muted-foreground/70 hover:text-foreground transition">
                {n}
              </div>
            ))}
          </div>
          <div className="mt-16 grid md:grid-cols-4 gap-px bg-hairline rounded-2xl overflow-hidden border border-hairline">
            <TrustStat value={1284} label="Stacks audited" />
            <TrustStat value={42} prefix="$" suffix="M+" label="Savings discovered" />
            <TrustStat value={9} label="AI vendors covered" />
            <TrustStat value={34} suffix="%" label="Avg. spend reduction" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="How it works"
            title={<>Three steps. <span className="text-gradient-mint italic">Zero meetings.</span></>}
            subtitle="Built for engineers and founders who want answers, not a sales process."
          />
          <div className="mt-16 grid md:grid-cols-3 gap-5">
            {[
              { n: "01", title: "Connect your AI stack", body: "Drop in the tools your team uses — seats, plans, API spend. Or import from a CSV.", icon: Zap },
              { n: "02", title: "Analyze in real time", body: "Stackslash models your usage against pricing tiers from every major AI vendor.", icon: Brain },
              { n: "03", title: "Unlock savings", body: "Get a ranked list of consolidations, downgrades, and switches with exact dollar impact.", icon: TrendingDown },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-2xl border border-hairline bg-surface/40 p-6 hover:border-primary/40 transition overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition duration-700 blur-3xl" style={{ background: "var(--gradient-mint)" }} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground tracking-widest">{s.n}</span>
                    <s.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="mt-8 font-display text-2xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOOL COVERAGE */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl glass-strong rounded-3xl p-8 md:p-12 shadow-glow-soft overflow-hidden relative">
          <div className="absolute -inset-1 -z-10 rounded-3xl opacity-30 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 items-center">
            <div>
              <SectionLabel>Coverage</SectionLabel>
              <h3 className="mt-5 font-display text-4xl leading-[1.05]">
                Every AI tool your team is <span className="text-gradient-mint italic">already using.</span>
              </h3>
              <p className="mt-4 text-muted-foreground">
                We track pricing, plan changes, and usage signals across the entire AI vendor landscape — so you don't have to.
              </p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {TOOLS.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-hairline bg-surface/40 p-3 hover:border-primary/40 hover:bg-surface transition flex items-center gap-2.5"
                >
                  <ToolGlyph tool={t} size={32} />
                  <div className="min-w-0">
                    <div className="text-sm truncate">{t.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{t.vendor}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Features"
            title={<>The intelligence layer for AI spend.</>}
            subtitle="Built like a financial system. Feels like a product you actually want to use."
          />
          <div className="mt-14 grid md:grid-cols-6 gap-4">
            <FeatureCard className="md:col-span-3" icon={Brain} title="AI-generated audit summaries" body="Plain-English explanations of what to cut, what to keep, and why. Built on a private LLM." />
            <FeatureCard className="md:col-span-3" icon={TrendingDown} title="Plan optimization engine" body="Models your seat count, usage, and feature needs against every tier — finds the exact right plan." />
            <FeatureCard className="md:col-span-2" icon={FileBarChart} title="Usage benchmarks" body="Compare your AI spend against teams of your size and stage." />
            <FeatureCard className="md:col-span-2" icon={Share2} title="Public shareable reports" body="One-click reports your CFO can actually read." />
            <FeatureCard className="md:col-span-2" icon={Shield} title="Read-only by design" body="We never write to your accounts. Connect via CSV, manual, or read-only API keys." />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-5xl relative">
          <div className="absolute -inset-10 -z-10 rounded-[3rem] opacity-40 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />
          <div className="glass-strong rounded-[2rem] px-8 py-20 md:py-28 text-center shadow-glow-soft noise overflow-hidden relative">
            <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
            <div className="relative">
              <SectionLabel>Free, forever, for the first audit</SectionLabel>
              <h2 className="mt-6 font-display text-5xl md:text-7xl leading-[1] tracking-tight">
                Find out what you're <br />
                <span className="text-gradient-aurora italic">actually paying for.</span>
              </h2>
              <p className="mt-6 max-w-xl mx-auto text-muted-foreground">
                The average team finds $2,840/mo in waste in their first audit. Yours starts in 60 seconds.
              </p>
              <Link
                to="/audit"
                className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium px-7 py-4 shadow-glow-mint hover:scale-[1.02] transition-transform"
              >
                <Sparkles className="w-4 h-4" /> Start your free audit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function TrustStat({ value, label, prefix = "", suffix = "" }: { value: number; label: string; prefix?: string; suffix?: string }) {
  return (
    <div className="bg-background/80 p-8 text-center">
      <div className="font-display text-4xl text-gradient-mint">
        <AnimatedCounter to={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="mt-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon, title, body, className = "",
}: { icon: any; title: string; body: string; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-2xl border border-hairline bg-surface/40 p-6 hover:border-primary/40 transition overflow-hidden ${className}`}
    >
      <div className="w-9 h-9 rounded-lg grid place-items-center bg-primary/10 border border-primary/20 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="mt-5 font-display text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </motion.div>
  );
}
