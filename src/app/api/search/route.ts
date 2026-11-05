import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";
import { toSlug } from "@/lib/data/exam-subjects";

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

// Guest preview auth cache
let cachedGuestBadge: string | null = "B536816D72FA09B200042157A4140BB5ADF8F2CA9D1BF7FEA592AB1A759D33C29696C0D09522571C8081FA69512A97AA";
let cachedGuestLine: string | null = null;
let guestTokenPromise: Promise<{ line: string; badge: string } | null> | null = null;

async function getGuestAuth(): Promise<{ line: string; badge: string } | null> {
  if (cachedGuestLine && cachedGuestBadge) {
    return { line: cachedGuestLine, badge: cachedGuestBadge };
  }
  if (guestTokenPromise) return guestTokenPromise;

  guestTokenPromise = (async () => {
    try {
      const baseUrl = getBackendBaseUrl();
      const loginUrl = `${baseUrl}/api/castoline/auth/login`;
      const res = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getSiteHeaders()),
        },
        body: JSON.stringify({
          email: "preview_guest@rhenis.internal",
          password: "PreviewGuest2026!#",
          loginMethod: "password",
          LoginProvider: "email",
          dashboardName: "web",
          role: "Learner",
          challenge: "learner.login.skew8lancasto",
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) return null;
      const loginData = await res.json().catch(() => null);
      if (loginData?.user?.castoLine) {
        const line = String(loginData.user.castoLine);
        const badge = String(loginData.user.castoBadge || cachedGuestBadge);
        cachedGuestLine = line;
        cachedGuestBadge = badge;
        return { line, badge };
      }
      return null;
    } catch {
      return null;
    } finally {
      guestTokenPromise = null;
    }
  })();

  return guestTokenPromise;
}

function resolvePanelFromText(text: string, fallback = "rn-nursing"): string {
  const t = text.toLowerCase();
  if (t.includes("nclex-rn") || t.includes("nclex rn")) return "nclex-rn";
  if (t.includes("nclex-pn") || t.includes("nclex pn") || t.includes("lpn practical")) return "nclex-pn";
  if (t.includes("ati-teas") || t.includes("ati teas") || t.includes("teas 7") || t.includes("teas")) return "ati-teas";
  if (t.includes("hesi-a2") || t.includes("hesi a2") || t.includes("hesi admission")) return "hesi-a2";
  if (t.includes("lpn-nursing") || t.includes("lpn nursing") || t.includes("lpn")) return "lpn-nursing";
  if (t.includes("rn-nursing") || t.includes("rn nursing")) return "rn-nursing";
  return fallback;
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
    const guest = await getGuestAuth();
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

  const queryExams = async (searchTerm: string) => {
    try {
      const url = `${baseUrl}/api/castoline/strata/assessment/exams/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=25&dynamicSearch=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(3500) });
      if (!res.ok) return [];
      const raw = await res.json();
      const rawItems = raw?.data?.items || raw?.Data?.Items || raw?.items || raw?.Items || [];
      const converted = convertBackendKeysToCamel({ items: rawItems }) as { items?: any[] };
      return converted?.items || [];
    } catch {
      return [];
    }
  };

  const querySubjects = async (searchTerm: string) => {
    try {
      const url = `${baseUrl}/api/castoline/strata/learning/subjects/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=25&dynamicSearch=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(3500) });
      if (!res.ok) return [];
      const raw = await res.json();
      const rawItems = raw?.data?.items || raw?.Data?.Items || raw?.items || raw?.Items || [];
      const converted = convertBackendKeysToCamel({ items: rawItems }) as { items?: any[] };
      return converted?.items || [];
    } catch {
      return [];
    }
  };

  const queryCourses = async (searchTerm: string) => {
    try {
      const url = `${baseUrl}/api/castoline/strata/learning/courses/list/absolute?fetchtype=absolute&dynamicPage=1&dynamicPerPage=15&dynamicSearch=${encodeURIComponent(searchTerm)}`;
      const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(3500) });
      if (!res.ok) return [];
      const raw = await res.json();
      const rawItems = raw?.data?.items || raw?.Data?.Items || raw?.items || raw?.Items || [];
      const converted = convertBackendKeysToCamel({ items: rawItems }) as { items?: any[] };
      return converted?.items || [];
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

    const panel = resolvePanelFromText(`${title} ${exam.courseName || ""} ${exam.subjectName || ""}`, currentPanel);
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
