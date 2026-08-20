import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Download } from "lucide-react";
import { useCaseStore } from "../store/caseStore";
import { useAuth } from "../store/authContext";
import { RESULT_CATEGORY_LABEL, type ResultCategory, type EligibilityResult } from "../types";
import { fetchLatestResult } from "../lib/api";
import { downloadCsv } from "../lib/csv";
import CountUp from "../components/CountUp";
import { calculatePathwayDistribution, calculateOffenceDistribution, calculateThresholdStats } from "../lib/analytics";

function AnimatedCount({ n, label, tone }: { n: number; label: string; tone?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="glass-panel p-6">
      <p className={`mono-num font-mono text-4xl ${tone ?? "text-paper"}`}>
        <CountUp value={n} />
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">{label}</p>
    </motion.div>
  );
}

const APPROACHING_WINDOW_DAYS = 45;

export default function Dashboard() {
  const { cases, loadingCases, analyze } = useCaseStore();
  const { session } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [results, setResults] = useState<Record<string, EligibilityResult>>({});
  const [loadingResults, setLoadingResults] = useState(true);

  // Every result shown on this dashboard comes from the backend's database
  // — either already computed (fetched), or computed now if a case has
  // never been run through the rule engine yet.
  useEffect(() => {
    if (loadingCases || cases.length === 0) return;
    let cancelled = false;
    async function loadAll() {
      setLoadingResults(true);
      const entries = await Promise.all(
        cases.map(async (c) => {
          const existing = await fetchLatestResult(c.caseId);
          if (existing.ok) return [c.caseId, existing.data] as const;
          if (!session?.accessToken) return null;
          const computed = await analyze(c, session.accessToken);
          return computed.ok ? ([c.caseId, computed.data] as const) : null;
        })
      );
      if (cancelled) return;
      setResults((prev) => {
        const next = { ...prev };
        for (const entry of entries) if (entry) next[entry[0]] = entry[1];
        return next;
      });
      setLoadingResults(false);
    }
    loadAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, loadingCases]);

  const rows = useMemo(() => cases.map((c) => ({ c, result: results[c.caseId] })), [cases, results]);

  const counts = useMemo(() => {
    const thresholdReached = rows.filter((r) => r.result?.undertrial?.reached).length;
    const approaching = rows.filter((r) => r.result?.undertrial && !r.result.undertrial.reached && r.result.undertrial.remainingDays <= APPROACHING_WINDOW_DAYS).length;
    const incomplete = rows.filter((r) => !r.result || r.result.primaryCategory === "INSUFFICIENT_DATA").length;
    const specialReview = rows.filter((r) => r.result?.primaryCategory === "ENHANCED_SPECIAL_STATUTE_REVIEW" || r.c.charges.some((ch) => ch.isSpecialStatute)).length;
    const multiCase = rows.filter((r) => r.c.status.multiplePendingCases).length;
    return { thresholdReached, approaching, incomplete, specialReview, multiCase };
  }, [rows]);

  const watchList = useMemo(
    () =>
      rows
        .filter((r) => r.result?.undertrial)
        .sort((a, b) => a.result!.undertrial!.remainingDays - b.result!.undertrial!.remainingDays)
        .slice(0, 6),
    [rows]
  );

  const filtered = rows.filter((r) => {
    if (statusFilter === "all") return true;
    return r.result?.primaryCategory === statusFilter;
  });

  const categories: ResultCategory[] = Object.keys(RESULT_CATEGORY_LABEL) as ResultCategory[];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Legal-Aid / Institutional View</p>
        <div className="flex items-center gap-2">
          {(loadingCases || loadingResults) && <Loader2 size={13} className="animate-spin text-paper-dim" />}
          <span className="flex items-center gap-1.5 border border-gold/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-gold">
            Demo Data • Synthetic Cases
          </span>
        </div>
      </div>
      <h1 className="mt-2 font-display text-4xl text-paper">Undertrial Watch</h1>
      <p className="mt-3 max-w-2xl text-sm text-paper-dim">
        A console for tracking custody-threshold exposure across a caseload — not a ranking of who
        should be released, only where a statutory clock is running. Every figure here was computed
        by the backend rule engine and read from the case database, not by this page.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <AnimatedCount n={counts.thresholdReached} label="Threshold reached" tone="text-good" />
        <AnimatedCount n={counts.approaching} label="Approaching threshold" tone="text-warn" />
        <AnimatedCount n={counts.incomplete} label="Incomplete data" tone="text-alert" />
        <AnimatedCount n={counts.specialReview} label="Special statute review" tone="text-gold" />
        <AnimatedCount n={counts.multiCase} label="Multiple-case review" tone="text-cyan" />
      </div>

      {/* ANALYTICS & INSIGHTS */}
      <div className="mt-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim">Rule Engine Insights</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Pathway Distribution */}
          <div className="glass-panel p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-cyan mb-4">Flagged Pathways</h3>
            <div className="space-y-3">
              {(() => {
                const pathwayStats = calculatePathwayDistribution(new Map(Object.entries(results)));
                if (pathwayStats.length === 0) {
                  return <p className="text-xs text-paper-dim">No flagged cases yet</p>;
                }
                return pathwayStats.map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between">
                    <span className="text-sm text-paper-dim">{stat.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 max-w-[120px] bg-navy-lighter">
                        <div className="h-full bg-cyan" style={{ width: `${stat.percentage}%` }} />
                      </div>
                      <span className="w-10 text-right font-mono text-xs text-paper">{stat.count}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Threshold Statistics */}
          <div className="glass-panel p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-gold mb-4">Custody Threshold Stats</h3>
            {(() => {
              const stats = calculateThresholdStats(cases, new Map(Object.entries(results)));
              return (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-paper-dim">Threshold Reached</p>
                    <p className="font-mono text-2xl text-good">{stats.reachedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-paper-dim">Days to Threshold (avg)</p>
                    <p className="font-mono text-2xl text-paper">{stats.averageDaysToThreshold ?? "—"}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Top Charges */}
        <div className="mt-6 glass-panel p-6">
          <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-paper-dim mb-4">Top Charges</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {(() => {
              const offenceStats = calculateOffenceDistribution(cases);
              if (offenceStats.length === 0) {
                return <p className="text-xs text-paper-dim col-span-3">No charges yet</p>;
              }
              return offenceStats.map((offence) => (
                <div key={offence.section} className="border-l-2 border-cyan-dim pl-3">
                  <p className="font-mono text-[10px] text-cyan">{offence.section}</p>
                  <p className="text-xs text-paper">{offence.name}</p>
                  <p className="text-xs text-paper-dim mt-1">{offence.count} case{offence.count !== 1 ? 's' : ''}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* WATCH LIST — cases nearest their threshold */}
      <div className="mt-14">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-paper-dim">Nearest to threshold</p>
        <div className="mt-4 space-y-3">
          {watchList.map(({ c, result }, i) => {
            const info = result!.undertrial!;
            const pct = Math.min(100, (info.custodyDaysNet / info.applicableThresholdDays) * 100);
            return (
              <motion.div
                key={c.caseId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="glass-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6"
              >
                <div className="w-32 shrink-0">
                  <Link to={`/results/${c.caseId}`} className="font-mono text-xs text-cyan hover:underline">
                    {c.caseId}
                  </Link>
                  <p className="text-xs text-paper-dim">{c.person.displayId}</p>
                </div>
                <div className="relative h-1.5 flex-1 bg-navy-lighter">
                  <div
                    className={`absolute inset-y-0 left-0 ${info.reached ? "bg-good" : "bg-cyan-dim"}`}
                    style={{ width: `${pct}%` }}
                  />
                  <div className="absolute -top-0.5 right-0 h-2.5 w-px bg-gold" />
                </div>
                <div className="w-40 shrink-0 text-right">
                  {info.reached ? (
                    <span className="font-mono text-[11px] uppercase text-good">Threshold reached</span>
                  ) : (
                    <span className="font-mono text-[11px] uppercase text-warn">{info.remainingDays}d remaining</span>
                  )}
                </div>
              </motion.div>
            );
          })}
          {watchList.length === 0 && !loadingResults && <p className="text-sm text-paper-dim">No cases with a computable §479 threshold yet.</p>}
        </div>
      </div>

      <div className="mt-14 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-paper-dim">Filter by status</span>
        <select className="border border-line-strong bg-navy px-3 py-2 text-xs text-paper outline-none focus:border-cyan" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {RESULT_CATEGORY_LABEL[cat]}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            downloadCsv(
              `undertrial-watch-${new Date().toISOString().slice(0, 10)}.csv`,
              ["Case ID", "Offence", "Rule", "Status", "Time to threshold (days)", "Priority"],
              filtered.map(({ c, result }) => {
                const primaryOutcome = result?.outcomes.find((o) => o.category === result.primaryCategory) ?? result?.outcomes[0];
                const undertrial = result?.undertrial;
                return [
                  c.caseId,
                  c.charges[0]?.section || "",
                  primaryOutcome?.legalSource.section || "",
                  result ? RESULT_CATEGORY_LABEL[result.primaryCategory] : "Not analyzed",
                  undertrial ? (undertrial.reached ? `+${undertrial.overDays}` : `${undertrial.remainingDays}`) : "",
                  primaryOutcome?.priority || "",
                ];
              })
            )
          }
          className="ml-auto flex items-center gap-1.5 border border-line-strong px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-paper-dim hover:border-cyan hover:text-cyan"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-[11px] uppercase tracking-[0.08em] text-paper-dim">
              <th className="px-4 py-3">Case</th>
              <th className="px-4 py-3">Offence</th>
              <th className="px-4 py-3">Rule</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Time to threshold</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ c, result }) => {
              const primaryOutcome = result?.outcomes.find((o) => o.category === result.primaryCategory) ?? result?.outcomes[0];
              const undertrial = result?.undertrial;
              return (
                <tr key={c.caseId} className="border-b border-line last:border-b-0 hover:bg-navy-light/50">
                  <td className="px-4 py-3 font-mono text-xs text-cyan">{c.caseId}</td>
                  <td className="px-4 py-3 text-paper">{c.charges[0]?.section || "—"}</td>
                  <td className="px-4 py-3 text-paper-dim">{primaryOutcome?.legalSource.section ?? "—"}</td>
                  <td className="px-4 py-3">
                    {result ? (
                      <span className="font-mono text-[11px] text-paper-dim">{RESULT_CATEGORY_LABEL[result.primaryCategory]}</span>
                    ) : (
                      <span className="font-mono text-[11px] text-paper-dim/60">{loadingResults ? "Analyzing…" : "Not analyzed"}</span>
                    )}
                  </td>
                  <td className="mono-num px-4 py-3 text-paper-dim">
                    {undertrial ? (undertrial.reached ? `+${undertrial.overDays}d` : `${undertrial.remainingDays}d`) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {primaryOutcome && (
                      <span className={`font-mono text-[11px] uppercase ${primaryOutcome.priority === "high" ? "text-alert" : primaryOutcome.priority === "medium" ? "text-warn" : "text-paper-dim"}`}>
                        {primaryOutcome.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {result ? (
                      <Link to={`/results/${c.caseId}`} className="font-mono text-[11px] uppercase text-cyan hover:underline">
                        Review →
                      </Link>
                    ) : (
                      <Link to="/analyze" className="font-mono text-[11px] uppercase text-paper-dim hover:text-cyan">
                        Analyze →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
