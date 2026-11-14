export interface ExamSchoolSource {
  school?: string | null;
  schoolName?: string | null;
  institution?: string | null;
  institutionName?: string | null;
  title?: string | null;
  description?: string | null;
  courseName?: string | null;
  programName?: string | null;
}

const SCHOOL_MATCHERS: readonly [string, RegExp][] = [
  ["Antelope Valley College", /\bantelope\s+valley\s+college\b/i],
  ["Blue Cliff College", /\bblue\s+cliff\s+college\b/i],
  ["Brooklyn University", /\bbrooklyn\s+university\b/i],
  ["Broward College", /\bbroward\s+college\b/i],
  ["Capella University", /\bcapella(\s+university)?\b/i],
  ["Chamberlain University", /\bchamberlain(\s+university)?\b/i],
  ["CNI College", /\bcni\s+college\b/i],
  ["East Los Angeles College", /\beast\s+los\s+angeles\s+college\b/i],
  ["Eastern Suffolk BOCES", /\beastern\s+suffolk(\s+boces|\s+college)?\b/i],
  ["Eastwick College", /\b(eastwick\s+college|teterboro(\s+eve)?)\b/i],
  ["Excelsior University", /\bexcelsior(\s+university)?\b/i],
  ["Galen College of Nursing", /\bgalen(\s+college(\s+of\s+nursing)?)?\b/i],
  ["Grand Canyon University (GCU)", /\b(gcu|grand\s+canyon(\s+university)?)\b/i],
  ["Helene Fuld College", /\b(helene\s+fuld|hellen\s+fluid)\s+college\b/i],
  ["Herzing University", /\bherzing(\s+university)?\b/i],
  ["Hondros College", /\bhondros(\s+college)?\b/i],
  ["ICHS", /\bichs\b/i],
  ["Indiana University", /\bindiana\s+university\b/i],
  ["Ivy Tech Community College", /\bivy\s*tech(\s+community\s+college)?\b/i],
  ["Jersey College", /\bjersey\s+college\b/i],
  ["Keiser University", /\bkeiser(\s+university)?\b/i],
  ["MassBay Community College", /\bmass\s*bay\s+community\s+college\b/i],
  ["Metro Tech Center", /\bmetro\s+tech\s+cent(?:er|re)\b/i],
  ["Miami Dade College", /\bmiami\s+dade(\s+college)?\b/i],
  ["Miami Regional University (MRU)", /\b(miami\s+regional(\s+university)?|mru)\b/i],
  ["Monroe College", /\bmonroe\s+college\b/i],
  ["Montgomery College", /\bmontgomery\s+college\b/i],
  ["Prism Career Institute", /\bprism\s+career\s+institute\b/i],
  ["Rasmussen University", /\brasmussen(\s+university|\s+college)?\b/i],
  ["Regis University", /\bregis\s+university\b/i],
  ["River Valley College", /\briver\s+valley\s+college\b/i],
  ["Roxborough Memorial College", /\broxob?oroug?h\s+memorial\s+college\b/i],
  ["Samuel Merritt University", /\bsamuel\s+merr?it{1,2}(\s+university)?\b/i],
  ["Simmons University", /\bsimmons\s+university\b/i],
  ["Smith Chason College", /\bsmith\s+chason\s+college\b/i],
  ["South Merit College", /\bsouth\s+merit\s+college\b/i],
  ["South University", /\b(south\s+u\b|south\s+tampa\s+university|south\s+university)\b/i],
  ["Southeastern College", /\bsoutheastern\s+college\b/i],
  ["Temu University", /\btemu\s+university\b/i],
  ["University of Texas Arlington", /\b(university\s+of\s+texas\s+arlington|ut\s+arlington)\b/i],
  ["Ursuline College", /\bursuline\s+college\b/i],
  ["Viterbo University", /\bviterbo(\s+university)?\b/i],
  ["Walden University", /\bwalden(\s+university)?\b/i],
  ["Warren County Community College", /\bwarren\s+county\s+community\s+college\b/i],
  ["West Coast University", /\b(west\s+coast\s+university|wcu)\b/i],
  ["Western Governors University (WGU)", /\b(wgu|western\s+governors(\s+university)?)\b/i],
];

const GENERIC_SCHOOL_RE =
  /(?:\(|[-–—]\s*)([A-Z][A-Za-z&'.]+(?:\s+[A-Z][A-Za-z&'.]+){0,4}\s+(?:University|Community College|College|Career Institute|Technical Center))\b/;

const isValidString = (val?: string | null): val is string =>
  typeof val === "string" &&
  val.trim() !== "" &&
  val.trim().toLowerCase() !== "null" &&
  val.trim().toLowerCase() !== "undefined";

/**
 * Resolves the canonical nursing school / institution associated with an exam.
 * Checks explicit backend school/institution properties first, then matches known
 * schools and university/college suffixes in the exam title and description.
 */
export function resolveExamSchool(exam: ExamSchoolSource): string | null {
  const direct =
    exam.schoolName ?? exam.school ?? exam.institutionName ?? exam.institution;
  if (isValidString(direct)) {
    return direct.trim();
  }

  const title = exam.title ?? "";
  const description = exam.description ?? "";

  for (const [label, regex] of SCHOOL_MATCHERS) {
    if (regex.test(title) || regex.test(description)) {
      return label;
    }
  }

  const genericMatch = title.match(GENERIC_SCHOOL_RE);
  if (genericMatch?.[1]) {
    let candidate = genericMatch[1].trim();
    candidate = candidate.replace(/^(Surg Exam|Medical Surg|Adult Health|General Exam)\s+/i, "");
    if (!/^(Community Health|Exam|General|Practice)\b/i.test(candidate)) {
      return candidate;
    }
  }

  return null;
}
