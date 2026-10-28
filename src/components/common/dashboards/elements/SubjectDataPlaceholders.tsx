"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  toSlug,
  type BackendSubject,
} from "@/lib/data/exam-subjects";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
import { Play } from "lucide-react";

/**
 * Backend-fed course-card grid shared by the non-NCLEX dashboards.
 *
 * Primary source: GET /api/exams/[examType]/subjects — the server fetches the
 * exam's courses exactly from the backend (strata courses filtered by the
 * exam's segment), so card names are the real backend course names. There is
 * no static fallback catalog; when the backend is unreachable the grid renders
 * its empty state.
 *
 * Clicking a card (or its Start Now button) navigates to the full subjects
 * page /dashboards/{examType}/exams/{courseSlug}/{courseId}, which lists that
 * course's subjects fetched from the backend.
 */
const clientExamSubjectsCache = new Map<string, BackendSubject[]>();

export function SubjectPlaceholderGrid({
  className,
  showStartNow = false,
  examType,
}: {
  className?: string;
  showStartNow?: boolean;
  examType?: string;
}) {
  const [subjects, setSubjects] = useState<BackendSubject[]>(() => {
    return examType ? clientExamSubjectsCache.get(examType) ?? [] : [];
  });

  useEffect(() => {
    if (!examType) return;

    let cancelled = false;

    const loadSubjects = async () => {
      try {
        const res = await fetch(`/api/exams/${examType}/subjects`, {
          headers: { ...renderSystemSessionHeaders() },
        });
        const data = await res.json();
        if (!cancelled) {
          const list = Array.isArray(data?.subjects) ? data.subjects : [];
          const mapped = list.map((s: BackendSubject) => ({
            ...s,
            id: s.id,
          }));
          clientExamSubjectsCache.set(examType, mapped);
          setSubjects(mapped);
        }
      } catch (err) {
        console.error(
          "[SubjectPlaceholderGrid] Failed to load exam subjects:",
          err
        );
        if (!cancelled && !clientExamSubjectsCache.has(examType)) setSubjects([]);
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [examType]);

  const cards: BackendSubject[] = subjects.map((subject) => ({
    id: subject.id,
    guidId: subject.guidId,
    name: subject.name,
    slug: subject.slug || toSlug(subject.name),
    description: subject.description,
    examCount: subject.examCount,
  }));

  return (
    <div className={className}>
      {cards.map((card) => {
        const examTypeSafe = examType ?? "rn-nursing";
        const identifier = card.guidId || card.id;
        const hasCustomExamsRoute = [
          "ati-teas",
          "hesi-a2",
          "rn-nursing",
          "lpn-nursing",
          "nclex-rn",
          "nclex-pn",
        ].includes(examTypeSafe);
        const href = hasCustomExamsRoute
          ? `/dashboards/${examTypeSafe}/exams/${card.slug}/${identifier}`
          : `/dashboards/${examTypeSafe}/vista/learning/subjects/distinct/overview?identifier=${identifier}`;
        return (
          <Link
            key={`${card.id}-${card.slug}`}
            href={href}
            className="group relative overflow-hidden rounded-xl bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] border border-[#CBDCF8] dark:border-white/10 hover:border-[#2FD9C4]/60 flex flex-col min-h-[50px] md:min-h-[70px] shadow-xs hover:shadow-md transition-all duration-200"
          >
            <div className="flex-1 flex items-center justify-center text-center px-2 pt-4">
              <span className="text-xs md:text-sm font-medium text-slate-900 dark:text-white/80 group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                {card.name}
              </span>
            </div>
            {showStartNow && (
              <span className="mx-2.5 mt-2.5 mb-2.5 select-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] md:text-sm font-medium bg-[#2FD9C4] text-[#08111F] hover:brightness-110 active:scale-[0.99] transition-all shadow-sm">
                <Play className="w-3.5 h-3.5 fill-current" />
                Start Now
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}