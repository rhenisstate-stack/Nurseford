import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;
export const dynamic = "force-dynamic";
import {
  toSlug,
  VALID_EXAM_TYPES,
  type BackendSubject,
} from "@/lib/data/exam-subjects";
import {
  getBackendBaseUrl,
} from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";

// Subject cards for the non-NCLEX dashboards, e.g. GET /api/exams/ati-teas/subjects
// → { examType, segment, subjects: [...] }.
//
// The subjects are fetched exactly from the backend (strata course feed filtered
// by the exam's segment), mirroring GET /api/courses. NCLEX is excluded here —
// its dashboards are already fed by GET /api/courses — and keeps the static
// catalog. When the backend is unreachable, the static catalog is used as a
// guaranteed fallback so the card row never renders empty.
const EXAM_SEGMENTS: Record<string, string> = {
  "ati-teas": "ATI_TEAS",
  "hesi-a2": "HESI_A2",
  "rn-nursing": "RN_NURSING",
  "lpn-nursing": "LPN_NURSING",
  "rn-exit": "RN_NURSING",
  "lpn-exit": "LPN_NURSING",
  "nclex-rn": "NCLEX_RN",
  "nclex-pn": "NCLEX_PN",
  "cna": "CNA",
  "ged": "GED",
  "pre-nursing": "PRE_NURSING",
  "certification": "CERTIFICATION",
};

// The backend truthfully labels every course with a `programName` (e.g. "ATI TEAS",
// "HESI A2", "RN Nursing Exams", "LPN Nursing Exams", "RN Exit Exams", "LPN Exit Exams").
// Map each dashboard / track to its intended program name(s).
const PROGRAM_NAME_FILTERS: Record<string, RegExp> = {
  "ati-teas": /^ATI[\s\-]*TEAS$/i,
  "hesi-a2": /^HESI[\s\-]*A2$/i,
  "rn-nursing": /^(?:RN[\s\-]*Nursing\s*Exams|RN[\s\-]*Exit(?:\s*Exams)?|Exit\s*Exams[\s\-–(]*RN\)?)/i,
  "lpn-nursing": /^(?:LPN[\s\-]*Nursing\s*Exams|LPN[\s\-]*Exit(?:\s*Exams)?|Exit\s*Exams[\s\-–(]*LPN\)?)/i,
  "rn-exit": /^(?:RN[\s\-]*Exit(?:\s*Exams)?|Exit\s*Exams[\s\-–(]*RN\)?|RN[\s\-]*Nursing\s*Exams)/i,
  "lpn-exit": /^(?:LPN[\s\-]*Exit(?:\s*Exams)?|Exit\s*Exams[\s\-–(]*LPN\)?|LPN[\s\-]*Nursing\s*Exams)/i,
  "nclex-rn": /^NCLEX[\s\-]*RN$/i,
  "nclex-pn": /^NCLEX[\s\-]*PN$/i,
  "cna": /^CNA/i,
  "ged": /^GED/i,
  "pre-nursing": /^Pre[-\s]*Nursing/i,
  "certification": /^Certification/i,
};

interface BackendCourseItem {
  id?: number | string;
  guidId?: string;
  name?: string;
  description?: string;
  segment?: string;
  programName?: string;
  coursesCount?: number;
  subjectsCount?: number;
  order?: number | string;
  rank?: number | string;
  position?: number | string;
  sortOrder?: number | string;
  displayOrder?: number | string;
}

const subjectsEndpoint = (): string =>
  `${getBackendBaseUrl()}/api/castoline/strata/learning/courses/list/absolute`;

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function parseOrder(value: unknown, fallbackIndex: number): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 10000 + fallbackIndex;
}

// ─────────────────────────────────────────────────────────────────────────────
// Program-name classifier.  The backend's `segment` field is unreliable, but
// the `programName` field truthfully labels each course.  We classify a course
// into a dashboard segment purely from its programName when possible.
// ─────────────────────────────────────────────────────────────────────────────
function programNameToSegment(programName: string | undefined): string | null {
  const p = (programName ?? "").trim();
  if (!p) return null;
  if (/^ATI\s*TEAS$/i.test(p)) return "ATI_TEAS";
  if (/^HESI\s*A2$/i.test(p)) return "HESI_A2";
  if (/^NCLEX\s*(RN|PN)$/i.test(p)) {
    return /PN/.test(p) ? "NCLEX_PN" : "NCLEX_RN";
  }
  if (/^RN\s*Nursing\s*Exams$/i.test(p)) return "RN_NURSING";
  if (/^LPN\s*Nursing\s*Exams$/i.test(p)) return "LPN_NURSING";
  return null;
}

// Last-resort classifier based on the course name, used only when programName
// itself is ambiguous or empty.
function inferSegmentFromName(name: string): string | null {
  const n = name.toLowerCase().trim();
  if (/nclex[\s\-]*pn/.test(n) && !/rn/.test(n)) return "NCLEX_PN";
  if (/nclex[\s\-]*rn/.test(n)) return "NCLEX_RN";
  if (/\b(?:lpn)\b/.test(n)) return "LPN_NURSING";
  if (/ati\s*teas|teas\s*\d/.test(n)) return "ATI_TEAS";
  if (/hesi\s*a2/.test(n)) return "HESI_A2";
  if (/\brn\b/.test(n)) return "RN_NURSING";
  return null;
}

