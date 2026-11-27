import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";
import { toSlug } from "@/lib/data/exam-subjects";
import { getGuestPreviewToken } from "@/lib/services/exams/questionsBreakdownService";
import {
  inferNursingPanelFromText,
  isAllowedNursingCourse,
  isAllowedNursingProgram,
  type CourseScopeShape,
  type ProgramScopeShape,
} from "@/lib/utils/exams/nursingProgramScope";

interface AllowedScopeCatalog {
  allowedPrograms: Array<ProgramScopeShape & { resolvedPanel: "rn-nursing" | "lpn-nursing" }>;
  allowedCourseIds: Set<string>;
  allowedCourseGuids: Set<string>;
  allowedCourseNames: Set<string>;
  timestamp: number;
}

const SCOPE_CATALOG_TTL_MS = 5 * 60 * 1000;
let cachedScopeCatalog: AllowedScopeCatalog | null = null;
let inflightScopeCatalog: Promise<AllowedScopeCatalog> | null = null;

async function getAllowedScopeCatalog(
  baseUrl: string,
  headers: HeadersInit
): Promise<AllowedScopeCatalog> {
  if (
    cachedScopeCatalog &&
    Date.now() - cachedScopeCatalog.timestamp < SCOPE_CATALOG_TTL_MS
  ) {
    return cachedScopeCatalog;
  }

  if (inflightScopeCatalog) return inflightScopeCatalog;

  inflightScopeCatalog = (async () => {
    try {
      const [progRes, courseRes] = await Promise.all([
        fetch(
          `${baseUrl}/api/castoline/strata/learning/programs/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=100`,
          { headers, cache: "no-store", signal: AbortSignal.timeout(4000) }
        ).catch(() => null),
        fetch(
          `${baseUrl}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=200`,
          { headers, cache: "no-store", signal: AbortSignal.timeout(4000) }
        ).catch(() => null),
      ]);

      const rawProgramsJson = progRes && progRes.ok ? await progRes.json().catch(() => null) : null;
      const rawCoursesJson = courseRes && courseRes.ok ? await courseRes.json().catch(() => null) : null;

      const rawProgs =
        rawProgramsJson?.data?.items ||
        rawProgramsJson?.Data?.Items ||
        rawProgramsJson?.items ||
        [];
      const rawCourses =
        rawCoursesJson?.data?.items ||
        rawCoursesJson?.Data?.Items ||
        rawCoursesJson?.items ||
        [];

      const progsConverted = (convertBackendKeysToCamel({ items: rawProgs }) as {
        items?: ProgramScopeShape[];
      })?.items ?? [];
      const coursesConverted = (convertBackendKeysToCamel({ items: rawCourses }) as {
        items?: CourseScopeShape[];
      })?.items ?? [];

      const allowedPrograms = progsConverted
        .filter((p) => isAllowedNursingProgram(p, "all"))
        .map((p) => ({
          ...p,
          resolvedPanel: inferNursingPanelFromText(p.name ?? p.programName ?? "", "rn-nursing"),
        }));

      const allowedCourses = coursesConverted.filter((c) =>
        isAllowedNursingCourse(c, "all")
      );

      const allowedCourseIds = new Set<string>();
      const allowedCourseGuids = new Set<string>();
      const allowedCourseNames = new Set<string>();

      for (const c of allowedCourses) {
        if (c.id != null) allowedCourseIds.add(String(c.id));
        if (c.guidId) allowedCourseGuids.add(c.guidId.toLowerCase());
        const cname = (c.name ?? c.title ?? "").trim().toLowerCase();
        if (cname) allowedCourseNames.add(cname);
      }

      const catalog: AllowedScopeCatalog = {
        allowedPrograms,
        allowedCourseIds,
        allowedCourseGuids,
        allowedCourseNames,
        timestamp: Date.now(),
      };

      if (allowedPrograms.length > 0 && allowedCourseIds.size > 0) {
        cachedScopeCatalog = catalog;
      }
      return catalog;
    } finally {
      inflightScopeCatalog = null;
    }
  })();

  return inflightScopeCatalog;
}

export interface SearchApiResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: "Exam" | "Subject / Course" | "Exam Bank" | "Dashboard Tool" | "Navigation";
  href: string;
  badge?: string;
  panelSlug?: string;
}

// In-memory cache for search queries
const searchCache = new Map<string, { results: SearchApiResultItem[]; timestamp: number }>();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

