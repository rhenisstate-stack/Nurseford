/**
 * Shared scope classifier restricting catalog, exam, assessment, result,
 * course, and search queries to RN Nursing, LPN Nursing, and RN/LPN Exit Exams.
 */

export type NursingProgramScope = "all" | "rn-nursing" | "lpn-nursing";

export interface ProgramScopeShape {
  id?: number | string | null;
  guidId?: string | null;
  name?: string | null;
  programName?: string | null;
  title?: string | null;
  segment?: string | null;
}

export interface CourseScopeShape {
  id?: number | string | null;
  guidId?: string | null;
  name?: string | null;
  title?: string | null;
  programName?: string | null;
  segment?: string | null;
}

export interface AssessmentScopeShape {
  id?: number | string | null;
  guidId?: string | null;
  name?: string | null;
  programName?: string | null;
}

export interface ResultScopeShape {
  programName?: string | null;
  courseName?: string | null;
  subjectName?: string | null;
  title?: string | null;
  segment?: string | null;
  assessmentName?: string | null;
}

const EXCLUDED_SEGMENTS = new Set([
  "ATI_TEAS",
  "HESI_A2",
  "NCLEX_RN",
  "NCLEX_PN",
  "CNA",
  "GED",
  "PRE_NURSING",
  "CERTIFICATION",
  "NEXUS_ICT",
  "ACCUPLACER",
]);

const EXCLUDED_NAME_RE =
  /\b(?:nclex|teas|ati[\s\-]*teas|hesi[\s\-]*a2|accuplacer|ged|cna|pre[-\s]*nursing|certification|explicit\s+dynamic)\b/i;

const RN_NURSING_OR_EXIT_RE =
  /^(?:RN[\s\-]*(?:Nursing|Exit)(?:\s*Exams?)?(?:\s*GROUP)?|EXIT[\s\-]*(?:ATI|HESI)?[\s\-]*(?:Exams?[\s\-]*)?RN|.*\bRN\b.*\bExit\b)$/i;

const LPN_NURSING_OR_EXIT_RE =
  /^(?:LPN[\s\-]*(?:Nursing|Exit)(?:\s*Exams?)?(?:\s*GROUP)?|EXIT[\s\-]*(?:ATI|HESI)?[\s\-]*(?:Exams?[\s\-]*)?(?:LPN|PN)|.*\b(?:LPN|PN)\b.*\bExit\b)$/i;

const GENERIC_EXIT_RE = /\bExit\s*Exams?(?:\s*GROUP)?\b/i;

export function resolveNursingScope(panel?: string | null): NursingProgramScope {
  if (panel === "rn-nursing") return "rn-nursing";
  if (panel === "lpn-nursing") return "lpn-nursing";
  return "all";
}

export function isAllowedNursingProgram(
  item: ProgramScopeShape | null | undefined,
  scope: NursingProgramScope = "all"
): boolean {
  if (!item) return false;

  const seg = (item.segment ?? "").toUpperCase().trim();
  const label = (item.name ?? item.programName ?? item.title ?? "").trim();
  if (!label && !seg) return false;

  if (seg && EXCLUDED_SEGMENTS.has(seg)) return false;
  if (label && EXCLUDED_NAME_RE.test(label)) return false;

  const isRn =
    seg === "RN_NURSING" ||
    seg === "RN_EXIT" ||
    RN_NURSING_OR_EXIT_RE.test(label);

  const isLpn =
    seg === "LPN_NURSING" ||
    seg === "LPN_EXIT" ||
    LPN_NURSING_OR_EXIT_RE.test(label);

  if (scope === "rn-nursing") return isRn;
  if (scope === "lpn-nursing") return isLpn;

  return isRn || isLpn || GENERIC_EXIT_RE.test(label);
}

