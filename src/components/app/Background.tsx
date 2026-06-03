import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-bg" />
      <motion.div
        className="glow-orb"
        style={{ width: 600, height: 600, left: "-10%", top: "-10%", background: "oklch(0.86 0.18 155 / 0.25)" }}
        animate={{ x: [0, 60, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="glow-orb"
        style={{ width: 700, height: 700, right: "-15%", top: "10%", background: "oklch(0.72 0.18 260 / 0.22)" }}
        animate={{ x: [0, -40, 20, 0], y: [0, 40, 10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="glow-orb"
        style={{ width: 500, height: 500, left: "30%", top: "60%", background: "oklch(0.78 0.16 200 / 0.18)" }}
        animate={{ x: [0, 30, -30, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}
