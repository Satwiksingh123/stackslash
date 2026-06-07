import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Nav } from "@/components/app/Nav";
import { AmbientBackground } from "@/components/app/Background";
import { supabase } from "@/lib/supabase/client";

const searchSchema = z.object({ mode: z.enum(["login", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Stackslash" },
      { name: "description", content: "Sign in to save your AI spend audits and access your dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(initialMode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Check your email for a password reset link.");
        setForgot(false);
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
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
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong rounded-3xl p-8 shadow-glow-soft"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {forgot ? "Reset password" : mode === "signup" ? "Create account" : "Welcome back"}
            </div>
            <h1 className="font-display text-3xl mt-2 leading-tight">
              {forgot ? (
                <>Reset your <span className="text-gradient-mint italic">password</span></>
              ) : mode === "signup" ? (
                <>Save every <span className="text-gradient-mint italic">audit.</span></>
              ) : (
                <>Sign in to <span className="text-gradient-mint italic">Stackslash.</span></>
              )}
            </h1>

            {!forgot && (
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="mt-6 w-full rounded-full glass border border-hairline px-4 py-3 text-sm font-medium hover:bg-white/5 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            )}

            {!forgot && (
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-hairline" /></div>
                <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                  <span className="bg-background/0 px-3 text-muted-foreground">or with email</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && !forgot && (
                <Field label="Name">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-background/60 border border-hairline rounded-lg px-3 py-2.5 text-sm focus:border-primary outline-none transition"
                  />
                </Field>
              )}
              <Field label="Email" icon={<Mail className="w-4 h-4" />}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-background/60 border border-hairline rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-primary outline-none transition"
                />
              </Field>
              {!forgot && (
                <Field label="Password" icon={<Lock className="w-4 h-4" />}>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-background/60 border border-hairline rounded-lg pl-9 pr-3 py-2.5 text-sm focus:border-primary outline-none transition"
                  />
                </Field>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-primary text-primary-foreground font-medium px-5 py-3 shadow-glow-mint hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 inline-flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {forgot ? "Send reset link" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              {forgot ? (
                <button onClick={() => setForgot(false)} className="hover:text-foreground transition">
                  ← Back to sign in
                </button>
              ) : (
                <>
                  <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="hover:text-foreground transition">
                    {mode === "login" ? "Need an account? Sign up" : "Have an account? Sign in"}
                  </button>
                  {mode === "login" && (
                    <button onClick={() => setForgot(true)} className="hover:text-foreground transition">
                      Forgot password?
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition">← Back home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        {children}
      </div>
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 11v3.2h4.5c-.2 1.2-1.4 3.6-4.5 3.6-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.7 3.2 1.2l2.2-2.1C16 5.6 14.2 4.8 12 4.8 7.9 4.8 4.6 8.1 4.6 12.2S7.9 19.6 12 19.6c6.9 0 6.9-6.4 6.7-7.6H12z" />
    </svg>
  );
}
