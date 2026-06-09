import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, LogOut, Plus, Settings, TrendingDown, User as UserIcon } from "lucide-react";
import { Nav } from "@/components/app/Nav";
import { AmbientBackground } from "@/components/app/Background";
import { getMyAudits, getMyProfile } from "@/lib/user/actions.server";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Stackslash" }] }),
  component: DashboardPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <p className="text-sm text-muted-foreground">Couldn't load your dashboard: {error.message}</p>
    </div>
  ),
});

function DashboardPage() {
  const navigate = useNavigate();
  const fetchAudits = useServerFn(getMyAudits);
  const fetchProfile = useServerFn(getMyProfile);

  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const { data: audits, isLoading } = useQuery({ queryKey: ["my-audits"], queryFn: () => fetchAudits() });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  const totalSavings = (audits ?? []).reduce((s, a) => s + a.totalMonthlySavings, 0);
  const totalSpend = (audits ?? []).reduce((s, a) => s + a.totalMonthlySpend, 0);

  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />

      <main className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Dashboard
              </div>
              <h1 className="font-display text-4xl md:text-5xl mt-2 leading-[1.05]">
                Welcome back{profile?.display_name ? `, ${profile.display_name}` : ""}.
              </h1>
            </div>
            <div className="flex gap-2">
              <Link
                to="/profile"
                className="rounded-full glass px-4 py-2.5 text-sm hover:bg-white/5 transition inline-flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full glass px-4 py-2.5 text-sm hover:bg-white/5 transition inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
              <Link
                to="/audit"
                className="rounded-full bg-primary text-primary-foreground font-medium px-4 py-2.5 shadow-glow-mint hover:scale-[1.02] transition-transform inline-flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" /> New audit
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Stat label="Audits saved" value={audits?.length ?? 0} />
            <Stat label="Tracked monthly spend" value={`$${Math.round(totalSpend).toLocaleString()}`} />
            <Stat label="Identified monthly savings" value={`$${Math.round(totalSavings).toLocaleString()}`} accent />
          </div>

          {/* Audit list */}
          <div>
            <div className="flex items-end justify-between mb-4">
              <h2 className="font-display text-2xl">Your audits</h2>
              <div className="text-xs font-mono text-muted-foreground">{audits?.length ?? 0} total</div>
            </div>

            {isLoading ? (
              <div className="glass rounded-2xl p-10 grid place-items-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !audits || audits.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <UserIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-40" />
                <p className="text-muted-foreground">No audits yet. Run your first one to see it here.</p>
                <Link
                  to="/audit"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground font-medium px-5 py-2.5 text-sm shadow-glow-mint hover:scale-[1.02] transition-transform"
                >
                  <Plus className="w-4 h-4" /> Start your first audit
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {audits.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className="glass rounded-2xl p-5 hover:border-primary/40 transition grid md:grid-cols-[1fr_auto_auto_auto] gap-4 items-center"
                  >
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        {a.stage ?? "Team"} · {a.teamSize} engineers · {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                      <div className="font-display text-xl mt-1">Audit · {a.slug}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Monthly</div>
                      <div className="font-mono">${Math.round(a.totalMonthlySpend).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Savings</div>
                      <div className="font-mono text-primary inline-flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        ${Math.round(a.totalMonthlySavings).toLocaleString()}
                      </div>
                    </div>
                    <Link
                      to="/results"
                      search={{ id: a.id }}
                      className="rounded-full bg-primary/10 border border-primary/30 text-primary px-4 py-2 text-sm inline-flex items-center gap-2 hover:bg-primary/20 transition"
                    >
                      Open <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-display text-3xl mt-2 ${accent ? "text-gradient-mint" : ""}`}>{value}</div>
    </div>
  );
}
