"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { strataService } from "@/lib/services/nexus/strata/strataService";
import type { StrataItem } from "@/lib/hooks/nexus/strata/assessment/learning/exams/nominal/useNominalStrataExams";
import type { BackendSubject } from "@/lib/data/exam-subjects";
import { ArrowRight, FileQuestion, FolderOpen, Loader2, X } from "lucide-react";

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
        }>("Exam", "NominalFetch", {
          identifier: String(subject.guidId ?? subject.id),
          dynamicPage: 1,
          dynamicPerPage: 50,
          dynamicSearch: "",
          dynamicSortColumn: "id",
          dynamicSortDirection: "desc",
        });

        if (cancelled) return;

        if (result?.error) {
          throw new Error(result.error);
        }

        const items = [...(result?.data?.items ?? [])].sort(
          (a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)
        );
        try {
          items.forEach((e) => {
            if (e.guidId && e.title) {
              localStorage.setItem(`exam_title_${e.guidId}`, e.title);
              sessionStorage.setItem(`exam_title_${e.guidId}`, e.title);
            }
            if (e.id && e.title) {
              localStorage.setItem(`exam_title_${e.id}`, e.title);
              sessionStorage.setItem(`exam_title_${e.id}`, e.title);
            }
          });
        } catch {}
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

  const startExam = (exam: StrataItem) => {
    try {
      if (exam.guidId) {
        if (exam.title) {
          localStorage.setItem(`exam_title_${exam.guidId}`, exam.title);
          sessionStorage.setItem(`exam_title_${exam.guidId}`, exam.title);
        }
      }
      if (exam.id) {
        if (exam.title) {
          localStorage.setItem(`exam_title_${exam.id}`, exam.title);
          sessionStorage.setItem(`exam_title_${exam.id}`, exam.title);
        }
      }
    } catch {}
    const params = new URLSearchParams({
      mode: "Exam",
      identifier: String(exam.guidId ?? exam.id),
    });
    router.push(`/web/${livePanelSlug ?? panelSlug}/vista/exam/generic?${params.toString()}`);
    onClose();
  };

  if (!isOpen || !subject) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-2 sm:px-3">
      <div className="w-full max-w-2xl rounded-2xl border border-[var(--card-border,#CBDCF8)] dark:border-white/10 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)] text-[var(--text-color)] shadow-2xl flex flex-col max-h-[92vh]">
        {/* ─── Header ─── */}
        <div className="px-4 py-3 border-b border-[var(--text-color)]/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#2FD9C4]/15 flex items-center justify-center shrink-0">
                <FolderOpen className="w-4 h-4 text-[#2FD9C4]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-[var(--text-color)] truncate">
                  {subject.name}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-[var(--text-color)]/40">
                  Select an exam to start practicing
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg hover:bg-[var(--text-color)]/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-[var(--text-color)]/60" />
            </button>
          </div>
          {subject.description && (
            <p className="mt-2 text-xs text-slate-600 dark:text-[var(--text-color)]/50 leading-relaxed line-clamp-2">
              {subject.description}
            </p>
          )}
        </div>

        {/* ─── Exam List ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          {status === "loading" || status === "idle" ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <Loader2 className="w-6 h-6 text-[#2FD9C4] animate-spin" />
              <p className="text-sm text-[var(--text-color)]/40">
                Loading exams…
              </p>
            </div>
          ) : status === "error" ? (
            <div className="rounded-2xl border border-red-400/30 bg-red-400/5 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-red-500 dark:text-red-300">
                Couldn’t load exams right now.
              </p>
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <FileQuestion className="w-8 h-8 text-slate-400 dark:text-[var(--text-color)]/20" />
              <p className="text-sm font-semibold text-slate-600 dark:text-[var(--text-color)]/50">
                No exams available yet — check back soon.
              </p>
            </div>
          ) : (
            exams.map((exam) => (
              <button
                key={exam.guidId ?? exam.id}
                onClick={() => startExam(exam)}
                className="group w-full text-left rounded-xl border border-[#CBDCF8] dark:border-white/10 bg-white/70 dark:bg-white/5 px-3 py-3 flex items-center gap-3 hover:border-[#2FD9C4]/60 hover:bg-white dark:hover:bg-white/10 shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs md:text-sm font-medium text-slate-900 dark:text-[var(--text-color)] truncate">
                    {exam.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-600 dark:text-[var(--text-color)]/50 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <FileQuestion className="w-3 h-3 text-[#0891b2] dark:text-[#2FD9C4]" />
                      {exam.questionsCount ?? 0} Qs
                    </span>
                  </div>
                </div>
                <span className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#2FD9C4] text-[#08111F] group-hover:brightness-110 transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 bg-[var(--card-bg,#EEF3FE)] dark:bg-[var(--card-bg,#15273e)]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}