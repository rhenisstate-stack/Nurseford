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
  easyQuestionIds?: (number | string)[];
  mediumQuestionIds?: (number | string)[];
  hardQuestionIds?: (number | string)[];
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

type DifficultyValue = string | number | null | undefined;

// The only fields read from a question in the breakdown payloads
interface BreakdownQuestionLike {
  id?: number | string;
  guidId?: string;
  difficulty?: DifficultyValue;
  difficultyLevel?: DifficultyValue;
  difficulty_level?: DifficultyValue;
  difficultyLevelName?: DifficultyValue;
  level?: DifficultyValue;
  grade?: DifficultyValue;
  questionOptions?: { difficulty?: DifficultyValue }[];
}

interface BreakdownSectionLike {
  questions?: BreakdownQuestionLike[];
  items?: BreakdownQuestionLike[];
}

// Covers both the live-exam payload and the questions/list/distinct payload
interface BreakdownPayload {
  items?: BreakdownQuestionLike[];
  questions?: BreakdownQuestionLike[];
  sections?: BreakdownSectionLike[];
  exam?: { sections?: BreakdownSectionLike[] };
  data?: {
    items?: BreakdownQuestionLike[];
    questions?: BreakdownQuestionLike[];
    sections?: BreakdownSectionLike[];
    exam?: { sections?: BreakdownSectionLike[] };
  };
}

// In-memory guest token cache for public question breakdown queries
let cachedGuestBadge: string | null = null;
let cachedGuestLine: string | null = null;
let guestTokenPromise: Promise<{ line: string; badge: string } | null> | null = null;

