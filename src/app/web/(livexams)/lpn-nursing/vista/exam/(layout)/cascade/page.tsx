// src\app\web\(nursing)\lpnnursing\vista\exam\(layout)\glacial\page.tsx
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLiveStrataExamContext } from "@/lib/contexts/panel/assessment/LiveStrataExamContext";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";
import { QuestionTypes } from "../../../../../partials/dispatcher/QuestionTypes";

import { ArrowRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ImpelModal from "@/app/(web)/auth/modals/Impel";
import LoginModal from "@/app/(web)/auth/modals/Login";
import RegisterModal from "@/app/(web)/auth/modals/Register";
import { LeftSideBar } from "./partials/LeftSideBar";

import {
  useDiscreteDominionSubscriptionPackages,
  DiscreteSubscriptionPackage,
} from "@/lib/hooks/nexus/subscription/packages/dicreate/useDiscreteDominionSubscriptionPackages";

import AuthRequiredModal, {
  shouldSuppressAuthAlert,
  suppressAuthAlertForever,
  suppressAuthAlertTemporarily,
} from "../../../../../partials/auth/AlertModal";

import SubscriptionAlertModal, {
  shouldSuppressSubscriptionAlert,
  suppressSubscriptionAlertForever,
} from "../../../../../partials/subscription/AlertModal";

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// TYPES
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

interface FlatQuestion {
  question: Parameters<typeof QuestionTypes.render>[0];
  sectionName: string;
  sectionId: number;
  sectionGuidId: string;
  globalIndex: number; // 1-based
  total: number;
}

// ───────────────────────────────────────────────────────────────────────────
// ACCESS CONTROL — Subscription Match + StrataAccessGroup Restriction
// ───────────────────────────────────────────────────────────────────────────

type ExamSessionType = NonNullable<ReturnType<typeof useLiveStrataExamContext>["examSession"]>;
type ExamCoreType = ExamSessionType["exam"];

// Maps a package's terminalClusterTableName to the matching guid field on the exam
const TABLE_TO_EXAM_GUID_FIELD: Record<string, keyof ExamCoreType> = {
  strata_programs: "programGuidId",
  strata_courses: "courseGuidId",
  strata_subjects: "subjectGuidId",
  strata_units: "unitGuidId",
  strata_lessons: "lessonGuidId",
  strata_topics: "topicGuidId",
  strata_concepts: "conceptGuidId",
  strata_facts: "factGuidId",
};

function packageMatchesExam(pkg: DiscreteSubscriptionPackage, exam: ExamCoreType | undefined): boolean {
  if (!exam || !pkg.terminalClusterTableName || !pkg.terminalClusterGuidId) return false;
  const guidField = TABLE_TO_EXAM_GUID_FIELD[pkg.terminalClusterTableName];
  if (!guidField) return false;
  const examGuid = exam[guidField] as string | undefined;
  return !!examGuid && examGuid === pkg.terminalClusterGuidId;
}

const isPaidValue = (v: string | null | undefined) => v === "Paid" || v === "Yes";

function subscriptionIsActive(sub: { subscriptionStatus: string; subscriptionHasPaid: string; validFrom: string; validUntil?: string | null }): boolean {
  if (sub.subscriptionStatus !== "Active" || !isPaidValue(sub.subscriptionHasPaid)) return false;
  const now = new Date();
  if (sub.validFrom && new Date(sub.validFrom) > now) return false;
  if (sub.validUntil && new Date(sub.validUntil) < now) return false;
  return true;
}

type AccessCheckResult = {
  hasFullAccess: boolean;
  matchedPackages: DiscreteSubscriptionPackage[];
  denialReason: string | null;
};

// ⚠️ ASSUMPTION: userSubscriptions returned per package are already scoped to
// the authenticated caller. If the endpoint instead returns every subscriber's
// rows, filter here on a userId field once that's confirmed on UserSubscriptionPackage.
function resolveSubscriptionAccess(packages: DiscreteSubscriptionPackage[], exam: ExamCoreType | undefined): AccessCheckResult {
  const matched = packages.filter((p) => packageMatchesExam(p, exam));
  if (matched.length === 0) return { hasFullAccess: false, matchedPackages: [], denialReason: null };

  for (const pkg of matched) {
    if (pkg.userSubscriptions?.some(subscriptionIsActive)) {
      return { hasFullAccess: true, matchedPackages: matched, denialReason: null };
    }
  }

  const anySub = matched.flatMap((p) => p.userSubscriptions ?? [])[0];
  let reason = "You Do Not Have An Active Subscription For This Exam's Content ⚓";
  if (anySub) {
    if (!isPaidValue(anySub.subscriptionHasPaid)) reason = "Your Subscription Payment is Not Confirmed — Please Complete Payment ⚓";
    else if (anySub.subscriptionStatus !== "Active") reason = `Your Subscription Status is "${anySub.subscriptionStatus}" — It Must Be "Active" ⚓`;
    else if (anySub.validUntil && new Date(anySub.validUntil) < new Date()) reason = "Your Subscription Has Expired ⚓";
  }
  return { hasFullAccess: false, matchedPackages: matched, denialReason: reason };
}

// ⚠️ ASSUMPTION: accessGroup / accessValue will exist on the exam root; today
// they're only modeled on StrataSessionQuestionFull. Swap this cast out once confirmed.
type ExamWithAccessRules = ExamCoreType & { accessGroup?: string; accessValue?: number };

function applyAccessGroupRestriction(flat: FlatQuestion[], accessGroup: string | undefined, accessValue: number | undefined): FlatQuestion[] {
  if (!accessGroup || accessGroup === "Unlimited" || accessGroup === "Duration") return flat;

  if (accessGroup === "Amount") {
    return flat.slice(0, Math.max(0, accessValue ?? flat.length));
  }

  if (accessGroup === "Percentage") {
    const pct = Math.max(0, Math.min(100, accessValue ?? 100));
    return flat.slice(0, Math.ceil((flat.length * pct) / 100));
  }

  return flat;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// HELPERS
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function flattenQuestions(
  sections: NonNullable<
    ReturnType<typeof useLiveStrataExamContext>["examSession"]
  >["sections"]
): FlatQuestion[] {
  const flat: Omit<FlatQuestion, "globalIndex" | "total">[] = [];

  for (const section of sections ?? []) {
    for (const q of section.questions ?? []) {
      flat.push({
        question: q,
        sectionName: section.name,
        sectionId: section.id,
        sectionGuidId: section.guidId,
      });
    }
  }

  return flat.map((item, i) => ({
    ...item,
    globalIndex: i + 1,
    total: flat.length,
  }));
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// SHARED STATUS BOX
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function StatusBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-start justify-center pt-20"
      style={{ backgroundColor: "var(--exam-content-bg)", color: "var(--exam-content-text)" }}
    >
      <div
        className="px-6 py-4 rounded-lg border bg-gradient-to-br from-purple-300 via-green-200 to-purple-300 shadow-md font-bold"
        style={{ fontSize: "var(--exam-content-font-lg)" }}
      >
        {children}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// QUESTION HEADER  (section label + question number + progress bar)
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function QuestionHeader({
  current,
  total,
  sectionName,
  onJump,
}: {
  current: number;
  total: number;
  sectionName: string;
  onJump: (index: number) => void;
}) {
  const progress = (current / total) * 100;
  const barRef = useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number>(0);
  const isDragging = useRef(false);

  const percentToIndex = useCallback((clientX: number): number => {
    if (!barRef.current) return current;
    const rect = barRef.current.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    return Math.max(1, Math.min(total, Math.round(percent * total)));
  }, [total, current]);

  const getHoverPercent = useCallback((clientX: number): number => {
    if (!barRef.current) return 0;
    const rect = barRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * 100;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setHoverIndex(percentToIndex(e.clientX));
    setHoverPercent(getHoverPercent(e.clientX));
    if (isDragging.current) onJump(percentToIndex(e.clientX));
  }, [percentToIndex, getHoverPercent, onJump]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging.current) setHoverIndex(null);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    onJump(percentToIndex(e.clientX));

    const onMove = (ev: MouseEvent) => {
      setHoverIndex(percentToIndex(ev.clientX));
      setHoverPercent(getHoverPercent(ev.clientX));
      onJump(percentToIndex(ev.clientX));
    };
    const onUp = () => {
      isDragging.current = false;
      setHoverIndex(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [percentToIndex, getHoverPercent, onJump]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    onJump(percentToIndex(e.clientX));
  }, [percentToIndex, onJump]);

  return (
    <div
      className="px-4 py-2 border-b"
      style={{ backgroundColor: "var(--exam-upper-nav-bg)", color: "var(--exam-upper-nav-text)" }}
    >
      <div className="flex items-center gap-2">

        {/* SECTION */}
        <span
          className="shrink-0 font-semibold uppercase tracking-wide whitespace-nowrap"
          style={{ fontSize: "var(--exam-upper-nav-font-sm)", color: "var(--exam-upper-nav-text)" }}
        >
          {sectionName} -
        </span>

        {/* QUESTION COUNT */}
        <span
          className="shrink-0 font-semibold whitespace-nowrap"
          style={{ fontSize: "var(--exam-upper-nav-font-sm)", color: "var(--exam-upper-nav-text)" }}
        >
          - Question :{" "}
          <span className="text-indigo-600">{current}</span>
          <span className="font-normal opacity-50"> / {total}</span>
        </span>

        {/* PROGRESS BAR WRAPPER — extra vertical padding = bigger click/hover zone, visually still thin */}
        <div
          className="flex-1 relative cursor-pointer py-2"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >

          {/* HOVER TOOLTIP */}
          {hoverIndex !== null && (
            <div
              className="absolute top-8 -translate-x-1/2 flex flex-col items-center z-[10001] pointer-events-none"
              style={{ left: `${hoverPercent}%` }}
            >
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-indigo-700" />
              <div className="bg-indigo-700 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap shadow-xl">
                Q {hoverIndex}
              </div>
            </div>
          )}

          {/* TRACK — h-1.5 keeps it thin */}
          <div
            ref={barRef}
            className="relative h-1.5 rounded-full bg-gray-200 overflow-visible"
          >

            {/* GLOW PULSE at hover position */}
            {hoverIndex !== null && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-400 opacity-40 pointer-events-none"
                style={{
                  left: `${hoverPercent}%`,
                  boxShadow: "0 0 8px 4px rgba(99,102,241,0.5)",
                  transition: "left 30ms linear",
                }}
              />
            )}

            {/* FILL */}
            <div
              className="absolute top-0 h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 pointer-events-none"
              style={{ width: `${progress}%`, transition: "width 300ms ease" }}
            />

            {/* RIDING DOT */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
              style={{ left: `${progress}%`, transition: "left 300ms ease" }}
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-indigo-600 shadow-sm text-[8px] font-bold text-indigo-600 select-none">
                {current}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT TOAST
// ─────────────────────────────────────────────────────────────────────────────

function SubmitToast() {
  const { submitStatus, submitMessage } = useLiveExamActionContext();
  if (submitStatus === "idle") return null;

  return (
    <div className={`
      hidden md:flex fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999]
      items-center gap-2 px-4 py-2 rounded-full
      shadow-lg border text-xs font-semibold whitespace-nowrap
      transition-all duration-300
      animate-in fade-in slide-in-from-bottom-3
      ${submitStatus === "saving" ? "bg-slate-100 border-slate-300 text-slate-500" : ""}
      ${submitStatus === "saved" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : ""}
      ${submitStatus === "error" ? "bg-red-50 border-red-300 text-red-600" : ""}
    `}>
      {submitStatus === "saving" && <span className="animate-spin inline-block">⏳</span>}
      {submitStatus === "saved" && <span>✓</span>}
      {submitStatus === "error" && <span>✕</span>}
      <span>
        {submitStatus === "saving" && "Saving . . . ⚓"}
        {submitStatus === "saved" && (submitMessage ?? "Saved Successfully ⚓")}
        {submitStatus === "error" && (submitMessage ?? "Failed to Save — Check Internet Connection ⚓")}
      </span>
    </div>
  );
}


// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// RESUME POSITION TOAST
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function ResumePositionToast({
  savedIndex,      // 0-based
  flatTotal,
  storageKey,
  onAccept,
  onDismiss,
}: {
  savedIndex: number;
  flatTotal: number;
  storageKey: string;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  const questionNumber = savedIndex + 1;
  const neverKey = `${storageKey}_never_ask`;

  const handleAlwaysGo = () => {
    sessionStorage.setItem(`${storageKey}_default`, "always");
    onAccept();
  };

  const handleNeverAsk = () => {
    sessionStorage.setItem(neverKey, "true");
    onDismiss();
  };

  return (
    <div className="fixed top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9998] w-[calc(100%-2rem)] max-w-md animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white border border-indigo-200 rounded-xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-indigo-600 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-bold">Resume Where You Left Last ⚓</span>
          </div>
          <button
            onClick={onDismiss}
            className="text-indigo-200 hover:text-white transition"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 mb-3">
            You Were On{" "}
            <span className="font-black text-indigo-600 text-base">Question {questionNumber}</span>
            <span className="text-gray-400 text-xs"> / {flatTotal}</span>
            {" "}— Jump Back There ?
          </p>

          {/* Mini progress */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
              style={{ width: `${(questionNumber / flatTotal) * 100}%` }}
            />
          </div>

          {/* Primary actions */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={onAccept}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Go to Q {questionNumber}
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 py-2 border border-gray-300 hover:bg-purple-300 text-gray-900 text-sm font-medium rounded-lg transition"
            >
              Start from Q 1
            </button>
          </div>

          {/* Secondary actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAlwaysGo}
              className="flex-1 py-1.5 border border-indigo-200 text-indigo-900 text-xs font-medium rounded-lg hover:bg-green-200 transition"
            >
              Always Resume for This Exam
            </button>
            <button
              onClick={handleNeverAsk}
              className="flex-1 py-1.5 border border-red-800 text-black text-xs font-medium rounded-lg hover:bg-yellow-500 transition"
            >
              Never Ask Again !
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

function SubmitConfirmModal({
  open,
  onConfirm,
  onCancel,
  examTitle,
  totalQuestions,
  answeredCount,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  examTitle: string;
  totalQuestions: number;
  answeredCount: number;
}) {
  const remaining = totalQuestions - answeredCount;
  const percentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-green-200 px-4 py-3 text-indigo-800 text-center">
          <h2 className="text-base font-black tracking-tight"> Confirm &amp; Submit Exam ⚓</h2>
          <p className="text-emerald-800 text-xs mt-0.5 truncate">{examTitle}</p>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">

          {/* Progress ring area */}
          <div className="flex items-center justify-center gap-4">
            {/* Circle */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={percentage === 100 ? "#16a34a" : percentage >= 50 ? "#ca8a04" : "#dc2626"}
                  strokeWidth="3"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-700">
                {percentage}%
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-slate-600">Answered : <span className="font-bold text-emerald-600">{answeredCount}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <span className="text-slate-600">Remaining : <span className="font-bold text-red-500">{remaining}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                <span className="text-slate-600">Total Qs : <span className="font-bold text-slate-700">{totalQuestions}</span></span>
              </div>
            </div>
          </div>

          {/* Warning if unanswered */}
          {remaining > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="text-amber-500 text-sm flex-shrink-0">⚠️</span>
              <p className="text-xs text-amber-700 font-medium">
                You Still Have <span className="font-black">{remaining}</span> Unanswered {remaining === 1 ? "question" : "questions"}. Unanswered Questions Will be Marked Incorrect 🪝
              </p>
            </div>
          )}

          {/* Good luck */}
          <p className="text-center text-xs text-slate-500 font-medium">
            {percentage === 100 ? "🎉 All Questions Answered — Best of Luck 🪝" : "Good Luck — You've Got This 🪝"}
          </p>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl border bg-yellow-300 border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel &amp; Close
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-xl bg-green-300 hover:bg-purple-400 text-black text-sm font-bold transition"
            >
              Confirm &amp; Submit
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function AttemptsExceededModal({
  open,
  attemptsAllowed,
  onExit,
  examSession,
  submitTool,
}: {
  open: boolean;
  attemptsAllowed: number;
  onExit: () => void;
  examSession: ReturnType<typeof useLiveStrataExamContext>["examSession"];
  submitTool: ReturnType<typeof useLiveExamActionContext>["submitTool"];
}) {
  const [view, setView] = useState<"main" | "complain">("main");
  const [complainText, setComplainText] = useState("");
  const [complainRating, setComplainRating] = useState(30);
  const [complainSent, setComplainSent] = useState(false);

  const VISTA_STRATA_PANEL = "lpnnursing";
  const VISTA_STRATA = "exams";
  const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA}`;

  const resolvedIdentifier =
    examSession?.exam?.assessmentGuidId ??
    examSession?.exam?.assessmentId?.toString() ??
    "";

  const overviewUrl = `${BASE_TOGGLE_ROUTE}/distinct/overview${resolvedIdentifier ? `?identifier=${resolvedIdentifier}` : ""}`;
  const outlineUrl = `${BASE_TOGGLE_ROUTE}/distinct/outline${resolvedIdentifier ? `?identifier=${resolvedIdentifier}` : ""}`;

  useEffect(() => {
    if (open) {
      setView("main");
      setComplainText("");
      setComplainRating(30);
      setComplainSent(false);
    }
  }, [open]);

  const handleComplainSubmit = async () => {
    if (!complainText.trim() || !examSession?.exam?.id || !examSession?.exam?.guidId) return;
    await submitTool("ActionExamFeedback", {
      examId: examSession.exam.id,
      examGuidId: examSession.exam.guidId,
      actionValue: complainRating,
      actionContent: `[Attempts Exhausted Complaint] ${complainText}`,
    });
    setComplainSent(true);
    setTimeout(() => setView("main"), 1800);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* ── HEADER ── */}
        <div className="bg-green-700 px-4 py-3 text-white text-center">
          <h2 className="text-base font-black">Attempts Exhausted ⚓</h2>
          <p className="text-xs mt-0.5 text-red-200">You Have Used All Allowed Exam Attempts</p>
        </div>

        {/* ── MAIN VIEW ── */}
        {view === "main" && (
          <div className="px-5 py-5 space-y-4">
            <div className="text-center text-6xl">🚫</div>

            <p className="text-sm text-gray-700 font-medium text-center">
              You have Used All{" "}
              <span className="font-black text-red-700">{attemptsAllowed}</span>{" "}
              Allowed Attempt{attemptsAllowed !== 1 ? "s" : ""} for this Exam.
            </p>

            <p className="text-xs text-gray-500 text-center">
              You Cannot Retake This Exam. Please Choose a Different Exam or Contact Your Exam Provider if You Believe This is an Error 🪝
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 text-center">
              📌 If you feel this is UnFair or an Error, Please Contact {" "}
              <span className="font-bold">Exam Administrator / Provider</span> For Assistance.
            </div>

            {/* Row 1 — exam navigation */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.location.href = overviewUrl}
                className="py-2.5 rounded-xl bg-indigo-200 hover:bg-yellow-400 text-black text-sm font-bold transition"
              >
                Open and Choose a Different Exam [ Cards ]
              </button>
              <button
                onClick={() => window.location.href = outlineUrl}
                className="py-2.5 rounded-xl bg-slate-200 hover:bg-yellow-400 text-black text-sm font-bold transition"
              >
                Open and Choose a Different Exam [ List ]
              </button>
            </div>

            {/* Row 2 — complaint + exit */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setView("complain")}
                className="py-2.5 rounded-xl bg-orange-300 hover:bg-orange-600 text-black text-sm font-bold transition"
              >
                📩 Send a Complaint
              </button>
              <button
                onClick={onExit}
                className="py-2.5 rounded-xl border border-green-800 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition"
              >
                ✕ Exit Exam
              </button>
            </div>
          </div>
        )}

        {/* COMPLAINT VIEW */}
        {view === "complain" && (
          <div className="px-5 py-5 space-y-4">
            {complainSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="text-4xl">✅</div>
                <p className="text-sm font-bold text-emerald-700">Complaint Submitted ⚓</p>
                <p className="text-xs text-gray-500">Thank you — Your Feedback has Been Recorded.</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-800 text-center">Send a Complaint to The Exam Provider</p>
                <textarea
                  rows={4}
                  value={complainText}
                  onChange={(e) => setComplainText(e.target.value)}
                  placeholder="Describe your Issue or Complaint Here . . . ✒️"
                  className="w-full border border-orange-900 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Satisfaction Rating — {" "}
                    <span className="text-orange-600 font-bold">{complainRating}%</span>
                  </label>
                  <input
                    type="range" min={0} max={100}
                    value={complainRating}
                    onChange={(e) => setComplainRating(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setView("main")}
                    className="py-2 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition"
                  >
                    ← Go Back
                  </button>
                  <button
                    onClick={handleComplainSubmit}
                    disabled={!complainText.trim()}
                    className="py-2 rounded-xl bg-green-300 hover:bg-orange-600 text-black text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Submit Complaint
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

function SubmitResultModal({
  open,
  success,
  message,
  onClose,
  onViewResults,
}: {
  open: boolean;
  success: boolean;
  message: string | null;
  onClose: (startFresh: boolean) => void;
  onViewResults: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className={`px-4 py-3 text-center ${success ? "bg-green-200" : "bg-green-200"}`}>
          <h2 className="text-base font-black text-indigo-900">
            {success ? "Exam Submitted Successfully ⚓" : "Exam Submission Failed ⚓"}
          </h2>
        </div>

        <div className="px-5 py-5 space-y-4 text-center">
          <div className="text-5xl">{success ? "🎉" : "⚠️"}</div>
          <p className="text-sm font-semibold text-gray-700">
            {message ?? (success ? "Your Exam Has been Submitted and Marked Successfully." : "Something Went Wrong, Check Internet & Ensure Logged In")}
          </p>
          {!success && (
            <p className="text-xs font-bold text-amber-800 bg-yellow-100 border border-amber-900 rounded-lg px-3 py-2">
              💡 To Start a New Attempt, Simply Answer [ Attempt ] at Least One Question Again 📌
            </p>
          )}
          {success && (
            <p className="text-xs text-indigo-700 bg-yellow-100 border border-indigo-500 rounded-lg px-3 py-2">
              Seeking Another Attempt ? Simply Answer [ Attempt ] at Least One Question Again 📌
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onViewResults}
              className="flex-1 py-2.5 rounded-xl text-black font-bold text-sm transition bg-gradient-to-r from-green-200 via-yellow-400 to-cyan-200 border
               hover:from-indigo-700 hover:via-yellow-800 hover:to-cyan-800 hover:text-white"
            >
              Open & View Results
            </button>
            <button
              onClick={() => onClose(false)}
              className="flex-1 py-2.5 rounded-xl text-black font-bold text-sm transition bg-gradient-to-r from-green-200 via-yellow-400 to-cyan-200 border
               hover:from-indigo-700 hover:via-yellow-800 hover:to-cyan-800 hover:text-white"
            >
              Cancel & Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// LIVE EXAM PAGE
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

export default function GlacialLiveExamPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const { examSession, loading, error } = useLiveStrataExamContext();
  const storageKey = examSession?.exam?.guidId
    ? `dynamic_live_exam_current_question_position_${examSession.exam.guidId}`
    : null;
  const [currentIndex, setCurrentIndex] = useState(0); // 0-based
  const [modalStage, setModalStage] = useState<"impel" | "login" | "register">("impel");
  const [loginInitialEmail, setLoginInitialEmail] = useState("");
  const [loginInitialMessage, setLoginInitialMessage] = useState("");
  const [attemptsBlocked, setAttemptsBlocked] = useState(false);

  const { submitExam, answeredCount: sessionAnsweredCount, setSecondsLeft, submitTool } = useLiveExamActionContext();

  // ── Prior Attempt Preview Banner ──────────────────────────────────────
  // Populated from the results page's "Open Attempt" flow — present only
  // when viewing a specific past attempt, not the live/current one.
  const previewAttemptParam = searchParams.get("attempt");
  const previewScoreParam = searchParams.get("score");
  const previewPassedParam = searchParams.get("passed");
  const previewPassMarkParam = searchParams.get("passmark");

  const [showPriorAttemptBanner, setShowPriorAttemptBanner] = useState(
    previewAttemptParam !== null
  );

  // First answer submitted this session means the user has started a new
  // attempt — the banner no longer reflects what they're looking at.
  useEffect(() => {
    if (sessionAnsweredCount > 0) {
      setShowPriorAttemptBanner(false);
    }
  }, [sessionAnsweredCount]);

  const { filteredSubscriptionPackages: subscriptionPackages } =
    useDiscreteDominionSubscriptionPackages({ page: 1, perPage: 300 });

  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [durationSecondsLeft, setDurationSecondsLeft] = useState<number | null>(null);
  const [durationExpired, setDurationExpired] = useState(false);

  const [authRequired, setAuthRequired] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const [submitResult, setSubmitResult] = useState<{ open: boolean; success: boolean; message: string | null }>({
    open: false, success: false, message: null,
  });

  // Refs for each question card — used for scrollIntoView
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToIndex = useCallback((idx: number) => {
    const el = questionRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Track which question is in view via IntersectionObserver
  useEffect(() => {
    if (questionRefs.current.length === 0) return;
    const observers: IntersectionObserver[] = [];
    questionRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setCurrentIndex(i); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [questionRefs.current.length]);

  useEffect(() => {
    if (!examSession) return;
    const attemptsAllowed = examSession.exam?.attemptsAllowed ?? 0;
    if (attemptsAllowed === 0) return;
    const sessionRow = examSession.examActions?.find(
      (a: { actionType: string; attemptCount?: number; status?: string }) =>
        a.actionType === "Pause"
    );
    const attemptCount = sessionRow?.attemptCount ?? 0;
    if (attemptCount >= attemptsAllowed) setAttemptsBlocked(true);
  }, [examSession]);

  useEffect(() => {
    if (!examSession) return;
    const sessionRow = examSession.examActions?.find(
      (a: { actionType: string; attemptCount?: number; status?: string }) =>
        a.actionType === "Pause"
    );
    if (sessionRow?.residualDuration && sessionRow.residualDuration > 0)
      setSecondsLeft(Math.round(sessionRow.residualDuration * 60));
  }, [examSession, setSecondsLeft]);

  // Stamp window so question components can read it on mount —
  // same signal shape as the generic exam page. Honours the sessionStorage
  // choice set by SubmitResultModal / the results page's "Open Attempt" flow.
  useEffect(() => {
    if (!examSession?.exam?.guidId) return;
    const modeKey = `exam_attempt_mode_${examSession.exam.guidId}`;
    const targetAttemptKey = `exam_attempt_target_number_${examSession.exam.guidId}`;
    const savedMode = sessionStorage.getItem(modeKey);
    const savedTargetAttempt = sessionStorage.getItem(targetAttemptKey);

    if (savedMode === "prior") {
      (window as Window & { __examIsNewAttempt?: boolean }).__examIsNewAttempt = false;

      if (savedTargetAttempt !== null) {
        const targetAttemptNumber = parseInt(savedTargetAttempt, 10);
        (window as Window & { __examTargetAttemptNumber?: number }).__examTargetAttemptNumber = targetAttemptNumber;
        window.dispatchEvent(
          new CustomEvent("exam:attempt:prior", { detail: { attemptNumber: targetAttemptNumber } })
        );
        sessionStorage.removeItem(targetAttemptKey);
      } else {
        window.dispatchEvent(new CustomEvent("exam:attempt:prior"));
      }

      sessionStorage.removeItem(modeKey);
    } else if (savedMode === "fresh") {
      (window as Window & { __examIsNewAttempt?: boolean }).__examIsNewAttempt = true;
      window.dispatchEvent(new CustomEvent("exam:attempt:fresh"));
      sessionStorage.removeItem(modeKey);
      sessionStorage.removeItem(targetAttemptKey);
    }
  }, [examSession?.exam?.guidId]);

  // Expose current attempt number globally so question components can detect stale answers
  useEffect(() => {
    if (!examSession) return;
    const currentAttempt = examSession.examActions?.[0]?.attemptCount ?? 0;
    (window as Window & { __examCurrentAttempt?: number }).__examCurrentAttempt = currentAttempt;
  }, [examSession]);

  const answeredCount = useMemo(() => {
    if (!examSession) return sessionAnsweredCount;
    const resumeCount = Object.keys(examSession.resumeAnswers ?? {}).length;
    return Math.max(resumeCount, sessionAnsweredCount);
  }, [examSession, sessionAnsweredCount]);

  const [examPaused, setExamPaused] = useState(false);
  const [isCancelled, setIsCancelled] = useState(
    examSession?.examActions?.[0]?.status === "Cancelled"
  );
  const isBlocked = examPaused || isCancelled;
  const isBlockedRef = useRef(isBlocked);
  useEffect(() => { isBlockedRef.current = isBlocked; }, [isBlocked]);

  const [resumeToast, setResumeToast] = useState<{ savedIndex: number } | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    const row = examSession?.examActions?.[0];
    if (!row) return;
    setIsCancelled(row.status === "Cancelled");
    if (row.status === "Paused") setExamPaused(true);
  }, [examSession]);

  useEffect(() => {
    const onPaused = () => setExamPaused(true);
    const onResume = () => { setExamPaused(false); setIsCancelled(false); };
    window.addEventListener("exam:paused", onPaused);
    window.addEventListener("exam:resume", onResume);
    return () => {
      window.removeEventListener("exam:paused", onPaused);
      window.removeEventListener("exam:resume", onResume);
    };
  }, []);

  useEffect(() => {
    const onAuthRequired = () => {
      // Full login/register flow already open — don't yank the user back to
      // Impel mid-flow. This is what caused "reduced back to impel" on retry.
      if (authRequired) return;
      if (shouldSuppressAuthAlert()) return;
      setShowAuthAlert(true);
    };
    window.addEventListener("exam:auth:required", onAuthRequired);
    return () => window.removeEventListener("exam:auth:required", onAuthRequired);
  }, [authRequired]);

  const openAuthFlow = useCallback(() => {
    setShowAuthAlert(false);
    setModalStage("impel");
    setAuthRequired(true);
    setExamPaused(true); // block nav/submit only once the real auth modal is up
  }, []);

  const closeAuthAlert = useCallback((dontShowAgain: boolean) => {
    setShowAuthAlert(false);
    if (dontShowAgain) suppressAuthAlertForever();
    else suppressAuthAlertTemporarily();
  }, []);

  // ── Resolve Subscription Access Against This Exam's Learning Hierarchy ──
  const subscriptionAccess = useMemo<AccessCheckResult>(
    () => resolveSubscriptionAccess(subscriptionPackages, examSession?.exam),
    [subscriptionPackages, examSession?.exam]
  );

  // Public exams bypass subscription checks and accessGroup restrictions
  // entirely — every question is shown, unlimited, no duration cap.
  const isPublicAccess = examSession?.exam?.accessType === "Public";

  // Ref (not state) so this stays true across re-renders even though
  // `subscriptionAccess` is a new object every time examSession/subscriptionPackages
  const subscriptionAlertShownRef = useRef(false);

  useEffect(() => {
    if (!examSession) return;
    if (isPublicAccess) return;
    if (subscriptionAlertShownRef.current) return;
    if (subscriptionAccess.matchedPackages.length > 0 && !subscriptionAccess.hasFullAccess) {
      if (shouldSuppressSubscriptionAlert(examSession.exam?.guidId)) return;
      subscriptionAlertShownRef.current = true;
      setShowAccessDeniedModal(true);
    }
  }, [examSession, subscriptionAccess, isPublicAccess]);

  const closeSubscriptionAlert = useCallback((dontShowAgain: boolean) => {
    setShowAccessDeniedModal(false);
    if (dontShowAgain) suppressSubscriptionAlertForever(examSession?.exam?.guidId);
  }, [examSession?.exam?.guidId]);

  const examAccess = examSession?.exam as ExamWithAccessRules | undefined;

  // Derive flat list (safe before data arrives), then gate it
  const rawFlat = examSession ? flattenQuestions(examSession.sections) : [];
  const restrictedFlat = (subscriptionAccess.hasFullAccess || isPublicAccess)
    ? rawFlat
    : applyAccessGroupRestriction(rawFlat, examAccess?.accessGroup, examAccess?.accessValue);

  const flat = restrictedFlat.map((item, i) => ({ ...item, globalIndex: i + 1, total: restrictedFlat.length }));
  const flatTotal = flat.length;

  const handlePrev = useCallback(() => {
    if (isBlockedRef.current) { window.dispatchEvent(new CustomEvent("exam:paused:intercept")); return; }
    const next = Math.max(0, currentIndex - 1);
    setCurrentIndex(next);
    scrollToIndex(next);
  }, [currentIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    if (isBlockedRef.current) { window.dispatchEvent(new CustomEvent("exam:paused:intercept")); return; }
    const next = Math.min(flatTotal - 1, currentIndex + 1);
    setCurrentIndex(next);
    scrollToIndex(next);
  }, [currentIndex, flatTotal, scrollToIndex]);

  const handleJump = useCallback((n: number) => {
    // n is 1-based from QuestionHeader / LeftSideBar
    if (isBlockedRef.current) { window.dispatchEvent(new CustomEvent("exam:paused:intercept")); return; }
    const idx = n - 1;
    setCurrentIndex(idx);
    scrollToIndex(idx);
  }, [scrollToIndex]);

  // Footer event bridge
  useEffect(() => {
    const onPrev = () => handlePrev();
    const onNext = () => handleNext();
    const onJump = (e: Event) => {
      if (isBlockedRef.current) { window.dispatchEvent(new CustomEvent("exam:paused:intercept")); return; }
      const idx = (e as CustomEvent<{ index: number }>).detail.index;
      setCurrentIndex(idx);
      scrollToIndex(idx);
    };
    const onStateRequest = () => {
      window.dispatchEvent(new CustomEvent("exam:state", {
        detail: { currentIndex, total: flatTotal },
      }));
    };
    window.addEventListener("exam:prev", onPrev);
    window.addEventListener("exam:next", onNext as EventListener);
    window.addEventListener("exam:jump", onJump as EventListener);
    window.addEventListener("exam:state:request", onStateRequest);
    return () => {
      window.removeEventListener("exam:prev", onPrev);
      window.removeEventListener("exam:next", onNext as EventListener);
      window.removeEventListener("exam:jump", onJump as EventListener);
      window.removeEventListener("exam:state:request", onStateRequest);
    };
  }, [handlePrev, handleNext, currentIndex, flatTotal, scrollToIndex]);

  // Broadcast state (currentIndex is now scroll-tracked)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("exam:state", {
      detail: { currentIndex, total: flatTotal, answeredCount },
    }));
  }, [currentIndex, flatTotal, answeredCount]);


  // Measure sticky navbar stack height and apply as CSS var for QuestionHeader offset
  useEffect(() => {
    const update = () => {
      const upper = document.getElementById("glacial-upper-nav");
      const lower = document.getElementById("glacial-lower-nav");

      let total = 0;
      if (upper) total += upper.getBoundingClientRect().height;
      if (lower) total += lower.getBoundingClientRect().height;

      document.documentElement.style.setProperty("--glacial-nav-offset", `${total}px`);
    };
    update();

    const obs = new ResizeObserver(update);
    const upper = document.getElementById("glacial-upper-nav");
    const lower = document.getElementById("glacial-lower-nav");
    if (upper) obs.observe(upper);
    if (lower) obs.observe(lower);

    window.addEventListener("resize", update);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);


  // Measure question header height and footer height for sidebar bounds
  useEffect(() => {
    const update = () => {
      const qHeader = document.getElementById("glacial-question-header");
      const footer = document.getElementById("glacial-lower-nav");
      if (qHeader) document.documentElement.style.setProperty("--glacial-question-header-h", `${qHeader.getBoundingClientRect().height}px`);
      if (footer) document.documentElement.style.setProperty("--glacial-footer-h", `${footer.getBoundingClientRect().height}px`);
    };
    update();
    const obs = new ResizeObserver(update);
    const qHeader = document.getElementById("glacial-question-header");
    const footer = document.getElementById("glacial-lower-nav");
    if (qHeader) obs.observe(qHeader);
    if (footer) obs.observe(footer);
    window.addEventListener("resize", update);
    return () => { obs.disconnect(); window.removeEventListener("resize", update); };
  }, []);



  // URL ?target jump on first load
  useEffect(() => {
    if (flatTotal === 0) return;
    const params = new URLSearchParams(window.location.search);
    const targetGuid = params.get("target");
    if (!targetGuid) return;
    const idx = flat.findIndex((q) => q.question.guidId === targetGuid);
    if (idx !== -1) { setCurrentIndex(idx); setTimeout(() => scrollToIndex(idx), 300); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatTotal]);

  // Resume position toast
  useEffect(() => {
    if (flatTotal === 0 || !storageKey) return;
    const saved = sessionStorage.getItem(storageKey);
    if (saved === null) return;
    const idx = parseInt(saved, 10);
    if (isNaN(idx) || idx <= 0 || idx >= flatTotal) return;
    const neverKey = `${storageKey}_never_ask`;
    const defaultKey = `${storageKey}_default`;
    if (sessionStorage.getItem(neverKey) === "true") return;
    if (sessionStorage.getItem(defaultKey) === "always") {
      setCurrentIndex(idx);
      setTimeout(() => scrollToIndex(idx), 300);
      return;
    }
    setResumeToast({ savedIndex: idx });
  }, [flatTotal, scrollToIndex, storageKey]);

  // Persist position
  useEffect(() => {
    if (!storageKey || flatTotal === 0) return;
    sessionStorage.setItem(storageKey, String(currentIndex));
  }, [currentIndex, storageKey, flatTotal]);

  useEffect(() => {
    const onSubmitRequest = () => {
      if (isBlockedRef.current) { window.dispatchEvent(new CustomEvent("exam:paused:intercept")); return; }
      setShowSubmitConfirm(true);
    };
    window.addEventListener("exam:submit", onSubmitRequest as EventListener);
    return () => window.removeEventListener("exam:submit", onSubmitRequest as EventListener);
  }, []);

  const handleConfirmedSubmit = useCallback(async () => {
    if (!examSession?.exam?.id || !examSession?.exam?.guidId) return;
    const key = `dynamic_live_exam_current_question_position_${examSession.exam.guidId}`;
    sessionStorage.removeItem(key);
    setShowSubmitConfirm(false);

    // result now carries { success, message } directly from runLifecycle
    const result = await submitExam({
      examId: examSession.exam.id!,
      examGuidId: examSession.exam.guidId!,
      reason: "User Submitted Exam ⚓",
      status: "Completed",
    });

    setSubmitResult({
      open: true,
      success: result.success,
      message: result.message,
    });

  }, [examSession, submitExam]);

  // Duration Access Group — Count Down, Force-Submit On Expiry 
  useEffect(() => {
    if (!examSession) return;
    if (isPublicAccess) return;
    if (subscriptionAccess.hasFullAccess) return;
    if (examAccess?.accessGroup !== "Duration") return;
    if (durationSecondsLeft !== null) return;
    setDurationSecondsLeft(Math.max(0, Math.round((examAccess?.accessValue ?? 0) * 60)));
  }, [examSession, subscriptionAccess.hasFullAccess, examAccess, durationSecondsLeft, isPublicAccess]);

  useEffect(() => {
    if (durationSecondsLeft === null) return;

    if (durationSecondsLeft <= 0) {
      if (!durationExpired) {
        setDurationExpired(true);
        setShowSubmitConfirm(false);
        handleConfirmedSubmit();
      }
      return;
    }

    const t = setTimeout(() => setDurationSecondsLeft((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(t);
  }, [durationSecondsLeft, durationExpired, handleConfirmedSubmit]);


  // Guards
  if (loading) return <StatusBox>Loading Live Exam . . . ⚓</StatusBox>;
  if (error) {
    if (error.includes("Access Denied")) {
      return (
        <>
          <StatusBox>{error}</StatusBox>

          <ImpelModal
            isOpen={modalStage === "impel"}
            onClose={() => window.history.back()}
            onChooseLogin={() => setModalStage("login")}
            onChooseRegister={() => setModalStage("register")}
          />
          <LoginModal
            isOpen={modalStage === "login"}
            onClose={() => window.history.back()}
            onSwitchToRegister={() => setModalStage("register")}
            initialEmail={loginInitialEmail}
            initialMessage={loginInitialMessage}
            redirectPath={currentUrl}
          />
          <RegisterModal
            isOpen={modalStage === "register"}
            onClose={() => window.history.back()}
            onSwitchToLogin={(email, message) => {
              setLoginInitialEmail(email);
              setLoginInitialMessage(message);
              setModalStage("login");
            }}
          />
        </>
      );
    }

    return <StatusBox>{error}</StatusBox>;
  }

  if (!examSession) return <StatusBox>No Exam Data Found ⚓</StatusBox>;
  if (flatTotal === 0) return <StatusBox>Neither Sections Nor Questions Are Available ⚓</StatusBox>;

  const safeIndex = Math.min(currentIndex, flatTotal - 1);

  // RENDER
  return (
    <main
      className="w-full select-none"
      style={{
        backgroundColor: "var(--exam-content-bg)",
        color: "var(--exam-content-text)",
        fontSize: "var(--exam-content-font-base)",
      }}
    >

      {durationSecondsLeft !== null && !subscriptionAccess.hasFullAccess && !isPublicAccess && (
        <div className="px-4 py-1 text-xs font-bold text-center bg-amber-100 text-amber-800 border-b border-amber-300">
          Limited Access — Time Remaining : {Math.floor(durationSecondsLeft / 60)}m {String(durationSecondsLeft % 60).padStart(2, "0")}s
        </div>
      )}

      {showPriorAttemptBanner && previewAttemptParam !== null && (
        <div className="px-4 py-2 text-xs font-bold text-center bg-indigo-100 text-indigo-800 border-b border-indigo-300 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>
            Viewing Attempt {parseInt(previewAttemptParam, 10) + 1}
            {previewScoreParam !== null && ` — Score : ${previewScoreParam}%`}
            {previewPassMarkParam !== null && ` (Pass Mark : ${previewPassMarkParam}%)`}
            {previewPassedParam !== null && (previewPassedParam === "true" ? " (Passed)" : " (Not Passed)")}
          </span>
          <span className="opacity-70 font-semibold">
            — Answering Any Question Will Start A New Attempt Automatically ⚓
          </span>
        </div>
      )}

      {/* Sticky progress header — offsets below all sticky navbars */}
      <div
        id="glacial-question-header"
        className="sticky z-[200]"
        style={{ top: "var(--glacial-nav-offset, 0px)" }}
      >
        <QuestionHeader
          current={safeIndex + 1}
          total={flatTotal}
          sectionName={flat[safeIndex]?.sectionName ?? ""}
          onJump={handleJump}
        />
      </div>

      {/* Sticky left sidebar rail */}
      <LeftSideBar
        flat={flat}
        currentIndex={safeIndex}
        onJump={handleJump}
      />

      {/* ALL questions — scrollable */}
      <div className="flex flex-col md:pl-5">
        {flat.map((item, i) => (
          <div
            key={item.question.guidId ?? i}
            ref={(el) => { questionRefs.current[i] = el; }}
            className="px-4 py-2"
            style={{ color: "var(--exam-content-text)", fontSize: "var(--exam-content-font-base)" }}
          >
            {QuestionTypes.render(
              item.question,
              item.globalIndex,
              examSession.exam.selectedMode,
              {
                examId: examSession.exam.id ?? 0,
                examGuidId: examSession.exam.guidId ?? "",
                sectionId: item.sectionId,
                sectionGuidId: item.sectionGuidId,
              }
            )}

            {/* Submit button only on last question */}
            {i === flatTotal - 1 && (
              <div className="flex justify-center my-8 pt-4 mx-2 border-t-3">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent("exam:submit"))}
                  className="flex items-center gap-1 px-4 py-2 text-md border border-emerald-500 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 font-semibold transition"
                >
                  Submit Exam <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <SubmitToast />

      {/* Subscription Access Modal */}
      <SubscriptionAlertModal
        open={showAccessDeniedModal}
        reason={subscriptionAccess.denialReason}
        examGuidId={examSession?.exam?.guidId}
        onClose={closeSubscriptionAlert}
      />

      <AuthRequiredModal
        open={showAuthAlert}
        onClose={closeAuthAlert}
        onLogin={openAuthFlow}
      />

      {authRequired && (
        <>
          <ImpelModal
            isOpen={modalStage === "impel"}
            onClose={() => {
              setAuthRequired(false);
              window.dispatchEvent(new CustomEvent("exam:resume"));
            }}
            onChooseLogin={() => setModalStage("login")}
            onChooseRegister={() => setModalStage("register")}
          />
          <LoginModal
            isOpen={modalStage === "login"}
            onClose={() => {
              setAuthRequired(false);
              window.dispatchEvent(new CustomEvent("exam:resume"));
            }}
            onSwitchToRegister={() => setModalStage("register")}
            initialEmail={loginInitialEmail}
            initialMessage={loginInitialMessage}
            redirectPath={currentUrl}
          />
          <RegisterModal
            isOpen={modalStage === "register"}
            onClose={() => {
              setAuthRequired(false);
              window.dispatchEvent(new CustomEvent("exam:resume"));
            }}
            onSwitchToLogin={(email, message) => {
              setLoginInitialEmail(email);
              setLoginInitialMessage(message);
              setModalStage("login");
            }}
          />
        </>
      )}

      {resumeToast && storageKey && (
        <ResumePositionToast
          savedIndex={resumeToast.savedIndex}
          flatTotal={flatTotal}
          storageKey={storageKey}
          onAccept={() => {
            setCurrentIndex(resumeToast.savedIndex);
            setTimeout(() => scrollToIndex(resumeToast.savedIndex), 150);
            setResumeToast(null);
          }}
          onDismiss={() => setResumeToast(null)}
        />
      )}

      <AttemptsExceededModal
        open={attemptsBlocked}
        attemptsAllowed={examSession?.exam?.attemptsAllowed ?? 0}
        onExit={() => window.history.back()}
        examSession={examSession}
        submitTool={submitTool}
      />

      <SubmitConfirmModal
        open={showSubmitConfirm}
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
        examTitle={examSession?.exam?.title ?? "Exam"}
        totalQuestions={flatTotal}
        answeredCount={answeredCount}
      />

      <SubmitResultModal
        open={submitResult.open}
        success={submitResult.success}
        message={submitResult.message}
        onViewResults={() => {
          if (examSession?.exam?.guidId) {
            router.push(`/dashboards/lpn-nursing/vista/assessment/exams/results/distinct?identifier=${examSession.exam.guidId}`);
          }
        }}
        onClose={(startFresh: boolean) => {
          if (examSession?.exam?.guidId) {
            sessionStorage.setItem(
              `exam_attempt_mode_${examSession.exam.guidId}`,
              startFresh ? "fresh" : "prior"
            );
            sessionStorage.setItem(
              `exam_attempt_count_${examSession.exam.guidId}`,
              String(examSession.examActions?.[0]?.attemptCount ?? 0)
            );
          }
          setSubmitResult({ open: false, success: false, message: null });
          window.location.reload();
        }}
      />

    </main>
  );
}
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────


// User selects answer → local state updates immediately (optimistic)
//                     → debounced POST/PUT to backend (300-500ms after last change)
//                     → "Saved ✓" pulse on success
//                     → on failure → show "Save failed, retrying..." + retry

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────