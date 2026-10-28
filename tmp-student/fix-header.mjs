import fs from "node:fs";
const ROOT = "C:/Users/Brian/Documents/Rhenis";
const JOBS = [
  { dir: "rn", panel: "nclex-rn", disp: "NCLEX-RN" },
  { dir: "pn", panel: "nclex-pn", disp: "NCLEX-PN" },
];
const out = [];
const push = (s) => out.push(siz);

for (const j of JOBS) {
  const p = `${ROOT}/src/app/dashboards/${j.panel}/vista/assessment/exams/distinct/overview/page.tsx`;
  let s = "";
  try { s = fs.readFileSync(p, "utf8"); } catch (e) { push(`READ-ERROR ${j.panel}: ${e.message}`); continue; }

  push(`===== ${j.disp} :: ${p} =====`);

  // 1) Ensure display constant exists
  const cNeedle = 'const VISTA_STRATA_PANEL_DISPLAY =';
  if (!s.includes(cNeedle)) {
    const insertionPoint = `const VISTA_STRATA_PANEL = "${j.panel}";`;
    const idx = s.indexOf(insertionPoint);
    if (idx >= 0) {
      s = s.slice(0, idx + insertionPoint.length) + `\nconst VISTA_STRATA_PANEL_DISPLAY = "${j.disp}";` + s.slice(idx + insertionPoint.length);
      push("  ADDED VISTA_STRATA_PANEL_DISPLAY constant");
    } else {
      push("  WARN: panel constant not found, cannot insert display");
    }
  } else {
    push("  display constant already present");
  }

  // 2) Fix H1 title: replace `{APP_TITLE} : ` -> `{VISTA_STRATA_PANEL_DISPLAY} : `
  const titleOld = `{APP_TITLE} : `;
  const titleNew = `{VISTA_STRATA_PANEL_DISPLAY} : `;
  const hasTitle = s.includes(titleOld);
  if (hasTitle) {
    s = s.split(titleOld).join(titleNew);
    push("  H1: replaced {APP_TITLE} : -> {VISTA_STRATA_PANEL_DISPLAY} :");
  } else {
    push("  H1: {APP_TITLE} : pattern not found (may already be fixed): " + sepCount(s, "VISTA_STRATA_PANEL_DISPLAY} :"));
  }

  // 3) Fix subtitle: `Across the {APP_TITLE}.` -> `Across the {VISTA_STRATA_PANEL_DISPLAY}.`
  const subOld = `Across the {APP_TITLE}.`;
  const subNew = `Across the {VISTA_STRATA_PANEL_DISPLAY}.`;
  const hasSub = s.includes(subOld);
  if (hasSub) {
    s = s.split(subOld).join(subNew);
    push("  SUB: replaced Across the {APP_TITLE}. -> Across the {VISTA_STRATA_PANEL_DISPLAY}.");
  } else {
    push("  SUB: Across the {APP_TITLE}. not found");
  }

  // 4) Sweep any remaining {APP_TITLE} in title/subtitle region (lines 290-302 equivalently — first header block)
  const hdrIdx = s.indexOf('const handleMaxWidth =');
  const headerStart = s.indexOf("{/* Centered Title */}");
  if (headerStart >= 0) {
    const segment = s.slice(headerStart, headerStart + 900);
    const remaining = (segment.match(/\{APP_TITLE\}/g) || []).length;
    push(`  Remaining {APP_TITLE} in header block: ${remaining}`);
  }

  fs.writeFileSync(p, s, "utf8");
  push("");
}

function sepCount(s, needle) {
  return (s.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
}

fs.writeFileSync(ROOT + "/tmp-student/fix-header.md", out.join("\n"), "utf8");
console.log("wrote " + out.length + " lines");