function resolvePanelFromText(text: string, fallback = "rn-nursing"): "rn-nursing" | "lpn-nursing" {
  const safeFallback = fallback === "lpn-nursing" ? "lpn-nursing" : "rn-nursing";
  return inferNursingPanelFromText(text, safeFallback);
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const rawQ = searchParams.get("q") || "";
  const q = rawQ.trim();
  const currentPanel = searchParams.get("panel") || "rn-nursing";

  if (!q || q.length < 2) {
    return NextResponse.json({ query: q, total: 0, results: [] });
  }

  const cacheKey = `${currentPanel}:${q.toLowerCase()}`;
  const now = Date.now();
  const cached = searchCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ query: q, total: cached.results.length, results: cached.results });
  }

  // Extract session auth headers
  let castoLine = req.headers.get("x-casto-line");
  let castoBadge = req.headers.get("x-casto-badge");
  const authHeader = req.headers.get("authorization");

  if (!castoBadge || castoBadge === "Void" || castoBadge === "void" || castoBadge === "null") {
    castoBadge = req.cookies.get("skew_blanc_session_badge")?.value || null;
  }
  if (!castoLine || castoLine === "Void" || castoLine === "void" || castoLine === "null") {
    const rawLine = req.cookies.get("skew_blanc_session_line")?.value;
    if (rawLine) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rawLine));
        castoLine = (castoBadge && parsed[castoBadge]) || Object.values(parsed)[0] || null;
      } catch {
        try {
          const parsed = JSON.parse(rawLine);
          castoLine = (castoBadge && parsed[castoBadge]) || Object.values(parsed)[0] || null;
        } catch {
          castoLine = rawLine;
        }
      }
    }
  }

  // Fallback to guest credentials if unauthenticated or Void
  if (!castoLine || castoLine === "Void") {
    const guest = await getGuestPreviewToken();
    if (guest) {
      castoLine = guest.line;
      if (!castoBadge || castoBadge === "Void") castoBadge = guest.badge;
    }
  }

  const siteHeaders = await getSiteHeaders();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...siteHeaders,
  };
  if (castoLine && castoLine !== "Void") headers["x-casto-line"] = castoLine;
  if (castoBadge && castoBadge !== "Void") headers["x-casto-badge"] = castoBadge;
  if (authHeader) headers["authorization"] = authHeader;

  const baseUrl = getBackendBaseUrl();
  const results: SearchApiResultItem[] = [];
  const seenHrefs = new Set<string>();

  // Extract query keywords (e.g. "Pathophysiology Exam-2" -> ["Pathophysiology", "Exam-2"])
  const words = q.split(/\s+/).filter(Boolean);
  const primaryWord = words[0] || q;

  const scopeCatalog = await getAllowedScopeCatalog(baseUrl, headers);

  const queryExams = async (searchTerm: string) => {
    if (scopeCatalog.allowedPrograms.length === 0) return [];
    const resultsPerProgram = await Promise.all(
      scopeCatalog.allowedPrograms.map(async (prog) => {
        const progId = String(prog.guidId || prog.id || "");
        if (!progId) return [];
        try {
          const url = `${baseUrl}/api/castoline/strata/assessment/exams/list/nominal?fetchtype=nominal&identifier=${encodeURIComponent(progId)}&dynamicLearningStrataName=program&dynamicPage=1&dynamicPerPage=25&dynamicSearch=${encodeURIComponent(searchTerm)}`;
          const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(3500) });
          if (!res.ok) return [];
          const raw = await res.json();
          const rawItems = raw?.data?.items || raw?.Data?.Items || raw?.items || raw?.Items || [];
          const converted = convertBackendKeysToCamel({ items: rawItems }) as { items?: any[] };
          return (converted?.items || []).map((item) => ({
            ...item,
            programName: item.programName || prog.name || prog.programName,
            __resolvedPanel: prog.resolvedPanel,
          }));
        } catch {
          return [];
        }
      })
    );
    return resultsPerProgram.flat();
  };

  const querySubjects = async (searchTerm: string) => {
    try {
      const url = `${baseUrl}/api/castoline/strata/learning/subjects/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=25&dynamicSearch=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(3500) });
      if (!res.ok) return [];
      const raw = await res.json();
      const rawItems = raw?.data?.items || raw?.Data?.Items || raw?.items || raw?.Items || [];
      const converted = convertBackendKeysToCamel({ items: rawItems }) as { items?: any[] };
      return (converted?.items || []).filter((s) => {
        if (s.programName && isAllowedNursingProgram({ programName: s.programName }, "all")) {
          return true;
        }
        const cGuid = s.courseGuidId ? String(s.courseGuidId).toLowerCase() : "";
        const cId = s.courseId != null ? String(s.courseId) : "";
        const cName = (s.courseName || "").trim().toLowerCase();
        return (
          (cGuid && scopeCatalog.allowedCourseGuids.has(cGuid)) ||
          (cId && scopeCatalog.allowedCourseIds.has(cId)) ||
          (cName && scopeCatalog.allowedCourseNames.has(cName))
        );
      });
    } catch {
      return [];
    }
  };

  const queryCourses = async (searchTerm: string) => {
    try {
      const url = `${baseUrl}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=25&dynamicSearch=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(3500) });
      if (!res.ok) return [];
      const raw = await res.json();
      const rawItems = raw?.data?.items || raw?.Data?.Items || raw?.items || raw?.Items || [];
      const converted = convertBackendKeysToCamel({ items: rawItems }) as { items?: any[] };
      return (converted?.items || []).filter((c) => isAllowedNursingCourse(c, "all"));
    } catch {
      return [];
    }
  };

  // Run backend search queries in parallel
  const searchPromises = [
    queryExams(q),
    querySubjects(q),
    queryCourses(q),
  ];

  // If query is multi-word like "Pathophysiology Exam-2", also query the primary word
  if (words.length > 1 && primaryWord.length >= 3) {
    searchPromises.push(queryExams(primaryWord));
    searchPromises.push(querySubjects(primaryWord));
  }

  const [examsRes, subjectsRes, coursesRes, secondaryExamsRes, secondarySubjectsRes] =
    await Promise.allSettled(searchPromises);

  const rawExams: any[] = [
    ...(examsRes.status === "fulfilled" ? examsRes.value : []),
    ...(secondaryExamsRes && secondaryExamsRes.status === "fulfilled" ? secondaryExamsRes.value : []),
  ];

  const rawSubjects: any[] = [
    ...(subjectsRes.status === "fulfilled" ? subjectsRes.value : []),
    ...(secondarySubjectsRes && secondarySubjectsRes.status === "fulfilled" ? secondarySubjectsRes.value : []),
  ];

  const rawCourses: any[] = coursesRes.status === "fulfilled" ? coursesRes.value : [];

  // Filter terms
  const rawTerms = q.toLowerCase().split(/[\s\-_]+/).filter(Boolean);
  const nonExamTerms = rawTerms.filter((t) => !/^(?:exam|exams|test|tests|\d+)$/i.test(t));
  const examNumberMatch = q.match(/(?:exam|test)[\s\-_]*(\d+)/i) || q.match(/\b(\d+)\b/);
  const examNumber = examNumberMatch ? examNumberMatch[1] : null;

  // 1. Process Exams
  rawExams.forEach((exam) => {
    const id = exam.guidId || exam.id;
    if (!id) return;

    const title = (exam.title || exam.name || "").trim();
    if (!title) return;

    const titleLower = title.toLowerCase();
    const qLower = q.toLowerCase();
    const fullText = `${title} ${exam.subjectName || ""} ${exam.courseName || ""} ${exam.season || ""} ${exam.year || ""}`.toLowerCase();
    const matchesPhrase = titleLower.includes(qLower) || fullText.includes(qLower);
    const matchesAll = rawTerms.every((t) => fullText.includes(t));
    const matchesNonExam = nonExamTerms.length > 0 && nonExamTerms.every((t) => fullText.includes(t));

    // For multi-word searches, require phrase match, all words, or all non-exam words
    if (words.length > 1) {
      if (!matchesPhrase && !matchesAll && !matchesNonExam) return;
    } else {
      const singleWord = rawTerms[0] || qLower;
      if (!titleLower.includes(singleWord) && !matchesAll) return;
    }

    const panel = exam.__resolvedPanel || resolvePanelFromText(`${title} ${exam.programName || ""} ${exam.courseName || ""} ${exam.subjectName || ""}`, currentPanel);
    const href = `/web/${panel}/vista/exam/generic?mode=Practice&identifier=${id}`;

    if (!seenHrefs.has(href)) {
      seenHrefs.add(href);
      const subtitleParts = [
        exam.subjectName || exam.courseName,
        exam.season,
        exam.year ? String(exam.year) : null,
      ].filter(Boolean);

      results.push({
        id: `exam-${id}`,
        title,
        subtitle: subtitleParts.length ? subtitleParts.join(" • ") : "Practice Examination",
        category: "Exam",
        href,
        badge: exam.questionsCount ? `${exam.questionsCount} Qs` : "Exam",
        panelSlug: panel,
      });
    }
  });

  // 2. Process Subjects
  rawSubjects.forEach((subject) => {
    const id = subject.guidId || subject.id;
    if (!id) return;

    const name = (subject.name || subject.title || "").trim();
    if (!name) return;

    const fullText = `${name} ${subject.courseName || ""} ${subject.description || ""}`.toLowerCase();
    const matchesAll = rawTerms.every((t) => fullText.includes(t));
    const matchesComposite = nonExamTerms.length > 0 && nonExamTerms.every((t) => fullText.includes(t));

    if (!matchesAll && !matchesComposite) return;

    const panel = resolvePanelFromText(`${name} ${subject.courseName || ""}`, currentPanel);
    const courseId = subject.courseGuidId || subject.courseId || "general-exams";
    const courseSlug = toSlug(subject.courseName || "general-exams");
    const subjectHref = `/dashboards/${panel}/exams/${courseSlug}/${courseId}/exams/${id}?subjectName=${encodeURIComponent(name)}`;

    // If query mentioned an exam under this subject (e.g. "Pathophysiology Exam-2")
    if (matchesComposite && examNumber) {
      const cleanSubName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
      const examTitle = `${cleanSubName} Exam-${examNumber}`;
      results.unshift({
        id: `inferred-exam-${id}-${examNumber}`,
        title: examTitle,
        subtitle: `${name} • Exam ${examNumber}`,
        category: "Exam",
        href: subjectHref,
        badge: `Exam #${examNumber}`,
        panelSlug: panel,
      });
    }

    if (!seenHrefs.has(subjectHref)) {
      seenHrefs.add(subjectHref);
      results.push({
        id: `subject-${id}`,
        title: name,
        subtitle: `${subject.courseName ? `${subject.courseName} • ` : ""}${subject.examCount ?? subject.examsCount ?? 0} Exams`,
        category: "Subject / Course",
        href: subjectHref,
        badge: subject.examCount ? `${subject.examCount} Exams` : "Subject",
        panelSlug: panel,
      });
    }
  });

  // 3. Process Courses
  rawCourses.forEach((course) => {
    const id = course.guidId || course.id;
    if (!id) return;

    const name = (course.name || course.title || "").trim();
    if (!name) return;

    const fullText = `${name} ${course.programName || ""} ${course.description || ""}`.toLowerCase();
    const matchesAll = rawTerms.every((t) => fullText.includes(t));
    if (!matchesAll) return;

    const panel = resolvePanelFromText(`${name} ${course.programName || ""}`, currentPanel);
    const href = `/dashboards/${panel}/exams/${toSlug(name)}/${id}`;

    if (!seenHrefs.has(href)) {
      seenHrefs.add(href);
      results.push({
        id: `course-${id}`,
        title: name,
        subtitle: `${course.programName ? `${course.programName} • ` : ""}Course & Subject Bank`,
        category: "Exam Bank",
        href,
        badge: "Course",
        panelSlug: panel,
      });
    }
  });

  // Exact Match Gate:
  // If the user searched a specific exam or subject name and exact matches exist,
  // return ONLY the exact match(es) so we don't overwhelm with other relative results.
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const qClean = clean(q);

  const isExact = (title: string) => {
    const tClean = clean(title);
    if (tClean === qClean) return true;
    const tNoSuffix = clean(title.replace(/\s*(?:nclex|hesi|ati|teas|rn|pn|exams?)+\s*$/i, ""));
    const qNoSuffix = clean(q.replace(/\s*(?:nclex|hesi|ati|teas|rn|pn|exams?)+\s*$/i, ""));
    return Boolean(tNoSuffix && qNoSuffix && tNoSuffix === qNoSuffix);
  };

  const exactMatches = results.filter((r) => isExact(r.title));
  let finalResults: SearchApiResultItem[] = [];

  if (exactMatches.length > 0) {
    const panelExact = exactMatches.filter((r) => !r.panelSlug || r.panelSlug === currentPanel);
    finalResults = panelExact.length > 0 ? panelExact : exactMatches;
  } else {
    // Only when no exact match exists do we show relative searches
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const qLower = q.toLowerCase();

      // Starts with comes next
      if (aTitle.startsWith(qLower) && !bTitle.startsWith(qLower)) return -1;
      if (bTitle.startsWith(qLower) && !aTitle.startsWith(qLower)) return 1;

      // Current panel boost
      if (a.panelSlug === currentPanel && b.panelSlug !== currentPanel) return -1;
      if (b.panelSlug === currentPanel && a.panelSlug !== currentPanel) return 1;

      return 0;
    });

    finalResults = results.slice(0, 12);
  }

  searchCache.set(cacheKey, { results: finalResults, timestamp: now });

  return NextResponse.json({
    query: q,
    total: finalResults.length,
    results: finalResults,
  });
}
