import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground border border-hairline rounded-full px-3 py-1 bg-surface/40">
      <span className="w-1 h-1 rounded-full bg-primary" />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}
    >
      {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
      <h2 className="font-display text-4xl md:text-5xl mt-5 leading-[1.05]">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">{subtitle}</p>}
    </motion.div>
  );
}
