import { Link } from "@tanstack/react-router";
import { Logo } from "./Nav";

export function Footer() {
  return (
    <footer className="relative border-t border-hairline mt-32">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="mx-auto max-w-6xl px-6 py-16 relative">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <Logo />
              <span className="font-display text-lg">Stackslash</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The spend intelligence layer for modern AI stacks. Built for teams that ship.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              All systems nominal
            </div>
          </div>
          <FooterCol title="Product" links={[["Audit", "/audit"], ["Results", "/results"], ["Public report", "/report/acme"]]} />
          <FooterCol title="Company" links={[["Why Stackslash", "/about"], ["Manifesto", "/about"], ["Changelog", "/about"]]} />
          <FooterCol title="Resources" links={[["AI Pricing Index", "/about"], ["Benchmarks", "/about"], ["Security", "/about"]]} />
        </div>
        <div className="mt-16 pt-6 border-t border-hairline flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Stackslash Labs, Inc.</div>
          <div className="font-mono">Built for teams that hate waste.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground font-mono">{title}</div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="hover:text-foreground transition text-foreground/80">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
