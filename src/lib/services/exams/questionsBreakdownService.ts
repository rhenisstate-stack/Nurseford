import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";

export interface ExamQuestionBreakdown {
  examId: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  uncategorized: number;
  easyPct: number;
  mediumPct: number;
  hardPct: number;
  questionIds: (number | string)[];
}

export interface QuestionsBreakdownResponse {
  exams: Record<string, ExamQuestionBreakdown>;
  summary: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
    easyPct: number;
    mediumPct: number;
    hardPct: number;
  };
}

// In-memory cache for 5 minutes per exam breakdown
interface CacheEntry {
  breakdown: ExamQuestionBreakdown;
  timestamp: number;
}
const breakdownCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Guest Preview Auth Token Cache (Allows unauthenticated guests to preview the questions)
const cachedGuestBadge: string | null = "B536816D72FA09B200042157A4140BB5ADF8F2CA9D1BF7FEA592AB1A759D33C29696C0D09522571C8081FA69512A97AA";
let cachedGuestLine: string | null = null;
let guestTokenPromise: Promise<{ line: string; badge: string } | null> | null = null;

export async function getGuestPreviewToken(): Promise<{ line: string; badge: string } | null> {
  if (cachedGuestLine && cachedGuestBadge) {
    return { line: cachedGuestLine, badge: cachedGuestBadge };
  }
  if (guestTokenPromise) return guestTokenPromise;

  guestTokenPromise = (async () => {
    try {
      const backendBaseUrl = getBackendBaseUrl();
      const loginUrl = `${backendBaseUrl}/api/castoline/auth/login`;
      const email = "preview_guest@rhenis.internal";
      const password = "PreviewGuest2026!#";

      const loginRes = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getSiteHeaders()),
        },
        body: JSON.stringify({
          email,
          password,
          loginMethod: "password",
          LoginProvider: "email",
          dashboardName: "web",
          role: "Learner",
          challenge: "learner.login.skew8lancasto",
        }),
      });

      const loginData = await loginRes.json().catch(() => null);
      if (loginData?.user?.castoLine) {
        const line = String(loginData.user.castoLine);
        const badge = String(loginData.user.castoBadge || cachedGuestBadge);
        cachedGuestLine = line;
        return { line, badge };
      }
    } catch (e) {
      console.error("Failed to acquire guest preview token:", e);
    } finally {
      guestTokenPromise = null;
    }
    return null;
  })();

  return guestTokenPromise;
}

function normalizeDiff(val: unknown): "easy" | "medium" | "hard" | null {
  if (val === null || val === undefined) return null;
  const s = String(val).toLowerCase().trim();
  if (s === "easy" || s === "beginner" || s === "1" || s === "foundation") return "easy";
  if (s === "medium" || s === "moderate" || s === "intermediate" || s === "2") return "medium";
  if (s === "hard" || s === "difficult" || s === "advanced" || s === "3") return "hard";
  return null;
}

