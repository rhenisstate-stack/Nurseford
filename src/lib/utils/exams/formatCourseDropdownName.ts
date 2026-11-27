/**
 * Formats course dropdown display names:
 * - "where there is rhemify replace with Exemplify"
 * - "remove anything Rhenis only in courses drop down names"
 * - "instead of A-T change to ATI and instead of H-S change to HESI"
 * - Canonical order: "ATI Exam-RN starts followed by ATI Exam-LPN, then HESI Exam RN, then HESI EXAM PN, like that"
 * - Cleans up remaining punctuation, leading/trailing hyphens, and whitespace.
 *
 * NOTE: Modifies the display label rendered for courses across breadcrumbs and dropdowns.
 * The underlying option value / slug remains mapped to preserve filtering,
 * matching, and routing logic.
 */

export function getCourseRank(courseName?: string | null): number {
  if (!courseName) return 999;
  const n = String(courseName).toLowerCase().replace(/rhenis\s*/gi, "").trim();

  // 1. ATI Exam-RN (starts!)
  if (/ati/i.test(n) && !/exit/i.test(n) && /\brn\b/i.test(n)) {
    return 1;
  }

  // 2. ATI Exam-LPN / ATI Exam-PN (followed by ATI Exam-LPN)
  if (/ati/i.test(n) && !/exit/i.test(n) && /(?:lpn|pn)\b/i.test(n)) {
    return 2;
  }

  // 3. HESI Exam RN (then HESI Exam RN)
  if ((/hesi/i.test(n) || /h-s/i.test(n)) && !/exit/i.test(n) && /\brn\b/i.test(n)) {
    return 3;
  }

  // 4. HESI EXAM PN / HESI Exam-LPN (then HESI EXAM PN)
  if ((/hesi/i.test(n) || /h-s/i.test(n)) && !/exit/i.test(n) && /(?:lpn|pn)\b/i.test(n)) {
    return 4;
  }

  // 5. ATI Exit Exams-RN
  if (/ati/i.test(n) && /exit/i.test(n) && /\brn\b/i.test(n)) {
    return 5;
  }

  // 6. ATI Exit Exams-LPN / PN
  if (/ati/i.test(n) && /exit/i.test(n) && /(?:lpn|pn)\b/i.test(n)) {
    return 6;
  }

  // 7. HESI Exit Exams-RN
  if ((/hesi/i.test(n) || /h-s/i.test(n)) && /exit/i.test(n) && /\brn\b/i.test(n)) {
    return 7;
  }

  // 8. HESI Exit Exams-PN / LPN
  if ((/hesi/i.test(n) || /h-s/i.test(n)) && /exit/i.test(n) && /(?:lpn|pn)\b/i.test(n)) {
    return 8;
  }

  // 9. Exemplify Practice-RN
  if (/exemplify/i.test(n) && /\brn\b/i.test(n)) {
    return 9;
  }

  // 10. Exemplify Practice-PN
  if (/exemplify/i.test(n) && /(?:lpn|pn)\b/i.test(n)) {
    return 10;
  }

  // 11. General Exams
  if (/general/i.test(n)) {
    return 11;
  }

  // 12. KAP-LAN Exams / Kaplan
  if (/kap-?lan/i.test(n)) {
    return 12;
  }

  // 13. Exemplify Assessment / General Exemplify
  if (/exemplify/i.test(n)) {
    return 13;
  }

  // 14. Comprehensive Exit Exams
  if (/exit/i.test(n)) {
    return 14;
  }

  return 20;
}

export function compareCourses(aName: string, bName: string): number {
  const dispA = formatCourseDropdownName(aName);
  const dispB = formatCourseDropdownName(bName);
  const rankA = getCourseRank(dispA);
  const rankB = getCourseRank(dispB);
  if (rankA !== rankB) return rankA - rankB;
  const isRnA = /\brn\b/i.test(dispA);
  const isRnB = /\brn\b/i.test(dispB);
  if (isRnA && !isRnB) return -1;
  if (!isRnA && isRnB) return 1;
  return dispA.localeCompare(dispB);
}

