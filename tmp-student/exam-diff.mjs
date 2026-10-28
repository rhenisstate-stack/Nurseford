import fs from "node:fs";
const ROOT = "C:/Users/Brian/Documents/Rhenis";
const report = [];
const push = (s) => report.push(s);

const ati = ROOT + "/src/app/dashboards/ati-teas/vista/assessment/exams/distinct/overview/page.tsx";
const rn  = ROOT + "/src/app/dashboards/nclex-rn/vista/assessment/exams/distinct/overview/page.tsx";

if (!fs.existsSync(ati)) push("MISSING ATI: " + ati);
if (!fs.existsSync(rn))  push("MISSING RN:  " + rn.MAX_LENGTH);

if (fs.existsSync(ati) && fs.existsSync(rn)) {
  const a = fs.readFileSync(ati, "utf8").split("\n");
  const r = fs.readFileSync(rn, "utf8").split("\n");
  push(`ATI lines: ${a.length}  |  RN lines: ${r.length}`);

  const grab = (L, from, to) => L.slice(from - 1, to).map((l, i) => `${String(from + i).padStart(4)}: ${l}`).join("\n");

  // Constants block (first 40 lines) — panel slug, levels, routes
  push("──── ATI constants (lines 1-45) ────");
  push(grab(a, 1, 45));
  push("──── RN constants (lines 1-45) ────");
  push(grab(r, 1, 45));

  // Card render region — find the grid + card JSX in each
  const gridLine = (L) => L.findIndex((l) => /grid grid-cols|filteredExams\.map|filteredStrata|\.map\(\(strata/.test(l));
  const clickLine = (L) => L.findIndex((l) => /handleCardClick|handleModeSelection|ACCESS NOW/.test(l));
  const pushLine = (L) => L.findIndex((l) => /\$\{BASE_CHILD_ROUTE\}/.test(l));
  const popupLine = (L) => L.findIndex((l) => /setShowModePopup|modePopup|Mode Selection Popup|showModePopup/.test(l));

  push(`ATI grid@${gridLine(a)} click@${clickLine(a)} childPush@${pushLine(a)} popup@${popupLine(a)}`);
  push(`RN  grid@${gridLine(r)} click@${clickLine(r)} childPush@${pushLine(r)} popup@${popupLine(r)}`);

  // Show each file around its card click + navigation (contextual)
  const ctx = (L) => {
    const c = clickLine(L);
    const p = pushLine(L);
    const seg = [];
    if (c >= 0) seg.push(`[ATI].click ctx:\n${grab(L, c + 1, c + 14)}`);
    if (p >= 0) seg.push(`[ATI].nav ctx:\n${grab(L, p + 1, p + 8)}`);
    return seg.join("\n\n");
  };
  const ctx2 = (L) => {
    const c = clickLine(L);
    const p = pushLine(L);
    const seg = [];
    if (c >= 0) seg.push(`[RN].click ctx:\n${grab(L, c + 1, c + 14)}`);
    if (p >= 0) seg.push(`[RN].nav ctx:\n${grab(L, p + 1, p + 8)}`);
    return seg.join("\n\n");
  };
  push("────────────────────────────");
  push(ctx(a));
  push("────────────────────────────");
  push(ctx2(r));
}

fs.writeFileSync(ROOT + "/tmp-student/exam-diff.md", report.join("\n"), "utf8");
console.log("wrote " + report.length + " lines");
