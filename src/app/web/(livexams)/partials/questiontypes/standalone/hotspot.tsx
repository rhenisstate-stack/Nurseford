'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import type { StrataSessionQuestionFull } from "@/lib/hooks/nexus/strata/assessment/learning/exams/live/useLiveStrataExamsHook";
import { QuestionToolbar } from "../../components/QuestionToolbar";
import { QuestionPromptHeader } from "@/components/panel/exam/QuestionPromptHeader";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";

interface Props {
  q: StrataSessionQuestionFull;
  questionNumber?: number;
  mode?: string;
  examId: number;
  examGuidId: string;
  sectionId: number;
  sectionGuidId: string;
  hideQuestionHeader?: boolean;
}

interface MarkerData {
  x: string;
  y: string;
  shape: "dot" | "circle" | "crosshair" | string;
}

export const HotspotQuestion = ({
  q,
  questionNumber,
  mode,
  examId,
  examGuidId,
  sectionId,
  sectionGuidId,
  hideQuestionHeader,
}: Props) => {

  const m = (mode ?? "").toLowerCase().trim();
  const showFeedback = m === "review" || m === "tutor";

  const bgMedia = q.questionMedias?.find((med) => med.type === "hotspot-background");

  const correctOptionIds = new Set(
    (q.questionCorrectAnswers ?? [])
      .filter((ca) => ca.isCorrect)
      .map((ca) => ca.questionOptionId)
  );

  const markers = (q.questionOptions ?? []).map((opt) => {
    const data: MarkerData = opt.data
      ? JSON.parse(opt.data)
      : { x: "0", y: "0", shape: "dot" };
    return { opt, data, isCorrect: correctOptionIds.has(opt.id) };
  });

  const { getAnswer, submitAnswer } = useLiveExamActionContext();

  const saved = getAnswer(q.id);
  const savedPicked = Array.isArray(saved?.answer)
    ? new Set(saved.answer as number[])
    : new Set<number>();

  // Auto-populate from backend savedUserAnswer if provided else just display answers without selection
  const persistedPicked: Set<number> = (() => {
    if (!q.savedUserAnswer?.userAnswerData) return new Set();
    try {
      const parsed = JSON.parse(q.savedUserAnswer.userAnswerData);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((x): x is number => typeof x === "number"));
    } catch { return new Set(); }
  })();

  const isFresh = sessionStorage.getItem(`exam_attempt_mode_${examGuidId}`) === "fresh";
  const expectedAttempt = parseInt(sessionStorage.getItem(`exam_attempt_count_${examGuidId}`) ?? "0", 10);
  const answerAttempt = q.savedUserAnswer?.attemptNumber ?? 0;
  const shouldClear = isFresh || (expectedAttempt > 0 && answerAttempt !== expectedAttempt);

  const [picked, setPicked] = useState<Set<number>>(
    () => shouldClear ? new Set() : (savedPicked.size > 0 ? savedPicked : persistedPicked)
  );

  useEffect(() => {
    if (savedPicked.size > 0 && picked.size === 0) {
      setPicked(savedPicked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved?.answer]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  // NEW ATTEMPT GUARD
  useEffect(() => {
    const onFresh = () => setPicked(new Set());
    const onPrior = () => setPicked(persistedPicked);
    window.addEventListener("exam:attempt:fresh", onFresh);
    window.addEventListener("exam:attempt:prior", onPrior);
    return () => {
      window.removeEventListener("exam:attempt:fresh", onFresh);
      window.removeEventListener("exam:attempt:prior", onPrior);
    };
  }, [persistedPicked]);

  // ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

  const toggle = (optId: number) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(optId)) next.delete(optId);
      else next.add(optId);

      // only user-picked data goes to backend — q data is never mutated
      submitAnswer(hideQuestionHeader ? "ActionCaseBasedHotspot" : "ActionHotspot", {
        questionId: q.id,
        questionGuidId: q.guidId,
        examId,
        examGuidId,
        sectionId,
        sectionGuidId,
        answer: Array.from(next),
      });

      return next;
    });
  };

  const getMarkerState = (optId: number, isCorrect: boolean) => {
    if (!showFeedback) return picked.has(optId) ? "selected" : "idle";
    if (picked.has(optId)) return isCorrect ? "correct" : "wrong";
    if (isCorrect) return "missed";
    return "idle";
  };

  const renderMarker = (shape: string, label: string, state: string) => {
    const color = {
      correct: "#10b981",
      wrong: "#ef4444",
      missed: "#f59e0b",
      selected: "#5c05f2",
      idle: "#bcc4d4",
    }[state] ?? "#6b7280";

    if (shape === "dot") {
      return (
        <>
          <circle r="0.8" fill={color} stroke="white" strokeWidth="0.2" />
          <text x="0.9" y="-0.9" fontSize="0.9" fontWeight="700" fill={color} dominantBaseline="middle">{label}</text>
        </>
      );
    }
    if (shape === "circle") {
      return (
        <>
          <circle r="1" fill={`${color.replace("0.9", "0.15")}`} stroke={color} strokeWidth="0.2" />
          <text x="1.2" y="-1.1" fontSize="0.9" fontWeight="700" fill={color} dominantBaseline="middle">{label}</text>
        </>
      );
    }
    return (
      <>
        <line x1="-0.8" x2="0.8" y1="0" y2="0" stroke={color} strokeWidth="0.2" />
        <line x1="0" x2="0" y1="-0.8" y2="0.8" stroke={color} strokeWidth="0.2" />
        <circle r="0.25" fill={color} />
        <text x="1" y="-1" fontSize="0.9" fontWeight="700" fill={color} dominantBaseline="middle">{label}</text>
      </>
    );
  };

  return (
    <div className="pt-1 space-y-2">

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      <QuestionPromptHeader
        questionNumber={questionNumber}
        questionText={q.questionText}
        metaQuestionText={q.metaQuestionText}
        hideQuestionHeader={hideQuestionHeader}
      />
{/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {!hideQuestionHeader &&
        q.metaQuestionText &&
        q.metaQuestionText.trim().toLowerCase() !== "null" && (
          <div
            className="text-sm px-2 text-gray-500 italic"
            dangerouslySetInnerHTML={{ __html: q.metaQuestionText }}
          />
        )}

      {/* ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}

      {bgMedia ? (
        <div className="relative max-w-xl mx-auto rounded-lg overflow-hidden border border-gray-200 bg-gray-100 select-none">
          <Image
            src={`/api/media/${bgMedia.mediaPath}`}
            alt="hotspot image"
            width={1200}
            height={800}
            className="w-full h-auto block pointer-events-none"
            draggable={false}
          />
          <svg
            className="absolute inset-0 w-full h-full overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {markers.map(({ opt, data, isCorrect }) => {
              const state = getMarkerState(opt.id, isCorrect);
              return (
                <g
                  key={opt.id}
                  transform={`translate(${data.x}, ${data.y}) scale(2)`}
                  onClick={() => toggle(opt.id)}
                  style={{ cursor: "pointer" }}
                >
                  {renderMarker(data.shape, opt.answerContent ?? "", state)}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="text-xs text-gray-400 italic">No Hotspot Image Available</div>
      )}

      {showFeedback && (
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Correct
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Incorrect
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Missed
          </span>
        </div>
      )}

      <QuestionToolbar q={q} mode={mode} examId={examId} examGuidId={examGuidId} sectionId={sectionId} sectionGuidId={sectionGuidId} />
    </div>
  );
};