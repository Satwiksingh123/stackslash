import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { TOOLS, DEMO_AUDIT } from "@/lib/audit/demo";
import { ToolGlyph } from "./ToolGlyph";
import { Sparkles, TrendingDown, Check, Loader2, Zap } from "lucide-react";

type Phase = "connect" | "detect" | "analyze" | "score" | "insight";

const PHASES: { id: Phase; label: string; duration: number }[] = [
  { id: "connect", label: "Connecting to stack", duration: 1400 },
  { id: "detect", label: "Detecting AI tools", duration: 3600 },
  { id: "analyze", label: "Modeling pricing tiers", duration: 2200 },
  { id: "score", label: "Scoring waste vectors", duration: 2400 },
  { id: "insight", label: "Audit complete", duration: 3800 },
];

const LOG_LINES = [
  "→ initializing audit runtime · v2.14.0",
  "→ scanning vendor manifests (47 sources)",
  "→ identity bridge · 18 seats matched",
  "→ pricing oracle · 9 vendors current",
  "→ usage telemetry · 30d window",
  "→ overlap detector · cursor ∩ copilot = 100%",
  "→ tier modeler · 3 plan downgrades viable",
  "→ confidence: 97.4% · ready",
];

export function DashboardPreview() {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const phase = PHASES[phaseIdx].id;

  useEffect(() => {
    const t = setTimeout(() => {
      setPhaseIdx((p) => (p + 1) % PHASES.length);
      setTick((t) => t + 1);
    }, PHASES[phaseIdx].duration);
    return () => clearTimeout(t);
  }, [phaseIdx]);

  const [logIdx, setLogIdx] = useState(0);
  useEffect(() => {
    setLogIdx(0);
    const id = setInterval(() => setLogIdx((i) => Math.min(i + 1, LOG_LINES.length)), 420);
    return () => clearInterval(id);
  }, [tick]);

  const revealedTools =
    phase === "connect" ? 0 :
    phase === "detect" ? Math.min(DEMO_AUDIT.length, Math.floor((logIdx / LOG_LINES.length) * (DEMO_AUDIT.length + 2)) + 1) :
    DEMO_AUDIT.length;

  const showSavings = phase === "score" || phase === "insight";
  const totalSpend = DEMO_AUDIT.reduce((s, e) => s + e.monthlyCost, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div
        className="absolute -inset-8 -z-10 rounded-[2rem] opacity-60 blur-3xl"
        style={{ background: "var(--gradient-aurora)" }}
      />
      <div className="glass-strong rounded-3xl p-3 shadow-glow-soft noise overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
          </div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-widest">
            stackslash.app/audit/acme-inc · live
          </div>
          <div className="text-[10px] font-mono text-primary inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" /> RUNNING
          </div>
        </div>

        <PhaseRail phaseIdx={phaseIdx} />

        <div className="rounded-2xl bg-background/60 border border-hairline p-4 md:p-5 grid md:grid-cols-[1fr_1.05fr] gap-4 mt-2 min-h-[440px]">
          <div className="flex flex-col gap-4">
            <Terminal logIdx={logIdx} />
            <SavingsPanel show={showSavings} totalSpend={totalSpend} phase={phase} />
          </div>
          <StackPanel revealed={revealedTools} phase={phase} />
        </div>
      </div>
    </motion.div>
  );
}

