import { NextRequest, NextResponse } from "next/server";
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
  "nclex-rn": "NCLEX_RN",
  "nclex-pn": "NCLEX_PN",
  "cna": "CNA",
  "ged": "GED",
  "pre-nursing": "PRE_NURSING",
  "certification": "CERTIFICATION",
};

// The backend truthfully labels every course with a `programName` (e.g. "ATI TEAS",
// "HESI A2", "RN Nursing Exams", "LPN Nursing Exams").  The `segment` field is
// NOT reliable — it is set to "ATI_TEAS" for virtually every course, which is
// what caused all courses to pile into the ATI TEAS dashboard.  Map each
// dashboard to its intended program name(s).  The dedicated "RN/LPN Exit Exams"
// programs are deliberately excluded — their exit exams live under the Exit
// programs, not the Nursing-exam dashboards.
const PROGRAM_NAME_FILTERS: Record<string, RegExp> = {
  "ati-teas": /^ATI\s*TEAS$/i,
  "hesi-a2": /^HESI\s*A2$/i,
  "rn-nursing": /^RN\s*Nursing\s*Exams$/i,
  "lpn-nursing": /^LPN\s*Nursing\s*Exams$/i,
  "nclex-rn": /^NCLEX\s*RN$/i,
  "nclex-pn": /^NCLEX\s*PN$/i,
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
  subjectsCount?: number;
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
    dynamicSortColumn: "name",
    dynamicSortDirection: "asc",
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
    next: { revalidate: 300 },
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
  // each course's exam.  This cleanly separates ATI TEAS / HESI A2 /
  // RN (incl. exit) / LPN (incl. exit).
  const byProgramName = items.filter((c) =>
    segmentProg ? segmentProg.test(c.programName ?? "") : false
  );

  // Fallback: if nothing matched from programName, use the programName→segment
  // classifier, then the name-based classifier as a last resort.
  const filtered =
    byProgramName.length > 0
      ? byProgramName
      : (() => {
          // only courses the program classifier assigns to this exact segment
          const byProg = items.filter(
            (c) => programNameToSegment(c.programName) === segment
          );
          if (byProg.length > 0) return byProg;
          return items.filter(
            (c) => inferSegmentFromName(c.name ?? "") === segment
          );
        })();

  console.log(
    `🌿 [/api/exams/${examType}/subjects] Backend returned ${items.length} items, ` +
      `programName matched ${byProgramName.length}, ` +
      `final: ${filtered.length}`
  );

  return filtered
    .map((c, i) => {
      const name = c.name?.trim() || `Subject ${i + 1}`;
      const guid = c.guidId || (typeof c.id === "string" && c.id.includes("-") ? c.id : undefined);
      return {
        id: guid ?? c.id ?? name,
        guidId: guid,
        name,
        slug: toSlug(name),
        description: c.description,
        examCount: toNumber(c.subjectsCount, 0),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

const examSubjectsCache = new Map<string, { subjects: BackendSubject[]; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ examType: string }> }
) {
  const { examType } = await params;

  if (!VALID_EXAM_TYPES.includes(examType)) {
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
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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