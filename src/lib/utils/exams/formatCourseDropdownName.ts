/**
 * Formats course dropdown display names:
 * - "where there is rhemify replace with Exemplify"
 * - "remove anything Rhenis only in courses drop down names"
 * - "instead of A-T change to ATI and instead of H-S change to Hesi"
 * - Cleans up remaining punctuation, leading/trailing hyphens, and whitespace.
 *
 * NOTE: Modifies the display label rendered for courses across breadcrumbs and dropdowns.
 * The underlying option value / slug remains mapped to preserve filtering,
 * matching, and routing logic.
 */
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

  // 4. Replace A-T / a-t with ATI and H-S / h-s with Hesi
  name = name
    .replace(/\bA\s*-\s*T\b/gi, "ATI")
    .replace(/\bH\s*-\s*S\b/gi, "Hesi");

  // 5. Collapse duplicate spaces
  name = name.replace(/\s{2,}/g, " ");

  // 6. Trim leading and trailing hyphens, dashes, colons, slashes, commas, and whitespace
  name = name.trim().replace(/^[-–—:;/,.\s]+|[-–—:;/,.\s]+$/g, "").trim();

  // 7. Hardcoded overrides for known course names
  const hardcodedMap: Record<string, string> = {
    "a-t exams rn": "ATI Exams-RN",
    "a-t exams lpn": "ATI Exams-LPN",
    "at exams rn": "ATI Exams-RN",
    "at exams lpn": "ATI Exams-LPN",
    "a-t exams-rn": "ATI Exams-RN",
    "a-t exams-lpn": "ATI Exams-LPN",
    "ati exams rn": "ATI Exams-RN",
    "ati exams lpn": "ATI Exams-LPN",
    "ati exams-rn": "ATI Exams-RN",
    "ati exams-lpn": "ATI Exams-LPN",
    "a-t exit exams-rn": "ATI Exit Exams-RN",
    "a-t exit exams-lpn": "ATI Exit Exams-LPN",
    "ati exit exams-rn": "ATI Exit Exams-RN",
    "ati exit exams-lpn": "ATI Exit Exams-LPN",
    "h-s exit rn exams": "Hesi Exit RN Exams",
    "h-s exit exams-lpn": "Hesi Exit Exams-LPN",
    "h-s exit exams-rn": "Hesi Exit Exams-RN",
    "hesi exit rn exams": "Hesi Exit RN Exams",
    "hesi exit exams-lpn": "Hesi Exit Exams-LPN",
    "hesi exit exams-rn": "Hesi Exit Exams-RN",
    "h-s exams-rn": "Hesi Exams-RN",
    "h-s exams-lpn": "Hesi Exams-LPN",
    "hesi exams-rn": "Hesi Exams-RN",
    "hesi exams-lpn": "Hesi Exams-LPN",
    "general exams": "General Exams",
    "exemplify": "Exemplify",
    "exemplify exams": "Exemplify Exams",
    "exemplify assessment": "Exemplify Assessment",
    "exemplify practice-rn": "Exemplify Practice-RN",
    "exemplify practice-pn": "Exemplify Practice-PN",
    "rhemplify practice-rn": "Exemplify Practice-RN",
    "rhemplify practice-pn": "Exemplify Practice-PN",
    "rhemify practice-rn": "Exemplify Practice-RN",
    "rhemify practice-pn": "Exemplify Practice-PN",
  };

  const lower = name.toLowerCase();
  if (hardcodedMap[lower]) {
    return hardcodedMap[lower];
  }

  // Fallback cleanup if not caught in hardcodedMap
  return (
    name
      .replace(/\bA\s*-\s*T\b/gi, "ATI")
      .replace(/\bH\s*-\s*S\b/gi, "Hesi") || "Nursing Course"
  );
}

export default formatCourseDropdownName;
