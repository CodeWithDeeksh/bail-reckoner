import type { Case, EligibilityResult } from "../types";

export interface PathwayStats {
  name: string;
  count: number;
  percentage: number;
}

export interface OffenceStats {
  section: string;
  name: string;
  count: number;
}

export interface ThresholdStats {
  reachedCount: number;
  notReachedCount: number;
  averageDaysToThreshold: number | null;
}

export function calculatePathwayDistribution(
  results: Map<string, EligibilityResult | undefined>
): PathwayStats[] {
  const pathwayCounts: Record<string, number> = {};
  let total = 0;

  for (const result of results.values()) {
    if (!result) continue;
    for (const outcome of result.outcomes) {
      // Skip non-flagged pathways
      if (outcome.pathwayId === "pathway-insufficient-data" || outcome.pathwayId === "pathway-not-eligible") {
        continue;
      }
      pathwayCounts[outcome.headline] = (pathwayCounts[outcome.headline] || 0) + 1;
      total += 1;
    }
  }

  return Object.entries(pathwayCounts)
    .map(([name, count]) => ({
      name: name.replace("POTENTIAL ", "").replace("ENHANCED ", ""),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateOffenceDistribution(
  cases: Case[]
): OffenceStats[] {
  const offenceCounts: Record<string, { name: string; count: number }> = {};

  for (const c of cases) {
    for (const charge of c.charges) {
      const key = charge.section || "Unknown";
      offenceCounts[key] = {
        name: charge.offenceName || key,
        count: (offenceCounts[key]?.count || 0) + 1,
      };
    }
  }

  return Object.entries(offenceCounts)
    .map(([section, data]) => ({
      section,
      name: data.name,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function calculateThresholdStats(
  cases: Case[],
  results: Map<string, EligibilityResult | undefined>
): ThresholdStats {
  let reachedCount = 0;
  let notReachedCount = 0;
  const thresholdDays: number[] = [];

  for (const c of cases) {
    const result = results.get(c.caseId);
    if (!result?.undertrial) {
      notReachedCount += 1;
      continue;
    }

    if (result.undertrial.reached) {
      reachedCount += 1;
      thresholdDays.push(result.undertrial.overDays);
    } else {
      notReachedCount += 1;
      thresholdDays.push(result.undertrial.remainingDays);
    }
  }

  const averageDaysToThreshold = thresholdDays.length > 0 
    ? Math.round(thresholdDays.reduce((a, b) => a + b, 0) / thresholdDays.length) 
    : null;

  return {
    reachedCount,
    notReachedCount,
    averageDaysToThreshold,
  };
}