export function formatCourseDropdownName(rawName?: string | null): string {
  if (!rawName || typeof rawName !== "string") return "";
  if (rawName === "All Courses" || rawName === "Course") return rawName;

  // 1. Where there is rhemify / rhemplify replace with Exemplify (case-aware)
  let name = rawName.replace(/rhem(?:p|pl|l)?ify/gi, (match) => {
    if (match === match.toUpperCase()) return "EXEMPLIFY";
    if (match[0] === match[0].toUpperCase()) return "Exemplify";
    return "exemplify";
  });

  // 2. Remove anything Rhenis (case-insensitive)
  name = name.replace(/rhenis/gi, "");

  // 3. Remove empty brackets/parentheses left behind
  name = name.replace(/\(\s*\)/g, "").replace(/\[\s*\]/g, "");

  // 4. Replace A-T / a-t with ATI and H-S / h-s / Hesi with HESI
  name = name
    .replace(/\bA\s*-\s*T\b/gi, "ATI")
    .replace(/\bH\s*-\s*S\b/gi, "HESI")
    .replace(/\bHesi\b/gi, "HESI");

  // 5. Collapse duplicate spaces
  name = name.replace(/\s{2,}/g, " ");

  // 6. Trim leading and trailing hyphens, dashes, colons, slashes, commas, and whitespace
  name = name.trim().replace(/^[-–—:;/,.\s]+|[-–—:;/,.\s]+$/g, "").trim();

  // 7. Hardcoded overrides for canonical course names:
  // "ATI Exam-RN starts followed by ATI Exam-LPN, then HESI Exam RN, then HESI EXAM PN, like that"
  const hardcodedMap: Record<string, string> = {
    // 1. ATI Exam-RN
    "a-t exams rn": "ATI Exam-RN",
    "a-t exams-rn": "ATI Exam-RN",
    "at exams rn": "ATI Exam-RN",
    "at exams-rn": "ATI Exam-RN",
    "ati exams rn": "ATI Exam-RN",
    "ati exams-rn": "ATI Exam-RN",
    "ati exam rn": "ATI Exam-RN",
    "ati exam-rn": "ATI Exam-RN",
    "a-t exam rn": "ATI Exam-RN",
    "a-t exam-rn": "ATI Exam-RN",

    // 2. ATI Exam-LPN
    "a-t exams lpn": "ATI Exam-LPN",
    "a-t exams-lpn": "ATI Exam-LPN",
    "at exams lpn": "ATI Exam-LPN",
    "at exams-lpn": "ATI Exam-LPN",
    "ati exams lpn": "ATI Exam-LPN",
    "ati exams-lpn": "ATI Exam-LPN",
    "ati exam lpn": "ATI Exam-LPN",
    "ati exam-lpn": "ATI Exam-LPN",
    "a-t exam lpn": "ATI Exam-LPN",
    "a-t exam-lpn": "ATI Exam-LPN",
    "ati exams pn": "ATI Exam-LPN",
    "ati exams-pn": "ATI Exam-LPN",
    "ati exam pn": "ATI Exam-LPN",
    "ati exam-pn": "ATI Exam-LPN",

    // 3. HESI Exam RN / HESI Exam-RN
    "h-s exams rn": "HESI Exam-RN",
    "h-s exams-rn": "HESI Exam-RN",
    "hs exams rn": "HESI Exam-RN",
    "hs exams-rn": "HESI Exam-RN",
    "hesi exams rn": "HESI Exam-RN",
    "hesi exams-rn": "HESI Exam-RN",
    "hesi exam rn": "HESI Exam-RN",
    "hesi exam-rn": "HESI Exam-RN",
    "h-s exam rn": "HESI Exam-RN",
    "h-s exam-rn": "HESI Exam-RN",

    // 4. HESI EXAM PN / HESI Exam-PN
    "h-s exams lpn": "HESI Exam-PN",
    "h-s exams-lpn": "HESI Exam-PN",
    "hs exams lpn": "HESI Exam-PN",
    "hs exams-lpn": "HESI Exam-PN",
    "hesi exams lpn": "HESI Exam-PN",
    "hesi exams-lpn": "HESI Exam-PN",
    "hesi exam lpn": "HESI Exam-PN",
    "hesi exam-lpn": "HESI Exam-PN",
    "h-s exam lpn": "HESI Exam-PN",
    "h-s exam-lpn": "HESI Exam-PN",
    "h-s exams pn": "HESI Exam-PN",
    "h-s exams-pn": "HESI Exam-PN",
    "hesi exams pn": "HESI Exam-PN",
    "hesi exams-pn": "HESI Exam-PN",
    "hesi exam pn": "HESI Exam-PN",
    "hesi exam-pn": "HESI Exam-PN",

    // 5 & 6. ATI Exit Exams (RN & LPN)
    "a-t exit exams-rn": "ATI Exit Exams-RN",
    "a-t exit exams rn": "ATI Exit Exams-RN",
    "ati exit exams-rn": "ATI Exit Exams-RN",
    "ati exit exams rn": "ATI Exit Exams-RN",
    "ati exit exam-rn": "ATI Exit Exams-RN",
    "ati exit exam rn": "ATI Exit Exams-RN",
    "a-t exit exams-lpn": "ATI Exit Exams-LPN",
    "a-t exit exams lpn": "ATI Exit Exams-LPN",
    "ati exit exams-lpn": "ATI Exit Exams-LPN",
    "ati exit exams lpn": "ATI Exit Exams-LPN",
    "ati exit exam-lpn": "ATI Exit Exams-LPN",
    "ati exit exam lpn": "ATI Exit Exams-LPN",
    "ati exit exams-pn": "ATI Exit Exams-LPN",
    "ati exit exam-pn": "ATI Exit Exams-LPN",

    // 7 & 8. HESI Exit Exams (RN & PN)
    "h-s exit rn exams": "HESI Exit RN Exams",
    "h-s exit exams-rn": "HESI Exit Exams-RN",
    "h-s exit exams rn": "HESI Exit Exams-RN",
    "hesi exit rn exams": "HESI Exit RN Exams",
    "hesi exit exams-rn": "HESI Exit Exams-RN",
    "hesi exit exams rn": "HESI Exit Exams-RN",
    "hesi exit exam-rn": "HESI Exit Exams-RN",
    "hesi exit exam rn": "HESI Exit Exams-RN",
    "h-s exit exams-lpn": "HESI Exit Exams-PN",
    "h-s exit exams lpn": "HESI Exit Exams-PN",
    "h-s exit exams-pn": "HESI Exit Exams-PN",
    "h-s exit exams pn": "HESI Exit Exams-PN",
    "hesi exit exams-lpn": "HESI Exit Exams-PN",
    "hesi exit exams lpn": "HESI Exit Exams-PN",
    "hesi exit exams-pn": "HESI Exit Exams-PN",
    "hesi exit exams pn": "HESI Exit Exams-PN",
    "hesi exit exam-pn": "HESI Exit Exams-PN",
    "hesi exit exam pn": "HESI Exit Exams-PN",

    // 9 & 10. Exemplify Practice (RN & PN)
    "exemplify practice-rn": "Exemplify Practice-RN",
    "exemplify practice rn": "Exemplify Practice-RN",
    "rhemplify practice-rn": "Exemplify Practice-RN",
    "rhemplify practice rn": "Exemplify Practice-RN",
    "rhemify practice-rn": "Exemplify Practice-RN",
    "rhemify practice rn": "Exemplify Practice-RN",
    "exemplify practice-pn": "Exemplify Practice-PN",
    "exemplify practice pn": "Exemplify Practice-PN",
    "rhemplify practice-pn": "Exemplify Practice-PN",
    "rhemplify practice pn": "Exemplify Practice-PN",
    "rhemify practice-pn": "Exemplify Practice-PN",
    "rhemify practice pn": "Exemplify Practice-PN",

    // 11. General Exams
    "general exams": "General Exams",
    "general exam": "General Exams",

    // 12. Kaplan Exams
    "kap-lan exams": "KAP-LAN Exams",
    "kaplan exams": "KAP-LAN Exams",
    "kap-lan exam": "KAP-LAN Exams",
    "kaplan exam": "KAP-LAN Exams",

    // 13. Exemplify General / Assessment
    "exemplify": "Exemplify",
    "exemplify exams": "Exemplify Exams",
    "exemplify exam": "Exemplify Exams",
    "exemplify assessment": "Exemplify Assessment",
  };

  const lower = name.toLowerCase();
  if (hardcodedMap[lower]) {
    return hardcodedMap[lower];
  }

  // Fallback cleanup if not caught in hardcodedMap
  return (
    name
      .replace(/\bA\s*-\s*T\b/gi, "ATI")
      .replace(/\bH\s*-\s*S\b/gi, "HESI")
      .replace(/\bHesi\b/gi, "HESI") || "Nursing Course"
  );
}

