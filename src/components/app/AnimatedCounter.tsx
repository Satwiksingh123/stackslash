import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

export function AnimatedCounter({
  to,
  duration = 1.8,
  prefix = "",
  suffix = "",
  format = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 }),
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(v),
    });
    return () => ctrl.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{format(val)}{suffix}
    </span>
  );
}
