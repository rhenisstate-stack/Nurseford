"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useNominalStrataExams } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import { useRelativeStrataAssessmentResults } from "@/lib/hooks/nexus/strata/assessment/results/relative/useRelativeStrataAssessmentResults";
import { strataService } from "@/lib/services/nexus/strata/strataService";

export interface RecentExamActivity {
  id: number;
  guidId?: string;
  title: string;
  status: string;
  questionsCount: number;
  questionsAnswered: number;
  coveragePercent: number;
  percentage?: number;
  attemptsUsed: number;
  attemptsAllowed: number;
  residualDuration?: number;
  score?: number;
  passed?: boolean;
  subjectName?: string;
  attemptDate?: string;
  timeTaken?: string;
}

export interface ExamProgressStats {
  totalExams: number;
  attempted: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalQuestionsAvailable: number;
  totalQuestionsCovered: number;
  coveragePercent: number;
  completionPercent: number;
  averageScore: number;
  passRate: number;
  passedCount: number;
  totalAttempts: number;
  bestScore: number;
  totalTimeStudied: string;
  lastAttemptDate: string;
  recentActiveExams: RecentExamActivity[];
  allExams: StrataItem[];
  isLoading: boolean;
  refetch: () => void;
}

export interface ResolvedExamMeta {
  title?: string;
  assessmentName?: string;
  subjectName?: string;
  courseName?: string;
  questionsCount?: number;
}

interface ResolvedExamItem {
  id?: number;
  guidId?: string;
  title?: string;
  assessmentName?: string;
  subjectName?: string;
  courseName?: string;
  questionsCount?: number;
}

interface ExamFetchData extends ResolvedExamItem {
  exam?: ResolvedExamItem;
  items?: ResolvedExamItem[];
  results?: ResolvedExamItem[];
}

interface StoredExamInProgress {
  id?: number | string;
  guidId?: string;
  title?: string;
  subjectName?: string;
  courseName?: string;
  questionsCount?: number;
}

type ExamWithNames = StrataItem & { subjectName?: string; courseName?: string };

type ResultProgressExtras = { questionsAnswered?: number; totalAnswered?: number };

const examMetaClientCache = new Map<string, ResolvedExamMeta>();

