import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitCommitHorizontal, Loader2 } from "lucide-react";
import { fetchRuleEngineInfo, type RuleEngineInfo } from "../lib/api";
import { RULE_VERSION_HISTORY } from "../lib/ruleVersionHistory";

export default function RuleHistory() {
  const [info, setInfo] = useState<RuleEngineInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRuleEngineInfo().then((i) => {
      setInfo(i);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 lg:px-10">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Rule Engine</p>
      <h1 className="mt-2 font-display text-4xl text-paper">Version History</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper-dim">
        Every result in this prototype is tagged with the exact rule-engine version that produced
        it (visible on every Bail Assessment screen). This page shows what that version currently
        checks, and how the engine has changed over time — audit-trail thinking applied to the
        rules themselves, not just individual case decisions.
      </p>

      <section className="glass-panel mt-10 p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Currently live</p>
        {loading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-paper-dim">
            <Loader2 size={14} className="animate-spin" /> Fetching live version from backend…
          </div>
        ) : info ? (
          <>
            <p className="mono-num mt-2 font-display text-2xl text-cyan">{info.version}</p>
            <p className="mt-1 text-sm text-paper-dim">{info.totalPathwaysChecked} configured pathways checked on every analysis:</p>
            <ul className="mt-3 space-y-1.5 text-sm text-paper">
              {info.pathways.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-cyan">—</span> {p}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-3 text-sm text-warn">Backend unreachable — live version info unavailable right now.</p>
        )}
      </section>

      <div className="mt-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">Changelog</p>
        <div className="relative mt-6 space-y-8 pl-6">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-line-strong" />
          {RULE_VERSION_HISTORY.map((entry, i) => (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="relative"
            >
              <span
                className="absolute -left-6 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2"
                style={{ borderColor: i === 0 ? "var(--color-cyan)" : "var(--color-gold-dim)", background: "var(--color-ink)" }}
              >
                {i === 0 && <GitCommitHorizontal size={8} className="text-cyan" />}
              </span>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-sm text-paper">{entry.version}</span>
                <span className="font-mono text-[11px] text-paper-dim">{entry.date}</span>
                {i === 0 && <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-cyan">current</span>}
              </div>
              <p className="mt-1 text-sm text-paper-dim">{entry.summary}</p>
              <ul className="mt-2 space-y-1 text-xs text-paper-dim">
                {entry.changes.map((change, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="text-gold">·</span> {change}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
