/**
 * Canonical program dropdown order and naming helper:
 * 1. RN Nursing Exam
 * 2. LPN Nursing Exam
 * 3. RN Exit
 * 4. PN Exit
 */

export const CANONICAL_PROGRAM_ORDER = [
  "RN Nursing Exam",
  "LPN Nursing Exam",
  "RN Exit",
  "PN Exit",
] as const;

export function getProgramRank(name: string): number {
  const n = (name || "").toLowerCase().trim();
  if (/^rn\s+nursing/i.test(n)) return 1;
  if (/^lpn\s+nursing/i.test(n)) return 2;
  if (/^rn\s+exit/i.test(n)) return 3;
  if (/^(?:p|lp)n\s+exit/i.test(n)) return 4;
  return 99;
}

export function formatProgramDropdownName(name: string): string {
  const n = (name || "").trim();
  if (/^rn\s+nursing/i.test(n)) return "RN Nursing Exam";
  if (/^lpn\s+nursing/i.test(n)) return "LPN Nursing Exam";
  if (/^rn\s+exit/i.test(n)) return "RN Exit";
  if (/^(?:p|lp)n\s+exit/i.test(n)) return "PN Exit";
  return n;
}

export function matchesProgram(itemProgramName: string, selected: string): boolean {
  if (!selected || selected === "All Programmes" || selected === "all") return true;
  const item = (itemProgramName || "").toLowerCase().trim();
  const sel = selected.toLowerCase().trim();

  if (item === sel) return true;

  // 1. RN Nursing Exam (matches "RN Nursing Exam", "RN Nursing Exams", etc.)
  if (/^rn\s+nursing\s+exam/i.test(sel) || sel === "rn nursing exam") {
    return /^rn\s+nursing/i.test(item) && !/exit/i.test(item);
  }

  // 2. LPN Nursing Exam (matches "LPN Nursing Exam", "LPN Nursing Exams", etc.)
  if (/^lpn\s+nursing\s+exam/i.test(sel) || sel === "lpn nursing exam") {
    return /^lpn\s+nursing/i.test(item) && !/exit/i.test(item);
  }

  // 3. RN Exit (matches "RN Exit", "RN Exit Exams", etc.)
  if (/^rn\s+exit/i.test(sel) || sel === "rn exit") {
    return /^rn\s+exit/i.test(item) || (/exit/i.test(item) && !/lpn|pn/i.test(item));
  }

  // 4. PN Exit (matches "PN Exit", "LPN Exit", "PN Exit Exams", "LPN Exit Exams")
  if (/^(?:p|lp)n\s+exit/i.test(sel) || sel === "pn exit") {
    return /(?:lpn|pn)\s+exit/i.test(item) || (/exit/i.test(item) && /lpn|pn/i.test(item));
  }

  return item.includes(sel) || sel.includes(item);
}
