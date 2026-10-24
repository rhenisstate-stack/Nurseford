/**
 * Extracts the correct 4-digit exam year (e.g. 2019, 2022, 2023, 2024, 2025, 2026).
 * Priority:
 * 1. 4-digit year found in exam title (e.g. "GRAMMAR 2023 Exam-3", "Adult Health 2022")
 * 2. 4-digit year found in subject name (e.g. "GRAMMAR 2023", "MATH 2024")
 * 3. Raw year property if valid (2000 - 2040)
 * 4. Fallback: 2026
 */
export function extractExamYear(
  title?: string | null,
  subjectName?: string | null,
  rawYear?: number | string | null
): number {
  if (title) {
    const titleMatch = title.match(/\b(201\d|202\d|203\d)\b/);
    if (titleMatch) return Number(titleMatch[1]);
  }
  if (subjectName) {
    const subjectMatch = subjectName.match(/\b(201\d|202\d|203\d)\b/);
    if (subjectMatch) return Number(subjectMatch[1]);
  }
  if (rawYear !== undefined && rawYear !== null) {
    const num = Number(rawYear);
    if (!isNaN(num) && num >= 2000 && num <= 2040) {
      return num;
    }
  }
  return 2026;
}
