import { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useReducedMotion, useInView } from "framer-motion";

interface Props {
  arrestDate: string;
  maxYears: number;
  isFirstTime: boolean;
  generalThresholdDays: number;
  firstTimeThresholdDays: number;
  applicableThresholdDays: number;
  custodyDays: number;
  reached: boolean;
  remainingDays: number;
  overDays: number;
}

export default function UndertrialTimeline({
  arrestDate,
  maxYears,
  isFirstTime,
  generalThresholdDays,
  firstTimeThresholdDays,
  applicableThresholdDays,
  custodyDays,
  reached,
  remainingDays,
  overDays,
}: Props) {
  const maxDays = Math.max(maxYears * 365, custodyDays, applicableThresholdDays) || 1;
  const pct = (d: number) => Math.min(100, (d / maxDays) * 100);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const prefersReducedMotion = useReducedMotion();
  const controls = useAnimation();
  const [markerPct, setMarkerPct] = useState(prefersReducedMotion ? pct(custodyDays) : 0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      setMarkerPct(pct(custodyDays));
      return;
    }
    controls.start({ width: `${pct(custodyDays)}%` });
    const start = performance.now();
    const duration = 1100;
    let raf: number;
    const step = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setMarkerPct(pct(custodyDays) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div ref={ref} className="py-2">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">
          Arrested {arrestDate}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">
          Max sentence {maxYears}y
        </span>
      </div>

      {/* track */}
      <div className="relative h-2 w-full rounded-none bg-navy-lighter">
        {/* progress fill */}
        <motion.div
          animate={controls}
          initial={{ width: 0 }}
          className="absolute inset-y-0 left-0 bg-cyan-dim"
          style={!prefersReducedMotion ? { width: `${markerPct}%` } : { width: `${pct(custodyDays)}%` }}
        />

        {/* general 1/2 threshold marker */}
        <div className="absolute top-0 h-2 w-px bg-gold" style={{ left: `${pct(generalThresholdDays)}%` }} title={`General threshold: ${(generalThresholdDays / 365).toFixed(2)}y`} />

        {/* first-time 1/3 threshold marker, only shown if distinct */}
        {firstTimeThresholdDays !== generalThresholdDays && (
          <div className="absolute top-0 h-2 w-px bg-gold-dim" style={{ left: `${pct(firstTimeThresholdDays)}%` }} title={`First-time offender threshold: ${(firstTimeThresholdDays / 365).toFixed(2)}y`} />
        )}

        {/* current position marker (animated) */}
        <motion.div
          className="absolute -top-1.5 h-5 w-px bg-cyan"
          style={!prefersReducedMotion ? { left: `${markerPct}%` } : { left: `${pct(custodyDays)}%` }}
        >
          <motion.span
            className="absolute -left-1 -top-1 block h-2.5 w-2.5 rounded-full bg-cyan"
            animate={reached ? { boxShadow: ["0 0 0 0 rgba(79,214,232,0.5)", "0 0 0 6px rgba(79,214,232,0)"] } : undefined}
            transition={reached ? { repeat: Infinity, duration: 1.6 } : undefined}
          />
        </motion.div>
      </div>

      {/* labels row */}
      <div className="relative mt-3 h-14 text-[11px]">
        <span className="absolute left-0 font-mono text-paper-dim">Arrest</span>

        <span
          className="absolute flex -translate-x-1/2 flex-col items-center font-mono text-gold"
          style={{ left: `${pct(generalThresholdDays)}%` }}
        >
          <span>▲</span>
          <span>1/2 general</span>
          <span>{(generalThresholdDays / 365).toFixed(2)}y</span>
        </span>

        {firstTimeThresholdDays !== generalThresholdDays && (
          <span
            className="absolute flex -translate-x-1/2 flex-col items-center font-mono text-gold-dim"
            style={{ left: `${pct(firstTimeThresholdDays)}%` }}
          >
            <span>▲</span>
            <span>1/3 first-time</span>
            <span>{(firstTimeThresholdDays / 365).toFixed(2)}y</span>
          </span>
        )}

        <span
          className="absolute flex -translate-x-1/2 flex-col items-center font-mono text-cyan"
          style={{ left: `${Math.min(92, pct(custodyDays))}%` }}
        >
          <span>▲</span>
          <span>today</span>
          <span>{(custodyDays / 365).toFixed(2)}y</span>
        </span>

        <span className="absolute right-0 font-mono text-paper-dim">{maxYears}y</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">
          Applicable threshold: {isFirstTime ? "1/3 (first-time offender)" : "1/2 (general)"} —{" "}
          {(applicableThresholdDays / 365).toFixed(2)}y ({applicableThresholdDays}d)
        </span>
        {reached ? (
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-good">
            <motion.span
              className="block h-1.5 w-1.5 rounded-full bg-good"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
            Threshold reached — {overDays} days past threshold
          </span>
        ) : (
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-warn">
            {remainingDays} days remaining until threshold
          </span>
        )}
      </div>
    </div>
  );
}
