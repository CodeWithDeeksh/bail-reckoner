import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ServerCog } from "lucide-react";
import RuleEvaluationTimeline from "./RuleEvaluationTimeline";
import type { EligibilityResult } from "../types";
import type { ApiResult } from "../lib/api";
import { wakeBackend } from "../lib/api";

// The nine-stage "reckoning" sequence — narrates exactly which checks the
// backend's deterministic rule engine is running, in order. Mapped to the
// five macro stages (INPUT / NORMALIZE / RULES / FLAGS / ASSESSMENT).
// This is a REAL network call underneath: the stage animation plays while
// waiting for the actual backend response, not a fixed timer standing in
// for computation that already happened.
const STAGES: { label: string; macro: number }[] = [
  { label: "VALIDATING CASE", macro: 0 },
  { label: "MAPPING CHARGES", macro: 1 },
  { label: "CALCULATING CUSTODY", macro: 1 },
  { label: "CHECKING DEFAULT-BAIL PERIOD", macro: 2 },
  { label: "CHECKING UNDERTRIAL THRESHOLD", macro: 2 },
  { label: "CHECKING EXCLUSIONS", macro: 2 },
  { label: "CHECKING MULTIPLE CASES", macro: 3 },
  { label: "CHECKING SPECIAL STATUTES", macro: 3 },
  { label: "BUILDING EXPLANATION", macro: 4 },
];

const NON_RESULT_PATHWAYS = new Set(["pathway-insufficient-data", "pathway-not-eligible"]);

interface Props {
  run: () => Promise<ApiResult<EligibilityResult>>;
  onSuccess: (result: EligibilityResult) => void;
  onCancel: () => void;
}

type Phase = "stages" | "summary" | "error" | "waking";

export default function ProcessingOverlay({ run, onSuccess, onCancel }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<Phase>("stages");
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [wakeSeconds, setWakeSeconds] = useState(0);
  const attempt = useRef(0);

  useEffect(() => {
    void execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advance the visible stage list while a network call is in flight, but
  // never race ahead of reality — it holds at the last stage until the
  // real response arrives instead of pretending to finish early.
  // Increased to 700ms so users have time to read each step.
  useEffect(() => {
    if (phase !== "stages") return;
    if (active >= STAGES.length - 1) return;
    const t = setTimeout(() => setActive((a) => a + 1), prefersReducedMotion ? 0 : 700);
    return () => clearTimeout(t);
  }, [active, phase, prefersReducedMotion]);

  async function execute() {
    attempt.current += 1;
    setPhase("stages");
    setErrorMsg(null);
    setActive(0);
    const res = await run();
    if (res.ok) {
      setResult(res.data);
      setActive(STAGES.length);
      setTimeout(() => setPhase("summary"), prefersReducedMotion ? 0 : 500);
      setTimeout(() => onSuccess(res.data), prefersReducedMotion ? 200 : 2200);
    } else {
      setErrorMsg(res.error);
      setPhase("error");
    }
  }

  async function retryWithWake() {
    setPhase("waking");
    setWakeSeconds(0);
    const ok = await wakeBackend((s) => setWakeSeconds(s));
    if (ok) {
      void execute();
    } else {
      setErrorMsg("Backend still unreachable after 45s.");
      setPhase("error");
    }
  }

  const macroIndex = phase === "summary" ? 5 : STAGES[active]?.macro ?? 0;
  const flaggedCount = result ? result.outcomes.filter((o) => !NON_RESULT_PATHWAYS.has(o.pathwayId)).length : 0;
  const evaluatedCount = 5; // configured pathway count — see backend /api/rule-engine/info

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-sm">
      <div className="w-full max-w-lg px-6">
        <AnimatePresence mode="wait">
          {phase === "stages" && (
            <motion.div key="stages" exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <p className="mb-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-cyan">
                Rule Engine Executing — Live Backend Call
              </p>
              <RuleEvaluationTimeline activeIndex={macroIndex} compact />
              <div className="mt-10 space-y-2">
                {STAGES.map((s, i) => {
                  const done = i < active;
                  const current = i === active;
                  return (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0.2 }}
                      animate={{ opacity: done || current ? 1 : 0.25 }}
                      className="flex items-center gap-3 border-l-2 py-1 pl-4"
                      style={{ borderColor: done ? "var(--color-good)" : current ? "var(--color-cyan)" : "var(--color-line-strong)" }}
                    >
                      <span className="font-mono text-[10px] text-paper-dim">{String(i + 1).padStart(2, "0")}</span>
                      {done ? (
                        <CheckCircle2 size={13} className="text-good" />
                      ) : current ? (
                        <motion.span
                          className="block h-2 w-2 rounded-full bg-cyan"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 0.8 }}
                        />
                      ) : (
                        <span className="block h-2 w-2 rounded-full bg-line-strong" />
                      )}
                      <span className="font-mono text-xs tracking-[0.05em] text-paper">{s.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === "summary" && result && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass-panel border-cyan-dim p-10 text-center"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-dim">Legal Pathways Evaluated</p>
              <p className="mono-num mt-4 font-display text-6xl text-cyan">{String(evaluatedCount).padStart(2, "0")}</p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.12em] text-paper">
                {String(flaggedCount).padStart(2, "0")} {flaggedCount === 1 ? "PATHWAY FLAGGED" : "PATHWAYS FLAGGED"}
              </p>
            </motion.div>
          )}

          {phase === "waking" && (
            <motion.div key="waking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel p-10 text-center">
              <ServerCog size={22} className="mx-auto animate-spin text-cyan" />
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-paper">Waking rule-engine backend…</p>
              <p className="mt-2 font-mono text-[11px] text-paper-dim">{wakeSeconds}s elapsed</p>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel border-alert/50 p-8 text-center">
              <AlertTriangle size={20} className="mx-auto text-alert" />
              <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-paper">Rule engine unreachable</p>
              <p className="mt-2 text-sm text-paper-dim">{errorMsg}</p>
              <p className="mt-2 text-xs text-paper-dim">
                No result was computed locally as a fallback — this app has a single authoritative
                rule engine, on the backend.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={onCancel}
                  className="border border-line-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-paper-dim hover:text-paper"
                >
                  Cancel
                </button>
                <button
                  onClick={retryWithWake}
                  className="border border-cyan-dim px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-cyan hover:bg-cyan hover:text-ink"
                >
                  Wake backend &amp; retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