/**
 * Returns a short, clean label for course toggle buttons at the exam level
 * (e.g. ATI, HESI, Examplify, General).
 */
export function formatCourseToggleLabel(rawName?: string | null): string {
  if (!rawName || typeof rawName !== "string") return "";
  const lower = rawName.toLowerCase().trim();
  if (lower === "all" || lower === "all courses" || lower === "course") return "All";

  const isExit = lower.includes("exit");

  if (lower.includes("ati") || lower.includes("a-t")) {
    return isExit ? "ATI Exit" : "ATI";
  }
  if (lower.includes("hesi") || lower.includes("h-s")) {
    return isExit ? "HESI Exit" : "HESI";
  }
  if (lower.includes("exemplify") || lower.includes("examplify") || lower.includes("rhem")) {
    return isExit ? "Examplify Exit" : "Examplify";
  }
  if (lower.includes("general")) {
    return "General";
  }
  if (lower.includes("kaplan") || lower.includes("kap-lan")) {
    return "Kaplan";
  }

  const cleaned = formatCourseDropdownName(rawName);
  return (
    cleaned
      .replace(/\s*exam(?:s)?(?:-rn|-lpn|-pn)?\b/gi, "")
      .replace(/\s*practice(?:-rn|-pn)?\b/gi, "")
      .trim() || cleaned
  );
}

export default formatCourseDropdownName;