export async function getGuestPreviewToken(): Promise<{ line: string; badge: string } | null> {
  if (cachedGuestLine && cachedGuestBadge) {
    return { line: cachedGuestLine, badge: cachedGuestBadge };
  }
  if (guestTokenPromise) return guestTokenPromise;

  guestTokenPromise = (async () => {
    try {
      const email = process.env.PREVIEW_GUEST_EMAIL || "preview_guest@rhenis.internal";
      const password = process.env.PREVIEW_GUEST_PASSWORD || "PreviewGuest2026!#";

      if (!password) {
        return null;
      }

      const backendBaseUrl = getBackendBaseUrl();
      const loginUrl = `${backendBaseUrl}/api/castoline/auth/login`;

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

      let loginData = await loginRes.json().catch(() => null);
      if (!loginData?.user?.castoLine) {
        const regUrl = `${backendBaseUrl}/api/castoline/auth/register`;
        const username = process.env.PREVIEW_GUEST_USERNAME || "preview_guest";
        const phone = process.env.PREVIEW_GUEST_PHONE || "+1234567890";
        const regRes = await fetch(regUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(await getSiteHeaders()),
          },
          body: JSON.stringify({
            username,
            email,
            phone,
            password,
            passwordConfirmation: password,
            loginMethod: "password",
            agree: true,
            role: "Learner",
            dashboardName: "web",
            provider: "email",
            challenge: "learner.register.skew8lancasto",
          }),
        }).catch((err) => {
          console.error("🔑 [questions-breakdown] Registration fetch error:", err);
          return null;
        });
        if (regRes) {
          const regJson = await regRes.json().catch(() => null);
          if (regJson?.user?.castoLine) {
            loginData = regJson;
          }
        }
      }

      if (loginData?.user?.castoLine) {
        const line = String(loginData.user.castoLine);
        const badge = String(loginData.user.castoBadge || cachedGuestBadge || "");
        cachedGuestLine = line;
        cachedGuestBadge = badge;
        return { line, badge };
      } else {
        console.warn("⚠️ [questions-breakdown] Guest login/registration response lacked castoLine");
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
  if (
    s === "easy" ||
    s === "beginner" ||
    s === "foundation" ||
    s === "novice" ||
    s === "1" ||
    s.includes("easy") ||
    s.includes("beginner") ||
    s.includes("foundation")
  ) {
    return "easy";
  }
  if (
    s === "medium" ||
    s === "moderate" ||
    s === "intermediate" ||
    s === "2" ||
    s.includes("medium") ||
    s.includes("intermediate") ||
    s.includes("moderate")
  ) {
    return "medium";
  }
  if (
    s === "hard" ||
    s === "difficult" ||
    s === "advanced" ||
    s === "expert" ||
    s === "3" ||
    s.includes("hard") ||
    s.includes("advanced") ||
    s.includes("difficult")
  ) {
    return "hard";
  }
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

  const headersToUse = { ...sessionHeaders };
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



    if (!res || !res.ok) {
      console.warn(`[questions-breakdown] /exams/list/live for ${examId} returned HTTP ${res?.status}. Trying questions list endpoints...`);

      // Fallback 1: Try /api/castoline/strata/assessment/questions/list/distinct with examId
      try {
        const qDistinctUrl = `${backendBaseUrl}/api/castoline/strata/assessment/questions/list/distinct?identifier=${examId}&fetchtype=distinct&dynamicPage=1&dynamicPerPage=500`;
        const qDistRes = await fetch(qDistinctUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(await getSiteHeaders()),
          },
          cache: "no-store",
        });
        console.log(`[questions-breakdown] questions/list/distinct ${examId}: HTTP ${qDistRes.status}`);
        if (qDistRes.ok) {
          const qDistData = (await qDistRes.json()) as BreakdownPayload;
          const qItems: BreakdownQuestionLike[] = qDistData?.data?.items || qDistData?.items || [];
          if (qItems.length > 0) {
            let eC = 0, mC = 0, hC = 0;
            const qIds: (number | string)[] = [];
            const eIds: (number | string)[] = [];
            const mIds: (number | string)[] = [];
            const hIds: (number | string)[] = [];
            for (const q of qItems) {
              const qId = q.id ?? q.guidId;
              if (qId) qIds.push(qId);
              const diff = normalizeDiff(q.difficulty ?? q.level ?? q.difficultyLevel);
              if (diff === "easy") { eC++; if (qId) eIds.push(qId); }
              else if (diff === "medium") { mC++; if (qId) mIds.push(qId); }
              else if (diff === "hard") { hC++; if (qId) hIds.push(qId); }
            }
            const cat = eC + mC + hC;
            const bd: ExamQuestionBreakdown = {
              examId,
              total: qItems.length,
              easy: eC,
              medium: mC,
              hard: hC,
              uncategorized: qItems.length - cat,
              easyPct: cat > 0 ? Math.round((eC / cat) * 100) : 0,
              mediumPct: cat > 0 ? Math.round((mC / cat) * 100) : 0,
              hardPct: cat > 0 ? Math.round((hC / cat) * 100) : 0,
              questionIds: qIds,
              easyQuestionIds: eIds,
              mediumQuestionIds: mIds,
              hardQuestionIds: hIds,
            };
            breakdownCache.set(examId, { breakdown: bd, timestamp: Date.now() });
            return bd;
          }
        }
      } catch (err) {
        console.warn(`[questions-breakdown] questions/list/distinct probe failed:`, err);
      }

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
    const converted = convertBackendKeysToCamel(raw) as BreakdownPayload;
    const sections: BreakdownSectionLike[] =
      converted?.data?.sections ||
      converted?.sections ||
      converted?.data?.exam?.sections ||
      converted?.exam?.sections ||
      [];
    const questions: BreakdownQuestionLike[] = sections.length > 0
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
    const easyQuestionIds: (number | string)[] = [];
    const mediumQuestionIds: (number | string)[] = [];
    const hardQuestionIds: (number | string)[] = [];

    for (const q of questions) {
      const qId = q.id ?? q.guidId;
      if (qId) questionIds.push(qId);

      const rawDiff =
        q.difficulty ??
        q.difficultyLevel ??
        q.difficulty_level ??
        q.difficultyLevelName ??
        q.level ??
        q.grade ??
        (q.questionOptions && q.questionOptions[0]?.difficulty);

      const norm = normalizeDiff(rawDiff);
      if (norm === "easy") {
        easyCount++;
        if (qId) easyQuestionIds.push(qId);
      } else if (norm === "medium") {
        mediumCount++;
        if (qId) mediumQuestionIds.push(qId);
      } else if (norm === "hard") {
        hardCount++;
        if (qId) hardQuestionIds.push(qId);
      } else {
        uncategorizedCount++;
      }
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
      easyQuestionIds,
      mediumQuestionIds,
      hardQuestionIds,
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
