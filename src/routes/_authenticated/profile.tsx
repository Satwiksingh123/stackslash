import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Nav } from "@/components/app/Nav";
import { AmbientBackground } from "@/components/app/Background";
import { getMyProfile, updateMyProfile } from "@/lib/user/actions.server";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Stackslash" }] }),
  component: ProfilePage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center p-8 text-center">
      <p className="text-sm text-muted-foreground">Couldn't load profile: {error.message}</p>
    </div>
  ),
});

function ProfilePage() {
  const fetchProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
  });

  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setCompany(profile.company ?? "");
      setRole(profile.role ?? "");
    }
  }, [profile]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile({
        data: {
          display_name: displayName || null,
          company: company || null,
          role: role || null,
        },
      });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative noise min-h-screen">
      <AmbientBackground />
      <Nav />

      <main className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-6 rounded-full glass px-4 py-2 text-sm font-medium text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition shadow-glow-soft"
          >
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-strong rounded-3xl p-8 shadow-glow-soft"
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Profile</div>
            <h1 className="font-display text-3xl mt-2 leading-tight">Your <span className="text-gradient-mint italic">account.</span></h1>

            {isLoading ? (
              <div className="mt-8 grid place-items-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <Field label="Email">
                  <input
                    type="email"
                    disabled
                    value={profile?.email ?? ""}
                    className="w-full bg-background/40 border border-hairline rounded-lg px-3 py-2.5 text-sm text-muted-foreground"
                  />
                </Field>
                <Field label="Display name">
                  <input
                    type="text"
                    autoFocus
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-background/60 border border-hairline rounded-lg px-3 py-2.5 text-sm focus:border-primary outline-none transition"
                  />
                </Field>
                <Field label="Company">
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Inc."
                    className="w-full bg-background/60 border border-hairline rounded-lg px-3 py-2.5 text-sm focus:border-primary outline-none transition"
                  />
                </Field>
                <Field label="Role">
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="CTO, Eng lead, …"
                    className="w-full bg-background/60 border border-hairline rounded-lg px-3 py-2.5 text-sm focus:border-primary outline-none transition"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-full bg-primary text-primary-foreground font-medium px-5 py-3 shadow-glow-mint hover:scale-[1.02] transition-transform disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save changes
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
