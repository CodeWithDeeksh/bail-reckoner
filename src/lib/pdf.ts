import type { Case, EligibilityResult } from "../types";
import { RESULT_CATEGORY_LABEL } from "../types";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Opens a new tab with a print-optimized (light, serif, black-on-white)
 * rendering of the Action Pack and triggers the browser's print dialog,
 * where "Save as PDF" is a native destination in every modern browser.
 * No PDF library dependency — this is the most robust cross-browser
 * approach and adds nothing to the app's bundle size.
 */
export function printActionPack(c: Case, result: EligibilityResult) {
  const primary = result.outcomes.find((o) => o.category === result.primaryCategory) ?? result.outcomes[0];

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Action Pack — ${esc(c.caseId)}</title>
<style>
  @page { margin: 22mm 18mm; }
  body { font-family: Georgia, "Times New Roman", serif; color: #111; line-height: 1.55; font-size: 12pt; max-width: 720px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 20pt; margin: 0 0 2px; }
  .eyebrow { font-family: "Courier New", monospace; font-size: 9pt; letter-spacing: 0.12em; text-transform: uppercase; color: #a67c00; margin-bottom: 6px; }
  .meta { font-family: "Courier New", monospace; font-size: 9pt; color: #555; margin-bottom: 20px; }
  h2 { font-family: "Courier New", monospace; font-size: 10pt; letter-spacing: 0.08em; text-transform: uppercase; color: #0a6b78; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin: 22px 0 8px; }
  p { margin: 4px 0; }
  ul { margin: 4px 0; padding-left: 20px; }
  li { margin: 2px 0; }
  .line { display: flex; justify-content: space-between; gap: 12px; font-family: "Courier New", monospace; font-size: 10pt; border-bottom: 1px dotted #ccc; padding: 3px 0; }
  .disclaimer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #999; font-size: 9.5pt; color: #444; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
  <button class="no-print" onclick="window.print()" style="float:right;font-family:sans-serif;padding:6px 12px;">Print / Save as PDF</button>
  <div class="eyebrow">Prototype-generated decision-support report</div>
  <h1>Action Pack — Case #${esc(c.caseId)}</h1>
  <div class="meta">Generated ${esc(new Date().toLocaleString())} · Analysis ${esc(result.analysisId)} · Rule engine ${esc(result.ruleEngineVersion)}</div>

  <h2>Case summary</h2>
  <p>${esc(c.person.displayId || "Unnamed")} · Age ${c.person.age} · ${esc(c.status.currentCourt || "Court not recorded")} · ${esc(c.status.caseStage || "Stage not recorded")}</p>

  <h2>Applicable legal pathway</h2>
  <p>${esc(RESULT_CATEGORY_LABEL[result.primaryCategory])}${primary ? " — " + esc(primary.headline) : ""}</p>

  <h2>Custody calculation</h2>
  ${primary && primary.calculation.length > 0
    ? primary.calculation.map((l) => `<div class="line"><span>${esc(l.label)}</span><span>${esc(l.value)}</span></div>`).join("")
    : "<p>No calculation applicable to this pathway.</p>"}

  <h2>Relevant statutory provisions</h2>
  <ul>${result.outcomes.map((o) => `<li>${esc(o.legalSource.section)} — ${esc(o.legalSource.shortTitle)}</li>`).join("")}</ul>

  <h2>Data gaps</h2>
  ${result.dataQuality.filter((f) => !f.ok).length > 0
    ? `<ul>${result.dataQuality.filter((f) => !f.ok).map((f) => `<li>${esc(f.field)} — ${esc(f.note)}</li>`).join("")}</ul>`
    : "<p>No critical data gaps recorded.</p>"}

  <h2>Flags requiring human review</h2>
  <ul>${result.judicialFactors.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>

  <h2>Suggested next procedural steps</h2>
  <p>${esc(result.nextStep)}</p>

  <h2>Legal-aid checklist</h2>
  <ul>
    <li>Verify identity and custody dates against the case file</li>
    <li>Confirm chargesheet-filing status with the investigating officer</li>
    <li>Confirm first-time-offender and criminal-history status</li>
    <li>Confirm whether a bail application has already been filed</li>
    <li>Escalate special-statute charges to counsel experienced in that statute</li>
  </ul>

  <h2>Documents / information requiring verification</h2>
  <p>Arrest memo, custody register extract, chargesheet (if filed), prior bail orders (if any), and identity documents.</p>

  <div class="disclaimer">
    This is a prototype-generated decision-support report built from synthetic demo data.
    It is not a court filing, not legal advice, and does not determine or grant bail.
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return; // popup blocked — caller can no-op, nothing to recover client-side
  win.document.open();
  win.document.write(html);
  win.document.close();
}
