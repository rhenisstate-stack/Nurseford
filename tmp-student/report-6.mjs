import fs from "node:fs";
const ROOT = "C:/Users/Brian/Documents/Rhenis";
const out = [];
const lines = (p) => fs.existsSync(ROOT + p) ? fs.readFileSync(ROOT + p, "utf8").split("\n") : [];
function show(rel, from, to, label) {
  const L = lines(rel.split("|")[0]);
  out.push(`===== ${label} :: ${rel.split("|")[0]} (${L.length}) =====`);
  for (let i = from - 1; i < Math.min(to, L.length); i++) out.push(`${String(i+1).padStart(4)}: ${L[i]}`);
  out.push("");
}
// NCLEX-RN dispatcher: RAT/readiness target + Start Practice target
show("src/app/dashboards/nclex-rn/page.tsx", 84, 100, "NCLEX-RN dispatcher");
// NCLEX-PN dispatcher
show("src/app/dashboards/nclex-pn/page.tsx", 84, 100, "NCLEX-PN dispatcher");
// nclex-rn learning/courses: where does card click push? children route + level token
show("src/app/dashboards/nclex-rn/vista/learning/courses/distinct/overview/page.tsx", 108, 122, "RN courses click");
// nclex-rn learning/subjects: where do subject cards push? assessment exams overview target
show("src/app/dashboards/nclex-rn/vista/learning/subjects/distinct/overview/page.tsx", 108, 120, "RN subjects click");
fs.writeFileSync(ROOT + "/tmp-student/report-6.md", out.join("\n"), "utf8");
console.log("wrote report-6: " + out.length);
