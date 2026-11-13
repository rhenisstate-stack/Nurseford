"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  toSlug,
  type BackendSubject,
} from "@/lib/data/exam-subjects";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";
import { Play, ArrowRight } from "lucide-react";

/**
 * Backend-fed course-card grid shared by the non-NCLEX dashboards.
 *
 * Primary source: GET /api/exams/[examType]/subjects — the server fetches the
 * exam's courses exactly from the backend (strata courses filtered by the
 * exam's segment), so card names are the real backend course names.
 *
 * When examType is "rn-nursing", it automatically fetches and displays both
 * "rn-nursing" and "rn-exit" courses.
 * When examType is "lpn-nursing", it automatically fetches and displays both
 * "lpn-nursing" and "lpn-exit" courses.
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
  examTypes,
}: {
  className?: string;
  showStartNow?: boolean;
  examType?: string;
  examTypes?: string[];
}) {
  const resolvedTypes = useMemo(() => {
    if (examTypes && examTypes.length > 0) return examTypes;
    if (examType === "rn-nursing") return ["rn-nursing", "rn-exit"];
    if (examType === "lpn-nursing") return ["lpn-nursing", "lpn-exit"];
    if (examType) return [examType];
    return [];
  }, [examType, examTypes]);

  const cacheKey = useMemo(() => resolvedTypes.join(","), [resolvedTypes]);

  const [subjects, setSubjects] = useState<BackendSubject[]>(() => {
    return clientExamSubjectsCache.get(cacheKey) ?? [];
  });

  useEffect(() => {
    if (resolvedTypes.length === 0) return;

    let cancelled = false;

    const loadSubjects = async () => {
      try {
        const results = await Promise.all(
          resolvedTypes.map(async (t) => {
            try {
              const res = await fetch(`/api/exams/${t}/subjects`, {
                headers: { ...renderSystemSessionHeaders() },
              });
              if (!res.ok) return [];
              const data = await res.json();
              return Array.isArray(data?.subjects) ? data.subjects : [];
            } catch {
              return [];
            }
          })
        );

        if (!cancelled) {
          const combined: BackendSubject[] = [];
          const seen = new Set<string>();

          results.forEach((list, groupIndex) => {
            const sortedList = [...list].sort(
              (a, b) => (a.order ?? 9999) - (b.order ?? 9999)
            );
            for (const s of sortedList) {
              const identifier = String(s.guidId || s.id);
              if (!seen.has(identifier)) {
                seen.add(identifier);
                combined.push({
                  ...s,
                  id: s.id,
                  order: groupIndex * 1000 + (s.order ?? 1),
                });
              }
            }
          });

          clientExamSubjectsCache.set(cacheKey, combined);
          setSubjects(combined);
        }
      } catch (err) {
        console.error(
          "[SubjectPlaceholderGrid] Failed to load exam subjects:",
          err
        );
        if (!cancelled && !clientExamSubjectsCache.has(cacheKey)) {
          setSubjects([]);
        }
      }
    };

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, resolvedTypes]);

  const cards: BackendSubject[] = subjects
    .map((subject) => ({
      id: subject.id,
      guidId: subject.guidId,
      name: subject.name,
      slug: subject.slug || toSlug(subject.name),
      description: subject.description,
      coursesCount: subject.coursesCount,
      order: subject.order,
      examCount: subject.examCount,
    }))
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

  return (
    <div className={className}>
      {cards.map((card) => {
        const examTypeSafe = examType ?? resolvedTypes[0] ?? "rn-nursing";
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
        const isExitCard = /exit/i.test(card.name) || /exit/i.test(card.slug);
        return (
          <Link
            key={`${card.id}-${card.slug}`}
            href={href}
            className={`group relative overflow-hidden rounded-xl bg-white dark:bg-[var(--card-bg,#15273e)] border border-slate-200/90 dark:border-white/10 ${
              isExitCard
                ? "hover:border-teal-500/60 dark:hover:border-[#2FD9C4]/50"
                : "hover:border-blue-500/50 dark:hover:border-sky-400/50"
            } flex flex-col shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className="flex-1 flex flex-col items-start text-left px-3.5 pt-3.5 pb-2">
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-[#2FD9C4] transition-colors line-clamp-1 leading-snug">
                {card.name}
              </span>
              {card.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-300/75 line-clamp-1 mt-0.5 leading-snug">
                  {card.description}
                </p>
              )}
            </div>

            {showStartNow && (
              <div className="mt-auto px-3.5 py-1.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-[#2FD9C4] group-hover:text-teal-800 dark:group-hover:text-teal-200 transition-colors">
                  <Play className="w-3 h-3 fill-current" />
                  Start Now
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-[#2FD9C4] group-hover:translate-x-0.5 transition-all duration-200" />
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}