export function isAllowedNursingAssessment(
  item: AssessmentScopeShape | null | undefined,
  scope: NursingProgramScope = "all"
): boolean {
  if (!item) return false;
  // Backend Assessment rows carry a placeholder segment ("ATI_TEAS"),
  // so classify strictly by Assessment / Program name.
  if (item.programName) {
    return isAllowedNursingProgram({ programName: item.programName }, scope);
  }
  const label = (item.name ?? "").trim();
  if (!label || EXCLUDED_NAME_RE.test(label)) return false;
  const isRn = RN_NURSING_OR_EXIT_RE.test(label);
  const isLpn = LPN_NURSING_OR_EXIT_RE.test(label);
  if (scope === "rn-nursing") return isRn;
  if (scope === "lpn-nursing") return isLpn;
  return isRn || isLpn || GENERIC_EXIT_RE.test(label);
}

export function isAllowedNursingCourse(
  item: CourseScopeShape | null | undefined,
  scope: NursingProgramScope = "all"
): boolean {
  if (!item) return false;

  const title = (item.name ?? item.title ?? "").trim();
  if (!title) return false;

  const seg = (item.segment ?? "").toUpperCase().trim();
  const normalizedSeg = seg.replace(/_/g, " ");

  if (
    EXCLUDED_NAME_RE.test(title) ||
    /\b(?:standalone\s+questions|client\s+needs)\b/i.test(title) ||
    (seg && (EXCLUDED_SEGMENTS.has(seg) || EXCLUDED_NAME_RE.test(normalizedSeg)))
  ) {
    return false;
  }

  if (item.programName) {
    return isAllowedNursingProgram(
      { programName: item.programName, segment: item.segment },
      scope
    );
  }

  // Only treat canonical program-level segment enums as authoritative program tags;
  // subject rows carry slugified subject names in `segment` and fall through to title matching.
  if (
    seg === "RN_NURSING" ||
    seg === "RN_EXIT" ||
    seg === "LPN_NURSING" ||
    seg === "LPN_EXIT"
  ) {
    return isAllowedNursingProgram({ segment: seg }, scope);
  }

  const combinedTitle = normalizedSeg ? `${title} ${normalizedSeg}`.trim() : title;

  const isRnCourse =
    /\b(?:rn|grn)\b|\b(?:rhenis|rhemplify|exit)[^a-z0-9]*.*\brn\b|rhenis\s+general\s+exams/i.test(
      combinedTitle
    );
  const isLpnCourse =
    /\b(?:lpn|pn)\b|kap[\s\-]*lan\s+exams/i.test(combinedTitle);
  const isExitCourse = /\bexit\b/i.test(combinedTitle);

  if (scope === "rn-nursing") return isRnCourse && !isLpnCourse;
  if (scope === "lpn-nursing") return isLpnCourse && !isRnCourse;

  return isRnCourse || isLpnCourse || isExitCourse;
}

export function isAllowedNursingResult(
  item: ResultScopeShape | null | undefined,
  scope: NursingProgramScope = "all"
): boolean {
  if (!item) return false;

  const progName = (item.programName ?? "").trim();
  if (progName) {
    return isAllowedNursingProgram({ programName: progName }, scope);
  }

  const courseName = (item.courseName ?? "").trim();
  if (courseName) {
    return isAllowedNursingCourse({ name: courseName }, scope);
  }

  const fallbackText = `${item.subjectName ?? ""} ${item.title ?? ""}`.trim();
  if (!fallbackText || EXCLUDED_NAME_RE.test(fallbackText)) return false;

  if (scope === "rn-nursing") {
    return !/\b(?:lpn|pn)\b/i.test(fallbackText) || /\brn\b/i.test(fallbackText);
  }
  if (scope === "lpn-nursing") {
    return /\b(?:lpn|pn)\b/i.test(fallbackText) && !/\brn\b/i.test(fallbackText);
  }

  return true;
}

export function inferNursingPanelFromText(
  text: string,
  fallback: "rn-nursing" | "lpn-nursing" = "rn-nursing"
): "rn-nursing" | "lpn-nursing" {
  const t = text.toLowerCase();
  if (t.includes("lpn-nursing") || t.includes("lpn nursing") || /\b(?:lpn|pn)\b/.test(t) || /-pn\b/.test(t)) {
    return "lpn-nursing";
  }
  if (t.includes("rn-nursing") || t.includes("rn nursing") || /\brn\b/.test(t) || /-rn\b/.test(t)) {
    return "rn-nursing";
  }
  return fallback === "lpn-nursing" ? "lpn-nursing" : "rn-nursing";
}