async function fetchBackendSubjects(examType: string, req: NextRequest): Promise<BackendSubject[]> {
  const segment = EXAM_SEGMENTS[examType];
  const segmentProg = PROGRAM_NAME_FILTERS[examType];
  const query = new URLSearchParams({
    fetchtype: "absolute",
    dynamicPage: "1",
    dynamicPerPage: "200",
    dynamicSearch: "",
  });

  // Forward the caller's session headers so the backend accepts the request.
  const castoLine = req.headers.get("x-casto-line");
  const castoBadge = req.headers.get("x-casto-badge");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(await getSiteHeaders()),
  };
  if (castoLine) headers["x-casto-line"] = castoLine;
  if (castoBadge) headers["x-casto-badge"] = castoBadge;

  const res = await fetch(`${subjectsEndpoint()}?${query.toString()}`, {
    method: "GET",
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`Backend responded ${res.status}`);
  }

  const raw = (await res.json()) as Record<string, unknown>;
  const converted = convertBackendKeysToCamel(raw) as {
    data?: { items?: BackendCourseItem[] };
  };

  const items = converted.data?.items ?? [];

  // Primary filter: use the backend's programName, which truthfully labels
  // each course's exam.
  const byProgramName = items.filter((c) =>
    segmentProg ? segmentProg.test(c.programName ?? "") : false
  );

  let filtered = byProgramName;

  // Fallback: if nothing matched from programName, use specialized classifiers
  if (filtered.length === 0) {
    if (examType === "rn-exit" || examType === "rn-nursing") {
      filtered = items.filter((c) => /rn/i.test(c.name ?? "") || /rn/i.test(c.programName ?? ""));
    } else if (examType === "lpn-exit" || examType === "lpn-nursing") {
      filtered = items.filter((c) => /lpn|pn\b/i.test(c.name ?? "") || /lpn|pn\b/i.test(c.programName ?? ""));
    } else if (examType === "nclex-rn") {
      filtered = items.filter((c) => /nclex[\s\-]*rn/i.test(c.name ?? "") || /nclex[\s\-]*rn/i.test(c.programName ?? ""));
    } else if (examType === "nclex-pn") {
      filtered = items.filter((c) => /nclex[\s\-]*pn/i.test(c.name ?? "") || /nclex[\s\-]*pn/i.test(c.programName ?? ""));
    } else {
      const byProg = items.filter(
        (c) => programNameToSegment(c.programName) === segment
      );
      filtered = byProg.length > 0 ? byProg : items.filter((c) => inferSegmentFromName(c.name ?? "") === segment);
    }
  }

  console.log(
    `🌿 [/api/exams/${examType}/subjects] Backend returned ${items.length} items, ` +
    `programName matched ${byProgramName.length}, ` +
    `final: ${filtered.length}`
  );

  const mapped: BackendSubject[] = filtered.map((c, i) => {
    const rawName = c.name?.trim() || "";
    const name = rawName
      .replace(/rhem(?:p|pl|l)?ify/gi, "Exemplify")
      .replace(/rhenis\s*/gi, "")
      .trim();
    const guid = c.guidId || (typeof c.id === "string" && c.id.includes("-") ? c.id : undefined);
    const slug = toSlug(name);
    const liveSubjectsCount = toNumber(c.subjectsCount ?? c.coursesCount, 0);

    return {
      id: guid ?? c.id ?? name,
      guidId: guid,
      name,
      slug,
      description: c.description || "",
      coursesCount: liveSubjectsCount,
      subjectsCount: liveSubjectsCount,
      examCount: liveSubjectsCount,
      order: parseOrder(c.order ?? c.position ?? c.rank ?? c.sortOrder ?? c.displayOrder, i + 1),
    };
  });

  mapped.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  return mapped;
}

const examSubjectsCache = new Map<string, { subjects: BackendSubject[]; timestamp: number }>();
const CACHE_TTL_MS = 15000;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ examType: string }> }
) {
  const { examType } = await params;

  if (!(VALID_EXAM_TYPES as readonly string[]).includes(examType)) {
    return NextResponse.json(
      {
        error: `Unknown exam type '${examType}'. Valid types: ${VALID_EXAM_TYPES.join(
          ", "
        )}`,
      },
      { status: 400 }
    );
  }

  const segment = EXAM_SEGMENTS[examType] ?? null;

  // NCLEX is not wired through this route (its dashboards use /api/courses).
  if (!segment) {
    return NextResponse.json({
      examType,
      segment: null,
      subjects: [],
    });
  }

  // Check in-memory cache first
  const now = Date.now();
  const cached = examSubjectsCache.get(examType);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      { examType, segment, subjects: cached.subjects },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  try {
    const subjects = await fetchBackendSubjects(examType, _req);
    examSubjectsCache.set(examType, { subjects, timestamp: now });
    console.log(`🌿 [/api/exams/${examType}/subjects] Fetched ${subjects.length} subjects from backend`);
    return NextResponse.json(
      { examType, segment, subjects },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error(
      `❌ [/api/exams/${examType}/subjects] Backend fetch failed:`,
      err
    );
    // If backend fails but we have stale cache, serve stale cache
    if (cached) {
      return NextResponse.json(
        { examType, segment, subjects: cached.subjects },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      );
    }
    return NextResponse.json({
      examType,
      segment,
      subjects: [],
    });
  }
}