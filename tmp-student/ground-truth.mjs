// read-only diagnostic: does the current disk state actually build the Start-Practice flow?
import fs from "node:fs";

const ROOT = "C:/Users/Brian/Documents/Rhenis";
const out = [];

function showReal(relPath, from, to, label) {
  const p = ROOT + "/" + relPath;
  if (!fs.existsSync(p)) { out.push(`MISSING ${relPath}`); return; }
  const lines = fs.readFileSync(p, "utf8").split("\n");
  out.push(`===== ${label} :: ${relPath} (${lines.length} lines) =====`);
  for (let i = from - 1; i < Math.min(to, lines.length); i++) out.push(`${String(i + 1).padStart(4)}: ${lines[i]}`);
  out.push("");
}

// 1) Both dashboard dispatchers — the practice branch (ground truth on disk)
showReal("src/app/dashboards/nclex-rn/page.tsx", 84, 100, "NCLEX-RN dispatcher");
showReal("src/app/dashboards/nclex-pn/page.tsx", 84, 100, "NCLEX-PN dispatcher");

// 2) The distinct/overview landing (Domains) — how it builds cards
const ov = ROOT + "/src/app/dashboards/nclex-rn/vista/assessment/exams/distinct/overview/page.tsx";
if (fs.existsSync(ov)) {
  const L = fs.readFileSync(ov, "utf8").split("\n");
  out.push(`===== Domains landing (nclex-rn) ${L.length} lines — key wiring =====`);
  L.forEach((l, i) => {
    if (/useNominalStrataExams|NCLEX_PRACTICE_CONFIG|distinct\/outline|handleCardClick|ACCESS|Start Exam|access now|identifier|BASE_CHILD_ROUTE|outline\?|router\.push/.test(l))
      out.push(`${String(i + 1).padStart(4)}: ${l.trim()}`);
  });
  out.push("");
} else out.push("MISSING nclex-rn distinct/overview page");

// 3) The practice config — backend group ids
showReal("src/lib/config/nclex-practice.ts", 1, 40, "NCLEX practice config");

fs.writeFileSync(ROOT + "/tmp-student/ground-truth.md", out.join("\n"), "utf8");
console.log("OK wrote " + out.length + " lines");
