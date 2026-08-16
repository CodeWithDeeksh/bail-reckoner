import { motion } from "framer-motion";
import { Check } from "lucide-react";

export const RULE_STAGES = ["INPUT", "NORMALIZE", "RULES", "FLAGS", "ASSESSMENT"] as const;

export type RuleStage = (typeof RULE_STAGES)[number];

const STAGE_HINT: Record<RuleStage, string> = {
  INPUT: "Structured case facts",
  NORMALIZE: "Matched to statute registry",
  RULES: "Deterministic pathway checks",
  FLAGS: "Pathways & conditions detected",
  ASSESSMENT: "Explainable result compiled",
};

/**
 * activeIndex: -1 = none active, 0..4 = stage in progress, >=5 = all complete.
 */
export default function RuleEvaluationTimeline({
  activeIndex,
  compact = false,
}: {
  activeIndex: number;
  compact?: boolean;
}) {
  return (
    <div className="flex items-stretch">
      {RULE_STAGES.map((stage, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <div key={stage} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <motion.div
                animate={{
                  borderColor: done || current ? "var(--color-cyan)" : "var(--color-line-strong)",
                  backgroundColor: done ? "var(--color-cyan)" : "transparent",
                }}
                transition={{ duration: 0.3 }}
                className="flex h-7 w-7 items-center justify-center rounded-full border"
              >
                {done ? (
                  <Check size={13} className="text-ink" strokeWidth={2.5} />
                ) : (
                  <motion.span
                    className="block h-2 w-2 rounded-full"
                    style={{ background: current ? "var(--color-cyan)" : "var(--color-line-strong)" }}
                    animate={current ? { opacity: [1, 0.3, 1] } : undefined}
                    transition={current ? { repeat: Infinity, duration: 0.9 } : undefined}
                  />
                )}
              </motion.div>
              <div>
                <p className={`font-mono text-[11px] uppercase tracking-[0.1em] ${done || current ? "text-paper" : "text-paper-dim"}`}>{stage}</p>
                {!compact && <p className="mt-0.5 text-[10px] text-paper-dim">{STAGE_HINT[stage]}</p>}
              </div>
            </div>
            {i < RULE_STAGES.length - 1 && (
              <div className="relative -mt-6 h-px flex-1 self-start overflow-hidden bg-line-strong sm:mx-1">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-cyan"
                  initial={{ width: "0%" }}
                  animate={{ width: i < activeIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