export async function fetchExamBreakdown(
  examId: string,
  sessionHeaders: Record<string, string> = {}
): Promise<ExamQuestionBreakdown> {
  const cached = breakdownCache.get(examId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.breakdown;
  }

  const backendBaseUrl = getBackendBaseUrl();
  const query = new URLSearchParams({
    fetchtype: "live",
    identifier: examId,
    dynamicPage: "1",
    dynamicPerPage: "500",
  });

  const url = `${backendBaseUrl}/api/castoline/strata/assessment/exams/list/live?${query.toString()}`;

  let headersToUse = { ...sessionHeaders };
  if (!headersToUse["x-casto-line"]) {
    const guestAuth = await getGuestPreviewToken();
    if (guestAuth) {
      headersToUse["x-casto-line"] = guestAuth.line;
      if (!headersToUse["x-casto-badge"]) headersToUse["x-casto-badge"] = guestAuth.badge;
    }
  }

  try {
    let res: Response | null = null;
    let attempts = 0;
    while (attempts < 2) {
      attempts++;
      try {
        res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(await getSiteHeaders()),
            ...headersToUse,
          },
          cache: "no-store",
        });
        if (res.ok) break;
      } catch (err) {
        if (attempts >= 2) throw err;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    if (res && res.status === 401) {
      console.warn(`[questions-breakdown] 401 Unauthorized for exam ${examId}. Retrying with guest preview token...`);
      const guestAuth = await getGuestPreviewToken();
      if (guestAuth) {
        res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(await getSiteHeaders()),
            "x-casto-line": guestAuth.line,
            "x-casto-badge": guestAuth.badge,
          },
          cache: "no-store",
        });
      }
    }

    if (!res || !res.ok) {
      console.warn(`[questions-breakdown] Failed to fetch live exam ${examId}: HTTP ${res?.status}`);
      return {
        examId,
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        uncategorized: 0,
        easyPct: 0,
        mediumPct: 0,
        hardPct: 0,
        questionIds: [],
      };
    }

    const raw = (await res.json()) as Record<string, unknown>;
    const converted = convertBackendKeysToCamel(raw) as any;
    const sections: any[] =
      converted?.data?.sections ||
      converted?.sections ||
      converted?.data?.exam?.sections ||
      converted?.exam?.sections ||
      [];
    const questions: any[] = sections.length > 0
      ? sections.flatMap((sec) => sec.questions || sec.items || [])
      : (converted?.data?.questions || converted?.questions || []);

    if (questions.length > 0) {
      const q0 = questions[0];
      console.log(`[questions-breakdown] Exam ${examId}: sections=${sections.length}, questions=${questions.length}, sampleQ:`, {
        id: q0?.id,
        difficulty: q0?.difficulty,
        difficultyLevel: q0?.difficultyLevel,
        level: q0?.level,
      });
    }

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    let uncategorizedCount = 0;
    const questionIds: (number | string)[] = [];

    for (const q of questions) {
      const qId = q.id ?? q.guidId;
      if (qId) questionIds.push(qId);

      const rawDiff =
        q.difficulty ??
        q.difficultyLevel ??
        q.difficulty_level ??
        q.level ??
        q.grade;

      const norm = normalizeDiff(rawDiff);
      if (norm === "easy") easyCount++;
      else if (norm === "medium") mediumCount++;
      else if (norm === "hard") hardCount++;
      else uncategorizedCount++;
    }

    const total = questions.length;
    const categorized = easyCount + mediumCount + hardCount;

    const breakdown: ExamQuestionBreakdown = {
      examId,
      total,
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
      uncategorized: uncategorizedCount,
      easyPct: categorized > 0 ? Math.round((easyCount / categorized) * 100) : 0,
      mediumPct: categorized > 0 ? Math.round((mediumCount / categorized) * 100) : 0,
      hardPct: categorized > 0 ? Math.round((hardCount / categorized) * 100) : 0,
      questionIds,
    };

    console.log(`[questions-breakdown] Exam ${examId}: total=${total}, easy=${easyCount}, med=${mediumCount}, hard=${hardCount}, uncat=${uncategorizedCount}`);
    breakdownCache.set(examId, { breakdown, timestamp: Date.now() });
    return breakdown;
  } catch (err) {
    console.error(`[questions-breakdown] Exception fetching exam ${examId}:`, err);
    return {
      examId,
      total: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      uncategorized: 0,
      easyPct: 0,
      mediumPct: 0,
      hardPct: 0,
      questionIds: [],
    };
  }
}

export async function fetchMultipleExamsBreakdown(
  examIds: string[],
  sessionHeaders: Record<string, string> = {},
  concurrency = 3
): Promise<ExamQuestionBreakdown[]> {
  const results: ExamQuestionBreakdown[] = new Array(examIds.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(concurrency, examIds.length) }, async () => {
    while (nextIndex < examIds.length) {
      const idx = nextIndex++;
      results[idx] = await fetchExamBreakdown(examIds[idx], sessionHeaders);
    }
  });

  await Promise.all(workers);
  return results;
}
