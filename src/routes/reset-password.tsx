import { useState, useEffect, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/app/Nav";
import { AmbientBackground } from "@/components/app/Background";
import { supabase } from "@/lib/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset password — Stackslash" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery token from the URL hash and emits a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />
      <main className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-strong rounded-3xl p-8 shadow-glow-soft"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Reset password</div>
            <h1 className="font-display text-3xl mt-2 leading-tight">Set a new <span className="text-gradient-mint italic">password.</span></h1>

            {!ready ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Waiting for your reset link to validate… If nothing happens, request a new link from the sign-in page.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-3">
                <label className="block">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">New password</div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-background/60 border border-hairline rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-primary outline-none transition"
                    />
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary text-primary-foreground font-medium px-5 py-3 shadow-glow-mint hover:scale-[1.02] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Update password
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