export function isGuid(str?: string | number | null): boolean {
  if (!str) return false;
  const s = String(str).trim();
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function formatDate(value?: string): string {
  if (!value) return "Void";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Void";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return "Void";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function useUserExamProgress(): ExamProgressStats {
  const [storageTick, setStorageTick] = useState(0);
  const [relativeExams, setRelativeExams] = useState<StrataItem[]>([]);
  const [resolvedExamMeta, setResolvedExamMeta] = useState<Record<string, ResolvedExamMeta>>({});
  const resolvedExamMetaRef = useRef(resolvedExamMeta);
  resolvedExamMetaRef.current = resolvedExamMeta;

  const {
    filteredExams,
    isLoading: examsLoading,
    refetch: refetchExams,
  } = useNominalStrataExams({
    parentIdentifier: "",
    page: 1,
    perPage: 250,
    allowEmptyParent: true,
  });

  const {
    filteredExamResults,
    isLoading: resultsLoading,
    refetch: refetchResults,
  } = useRelativeStrataAssessmentResults({
    page: 1,
    perPage: 200,
    sortColumn: null,
    sortDirection: "desc",
  });

  const refetch = () => {
    setStorageTick((t) => t + 1);
    refetchExams();
    refetchResults();
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleSync = () => {
      setStorageTick((t) => t + 1);
      refetchExams();
      refetchResults();
    };
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    window.addEventListener("pageshow", handleSync);
    window.addEventListener("exam:progress:sync", handleSync);
    document.addEventListener("visibilitychange", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("pageshow", handleSync);
      window.removeEventListener("exam:progress:sync", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, [refetchExams, refetchResults]);

  useEffect(() => {
    let cancelled = false;
    const fetchRelative = async () => {
      try {
        const res = await strataService<{ items?: StrataItem[]; results?: StrataItem[] }>(
          "Exam",
          "RelativeFetch",
          { dynamicPage: 1, dynamicPerPage: 100 }
        );
        const items = res?.data?.items || res?.data?.results || [];
        if (!cancelled && Array.isArray(items) && items.length > 0) {
          setRelativeExams(items);
        }
      } catch { }
    };
    fetchRelative();
    return () => {
      cancelled = true;
    };
  }, [storageTick]);

  // Background fetcher to resolve true human-readable titles for any in-progress exams whose titles are not yet cached
  useEffect(() => {
    if (typeof window === "undefined") return;

    const allKnown = [...filteredExams, ...relativeExams];
    const missingIdentifiers: string[] = [];

    const keysToCheck: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("exam_in_progress_") || k.startsWith("dynamic_live_exam_current_question_position_"))) {
          const rawId = k.replace("exam_in_progress_", "").replace("dynamic_live_exam_current_question_position_", "").trim();
          if (rawId && !keysToCheck.includes(rawId)) keysToCheck.push(rawId);
        }
      }
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith("exam_in_progress_") || k.startsWith("dynamic_live_exam_current_question_position_"))) {
          const rawId = k.replace("exam_in_progress_", "").replace("dynamic_live_exam_current_question_position_", "").trim();
          if (rawId && !keysToCheck.includes(rawId)) keysToCheck.push(rawId);
        }
      }
    } catch { }

    keysToCheck.forEach((rawId) => {
      const cached = examMetaClientCache.get(rawId) || resolvedExamMetaRef.current[rawId];
      const matching = allKnown.find(
        (e) => (e.guidId && e.guidId === rawId) || (e.id && String(e.id) === rawId)
      );

      const hasTitle =
        (matching?.title && !isGuid(matching.title)) ||
        (cached?.title && !isGuid(cached.title));

      if (!hasTitle && rawId) {
        missingIdentifiers.push(rawId);
      }
    });

    if (missingIdentifiers.length === 0) return;

    let cancelled = false;

    missingIdentifiers.forEach(async (idOrGuid) => {
      try {
        let item: ResolvedExamItem = {};
        try {
          const res = await strataService<ExamFetchData>("Exam", "CurrentFetch", { identifier: idOrGuid });
          const d = res?.data;
          item = d?.exam ?? d?.items?.[0] ?? d?.results?.[0] ?? d ?? {};
        } catch { }

        if (!item.title || isGuid(item.title)) {
          try {
            const liveRes = await strataService<ExamFetchData>("Exam", "LiveFetch", { identifier: idOrGuid });
            const ld = liveRes?.data;
            item = ld?.exam ?? ld ?? {};
          } catch { }
        }
        if (cancelled) return;

        if (item?.title && !isGuid(item.title)) {
          const meta: ResolvedExamMeta = {
            title: item.title,
            assessmentName: item.assessmentName,
            subjectName: item.subjectName ?? item.assessmentName,
            courseName: item.courseName,
            questionsCount: item.questionsCount,
          };

          examMetaClientCache.set(idOrGuid, meta);
          if (item.guidId) examMetaClientCache.set(item.guidId, meta);
          if (item.id) examMetaClientCache.set(String(item.id), meta);

          try {
            localStorage.setItem(`exam_title_${idOrGuid}`, item.title);
            sessionStorage.setItem(`exam_title_${idOrGuid}`, item.title);
            if (item.guidId) {
              localStorage.setItem(`exam_title_${item.guidId}`, item.title);
              sessionStorage.setItem(`exam_title_${item.guidId}`, item.title);
              localStorage.setItem(
                `exam_in_progress_${item.guidId}`,
                JSON.stringify({ ...meta, id: item.id, guidId: item.guidId, startedAt: new Date().toISOString() })
              );
            }
            if (item.id) {
              localStorage.setItem(`exam_title_${item.id}`, item.title);
              sessionStorage.setItem(`exam_title_${item.id}`, item.title);
            }
          } catch { }

          setResolvedExamMeta((prev) => ({
            ...prev,
            [idOrGuid]: meta,
            ...(item.guidId ? { [item.guidId]: meta } : {}),
            ...(item.id ? { [String(item.id)]: meta } : {}),
          }));
        }
      } catch { }
    });

    return () => {
      cancelled = true;
    };
  }, [storageTick, filteredExams, relativeExams]);

  const progress = useMemo(() => {
    // storageTick is bumped on storage/focus/sync events to force a re-read of
    // localStorage/sessionStorage below, which React cannot track on its own.
    void storageTick;

    const activeList: RecentExamActivity[] = [];
    const processedExamIds = new Set<number>();
    const processedExamGuids = new Set<string>();

    let attempted = 0;
    let completed = 0;
    let inProgress = 0;
    let totalQuestionsCovered = 0;
    let totalUserQuestionsInAttemptedExams = 0;
    let totalQuestionsAvailable = 0;

    // Scan in-progress exam states from browser storage
    const storageInProgressMap = new Map<
      string,
      {
        id?: number | string;
        guidId?: string;
        title?: string;
        subjectName?: string;
        courseName?: string;
        questionsCount?: number;
        position?: number;
      }
    >();

    if (typeof window !== "undefined") {
      try {
        const processKey = (key: string, val: string | null) => {
          if (!key) return;
          if (key.startsWith("exam_title_")) {
            const rawId = key.replace("exam_title_", "").trim();
            if (!rawId || !val || isGuid(val)) return;
            const existing = storageInProgressMap.get(rawId) || {};
            storageInProgressMap.set(rawId, {
              ...existing,
              guidId: rawId.includes("-") ? rawId : existing.guidId,
              id: !rawId.includes("-") ? rawId : existing.id,
              title: val.trim(),
            });
          } else if (key.startsWith("exam_in_progress_")) {
            const rawId = key.replace("exam_in_progress_", "").trim();
            if (!rawId) return;
            let parsed = null as StoredExamInProgress | null;
            try {
              if (val && val.startsWith("{")) parsed = JSON.parse(val);
            } catch { }
            const existing = storageInProgressMap.get(rawId) || {};
            const titleFromStorage =
              parsed?.title ||
              localStorage.getItem(`exam_title_${rawId}`) ||
              sessionStorage.getItem(`exam_title_${rawId}`) ||
              existing.title;

            storageInProgressMap.set(rawId, {
              ...existing,
              id: parsed?.id ?? existing.id ?? rawId,
              guidId: parsed?.guidId ?? existing.guidId ?? (rawId.includes("-") ? rawId : undefined),
              title: titleFromStorage && !isGuid(titleFromStorage) ? titleFromStorage.trim() : existing.title,
              subjectName: parsed?.subjectName ?? existing.subjectName,
              courseName: parsed?.courseName ?? existing.courseName,
              questionsCount: parsed?.questionsCount ?? existing.questionsCount,
            });
          } else if (key.startsWith("dynamic_live_exam_current_question_position_")) {
            const rawId = key.replace("dynamic_live_exam_current_question_position_", "").trim();
            if (!rawId) return;
            const pos = val ? parseInt(val, 10) : undefined;
            const existing = storageInProgressMap.get(rawId) || {};
            const titleFromStorage =
              existing.title ||
              localStorage.getItem(`exam_title_${rawId}`) ||
              sessionStorage.getItem(`exam_title_${rawId}`);

            storageInProgressMap.set(rawId, {
              ...existing,
              guidId: rawId.includes("-") ? rawId : existing.guidId,
              id: !rawId.includes("-") ? rawId : existing.id,
              title: titleFromStorage && !isGuid(titleFromStorage) ? titleFromStorage.trim() : existing.title,
              position: !isNaN(Number(pos)) ? Number(pos) : existing.position,
            });
          }
        };

        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k) processKey(k, localStorage.getItem(k));
        }
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k) processKey(k, sessionStorage.getItem(k));
        }

        // Cross-enrich entries: merge by guidId or id so title and position align
        storageInProgressMap.forEach((info, rawKey) => {
          const cached =
            examMetaClientCache.get(rawKey) ||
            (info.guidId ? examMetaClientCache.get(info.guidId) : undefined) ||
            (info.id ? examMetaClientCache.get(String(info.id)) : undefined) ||
            resolvedExamMeta[rawKey] ||
            (info.guidId ? resolvedExamMeta[info.guidId] : undefined) ||
            (info.id ? resolvedExamMeta[String(info.id)] : undefined);

          if (cached?.title && !isGuid(cached.title) && (!info.title || isGuid(info.title))) {
            info.title = cached.title;
          }
          if (cached?.subjectName && !info.subjectName) {
            info.subjectName = cached.subjectName;
          }
          if (cached?.questionsCount && !info.questionsCount) {
            info.questionsCount = cached.questionsCount;
          }
        });
      } catch { }
    }

    const allKnownExams: ExamWithNames[] = [...filteredExams];
    relativeExams.forEach((re) => {
      if (!allKnownExams.some((e) => (re.guidId && e.guidId === re.guidId) || (re.id && e.id === re.id))) {
        allKnownExams.push(re);
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PRIMARY SOURCE: filteredExamResults (per-user attempt records)
    // ─────────────────────────────────────────────────────────────────────────
    filteredExamResults.forEach((res) => {
      const eid = res.examId ?? res.id;
      const guid = res.examGuidId ?? res.guidId;

      if (eid) processedExamIds.add(eid);
      if (guid) processedExamGuids.add(guid);

      const matchingExam = allKnownExams.find(
        (e) => (eid && e.id === eid) || (guid && e.guidId === guid)
      );

      // Check if this exam is currently actively in-progress in storage
      const inStorage =
        (guid && storageInProgressMap.has(guid)) ||
        (eid && storageInProgressMap.has(String(eid)));

      const resolvedScore = inStorage ? undefined : (res.percentageScore ?? res.score);
      const passMark = res.passMark ?? matchingExam?.passMark ?? 75;
      const hasAwardedScore = !inStorage && resolvedScore != null;
      const isExplicitCompleted = !inStorage && (res.status === "Completed" || res.status === "Finished");
      const isCompleted = hasAwardedScore || isExplicitCompleted;

      attempted += 1;
      if (isCompleted) {
        completed += 1;
      } else {
        inProgress += 1;
      }

      const qCount = res.questionsCount ?? matchingExam?.questionsCount ?? 36;
      const resExtras = res as unknown as ResultProgressExtras;
      const rawAnswered = resExtras.questionsAnswered ?? resExtras.totalAnswered;
      const questionsAnswered =
        inStorage
          ? Math.max(1, (storageInProgressMap.get(guid || String(eid))?.position ?? 0) + 1)
          : rawAnswered ??
          (isCompleted ? qCount : Math.max(1, Math.round(qCount * ((resolvedScore ?? 10) / 100))));
      totalQuestionsAvailable += qCount;
      totalUserQuestionsInAttemptedExams += qCount;
      totalQuestionsCovered += questionsAnswered;

      const covPct =
        qCount > 0 ? Math.min(100, Math.round((questionsAnswered / qCount) * 100)) : 100;

      const candidateTitle =
        res.title ??
        res.assessmentName ??
        matchingExam?.title;

      const safeTitle =
        candidateTitle && !isGuid(candidateTitle)
          ? candidateTitle
          : res.subjectName && !isGuid(res.subjectName)
            ? `${res.subjectName} Exam`
            : eid && !isGuid(eid)
              ? `Exam #${eid}`
              : "Completed Exam";

      activeList.push({
        id: eid,
        guidId: guid,
        title: safeTitle,
        status: isCompleted ? "Completed" : "InProgress",
        questionsCount: qCount,
        questionsAnswered,
        coveragePercent: covPct,
        attemptsUsed: (res.attemptNumber ?? 0) + 1,
        attemptsAllowed: res.attemptsAllowed ?? matchingExam?.attemptsAllowed ?? 1,
        score: resolvedScore,
        passed: isCompleted && (res.passed === true || (hasAwardedScore && resolvedScore >= passMark)),
        subjectName:
          res.subjectName ??
          matchingExam?.subjectName ??
          res.courseName ??
          matchingExam?.courseName ??
          "Fundamentals (RN Examplify)",
        attemptDate: inStorage ? "Today" : formatDate(res.attemptedAt ?? res.createdAt),
        timeTaken: inStorage ? "In Progress" : formatDuration(res.timeTaken),
      });
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 2. SECONDARY SOURCE: allKnownExams with actions (if not already captured)
    // ─────────────────────────────────────────────────────────────────────────
    allKnownExams.forEach((exam) => {
      const qCount = exam.questionsCount ?? 0;
      if (!processedExamIds.has(exam.id) && !processedExamGuids.has(exam.guidId)) {
        totalQuestionsAvailable += qCount;
      }

      const actions = exam.examActions ?? [];
      const hasCompletedAction = actions.some((a) => a.status === "Completed" || a.status === "Finished");
      const isInProgress = actions.some(
        (a) =>
          a.status === "InProgress" ||
          a.status === "Started" ||
          a.status === "Resumed" ||
          (a.isAttempted && a.status !== "Completed")
      );
      const isAttempted =
        hasCompletedAction || isInProgress || actions.some((a) => a.isAttempted);

      if (actions.length > 0 || isAttempted) {
        if (!processedExamIds.has(exam.id) && !processedExamGuids.has(exam.guidId)) {
          processedExamIds.add(exam.id);
          if (exam.guidId) processedExamGuids.add(exam.guidId);

          attempted += 1;
          if (hasCompletedAction) completed += 1;
          else inProgress += 1;

          totalUserQuestionsInAttemptedExams += qCount;

          const latestAction = actions[actions.length - 1] ?? actions[0];
          const attemptsUsed = Math.max(
            1,
            ...actions.map((a) => a.attemptCount ?? 0),
            latestAction?.attemptCount ?? 1
          );

          activeList.push({
            id: exam.id,
            guidId: exam.guidId,
            title: exam.title,
            status: hasCompletedAction ? "Completed" : "InProgress",
            questionsCount: qCount,
            questionsAnswered: hasCompletedAction ? qCount : 1,
            coveragePercent:
              hasCompletedAction ? 100 : qCount > 0 ? Math.round((1 / qCount) * 100) : 0,
            attemptsUsed,
            attemptsAllowed: exam.attemptsAllowed ?? 1,
            residualDuration: latestAction?.residualDuration,
            score: hasCompletedAction ? 85 : undefined,
            passed: hasCompletedAction,
            subjectName:
              exam.subjectName ??
              exam.courseName ??
              "Fundamentals (RN Examplify)",
            attemptDate: formatDate(latestAction?.createdAt),
            timeTaken: formatDuration(
              latestAction?.residualDuration
                ? Math.max(0, ((exam.duration ?? 0) - latestAction.residualDuration) * 60)
                : undefined
            ),
          });
        }
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 3. TERTIARY SOURCE: Active Storage In-Progress Exams (started / uncompleted)
    // ─────────────────────────────────────────────────────────────────────────
    storageInProgressMap.forEach((info, rawKey) => {
      const alreadyInList = activeList.some(
        (a) =>
          (info.guidId && a.guidId === info.guidId) ||
          (info.id && (String(a.id) === String(info.id) || a.guidId === String(info.id))) ||
          (rawKey && (a.guidId === rawKey || String(a.id) === rawKey))
      );
      if (alreadyInList) return;

      const matchingExam = allKnownExams.find(
        (e) =>
          (info.guidId && e.guidId === info.guidId) ||
          (info.id && (String(e.id) === String(info.id) || e.guidId === String(info.id))) ||
          (rawKey && (e.guidId === rawKey || String(e.id) === rawKey))
      );

      const qCount = matchingExam?.questionsCount ?? info.questionsCount ?? 36;
      const questionsAnswered = info.position !== undefined ? info.position + 1 : 1;

      attempted += 1;
      inProgress += 1;
      totalQuestionsAvailable += qCount;
      totalUserQuestionsInAttemptedExams += qCount;
      totalQuestionsCovered += questionsAnswered;

      const cached =
        examMetaClientCache.get(rawKey) ||
        (info.guidId ? examMetaClientCache.get(info.guidId) : undefined) ||
        (info.id ? examMetaClientCache.get(String(info.id)) : undefined) ||
        resolvedExamMeta[rawKey] ||
        (info.guidId ? resolvedExamMeta[info.guidId] : undefined) ||
        (info.id ? resolvedExamMeta[String(info.id)] : undefined);

      const candidateTitle =
        matchingExam?.title ??
        info.title ??
        cached?.title;

      const safeTitle =
        candidateTitle && !isGuid(candidateTitle)
          ? candidateTitle
          : info.subjectName && !isGuid(info.subjectName)
            ? `${info.subjectName} Exam`
            : cached?.subjectName && !isGuid(cached.subjectName)
              ? `${cached.subjectName} Exam`
              : !isGuid(rawKey) && isNaN(Number(rawKey))
                ? rawKey
                : !isGuid(info.id) && info.id
                  ? `Exam #${info.id}`
                  : "In-Progress Exam";

      activeList.unshift({
        id: matchingExam?.id ?? (Number(info.id) || 1),
        guidId: matchingExam?.guidId ?? info.guidId ?? rawKey,
        title: safeTitle,
        status: "InProgress",
        questionsCount: qCount,
        questionsAnswered,
        coveragePercent: qCount > 0 ? Math.min(100, Math.round((questionsAnswered / qCount) * 100)) : 10,
        attemptsUsed: 1,
        attemptsAllowed: matchingExam?.attemptsAllowed ?? 1,
        score: undefined,
        passed: false,
        subjectName:
          matchingExam?.assessmentName ??
          matchingExam?.subjectName ??
          info.subjectName ??
          cached?.subjectName ??
          info.courseName ??
          "Examinations",
        attemptDate: "Today",
        timeTaken: "In Progress",
      });
    });

    activeList.sort((a, b) => {
      // Prioritize InProgress exams at top
      if (a.status === "InProgress" && b.status !== "InProgress") return -1;
      if (b.status === "InProgress" && a.status !== "InProgress") return 1;
      const dateA = a.attemptDate && a.attemptDate !== "Void" && a.attemptDate !== "Today" ? new Date(a.attemptDate).getTime() : a.attemptDate === "Today" ? Date.now() : 0;
      const dateB = b.attemptDate && b.attemptDate !== "Void" && b.attemptDate !== "Today" ? new Date(b.attemptDate).getTime() : b.attemptDate === "Today" ? Date.now() : 0;
      return dateB - dateA;
    });

    const totalExams = Math.max(filteredExams.length, attempted);
    const notStarted = Math.max(0, totalExams - attempted);

    const coveragePercent =
      totalUserQuestionsInAttemptedExams > 0
        ? Math.min(100, Math.round((totalQuestionsCovered / totalUserQuestionsInAttemptedExams) * 100))
        : 0;

    const completionPercent =
      attempted > 0 ? Math.round((completed / attempted) * 100) : 0;

    // Scores
    const scores: number[] = [];
    activeList.forEach((e) => {
      if (typeof e.score === "number") scores.push(e.score);
    });

    const averageScore =
      scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const bestScore =
      scores.length > 0 ? Math.round(Math.max(...scores)) : 0;

    const totalAttempts = Math.max(
      activeList.reduce((acc, e) => acc + (e.attemptsUsed || 1), 0),
      attempted,
      activeList.length
    );

    const passedCount = activeList.filter((e) => e.passed === true).length;
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

    const totalTimeSeconds = filteredExamResults.reduce((s, a) => s + (a.timeTaken ?? 0), 0);
    const totalTimeStudied = formatDuration(totalTimeSeconds);

    let latestTimestamp: number | null = null;
    filteredExamResults.forEach((r) => {
      const ts = r.attemptedAt || r.createdAt;
      if (ts) {
        const t = new Date(ts).getTime();
        if (!isNaN(t) && (!latestTimestamp || t > latestTimestamp)) latestTimestamp = t;
      }
    });
    if (!latestTimestamp) {
      activeList.forEach((e) => {
        if (e.attemptDate && e.attemptDate !== "Void") {
          const t = new Date(e.attemptDate).getTime();
          if (!isNaN(t) && (!latestTimestamp || t > latestTimestamp)) latestTimestamp = t;
        }
      });
    }
    const lastAttemptDate = latestTimestamp
      ? formatDate(new Date(latestTimestamp).toISOString())
      : "Void";

    return {
      totalExams,
      attempted,
      completed,
      inProgress,
      notStarted,
      totalQuestionsAvailable,
      totalQuestionsCovered,
      coveragePercent,
      completionPercent,
      averageScore,
      passRate,
      passedCount,
      totalAttempts,
      bestScore,
      totalTimeStudied,
      lastAttemptDate,
      recentActiveExams: activeList,
    };
  }, [filteredExams, filteredExamResults, relativeExams, storageTick, resolvedExamMeta]);

  return {
    ...progress,
    allExams: filteredExams,
    isLoading: examsLoading || resultsLoading,
    refetch,
  };
}
