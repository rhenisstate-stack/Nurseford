import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/Brian/Documents/Rhenis";
const dashboardsDir = path.join(ROOT, "src/app/dashboards");
const out = [];

const panels = [
  { slug: "nclex-rn", wrong: "ati-teas", right: "nclex-rn" },
  { slug: "nclex-pn", wrong: "ati-teas", right: "nclex-pn" },
];

function walk(dir) {
  const results = [];
  let entries = [];
  try { entries = fs.readdirSync(dir); } catch { return results; }
  for (const e of entries) {
    const full = path.join(dir, e);
    let st;
    try { st = fs.statSync(full); } catch { continue; }
    if (st.isDirectory()) results.push(...walk(full));
    else if (e === "page.tsx") results.push(full);
  }
  return results;
}

for (const panel of panels) {
  const panelDir = path.join(dashboardsDir, panel.slug);
  const files = walk(panelDir).filter((f) => f.includes("\\vista\\"));
  const changed = [];
  const skipped = [];

  for (const f of files) {
    let src;
    try { src = fs.readFileSync(f, "utf8"); } catch { continue; }
    const needle = `const VISTA_STRATA_PANEL = "${panel.wrong}";`;
    if (!src.includes(needle)) { skipped.push(f.replace(panelDir, "")); continue; }
    if (src.includes(`const VISTA_STRATA_PANEL = "${panel.right}";`)) { skipped.push(f.replace(panelDir, "") + " [ALREADY OK]"); continue; }
    const next = src.replace(needle, `const VISTA_STRATA_PANEL = "${panel.right}";`);
    fs.writeFileSync(f, next, "utf8");
    const count = src.split("\n").length;
    changed.push(`${f.replace(panelDir, "")} (${count} lines)`);
  }

  out.push(`===== PANEL: ${panel.slug} : ${panel.wrong} -> ${panel.right} =====`);
  out.push(`CHANGED (${changed.length}):`);
  changed.forEach((c) => out.push(`  ${c}`));
  out.push(`SKIPPED (no-op / already ok) [${skipped.length}]:`);
  skipped.slice(0, 10).forEach((c) => out.push(`  ${c}`));
  if (skipped.length > 10) out.push(`  ... and ${skipped.length - 10} more`);
  out.push("");
}

const reportPath = path.join(ROOT, "tmp-student/fix-panel-slug.md");
fs.writeFileSync(reportPath, out.join("\n"), "utf8");
console.log("wrote " + out.length + " lines -> " + reportPath);
