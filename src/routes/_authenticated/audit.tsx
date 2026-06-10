import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Plus, Sparkles, X, Loader2 } from "lucide-react";
import { Nav } from "@/components/app/Nav";
import { AmbientBackground } from "@/components/app/Background";
import { TOOLS, type Tool } from "@/lib/audit/demo";
import { ToolGlyph } from "@/components/app/ToolGlyph";
import { createAudit } from "@/lib/audit/actions.server";
import { toast } from "sonner";

const DRAFT_KEY = "stackslash:audit-draft:v1";

type Entry = { tool: Tool; plan: string; seats: number; spend: number; useCase: string };

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Run your AI spend audit — Stackslash" },
      { name: "description", content: "A 60-second guided audit of your team's AI stack. Find savings instantly." },
    ],
  }),
  component: AuditPage,
});

const STEPS = ["Select stack", "Configure plans", "Context", "Review"] as const;

function AuditPage() {
  const navigate = useNavigate();
  const submitAudit = useServerFn(createAudit);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set(["chatgpt", "cursor", "claude", "copilot"]));
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [teamSize, setTeamSize] = useState(15);
  const [stage, setStage] = useState("Seed");
  const [scanning, setScanning] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ── Draft persistence ──
  // Audits are anonymous, but we still don't want a refresh to wipe state.
  // localStorage is the right tool: small, synchronous, no backend round-trip.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as {
          selected?: string[];
          entries?: Record<string, Omit<Entry, "tool"> & { toolId: string }>;
          teamSize?: number;
          stage?: string;
        };
        if (d.selected?.length) setSelected(new Set(d.selected));
        if (d.entries) {
          const restored: Record<string, Entry> = {};
          for (const [id, e] of Object.entries(d.entries)) {
            const tool = TOOLS.find((t) => t.id === id);
            if (tool) restored[id] = { tool, plan: e.plan, seats: e.seats, spend: e.spend, useCase: e.useCase };
          }
          setEntries(restored);
        }
        if (typeof d.teamSize === "number") setTeamSize(d.teamSize);
        if (typeof d.stage === "string") setStage(d.stage);
      }
    } catch { /* ignore corrupt drafts */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const serializable = Object.fromEntries(
      Object.entries(entries).map(([id, e]) => [id, { plan: e.plan, seats: e.seats, spend: e.spend, useCase: e.useCase }]),
    );
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ selected: [...selected], entries: serializable, teamSize, stage }),
    );
  }, [hydrated, selected, entries, teamSize, stage]);

  const selectedTools = useMemo(() => TOOLS.filter((t) => selected.has(t.id)), [selected]);

  const toggleTool = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateEntry = useCallback((toolId: string, patch: Partial<Entry>) => {
    const tool = TOOLS.find((t) => t.id === toolId)!;
    setEntries((e) => ({
      ...e,
      [toolId]: {
        tool,
        plan: e[toolId]?.plan ?? tool.plans[0].name,
        seats: e[toolId]?.seats ?? 5,
        spend: e[toolId]?.spend ?? tool.plans[0].price * 5,
        useCase: e[toolId]?.useCase ?? "",
        ...patch,
      },
    }));
  }, []);

  const totalSpend = Object.values(entries)
    .filter((e) => selected.has(e.tool.id))
    .reduce((s, e) => s + (e.spend || 0), 0);

  const next = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setScanning(true);
    try {
      const items = selectedTools.map((t) => {
        const e = entries[t.id];
        const plan = e?.plan ?? t.plans[0].name;
        const seats = e?.seats ?? 5;
        const spend = e?.spend ?? t.plans[0].price * seats;
        return {
          toolId: t.id,
          plan,
          seats,
          monthlyCost: Number(spend) || 0,
          useCase: e?.useCase || undefined,
        };
      });
      const result = await submitAudit({
        data: { teamSize, stage, items },
      });
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
      navigate({ to: "/results", search: { id: result.id } });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't run the audit. Please try again.");
      setScanning(false);
    }
  };

  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />

      <main className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Header / progress */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Audit · Step {step + 1} of {STEPS.length}
              </div>
              <h1 className="font-display text-4xl md:text-5xl mt-2 leading-[1.05]">
                {step === 0 && <>What's in your <span className="text-gradient-mint italic">AI stack?</span></>}
                {step === 1 && <>Configure each <span className="text-gradient-mint italic">tool.</span></>}
                {step === 2 && <>Tell us about <span className="text-gradient-mint italic">your team.</span></>}
                {step === 3 && <>Ready to <span className="text-gradient-mint italic">scan.</span></>}
              </h1>
            </div>
            <div className="hidden md:flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${i <= step ? "bg-primary w-10" : "bg-white/10 w-6"}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* Step content */}
            <div className="glass rounded-2xl p-6 md:p-8 shadow-glow-soft min-h-[480px] relative overflow-hidden">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="0"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="text-muted-foreground">Pick everything your team is paying for. We support seat-based plans and usage-based APIs.</p>
                    <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {TOOLS.map((t) => {
                        const on = selected.has(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleTool(t.id)}
                            className={`group relative text-left rounded-xl border p-4 transition overflow-hidden ${
                              on
                                ? "border-primary/60 bg-primary/5 shadow-glow-mint"
                                : "border-hairline bg-surface/40 hover:border-white/20"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <ToolGlyph tool={t} />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{t.name}</div>
                                <div className="text-[11px] text-muted-foreground font-mono">{t.vendor} · {t.category}</div>
                              </div>
                              <div className={`w-5 h-5 rounded-md grid place-items-center border ${on ? "bg-primary border-primary text-primary-foreground" : "border-hairline"}`}>
                                {on && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="1"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-3"
                  >
                    <p className="text-muted-foreground">Set the plan and seats. We'll pull live pricing for usage-based APIs.</p>
                    {selectedTools.map((t) => {
                      const e = entries[t.id] ?? {
                        tool: t,
                        plan: t.plans[0].name,
                        seats: 5,
                        spend: t.plans[0].price * 5,
                        useCase: "",
                      };
                      const isApi = t.category === "API";
                      return (
                        <div key={t.id} className="rounded-xl border border-hairline bg-surface/40 p-4 grid md:grid-cols-[auto_1fr_140px_140px_120px] gap-3 items-center">
                          <div className="flex items-center gap-3">
                            <ToolGlyph tool={t} />
                            <div>
                              <div className="font-medium">{t.name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{t.vendor}</div>
                            </div>
                          </div>
                          <div>
                            <Label>Plan</Label>
                            <select
                              value={e.plan}
                              onChange={(ev) => {
                                const p = t.plans.find((p) => p.name === ev.target.value)!;
                                updateEntry(t.id, { plan: p.name, spend: p.price * e.seats });
                              }}
                              className="mt-1 w-full bg-background/60 border border-hairline rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition"
                            >
                              {t.plans.map((p) => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>{isApi ? "—" : "Seats"}</Label>
                            <input
                              type="number"
                              min={1}
                              disabled={isApi}
                              value={e.seats}
                              onChange={(ev) => {
                                const seats = Math.max(1, +ev.target.value || 1);
                                const p = t.plans.find((p) => p.name === e.plan)!;
                                updateEntry(t.id, { seats, spend: p.price * seats });
                              }}
                              className="mt-1 w-full bg-background/60 border border-hairline rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition disabled:opacity-40"
                            />
                          </div>
                          <div>
                            <Label>$/month</Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                              <input
                                type="number"
                                value={e.spend}
                                onChange={(ev) => updateEntry(t.id, { spend: +ev.target.value || 0 })}
                                className="w-full bg-background/60 border border-hairline rounded-lg pl-7 pr-3 py-2 text-sm font-mono focus:border-primary outline-none transition"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => toggleTool(t.id)}
                            className="text-muted-foreground hover:text-destructive transition rounded-lg p-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => setStep(0)}
                      className="w-full rounded-xl border border-dashed border-hairline py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add another tool
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="2"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                  >
                    <p className="text-muted-foreground">We use this to benchmark against teams like yours.</p>

                    <div>
                      <Label>Team size — {teamSize} engineers</Label>
                      <input
                        type="range"
                        min={1} max={200} value={teamSize}
                        onChange={(e) => setTeamSize(+e.target.value)}
                        className="mt-2 w-full accent-[oklch(0.86_0.18_155)]"
                      />
                    </div>

                    <div>
                      <Label>Company stage</Label>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {["Pre-seed", "Seed", "Series A", "Series B+"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setStage(s)}
                            className={`rounded-lg border px-3 py-2.5 text-sm transition ${
                              stage === s
                                ? "border-primary/60 bg-primary/10 text-foreground"
                                : "border-hairline bg-surface/40 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Primary use case (optional)</Label>
                      <textarea
                        rows={3}
                        placeholder="e.g. We're a B2B SaaS team using AI for code, support automation, and content."
                        className="mt-2 w-full bg-background/60 border border-hairline rounded-lg px-3 py-2.5 text-sm focus:border-primary outline-none transition resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                  >
                    <p className="text-muted-foreground">Review before we scan.</p>
                    <div className="mt-5 rounded-xl border border-hairline divide-y divide-white/5">
                      {selectedTools.map((t) => {
                        const e = entries[t.id] ?? { plan: t.plans[0].name, seats: 5, spend: t.plans[0].price * 5 };
                        return (
                          <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                            <ToolGlyph tool={t} size={28} />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{t.name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{e.plan} · {e.seats} seats</div>
                            </div>
                            <div className="font-mono text-sm">${(e.spend || 0).toLocaleString()}/mo</div>
                          </div>
                        );
                      })}
                    </div>

                    {scanning && (
                      <div className="mt-6 relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-5">
                        <motion.div
                          className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                          animate={{ x: ["-20%", "120%"] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="relative flex items-center gap-3 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="font-mono uppercase tracking-widest text-primary text-xs">Scanning</span>
                          <span className="text-muted-foreground">Modeling usage against {TOOLS.length} vendor pricing tiers…</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky summary */}
            <div className="lg:sticky lg:top-32">
              <div className="glass-strong rounded-2xl p-6 shadow-glow-soft">
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Live summary
                </div>
                <div className="mt-3 font-display text-4xl text-gradient-mint">
                  ${totalSpend.toLocaleString()}
                  <span className="text-base text-muted-foreground font-sans"> /mo</span>
                </div>
                <div className="text-xs text-muted-foreground">across {selected.size} tools</div>

                <div className="mt-5 space-y-1.5">
                  {selectedTools.length === 0 && (
                    <div className="text-xs text-muted-foreground italic">No tools selected yet.</div>
                  )}
                  {selectedTools.map((t) => {
                    const e = entries[t.id];
                    return (
                      <div key={t.id} className="flex items-center gap-2 text-xs">
                        <ToolGlyph tool={t} size={20} />
                        <span className="flex-1 truncate">{t.name}</span>
                        <span className="font-mono text-muted-foreground">${(e?.spend ?? 0).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-start gap-2 text-xs leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground/80">
                    Based on teams your size, expect <span className="text-primary font-medium">~$1,840/mo</span> in savings.
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0 || scanning}
                  className="flex-1 rounded-full glass px-4 py-3 text-sm hover:bg-white/5 transition disabled:opacity-40 inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={next}
                  disabled={selected.size === 0 || scanning}
                  className="flex-[1.4] rounded-full bg-primary text-primary-foreground font-medium px-5 py-3 shadow-glow-mint hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 inline-flex items-center justify-center gap-2"
                >
                  {step === 3 ? (scanning ? "Scanning…" : "Run audit") : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{children}</div>;
}
