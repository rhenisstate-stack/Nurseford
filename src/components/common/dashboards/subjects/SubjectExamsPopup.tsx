"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { strataService } from "@/lib/services/nexus/strata/strataService";
import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import type { BackendSubject } from "@/lib/data/exam-subjects";
import { ArrowRight, FileQuestion, FolderOpen, Loader2, X } from "lucide-react";
import { extractExamYear } from "@/lib/utils/exams/extractExamYear";
import { useExamAccessGuard } from "@/components/common/dashboards/modals/useExamAccessGuard";

interface SubjectExamsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  subject: BackendSubject | null;
  panelSlug: string;
  livePanelSlug?: string;
}

type LoadStatus = "idle" | "loading" | "ready" | "error";

export function SubjectExamsPopup({
  isOpen,
  onClose,
  subject,
  panelSlug,
  livePanelSlug,
}: SubjectExamsPopupProps) {
  const router = useRouter();
  const [exams, setExams] = useState<StrataItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");

  useEffect(() => {
    if (!isOpen || !subject) return;

    let cancelled = false;
    setStatus("loading");

    const loadExams = async () => {
      try {
        const result = await strataService<{
          items: StrataItem[];
          skewTotal: number;
          skewTotalPages?: number;
        }>("Exam", "NominalFetch", {
          identifier: String(subject.guidId ?? subject.id),
          dynamicPage: 1,
          dynamicPerPage: 500,
          dynamicSearch: "",
          dynamicSortColumn: "updatedAt",
          dynamicSortDirection: "desc",
          dynamicLearningStrataName: "subject",
        });

        if (cancelled) return;

        if (result?.error) {
          throw new Error(result.error);
        }

        const rawItems = [...(result?.data?.items ?? [])];
        const totalPages = result?.data?.skewTotalPages ?? 1;
        if (totalPages > 1 && rawItems.length < (result?.data?.skewTotal ?? 0)) {
          const remainingPagePromises = [];
          for (let p = 2; p <= totalPages; p++) {
            remainingPagePromises.push(
              strataService<{ items?: StrataItem[] }>("Exam", "NominalFetch", {
                identifier: String(subject.guidId ?? subject.id),
                dynamicPage: p,
                dynamicPerPage: 500,
                dynamicSearch: "",
                dynamicSortColumn: "updatedAt",
                dynamicSortDirection: "desc",
                dynamicLearningStrataName: "subject",
              })
            );
          }
          const additionalResults = await Promise.all(remainingPagePromises);
          for (const res of additionalResults) {
            if (res?.data?.items) {
              rawItems.push(...res.data.items);
            }
          }
        }

        const seenExamIds = new Set<string>();
        const uniqueItems = rawItems.filter((e) => {
          const key = String(e.guidId || e.id);
          if (seenExamIds.has(key)) return false;
          seenExamIds.add(key);
          return true;
        });

        const items = [...uniqueItems].sort((a, b) => {
          const yrB = extractExamYear(b.title, subject?.name, b.year, b.createdAt) ?? 0;
          const yrA = extractExamYear(a.title, subject?.name, a.year, a.createdAt) ?? 0;
          if (yrB !== yrA) return yrB - yrA;

          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;

          return (Number(b.id) || 0) - (Number(a.id) || 0);
        });
        setExams(items);
        setStatus("ready");
      } catch (err) {
        console.error("[SubjectExamsPopup] Failed to load exams:", err);
        if (!cancelled) setStatus("error");
      }
    };

    loadExams();

    return () => {
      cancelled = true;
    };
  }, [isOpen, subject]);

  const panelTitle = panelSlug.replace(/-/g, " ").toUpperCase();
  const { guard, modal: accessModal } = useExamAccessGuard(panelSlug, panelTitle);

  const startExam = (exam: StrataItem) => {
    guard(exam.accessType !== "Public", () => {
      const params = new URLSearchParams({
        mode: "Exam",
        identifier: String(exam.guidId ?? exam.id),
      });
      router.push(`/web/${livePanelSlug ?? panelSlug}/vista/exam/generic?${params.toString()}`);
      onClose();
    });
  };

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 sm:px-3">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] shadow-2xl flex flex-col max-h-[92vh]">
        {/* ─── Header ─── */}
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-center shrink-0">
                <FolderOpen className="w-4 h-4 text-teal-700 dark:text-teal-300" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-base md:text-lg font-bold text-navy dark:text-white truncate">
                  {subject.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select an exam to start practicing
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {subject.description && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
              {subject.description}
            </p>
          )}
        </div>

        {/* ─── Exam List ─── */}
        <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-2.5 min-h-0">
          {status === "loading" || status === "idle" ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-6 h-6 text-teal-600 dark:text-teal-400 animate-spin" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Loading exams…
              </p>
            </div>
          ) : status === "error" ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                Couldn’t load exams right now.
              </p>
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <FileQuestion className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                No exams available yet — check back soon.
              </p>
            </div>
          ) : (
            exams.map((exam) => (
              <button
                key={exam.guidId ?? exam.id}
                onClick={() => startExam(exam)}
                className="group w-full text-left rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-3.5 py-3 flex items-center gap-3 hover:border-teal-500/60 hover:bg-white dark:hover:bg-slate-800 shadow-2xs transition-all duration-200 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-sm md:text-[15px] font-bold text-navy dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                    {exam.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <FileQuestion className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      {exam.questionsCount ?? 0} Questions
                    </span>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A2540] group-hover:bg-teal-700 dark:bg-slate-700 dark:group-hover:bg-teal-600 text-white shadow-2xs group-hover:scale-105 transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-[#16233B]">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-navy dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
      {accessModal}
    </div>
  );
}