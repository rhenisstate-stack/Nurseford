/**
 * Formats course dropdown display names:
 * - "where there is rhemify replace with Exemplify"
 * - "remove anything Rhenis only in courses drop down names"
 * - Cleans up remaining punctuation, leading/trailing hyphens, and whitespace.
 *
 * NOTE: Only modifies the display label rendered inside the courses dropdown.
 * The underlying option value remains unchanged to preserve filtering,
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

  // 4. Collapse duplicate spaces
  name = name.replace(/\s{2,}/g, " ");

  // 5. Trim leading and trailing hyphens, dashes, colons, slashes, commas, and whitespace
  name = name.trim().replace(/^[-–—:;/,.\s]+|[-–—:;/,.\s]+$/g, "").trim();

  // 6. Hardcoded overrides for known course names if needed
  const hardcodedMap: Record<string, string> = {
    "a-t exams rn": "A-T Exams-RN",
    "a-t exams lpn": "A-T Exams-LPN",
    "at exams rn": "A-T Exams-RN",
    "at exams lpn": "A-T Exams-LPN",
    "a-t exams-rn": "A-T Exams-RN",
    "a-t exams-lpn": "A-T Exams-LPN",
    "a-t exit exams-rn": "A-T EXIT Exams-RN",
    "a-t exit exams-lpn": "A-T EXIT Exams-LPN",
    "h-s exit rn exams": "H-S EXIT RN Exams",
    "h-s exit exams-lpn": "H-S EXIT Exams-LPN",
    "h-s exit exams-rn": "H-S EXIT Exams-RN",
    "h-s exams-rn": "H-S Exams-RN",
    "h-s exams-lpn": "H-S Exams-LPN",
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

  return name || "Nursing Course";
}

export default formatCourseDropdownName;
