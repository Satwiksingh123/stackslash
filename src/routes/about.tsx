import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Lock, Sparkles, Zap } from "lucide-react";
import { Nav } from "@/components/app/Nav";
import { Footer } from "@/components/app/Footer";
import { AmbientBackground } from "@/components/app/Background";
import { SectionLabel } from "@/components/app/Section";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Why Stackslash exists — Stackslash" },
      { name: "description", content: "Teams are spending billions on AI tools they don't fully use. Stackslash is the financial brain for the AI stack." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />

      <main className="pt-40 pb-24 px-6">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <SectionLabel>Manifesto · v0.4</SectionLabel>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[1] tracking-tight">
              The AI stack is the <span className="text-gradient-aurora italic">new cloud bill.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="prose prose-invert mt-10 max-w-none text-foreground/85 font-display text-xl md:text-2xl leading-[1.5] space-y-6"
          >
            <p>
              Every team building software in 2026 is paying for at least <span className="text-gradient-mint">seven AI tools</span>.
              ChatGPT. Claude. Cursor. Copilot. v0. Windsurf. Two API bills.
            </p>
            <p>
              Most of it is paid by autopilot. Plans were chosen 18 months ago, by one person, when the team was half the size.
              Half the seats don't log in. APIs route frontier models for tasks a small model would crush.
            </p>
            <p className="text-foreground">
              Stackslash is the financial brain for the AI stack. We watch what your team actually uses, model it against every vendor's pricing,
              and tell you — in dollars — what to do about it.
            </p>
            <p>
              No sales call. No procurement deck. Just the truth, in 60 seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16 grid sm:grid-cols-3 gap-3"
          >
            <Pillar icon={Eye} title="Visibility" body="Every tool, plan, seat, and API call in one place." />
            <Pillar icon={Sparkles} title="Intelligence" body="A private LLM that knows every AI vendor's pricing." />
            <Pillar icon={Zap} title="Action" body="Specific recommendations with dollar impact." />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-16 glass-strong rounded-3xl p-8 md:p-10 shadow-glow-soft text-center relative overflow-hidden"
          >
            <div className="absolute -inset-1 -z-10 rounded-3xl opacity-50 blur-3xl" style={{ background: "var(--gradient-aurora)" }} />
            <Lock className="w-5 h-5 text-primary mx-auto" />
            <p className="mt-4 font-display text-2xl md:text-3xl leading-snug max-w-xl mx-auto">
              We are read-only by design. Stackslash never writes to your accounts, never holds your billing data, never resells your usage.
            </p>
            <Link
              to="/audit"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium px-6 py-3.5 shadow-glow-mint hover:scale-[1.02] transition-transform"
            >
              Audit your stack <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Pillar({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="w-9 h-9 rounded-lg grid place-items-center bg-primary/10 border border-primary/20 text-primary">
        <Icon className="w-4 h-4" />
      </div>
      <div className="mt-4 font-display text-xl">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{body}</div>
    </div>
  );
}
