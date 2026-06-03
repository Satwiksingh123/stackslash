import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Command, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoAsset from "@/assets/stackslash-logo.png.asset.json";

export function Nav() {
  const { user } = useAuth();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 px-4 pt-4"
    >
      <div className="mx-auto max-w-6xl">
        <div className="glass rounded-full px-3 py-2 flex items-center justify-between shadow-glow-soft">
          <Link to="/" className="flex items-center gap-2 pl-2">
            <Logo />
            <span className="font-display text-lg tracking-tight">Stackslash</span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-muted-foreground border border-hairline rounded-full px-1.5 py-0.5 ml-1">
              Beta
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <NavLink to="/audit">Audit</NavLink>
            <NavLink to="/results">Results</NavLink>
            <NavLink to="/report/acme">Report</NavLink>
            <NavLink to="/about">Why Stackslash</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground border border-hairline rounded-md px-2 py-1">
              <Command className="w-3 h-3" /> K
            </div>
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:opacity-90 transition shadow-glow-mint inline-flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:inline-block text-sm text-muted-foreground hover:text-foreground transition px-3 py-2">
                  Sign in
                </Link>
                <Link
                  to="/audit"
                  className="rounded-full bg-primary text-primary-foreground text-sm font-medium px-4 py-2 hover:opacity-90 transition shadow-glow-mint"
                >
                  Run free audit
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-full hover:text-foreground hover:bg-white/5 transition"
      activeProps={{ className: "text-foreground bg-white/5" }}
    >
      {children}
    </Link>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="grid place-items-center" style={{ width: size, height: size }}>
      <img
        src={logoAsset.url}
        alt="Stackslash logo"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
