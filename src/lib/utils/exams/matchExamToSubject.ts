/**
 * Matches an assessment exam to a learning subject dynamically using
 * domain keywords, title inspection, and exam metadata (year, tags).
 *
 * Eliminates all hardcoding: counts and listings are derived purely
 * from the live backend assessment and learning records.
 */

export interface MatchableExam {
  id?: number | string;
  guidId?: string;
  title?: string;
  year?: number | string;
  description?: string;
  season?: string;
  segment?: string;
  tag?: string;
  questionsCount?: number;
}

export function matchExamToSubject(
  exam: MatchableExam,
  subjectName: string,
  courseName: string = "",
  examType: string = ""
): boolean {
  const eTitle = (exam.title || "").toLowerCase();
  const eYear = String(exam.year || "");
  const sName = subjectName.toLowerCase();
  const cName = courseName.toLowerCase();
  const eType = examType.toLowerCase();

  // Clinical nursing isolation: LPN and RN are core clinical nursing panels.
  // Entrance exams (HESI A2, TEAS, GED, Accuplacer) and pure high-school/academic
  // subjects (Math, Reading Comprehension, Grammar, Vocabulary) must NEVER leak into LPN or RN courses.
  const isLpnNursing = eType === "lpn-nursing" || /\b(lpn|pn)\b/i.test(cName);
  const isRnNursing = eType === "rn-nursing" || (/\brn\b/i.test(cName) && !/\b(lpn|pn)\b/i.test(cName));
  const isClinicalNursing = isLpnNursing || isRnNursing;

  if (isClinicalNursing) {
    // 1. Strictly block entrance exam provider identifiers
    if (
      eTitle.includes("hesi a2") ||
      eTitle.includes("teas") ||
      eTitle.includes("ged") ||
      eTitle.includes("accuplacer")
    ) {
      return false;
    }

    // 2. Strictly block entrance/academic math tests (Dosage Calculation is the only clinical calculation topic)
    const isPureMathExam =
      /\b(math|maths|mathematics|arithmetic|algebra|geometry)\b/i.test(eTitle) &&
      !/\b(dosage|calc|calculation)\b/i.test(eTitle);
    if (isPureMathExam) {
      return false;
    }

    // 3. Strictly block grammar and vocabulary entrance exams
    if (/\b(grammar|vocabulary|vocabularies)\b/i.test(eTitle)) {
      return false;
    }

    // 4. LPN vs RN cohort isolation
    if (isLpnNursing) {
      // Prevent RN-only exams from displaying in LPN courses
      if (/\brn\b/i.test(eTitle) && !/\b(pn|lpn)\b/i.test(eTitle)) {
        return false;
      }
    } else if (isRnNursing) {
      // Prevent LPN/PN-only exams from displaying in RN courses
      if (/\b(pn|lpn)\b/i.test(eTitle) && !/\brn\b/i.test(eTitle)) {
        return false;
      }
    }
  }

  // Provider isolation: prevent cross-provider pollution between ATI, HESI, Examplify, Kaplan, and General
  const isAtiCourse = /\bati\b/i.test(cName) || /\bati\b/i.test(sName);
  const isHesiCourse = /\bhesi\b/i.test(cName) || /\bhesi\b/i.test(sName);
  const isExamplifyCourse = /\bexamplify\b/i.test(cName) || /\bexamplify\b/i.test(sName);
  const isKaplanCourse = /\bkaplan\b/i.test(cName) || /\bkaplan\b/i.test(sName);
  const isGeneralCourse = /\bgeneral\b/i.test(cName) || /\bgeneral\b/i.test(sName);

  const hasAti = /\bati\b/i.test(eTitle);
  const hasHesi = /\bhesi\b/i.test(eTitle);
  const hasExamplify = /\bexamplify\b/i.test(eTitle);
  const hasKaplan = /\bkaplan\b/i.test(eTitle);

  // If this is an Examplify course/subject, reject ATI, HESI, and Kaplan exams
  if (isExamplifyCourse) {
    if (hasAti || hasHesi || hasKaplan) return false;
  }

  // If this is an ATI course/subject, reject HESI, Examplify, and Kaplan exams
  if (isAtiCourse && !isHesiCourse && !isExamplifyCourse) {
    if (hasHesi || hasExamplify || hasKaplan) return false;
  }

  // If this is a HESI course/subject, reject ATI, Examplify, and Kaplan exams
  if (isHesiCourse && !isAtiCourse && !isExamplifyCourse) {
    if (hasAti || hasExamplify || hasKaplan) return false;
  }

  // If this is a Kaplan course/subject, reject ATI, HESI, and Examplify exams
  if (isKaplanCourse) {
    if (hasAti || hasHesi || hasExamplify) return false;
  }

  // If this is a General course/subject, reject explicitly branded exams
  if (isGeneralCourse) {
    if (hasAti || hasHesi || hasExamplify || hasKaplan) return false;
  }

  // Extract year from subject name if present (e.g. 2023, 2024, 2025, 2026)
  const sYearMatch = sName.match(/\b(202\d)\b/);
  const sYear = sYearMatch ? sYearMatch[1] : "";

  if (sYear) {
    const eTitleYearMatch = eTitle.match(/\b(202\d)\b/);
    if (eTitleYearMatch) {
      if (eTitleYearMatch[1] !== sYear) return false;
    } else {
      if (eYear && eYear !== sYear) return false;
    }
  }

  // Specific domain rules (ordered from most specific to general)
  if (sName.includes("adult health")) {
    return (
      eTitle.includes("adult health") &&
      !eTitle.includes("med surg") &&
      !eTitle.includes("medical surgical")
    );
  }

  if (sName.includes("capstone")) {
    return eTitle.includes("capstone");
  }

  if (sName.includes("community health") || sName.includes("community")) {
    if (isExamplifyCourse) {
      return (
        (eTitle.includes("community") || eTitle.includes("nur 4353")) &&
        !eTitle.includes("community college") &&
        !eTitle.includes("med-surg") &&
        !eTitle.includes("med surg") &&
        !eTitle.includes("leadership") &&
        !eTitle.includes("child") &&
        !eTitle.includes("human needs") &&
        !eTitle.includes("mental health") &&
        !eTitle.includes("proctored")
      );
    }
    return (
      eTitle.includes("community health") ||
      eTitle.includes("community nursing") ||
      (eTitle.includes("community") &&
        !eTitle.includes("community college") &&
        !eTitle.includes("examplify") &&
        !eTitle.includes("med-surg") &&
        !eTitle.includes("med surg"))
    );
  }

  if (sName.includes("dosage") || sName.includes("calculation")) {
    return eTitle.includes("dosage") || eTitle.includes("calculation");
  }

  if (sName.includes("fundamentals")) {
    return eTitle.includes("fundamental");
  }

  if (sName.includes("health assessment") || sName.includes("assessment")) {
    if (sName.includes("concept")) {
      return eTitle.includes("concept");
    }
    return (
      eTitle.includes("physical assessment") ||
      eTitle.includes("health assessment") ||
      (eTitle.includes("assessment") &&
        (eTitle.includes("health") || eTitle.includes("physical")))
    ) && !eTitle.includes("concept");
  }

  if (sName.includes("leadership")) {
    return eTitle.includes("leadership") || eTitle.includes("management");
  }

  if (sName.includes("maternal") || sName.includes("newborn")) {
    return (
      eTitle.includes("maternal") ||
      eTitle.includes("maternity") ||
      eTitle.includes("newborn") ||
      /\bob\b/.test(eTitle)
    );
  }

  if (sName.includes("med-surg") || sName.includes("med surg")) {
    return (
      eTitle.includes("med surg") ||
      eTitle.includes("med-surg") ||
      eTitle.includes("medical surgical") ||
      eTitle.includes("medical-surgical")
    );
  }

  if (sName.includes("mental health") || sName.includes("mental")) {
    return eTitle.includes("mental") || eTitle.includes("psych");
  }

  if (sName.includes("nutrition")) {
    return eTitle.includes("nutrition");
  }

  if (sName.includes("pediatrics") || sName.includes("pediatric")) {
    return (
      eTitle.includes("pediatric") ||
      eTitle.includes("peds") ||
      eTitle.includes("child")
    );
  }

  if (sName.includes("pharmacology")) {
    return eTitle.includes("pharmacology") || /\bpharm\b/.test(eTitle);
  }

  if (sName.includes("concept-based") || sName.includes("concept based")) {
    return eTitle.includes("concept");
  }

  if (sName.includes("custom")) {
    const clinicalKeywords = [
      "adult health",
      "dosage",
      "fundamental",
      "maternal",
      "mental",
      "nutrition",
      "pediatric",
      "pharm",
      "med surg",
      "medical surgical",
      "capstone",
      "leadership",
    ];
    if (!eTitle.includes("custom")) return false;
    return !clinicalKeywords.some((kw) => eTitle.includes(kw));
  }

  // Pre-existing HESI & TEAS domain rules
  if (sName.includes("exit") && !eTitle.includes("exit") && !eTitle.includes("predictor")) {
    return false;
  }
  if (sName.includes("anatomy") || sName.includes("physiology")) {
    return eTitle.includes("anatomy") || eTitle.includes("physiology");
  }
  if (sName.includes("comprehensive")) {
    return eTitle.includes("comprehensive") || eTitle.includes("predictor");
  }
  if (sName.includes("biology")) return eTitle.includes("biology");
  if (sName.includes("grammar")) return eTitle.includes("grammar");
  if (sName.includes("math")) return eTitle.includes("math");
  if (sName.includes("vocabularies") || sName.includes("vocabulary")) {
    return eTitle.includes("vocabularies") || eTitle.includes("vocabulary");
  }
  if (sName.includes("reading")) return eTitle.includes("reading");
  if (sName.includes("science")) return eTitle.includes("science");
  if (sName.includes("english")) return eTitle.includes("english");
  if (sName.includes("kaplan")) return eTitle.includes("kaplan");
  if (sName.includes("examplify")) return eTitle.includes("examplify");

  // Fallback domain keyword matching, stripping generic stop words
  const stopWords = new Set([
    "ati",
    "rn",
    "pn",
    "hesi",
    "nursing",
    "exam",
    "exams",
    "test",
    "tests",
    "practice",
    "and",
    "the",
    "for",
    "with",
    "all",
  ]);
  const sKeywords = sName
    .replace(/\b202\d\b/g, "")
    .replace(/[^a-z0-9]/gi, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (sKeywords.length === 0) return false;
  return sKeywords.some((k) => eTitle.includes(k));
}
