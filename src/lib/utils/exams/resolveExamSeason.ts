/**
 * Resolves the accurate season (Fall, Spring, Summer, Winter) for an exam.
 * Inspects explicit season mentions in the title, description, and month indicators (full & abbreviated),
 * ensuring Summer, Fall, and Spring exams are accurately labelled without mixing.
 */
export function resolveExamSeason(
  rawSeason?: string | null,
  title?: string | null,
  description?: string | null
): string | null {
  const text = `${title ?? ""} ${description ?? ""}`.toLowerCase();

  // 1. Explicit season keyword in title/description
  if (/\bsummer\b/i.test(title ?? "") || /\bsummer\b/i.test(text)) {
    return "Summer";
  }
  if (/\b(fall|autumn)\b/i.test(title ?? "") || /\b(fall|autumn)\b/i.test(text)) {
    return "Fall";
  }
  if (/\bspring\b/i.test(title ?? "") || /\bspring\b/i.test(text)) {
    return "Spring";
  }
  if (/\bwinter\b/i.test(text)) {
    return "Winter";
  }

  // 2. Month indicators in title/description (full & common abbreviations)
  if (/\b(june|jun|july|jul|august|aug)\b/i.test(text)) {
    return "Summer";
  }
  if (/\b(september|sept|sep|october|oct|november|nov|december|dec)\b/i.test(text)) {
    return "Fall";
  }
  if (/\b(january|jan|february|feb|march|mar|april|apr|may)\b/i.test(text)) {
    return "Spring";
  }

  // 3. Backend raw season if valid
  if (
    rawSeason &&
    typeof rawSeason === "string" &&
    rawSeason.trim() !== "" &&
    rawSeason.toLowerCase() !== "null" &&
    rawSeason.toLowerCase() !== "undefined"
  ) {
    const s = rawSeason.trim().toLowerCase();
    if (s.includes("summer")) return "Summer";
    if (s.includes("fall") || s.includes("autumn")) return "Fall";
    if (s.includes("spring")) return "Spring";
    if (s.includes("winter")) return "Winter";
    return rawSeason.trim();
  }

  return null;
}