function PhaseRail({ phaseIdx }: { phaseIdx: number }) {
  return (
    <div className="px-2 pt-2">
      <div className="flex items-center gap-2">
        {PHASES.map((p, i) => {
          const state = i < phaseIdx ? "done" : i === phaseIdx ? "active" : "todo";
          return (
            <div key={p.id} className="flex-1 flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  state === "active" ? "bg-primary animate-pulse-glow" :
                  state === "done" ? "bg-primary" : "bg-white/15"
                }`} />
                <span className={`text-[9px] font-mono uppercase tracking-widest truncate ${
                  state === "todo" ? "text-muted-foreground/50" : "text-foreground/80"
                }`}>
                  {p.label}
                </span>
              </div>
              <div className="flex-1 h-px bg-hairline relative overflow-hidden">
                {state !== "todo" && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: state === "done" ? "100%" : "70%" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Terminal({ logIdx }: { logIdx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logIdx]);
  return (
    <div className="rounded-xl border border-hairline bg-black/40 overflow-hidden">
      <div className="px-3 py-1.5 border-b border-hairline flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">audit.runtime · stdout</span>
        <span className="text-[9px] font-mono text-primary">●</span>
      </div>
      <div ref={ref} className="font-mono text-[10.5px] leading-[1.7] p-3 h-[148px] overflow-hidden scrollbar-thin">
        {LOG_LINES.slice(0, logIdx).map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="text-foreground/75"
          >
            <span className="text-primary/70 mr-1.5">{String(i + 1).padStart(2, "0")}</span>
            {l}
          </motion.div>
        ))}
        {logIdx < LOG_LINES.length && (
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1.5 h-3 bg-primary/80 align-middle ml-1"
          />
        )}
      </div>
    </div>
  );
}

function SavingsPanel({ show, totalSpend, phase }: { show: boolean; totalSpend: number; phase: Phase }) {
  const target = Math.round(totalSpend * 0.342);
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!show) { mv.set(0); setDisplay(0); return; }
    const ctrl = animate(mv, target, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => ctrl.stop();
  }, [show, target]);

  return (
    <div className="rounded-xl border border-hairline bg-surface/40 p-4 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!show ? (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            Awaiting analysis…
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Monthly waste detected</div>
            <div className="mt-1 flex items-end gap-2">
              <span className="font-display text-4xl text-gradient-mint tabular-nums">${display.toLocaleString()}</span>
              <span className="text-xs text-primary inline-flex items-center gap-1 mb-1.5">
                <TrendingDown className="w-3 h-3" /> 34.2%
              </span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
              of ${totalSpend.toLocaleString()}/mo · ${(target * 12).toLocaleString()}/yr opportunity
            </div>
            {phase === "insight" && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary">
                  <Sparkles className="w-3 h-3" /> AI insight
                </div>
                <p className="mt-1 text-[11px] text-foreground/80 leading-relaxed">
                  Cursor + Copilot overlap on 100% of seats. Consolidate to save{" "}
                  <span className="text-primary font-medium">$3,192/yr</span>.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StackPanel({ revealed, phase }: { revealed: number; phase: Phase }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface/40 p-3 relative overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Detected stack</span>
        <span className="text-[10px] font-mono text-primary tabular-nums">{revealed}/{DEMO_AUDIT.length}</span>
      </div>
      {phase === "detect" && (
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent pointer-events-none"
          initial={{ top: "8%" }}
          animate={{ top: "96%" }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="flex-1 space-y-1.5">
        {DEMO_AUDIT.map((e, i) => {
          const t = TOOLS.find((x) => x.id === e.toolId)!;
          const isVisible = i < revealed;
          const showSavings = (phase === "score" || phase === "insight") && isVisible;
          const saving = Math.round(e.monthlyCost * (i % 2 === 0 ? 0.32 : 0.18));
          return (
            <motion.div
              key={e.toolId}
              animate={{ opacity: isVisible ? 1 : 0.15, x: isVisible ? 0 : -6 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-colors ${
                isVisible ? "border-hairline bg-surface/60" : "border-hairline/50 bg-surface/20"
              }`}
            >
              <ToolGlyph tool={t} size={26} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate flex items-center gap-1.5">
                  {t.name}
                  {isVisible && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex">
                      <Check className="w-2.5 h-2.5 text-primary" />
                    </motion.span>
                  )}
                </div>
                <div className="text-[9px] text-muted-foreground font-mono truncate">{e.plan} · {e.seats} seats</div>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-xs font-mono">${e.monthlyCost}</div>
                <AnimatePresence>
                  {showSavings && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className="text-[9px] text-primary font-mono inline-flex items-center gap-0.5"
                    >
                      <TrendingDown className="w-2 h-2" />−${saving}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
      {phase === "insight" && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary inline-flex items-center gap-1.5">
            <Zap className="w-3 h-3" /> 3 recommendations ready
          </span>
          <span className="text-[10px] font-mono text-foreground/80">→ view report</span>
        </motion.div>
      )}
    </div>
  );
}
