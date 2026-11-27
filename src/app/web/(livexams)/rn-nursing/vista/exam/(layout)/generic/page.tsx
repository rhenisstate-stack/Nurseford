// src/app/web/(livexams)/ati-teas/vista/exam/(layout)/generic/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useLiveStrataExamContext } from "@/lib/contexts/panel/assessment/LiveStrataExamContext";
import { useLiveExamActionContext } from "@/lib/contexts/web/assessment/live/useLiveExamActionContext";
import { useCurrentSystemUser } from "@/lib/hooks/users/account/current/useCurrentSystemUser";
import { getUsernameCookie } from "@/lib/utils/sessions/generateSystemUserSessionCookies";
import { QuestionTypes } from "../../../../../partials/dispatcher/QuestionTypes";
import { CustomMiniCalculator } from "@/components/panel/exam/tools/CustomMiniCalculator";
import ImpelUserAuthetication from "@/components/auth/modal/ImpelUserAuthetication";
import { useMyActiveSubscription } from "@/app/(web)/includes/components/exams/ActiveSubscriptionCard";
import { useExamSubscriptionAccess } from "@/lib/hooks/nexus/subscription/packages/useExamSubscriptionAccess";
import UserAccountDropdown from "@/components/common/user/UserAccountDropdown";
import HeedMessageBellDropdown from "@/components/common/notifications/HeedMessageBellDropdown";
import { FiChevronDown } from "react-icons/fi";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  HelpCircle,
  LogOut,
  FileText,
  Hourglass,
  Clock,
  Flag,
  CheckCircle2,
  X,
  RotateCcw,
  Sun,
  Moon,
  LayoutList,
  Settings,
  Pause,
  SquarePower,
  Star,
  Bookmark,
  Pin,
  Crown,
  Sparkles,
  UserCheck,
  Lock,
} from "lucide-react";
import { useExamFontSize } from "@/lib/contexts/web/assessment/theme/ExamFontSizeContext";
import { useExamTheme } from "@/lib/contexts/web/assessment/theme/ExamThemeContext";
import { resolveExamSeason } from "@/lib/utils/exams/resolveExamSeason";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface FlatQuestion {
  question: Parameters<typeof QuestionTypes.render>[0];
  sectionName: string;
  sectionId: number;
  sectionGuidId: string;
  globalIndex: number; // 1-based
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type RealIds = {
  _realSectionId?: number;
  _realSectionGuidId?: string;
  _realExamId?: number;
  _realExamGuidId?: string;
};
const realIds = (q: unknown): RealIds => q as RealIds;

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
        sectionId: realIds(q)._realSectionId ?? section.id,
        sectionGuidId: realIds(q)._realSectionGuidId ?? section.guidId,
      });
    }
  }

  return flat.map((item, i) => ({
    ...item,
    globalIndex: i + 1,
    total: flat.length,
  }));
}

function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [
    h > 0 ? `${h}h` : null,
    `${String(m).padStart(2, "0")}m`,
    `${String(s).padStart(2, "0")}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED STATUS BOX
// ─────────────────────────────────────────────────────────────────────────────

function StatusBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="px-8 py-6 rounded-2xl border border-slate-200 bg-white shadow-xl font-bold text-slate-800 text-center max-w-md">
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT TOAST
// ─────────────────────────────────────────────────────────────────────────────

function SubmitToast() {
  const { submitStatus, submitMessage } = useLiveExamActionContext();
  if (submitStatus === "idle") return null;

  return (
    <div
      className={`
      hidden md:flex fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999]
      items-center gap-2 px-4 py-2 rounded-full
      shadow-lg border text-xs font-semibold whitespace-nowrap
      transition-all duration-300
      animate-in fade-in slide-in-from-bottom-3
      ${submitStatus === "saving" ? "bg-slate-100 border-slate-300 text-slate-600" : ""}
      ${submitStatus === "saved" ? "bg-emerald-50 border-emerald-300 text-emerald-700" : ""}
      ${submitStatus === "error" ? "bg-red-50 border-red-300 text-red-600" : ""}
    `}
    >
      {submitStatus === "saving" && <span className="animate-spin inline-block">⏳</span>}
      {submitStatus === "saved" && <span>✓</span>}
      {submitStatus === "error" && <span>✕</span>}
      <span>
        {submitStatus === "saving" && "Saving answer..."}
        {submitStatus === "saved" && (submitMessage ?? "Saved Successfully")}
        {submitStatus === "error" && (submitMessage ?? "Failed to Save — Check Connection")}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATOR MODAL
// ─────────────────────────────────────────────────────────────────────────────

function CalculatorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10005] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0c1929] px-4 py-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-cyan-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-4 bg-slate-50">
          <CustomMiniCalculator />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELP MODAL
// ─────────────────────────────────────────────────────────────────────────────

function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10005] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0c1929] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-cyan-400" />
            <h3 className="font-bold text-sm">Exam Instructions &amp; Help</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 text-xs">
              1
            </span>
            <div>
              <p className="font-semibold text-slate-800">Navigation</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Use the <strong>Previous</strong> and <strong>Next</strong> buttons or click any question number on the left sidebar to jump directly.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0 text-xs">
              2
            </span>
            <div>
              <p className="font-semibold text-slate-800">Flag for Review</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Click <strong>Flag for Review</strong> on the question card or toggle <strong>Mark for Review</strong> at the bottom to flag questions you want to revisit.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0 text-xs">
              3
            </span>
            <div>
              <p className="font-semibold text-slate-800">Calculator &amp; Tools</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Access the built-in mini calculator anytime by clicking the <strong>Calculator</strong> button in the top navigation bar.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0 text-xs">
              4
            </span>
            <div>
              <p className="font-semibold text-slate-800">Ending &amp; Submitting</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Click <strong>End Exam</strong> in the top header or <strong>Submit Exam</strong> on the final question. You will see an answer summary before confirming.
              </p>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition cursor-pointer"
            >
              Got it, Resume Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUME POSITION TOAST
// ─────────────────────────────────────────────────────────────────────────────

function ResumePositionToast({
  savedIndex,
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
        <div className="bg-indigo-600 px-4 py-2.5 flex items-center justify-between">
          <span className="text-white text-sm font-bold">Resume Where You Left Last</span>
          <button onClick={onDismiss} className="text-indigo-200 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-3">
          <p className="text-sm text-gray-700 mb-3">
            You were on <span className="font-bold text-indigo-600 text-base">Question {questionNumber}</span>
            <span className="text-gray-400 text-xs"> / {flatTotal}</span> — jump back there?
          </p>

          <div className="h-1.5 w-full bg-gray-100 rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
              style={{ width: `${(questionNumber / flatTotal) * 100}%` }}
            />
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={onAccept}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
            >
              Go to Q {questionNumber}
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 py-2 border border-gray-300 hover:bg-slate-50 text-gray-800 text-sm font-medium rounded-lg transition cursor-pointer"
            >
              Start from Q 1
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAlwaysGo}
              className="flex-1 py-1.5 border border-indigo-200 text-indigo-900 text-xs font-medium rounded-lg hover:bg-indigo-50 transition cursor-pointer"
            >
              Always Resume
            </button>
            <button
              onClick={handleNeverAsk}
              className="flex-1 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Never Ask Again
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
  onChooseDifferentExam,
  examTitle,
  totalQuestions,
  answeredCount,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onChooseDifferentExam?: () => void;
  examTitle: string;
  totalQuestions: number;
  answeredCount: number;
}) {
  const remaining = totalQuestions - answeredCount;
  const percentage = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0c1929] px-5 py-4 text-white text-center">
          <h2 className="text-base font-bold tracking-tight">Kindly Confirm to End Exam</h2>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{examTitle}</p>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center justify-center gap-5">
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke={percentage === 100 ? "#16a34a" : percentage >= 50 ? "#ca8a04" : "#dc2626"}
                  strokeWidth="3"
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-800">
                {percentage}%
              </span>
            </div>

            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-slate-600">
                  Answered: <span className="font-bold text-emerald-600">{answeredCount}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <span className="text-slate-600">
                  Remaining: <span className="font-bold text-red-500">{remaining}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                <span className="text-slate-600">
                  Total Questions: <span className="font-bold text-slate-800">{totalQuestions}</span>
                </span>
              </div>
            </div>
          </div>

          {remaining > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <span className="text-amber-500 text-sm shrink-0">⚠️</span>
              <p className="text-xs text-amber-800 font-medium">
                You still have <span className="font-bold">{remaining}</span> unanswered {remaining === 1 ? "question" : "questions"}. Unanswered questions will be scored as incorrect.
              </p>
            </div>
          )}

          <p className="text-center text-xs text-slate-500 font-medium">
            {percentage === 100 ? "All questions answered — best of luck!" : "Are you ready to submit your exam?"}
          </p>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel &amp; Return
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
            >
              Confirm &amp; End
            </button>
          </div>

          {onChooseDifferentExam && (
            <button
              type="button"
              onClick={onChooseDifferentExam}
              className="w-full py-2 px-3 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 pt-1"
            >
              <RotateCcw size={13} />
              <span>Choose a Different Exam instead</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHOOSE EXAM CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ChooseExamModal({
  open,
  onClose,
  examSession,
}: {
  open: boolean;
  onClose: () => void;
  examSession: ReturnType<typeof useLiveStrataExamContext>["examSession"];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const handleGoBack = () => {
    onClose();
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/dashboards");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-indigo-600 px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-indigo-200" />
            <h2 className="text-sm font-bold text-white">Choose a Different Exam</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-800 font-semibold">
              Leave this exam session?
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Your current progress and answers have been safely saved.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {/* Primary Action: Go Back to Exams List / Previous Page */}
            <button
              onClick={handleGoBack}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={15} />
              <span>Go Back to Exams</span>
            </button>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer mt-1"
            >
              Cancel &amp; Stay on Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ATTEMPTS EXCEEDED MODAL
// ─────────────────────────────────────────────────────────────────────────────

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
    <div className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-red-700 px-4 py-3 text-white text-center">
          <h2 className="text-base font-bold">Attempts Exhausted</h2>
          <p className="text-xs mt-0.5 text-red-200">You have used all allowed attempts</p>
        </div>

        {view === "main" && (
          <div className="px-5 py-5 space-y-4">
            <div className="text-center text-5xl">🚫</div>
            <p className="text-sm text-gray-700 font-medium text-center">
              You have used all <span className="font-bold text-red-700">{attemptsAllowed}</span> allowed attempt{attemptsAllowed !== 1 ? "s" : ""} for this exam.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setView("complain")}
                className="py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold transition cursor-pointer"
              >
                📩 Send Feedback
              </button>
              <button
                onClick={onExit}
                className="py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                ✕ Exit Exam
              </button>
            </div>
          </div>
        )}

        {view === "complain" && (
          <div className="px-5 py-5 space-y-4">
            {complainSent ? (
              <div className="text-center py-6 space-y-2">
                <div className="text-4xl">✅</div>
                <p className="text-sm font-bold text-emerald-700">Feedback Submitted</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-800 text-center">Send Message to Exam Provider</p>
                <textarea
                  rows={4}
                  value={complainText}
                  onChange={(e) => setComplainText(e.target.value)}
                  placeholder="Describe your issue or question..."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setView("main")}
                    className="py-2 rounded-xl border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-100 transition cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleComplainSubmit}
                    disabled={!complainText.trim()}
                    className="py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 transition cursor-pointer"
                  >
                    Submit
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

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT RESULT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function SubmitResultModal({
  open,
  success,
  message,
  onClose,
  onChooseDifferentExam,
}: {
  open: boolean;
  success: boolean;
  message: string | null;
  onClose: (startFresh: boolean) => void;
  onChooseDifferentExam?: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`px-4 py-3 text-center ${success ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          <h2 className="text-base font-bold">
            {success ? "Exam Submitted Successfully" : "Exam Submission Failed"}
          </h2>
        </div>

        <div className="px-5 py-5 space-y-4 text-center">
          <div className="text-5xl">{success ? "🎉" : "⚠️"}</div>
          <p className="text-sm font-semibold text-slate-700">
            {message ?? (success ? "Your exam has been submitted and scored." : "Something went wrong. Please check your connection.")}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onClose(false)}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              View Results
            </button>
            <button
              onClick={() => onClose(true)}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition cursor-pointer"
            >
              New Attempt
            </button>
          </div>

          {onChooseDifferentExam && (
            <button
              type="button"
              onClick={onChooseDifferentExam}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200 mt-1"
            >
              <RotateCcw size={14} />
              <span>Choose a Different Exam</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION NAVIGATOR MODAL
// ─────────────────────────────────────────────────────────────────────────────

function QuestionNavigatorModal({
  open,
  onClose,
  total,
  currentIndex,
  onSelect,
  answeredMap,
  allowedMaxIndex,
  isGuest,
  isSubscribed,
  onRequireLogin,
  onRequireSubscribe,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  currentIndex: number;
  onSelect: (index: number) => void;
  answeredMap: Record<number, boolean>;
  allowedMaxIndex?: number;
  isGuest?: boolean;
  isSubscribed?: boolean;
  onRequireLogin?: () => void;
  onRequireSubscribe?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1929] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#10B981] px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <LayoutList size={18} />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Question Navigator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs font-semibold pb-2 border-b border-slate-200 dark:border-white/10 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block" /> Current
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block" /> Answered
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 inline-block" /> Unanswered
            </span>
            {typeof allowedMaxIndex === "number" && allowedMaxIndex < total - 1 && (
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="text-xs">🔒</span> Locked
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: total }, (_, i) => {
              const isCurrent = i === currentIndex;
              const isAnswered = Boolean(answeredMap[i]);
              const isLocked = typeof allowedMaxIndex === "number" && i > allowedMaxIndex;

              const handleClick = () => {
                if (isLocked) {
                  onClose();
                  if (isGuest) {
                    onRequireLogin?.();
                  } else {
                    onRequireSubscribe?.();
                  }
                  return;
                }
                onSelect(i);
                onClose();
              };

              return (
                <button
                  key={i}
                  onClick={handleClick}
                  title={isLocked ? (isGuest ? "Login required" : "Subscription required") : `Question ${i + 1}`}
                  className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-2xs relative ${isCurrent
                    ? "bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1"
                    : isLocked
                      ? "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 opacity-60 hover:opacity-100"
                      : isAnswered
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <span>{i + 1}</span>
                  {isLocked && <span className="text-[10px] ml-0.5">🔒</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE EXAM PAGE
// ─────────────────────────────────────────────────────────────────────────────

const DEV_MOCK_SESSION = {
  exam: {
    id: 999,
    guidId: "f5b6a158-9a1c-41ab-a662-45e1d5d93a6b",
    title: "NSG521 Fundamentals & Health Assessment Final Exam 2026",
    assessmentName: "Fundamentals & Health Assessment",
    subjectName: "RN Nursing",
    season: "Final",
    year: "2026",
    attemptsAllowed: 10,
    selectedMode: "Practice",
    questionsCount: 58,
    timeDuration: 7200,
  },
  sections: [
    {
      id: 1,
      guidId: "sec-1",
      name: "Client Care & Assessment",
      questions: [
        {
          id: 101,
          guidId: "q-101",
          type: "casebasedmultipleselect",
          questionType: "casebasedmultipleselect",
          questionText: "A nurse is caring for a client.",
          metaQuestionText: "Which other recommendation(s) could the nurse give to help the client have better sleep? Select all that apply.",
          questionContents: [
            {
              id: 1,
              title: "History and Physical",
              description: "<p>Client is a 36-year-old female who is in the clinic today for insomnia. She reports that she started having trouble sleeping 2 years ago after her father's death. Has no medical problems and has never had surgery. Takes an oral contraceptive and a multivitamin daily. Does not smoke but drinks 1 to 2 glasses of wine every evening.</p>",
              prerequisites: "CaseBasedData"
            },
            {
              id: 2,
              title: "Nurses' Notes",
              description: "<p>Client appears fatigued with dark circles under eyes. Oriented x 4. Expresses frustration regarding daytime grogginess.</p>",
              prerequisites: "CaseBasedData"
            },
            {
              id: 3,
              title: "Vital signs",
              description: "<p>BP 118/76 mmHg, HR 72 bpm, RR 16/min, Temp 98.4°F, SpO2 99% on room air.</p>",
              prerequisites: "CaseBasedData"
            },
            {
              id: 4,
              title: "Orders",
              description: "<p>Sleep hygiene counseling. Sleep diary for 2 weeks. Follow up in 1 month.</p>",
              prerequisites: "CaseBasedData"
            }
          ],
          questionOptions: [
            { id: 1, option: "Avoid alcohol in the evening", answerContent: "Avoid alcohol in the evening", primaryText: "Avoid alcohol in the evening" },
            { id: 2, option: "Avoid naps", answerContent: "Avoid naps", primaryText: "Avoid naps" },
            { id: 3, option: "Watch television in bed to fall asleep", answerContent: "Watch television in bed to fall asleep", primaryText: "Watch television in bed to fall asleep" },
            { id: 4, option: "Exercise in the evening", answerContent: "Exercise in the evening", primaryText: "Exercise in the evening" },
            { id: 5, option: "Try to go to bed and awaken at the same time every day", answerContent: "Try to go to bed and awaken at the same time every day", primaryText: "Try to go to bed and awaken at the same time every day" },
          ],
          questionCorrectAnswers: [
            { id: 1, questionOptionId: 1, isCorrect: true },
            { id: 2, questionOptionId: 2, isCorrect: true },
            { id: 5, questionOptionId: 5, isCorrect: true }
          ]
        },
        {
          id: 102,
          guidId: "q-102",
          type: "singlechoice",
          questionType: "singlechoice",
          questionText: "The nurse is reviewing the client's lab results.",
          metaQuestionText: "Which electrolyte imbalance should the nurse prioritize reporting to the primary care provider?",
          questionOptions: [
            { id: 11, option: "Sodium 138 mEq/L", answerContent: "Sodium 138 mEq/L", primaryText: "Sodium 138 mEq/L" },
            { id: 12, option: "Potassium 2.9 mEq/L", answerContent: "Potassium 2.9 mEq/L", primaryText: "Potassium 2.9 mEq/L" },
            { id: 13, option: "Chloride 101 mEq/L", answerContent: "Chloride 101 mEq/L", primaryText: "Chloride 101 mEq/L" },
            { id: 14, option: "Calcium 9.2 mg/dL", answerContent: "Calcium 9.2 mg/dL", primaryText: "Calcium 9.2 mg/dL" },
          ],
          questionCorrectAnswers: [
            { id: 12, questionOptionId: 12, isCorrect: true }
          ]
        }
      ]
    }
  ],
  examActions: []
};

export default function LiveExamPage() {
  const liveCtx = useLiveStrataExamContext();
  const [isDevPreview, setIsDevPreview] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("dev_preview=1")) {
      setIsDevPreview(true);
    }
  }, []);

  const error = isDevPreview ? null : liveCtx.error;
  const loading = isDevPreview ? false : liveCtx.loading;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const examSession = (isDevPreview && !liveCtx.examSession) ? (DEV_MOCK_SESSION as any) : liveCtx.examSession;

  const { user } = useCurrentSystemUser();
  const userName = isDevPreview ? "MACHOKOMBO" : (user?.userName?.trim() || getUsernameCookie() || "Guest");
  const userInitial = (userName.charAt(0) || "M").toUpperCase();

  const storageKey = examSession?.exam?.guidId
    ? `dynamic_live_exam_current_question_position_${examSession.exam.guidId}`
    : null;

  const [currentIndex, setCurrentIndex] = useState(0); // 0-based
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [attemptsBlocked, setAttemptsBlocked] = useState(false);
  const [navigatingPackages, setNavigatingPackages] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const programSlug = useMemo(() => {
    const match = pathname?.match(/\/(rn-nursing|lpn-nursing|nclex-rn|nclex-pn|ati-teas|hesi-a2|cna|ged|pre-nursing|certification)/);
    return match?.[1] || "rn-nursing";
  }, [pathname]);

  const isGuest = useMemo(() => {
    if (user?.userName && user.userName.toLowerCase() !== "guest") {
      return false;
    }
    const cookieUser = getUsernameCookie();
    if (cookieUser && cookieUser.toLowerCase() !== "guest") {
      return false;
    }
    return !user;
  }, [user]);

  const { isSubscribed: hookSubscribed, subscriptionsLoading } = useExamSubscriptionAccess({
    user,
    isGuest,
    programSlug,
    exam: examSession?.exam,
  });

  // Same check used on the landing/subjects pages (active sub for this program segment)
  const parentName = programSlug.toUpperCase().replace(/-/g, "_");
  const myActiveSubscription = useMyActiveSubscription(parentName);
  const isSubscribed = isDevPreview || hookSubscribed || Boolean(myActiveSubscription);
  const packagesHref = `/dashboards/${programSlug}/vista/subscriptions/items`;

  useEffect(() => {
    if (showSubscriptionModal) router.prefetch(packagesHref);
  }, [showSubscriptionModal, packagesHref, router]);

  const handleCloseSubscriptionModal = useCallback(() => {
    setShowSubscriptionModal(false);
    setNavigatingPackages(false);
    router.push(`/dashboards/${programSlug}`);
  }, [router, programSlug]);

  // Modals
  const [calcOpen, setCalcOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [chooseExamOpen, setChooseExamOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const handleShareExam = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [resumeToast, setResumeToast] = useState<{ savedIndex: number } | null>(null);
  const [submitResult, setSubmitResult] = useState<{ open: boolean; success: boolean; message: string | null }>({
    open: false,
    success: false,
    message: null,
  });

  const [flaggedIds, setFlaggedIds] = useState<Record<number, boolean>>({});
  const [splitLayout, setSplitLayout] = useState(false);

  const [mobileToolbarState, setMobileToolbarState] = useState<{
    starred: boolean;
    pinned: boolean;
    bookmarked: boolean;
    flagged: boolean;
    canShowFlag: boolean;
  }>({
    starred: false,
    pinned: false,
    bookmarked: false,
    flagged: false,
    canShowFlag: true,
  });

  useEffect(() => {
    const handleToolbarState = (e: Event) => {
      const detail = (e as CustomEvent<{
        starred?: boolean;
        pinned?: boolean;
        bookmarked?: boolean;
        flagged?: boolean;
        canShowFlag?: boolean;
      }>).detail;
      if (detail) {
        setMobileToolbarState({
          starred: Boolean(detail.starred),
          pinned: Boolean(detail.pinned),
          bookmarked: Boolean(detail.bookmarked),
          flagged: Boolean(detail.flagged),
          canShowFlag: detail.canShowFlag !== false,
        });
      }
    };
    window.addEventListener("exam:toolbar:state", handleToolbarState);
    return () => {
      window.removeEventListener("exam:toolbar:state", handleToolbarState);
    };
  }, []);

  const {
    getAnswer,
    submitExam,
    pauseExam,
    answeredCount: sessionAnsweredCount,
    secondsLeft,
    setSecondsLeft,
    saveResidualDuration,
    submitTool,
  } = useLiveExamActionContext();

  const { scaleGlobal, resetFontSizes, fontSizes } = useExamFontSize();
  const { isDark, toggleTheme } = useExamTheme();

  // Check attempts exhausted on load
  useEffect(() => {
    if (!examSession) return;
    const attemptsAllowed = examSession.exam?.attemptsAllowed ?? 0;
    if (attemptsAllowed === 0) return;
    const sessionRow = examSession.examActions?.find(
      (a: { actionType: string; attemptCount?: number; residualDuration?: number; status?: string }) =>
        a.actionType === "Pause"
    );
    const attemptCount = sessionRow?.attemptCount ?? 0;
    if (attemptCount >= attemptsAllowed) {
      setAttemptsBlocked(true);
    }
  }, [examSession]);

  // Derive flat list
  const flat = useMemo(() => {
    return examSession ? flattenQuestions(examSession.sections) : [];
  }, [examSession]);
  const flatTotal = flat.length;

  // Allowed max index: if not subscribed and subscriptions finished loading, limit preview to 0
  const allowedMaxIndex = useMemo(() => {
    if (!isSubscribed && !subscriptionsLoading) {
      return 0;
    }
    return flatTotal > 0 ? flatTotal - 1 : 0;
  }, [flatTotal, isSubscribed, subscriptionsLoading]);

  const registeredLimitCount = useMemo(() => {
    return isSubscribed || subscriptionsLoading ? flatTotal : 1;
  }, [flatTotal, isSubscribed, subscriptionsLoading]);

  // Set in-progress markers in storage on exam load
  useEffect(() => {
    if (!examSession?.exam) return;
    const guidId = examSession.exam.guidId;
    const id = examSession.exam.id;
    const examPayload = JSON.stringify({
      id: examSession.exam.id,
      guidId: examSession.exam.guidId,
      title: examSession.exam.title,
      subjectName: examSession.exam.subjectName || examSession.exam.assessmentName,
      courseName: examSession.exam.courseName,
      questionsCount: examSession.exam.questionsCount || flatTotal || 0,
      startedAt: new Date().toISOString(),
    });
    try {
      if (guidId) {
        localStorage.setItem(`exam_in_progress_${guidId}`, examPayload);
        sessionStorage.setItem(`exam_in_progress_${guidId}`, examPayload);
        if (examSession.exam.title) {
          localStorage.setItem(`exam_title_${guidId}`, examSession.exam.title);
          sessionStorage.setItem(`exam_title_${guidId}`, examSession.exam.title);
        }
      }
      if (id) {
        localStorage.setItem(`exam_in_progress_${id}`, examPayload);
        sessionStorage.setItem(`exam_in_progress_${id}`, examPayload);
        if (examSession.exam.title) {
          localStorage.setItem(`exam_title_${id}`, examSession.exam.title);
          sessionStorage.setItem(`exam_title_${id}`, examSession.exam.title);
        }
      }
    } catch { }
  }, [examSession?.exam, flatTotal]);

  const answeredMap = useMemo(() => {
    const map: Record<number, boolean> = {};
    flat.forEach((item, idx) => {
      const a = getAnswer(item.question.id);
      if (a != null || item.question.savedUserAnswer != null) {
        map[idx] = true;
      }
    });
    return map;
  }, [flat, getAnswer]);

  // Initialize flagged, starred, pinned, bookmarked questions from backend
  useEffect(() => {
    if (!examSession?.sections) return;
    const initialFlags: Record<number, boolean> = {};

    for (const s of examSession.sections) {
      for (const q of s.questions ?? []) {
        for (const a of q.questionActions ?? []) {
          try {
            const parsed = JSON.parse(a.actionContent ?? "{}");
            if (parsed.Flag) initialFlags[q.id] = true;
          } catch {
            // ignore non-json action content
          }
        }
      }
    }
    setFlaggedIds(initialFlags);
  }, [examSession]);

  // Exam state checks
  const [examPaused, setExamPaused] = useState(false);
  const [isCancelled, setIsCancelled] = useState(
    false
  );
  const isBlocked = examPaused;
  const isBlockedRef = useRef(isBlocked);
  useEffect(() => {
    isBlockedRef.current = isBlocked;
  }, [isBlocked]);

  useEffect(() => {
    const row = examSession?.examActions?.[0];
    if (!row) return;
    // Past cancelled attempts do not block active practice sessions
    if (row.status === "Paused") setExamPaused(true);
  }, [examSession]);

  useEffect(() => {
    const onPaused = () => setExamPaused(true);
    const onResume = () => {
      setExamPaused(false);
      setIsCancelled(false);
    };
    window.addEventListener("exam:paused", onPaused);
    window.addEventListener("exam:resume", onResume);
    return () => {
      window.removeEventListener("exam:paused", onPaused);
      window.removeEventListener("exam:resume", onResume);
    };
  }, []);

  // Timer logic
  const examMode = (examSession?.exam?.selectedMode ?? "").toLowerCase().trim();
  const isStrictMode = examMode === "exam" || examMode === "test";
  const totalSeconds = (examSession?.exam?.duration ?? 0) * 60;

  const examActions = examSession?.examActions ?? [];
  const latestAction = examActions[examActions.length - 1];
  const backendResidualSeconds = latestAction?.residualDuration
    ? Math.round(latestAction.residualDuration * 60)
    : null;

  const [timeWarning, setTimeWarning] = useState(false);
  const [timeUp, setTimeUp] = useState(false);

  const isNewAttempt = examSession?.examActions?.[0]?.status === "Completed";
  const currentAttemptNumber = examSession?.examActions?.[0]?.attemptCount ?? 0;

  // Seed timer
  useEffect(() => {
    if (totalSeconds <= 0) return;
    const attemptModeKeyTimer = examSession?.exam?.guidId
      ? `exam_attempt_mode_${examSession.exam.guidId}`
      : null;
    const attemptModeTimer = attemptModeKeyTimer ? sessionStorage.getItem(attemptModeKeyTimer) : null;
    const shouldResetTimer = isNewAttempt && attemptModeTimer !== "prior";

    const startFrom = shouldResetTimer ? totalSeconds : (backendResidualSeconds ?? totalSeconds);
    setSecondsLeft(startFrom);
    setTimeWarning(false);
    setTimeUp(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds, isNewAttempt, backendResidualSeconds]);

  // Countdown tick
  useEffect(() => {
    if (totalSeconds <= 0) return;
    if (timeUp) return;
    if (examPaused) return;

    const warningThreshold = Math.floor(totalSeconds * 0.2);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= warningThreshold) setTimeWarning(true);
        if (next <= 0) {
          clearInterval(interval);
          setTimeUp(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds, timeUp, setSecondsLeft, examPaused]);

  // Strict mode time-up auto submit
  useEffect(() => {
    if (!timeUp || !isStrictMode) return;
    const examId = examSession?.exam?.id ?? 0;
    const examGuidId = examSession?.exam?.guidId ?? "";
    if (!examId || !examGuidId) return;
    submitExam({ examId, examGuidId, reason: "Time up — Auto Submitted" });
  }, [timeUp, isStrictMode, examSession, submitExam]);

  // Periodic residual duration autosave
  const secondsLeftRef = useRef(secondsLeft);
  useEffect(() => {
    secondsLeftRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    const examId = examSession?.exam?.id ?? 0;
    const examGuidId = examSession?.exam?.guidId ?? "";
    if (!examId || !examGuidId) return;

    const saveResidual = () => {
      saveResidualDuration({
        examId,
        examGuidId,
        residualDuration: parseFloat((secondsLeftRef.current / 60).toFixed(4)),
        reason: "Periodic Residual Duration Autosave (2-Minute Interval)",
        status: "true",
      });
    };

    const periodicTimer = setInterval(saveResidual, 2 * 60 * 1000);
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(saveResidual, 300);
      } else {
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", saveResidual);

    return () => {
      clearInterval(periodicTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", saveResidual);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [examSession?.exam?.id, examSession?.exam?.guidId, saveResidualDuration]);

  // Answer count calculation
  const answeredCount = useMemo(() => {
    if (!examSession) return sessionAnsweredCount;

    const attemptModeKey = examSession.exam?.guidId
      ? `exam_attempt_mode_${examSession.exam.guidId}`
      : null;
    const isFreshAttempt = isNewAttempt && (attemptModeKey ? sessionStorage.getItem(attemptModeKey) !== "prior" : true);

    if (isFreshAttempt) {
      return sessionAnsweredCount;
    }

    const allQuestions = (examSession.sections ?? []).flatMap(
      (s: { questions?: { savedUserAnswer?: { attemptNumber?: number } }[] }) =>
        s.questions ?? []
    );
    const currentAttemptAnswered = allQuestions.filter(
      (q: { savedUserAnswer?: { attemptNumber?: number } }) =>
        q.savedUserAnswer?.attemptNumber === currentAttemptNumber
    ).length;

    return Math.max(currentAttemptAnswered, sessionAnsweredCount);
  }, [examSession, sessionAnsweredCount, isNewAttempt, currentAttemptNumber]);

  const questionsRemaining = Math.max(0, flatTotal - answeredCount);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (isBlockedRef.current) {
      window.dispatchEvent(new CustomEvent("exam:paused:intercept"));
      if (!examSession?.exam) return;
    }
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, [examSession?.exam]);

  const handleNext = useCallback((total?: number) => {
    if (isBlockedRef.current) {
      window.dispatchEvent(new CustomEvent("exam:paused:intercept"));
      if (!examSession?.exam) return;
    }
    if (!subscriptionsLoading && !isSubscribed && currentIndex >= allowedMaxIndex) {
      setShowSubscriptionModal(true);
      return;
    }
    const maxTotal = typeof total === "number" && total > 0 ? total : flatTotal;
    const cappedLimit = !subscriptionsLoading && !isSubscribed ? allowedMaxIndex : maxTotal - 1;

    setCurrentIndex((i) => Math.min(cappedLimit, i + 1));
  }, [flatTotal, examSession?.exam, isSubscribed, subscriptionsLoading, currentIndex, allowedMaxIndex]);

  // Listen for navigation window events
  useEffect(() => {
    const onPrev = () => handlePrev();
    const onNext = (e: Event) =>
      handleNext((e as CustomEvent<{ total?: number }>).detail?.total);

    const onJump = (e: Event) => {
      if (isBlockedRef.current) {
        window.dispatchEvent(new CustomEvent("exam:paused:intercept"));
        if (!examSession?.exam) return;
      }
      const idx = (e as CustomEvent<{ index: number }>).detail.index;
      if (!subscriptionsLoading && !isSubscribed && idx > allowedMaxIndex) {
        setShowSubscriptionModal(true);
        return;
      }
      const cappedLimit = !subscriptionsLoading && !isSubscribed ? allowedMaxIndex : flatTotal - 1;
      setCurrentIndex(Math.min(Math.max(0, idx), cappedLimit));
    };

    window.addEventListener("exam:prev", onPrev);
    window.addEventListener("exam:next", onNext as EventListener);
    window.addEventListener("exam:jump", onJump as EventListener);

    return () => {
      window.removeEventListener("exam:prev", onPrev);
      window.removeEventListener("exam:next", onNext as EventListener);
      window.removeEventListener("exam:jump", onJump as EventListener);
    };
  }, [handlePrev, handleNext, flatTotal, examSession?.exam]);

  // Broadcast exam state to toolbars and footers
  useEffect(() => {
    if (flatTotal > 0) {
      window.dispatchEvent(
        new CustomEvent("exam:state", {
          detail: {
            currentIndex,
            total: flatTotal,
            isLast: currentIndex >= flatTotal - 1,
          },
        })
      );
    }
  }, [currentIndex, flatTotal]);

  useEffect(() => {
    const onStateReq = () => {
      if (flatTotal > 0) {
        window.dispatchEvent(
          new CustomEvent("exam:state", {
            detail: {
              currentIndex,
              total: flatTotal,
              isLast: currentIndex >= flatTotal - 1,
            },
          })
        );
      }
    };
    window.addEventListener("exam:state:request", onStateReq);
    return () => window.removeEventListener("exam:state:request", onStateReq);
  }, [currentIndex, flatTotal]);

  // Session storage position restore
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
      if (!examSession?.exam) return;
    }
    setResumeToast({ savedIndex: idx });
  }, [flatTotal, storageKey, examSession?.exam]);

  // Persist current position
  useEffect(() => {
    if (!storageKey || flatTotal === 0) return;
    sessionStorage.setItem(storageKey, String(currentIndex));
  }, [currentIndex, storageKey, flatTotal]);

  // Listen for submit request
  useEffect(() => {
    const onSubmitRequest = () => {
      if (isBlockedRef.current) {
        window.dispatchEvent(new CustomEvent("exam:paused:intercept"));
        if (!examSession?.exam) return;
      }
      setShowSubmitConfirm(true);
    };
    window.addEventListener("exam:submit", onSubmitRequest as EventListener);
    return () => window.removeEventListener("exam:submit", onSubmitRequest as EventListener);
  }, [examSession?.exam]);

  // Submit confirmation handler
  const handleConfirmedSubmit = useCallback(async () => {
    if (!examSession?.exam?.id || !examSession?.exam?.guidId) return;
    const key = `dynamic_live_exam_current_question_position_${examSession.exam.guidId}`;
    try {
      sessionStorage.removeItem(key);
      localStorage.removeItem(`exam_in_progress_${examSession.exam.guidId}`);
      sessionStorage.removeItem(`exam_in_progress_${examSession.exam.guidId}`);
      localStorage.removeItem(`exam_in_progress_${examSession.exam.id}`);
      sessionStorage.removeItem(`exam_in_progress_${examSession.exam.id}`);
    } catch { }
    setShowSubmitConfirm(false);

    const result = await submitExam({
      examId: examSession.exam.id,
      examGuidId: examSession.exam.guidId,
      reason: "User Submitted Exam",
      status: "Completed",
    });

    setSubmitResult({
      open: true,
      success: result.success,
      message: result.message,
    });
  }, [examSession, submitExam]);

  // Toggle flag handler
  const safeIndex = Math.min(currentIndex, Math.max(0, flatTotal - 1));
  const current = flat[safeIndex];

  const handleToggleFlag = useCallback(async () => {
    if (!current?.question?.id || !examSession?.exam?.id || !examSession?.exam?.guidId) return;
    const qId = current.question.id;
    const qGuidId = current.question.guidId;
    const nextFlagState = !flaggedIds[qId];

    setFlaggedIds((prev) => ({ ...prev, [qId]: nextFlagState }));

    await submitTool("ActionQuestionFlag", {
      examId: examSession.exam.id,
      examGuidId: examSession.exam.guidId,
      sectionId: current.sectionId,
      sectionGuidId: current.sectionGuidId,
      questionId: qId,
      questionGuidId: qGuidId,
      actionValue: nextFlagState ? "Flagged" : "Unflagged",
      actionContent: JSON.stringify({ Flag: nextFlagState }),
    });
  }, [current, examSession, flaggedIds, submitTool]);

  useEffect(() => {
    if (!current?.question) return;
    const actions = (current.question.questionActions ?? []).map((a: { actionContent?: string }) => {
      try {
        return { ...a, _parsed: JSON.parse(a.actionContent ?? "{}") };
      } catch {
        return { ...a, _parsed: {} };
      }
    });
    const star = actions.find((a: { _parsed: Record<string, unknown> }) => a._parsed.Star !== undefined);
    const pin = actions.find((a: { _parsed: Record<string, unknown> }) => a._parsed.Pin !== undefined);
    const bmark = actions.find((a: { _parsed: Record<string, unknown> }) => a._parsed.Bookmark !== undefined);
    const flag = actions.find((a: { _parsed: Record<string, unknown> }) => a._parsed.Flag !== undefined);

    setMobileToolbarState((prev) => ({
      ...prev,
      starred: Boolean(star?._parsed?.Star),
      pinned: Boolean(pin?._parsed?.Pin),
      bookmarked: Boolean(bmark?._parsed?.Bookmark),
      flagged: Boolean(flag?._parsed?.Flag || (current.question && flaggedIds[current.question.id])),
    }));
  }, [current, flaggedIds]);

  const handleTogglePause = useCallback(async () => {
    if (examPaused) {
      setExamPaused(false);
      setIsCancelled(false);
      window.dispatchEvent(new CustomEvent("exam:resume"));
    } else {
      setExamPaused(true);
      window.dispatchEvent(new CustomEvent("exam:paused"));
      if (examSession?.exam?.id && examSession?.exam?.guidId) {
        pauseExam({
          examId: examSession.exam.id,
          examGuidId: examSession.exam.guidId,
          residualDuration: parseFloat((secondsLeftRef.current / 60).toFixed(4)),
          reason: "User paused exam",
        });
      }
    }
  }, [examPaused, examSession, pauseExam]);
  if (loading) return <StatusBox>Loading Live Exam...</StatusBox>;

  if (error) {
    const errLower = error.toLowerCase();
    if (
      errLower.includes("access denied") ||
      errLower.includes("log in") ||
      errLower.includes("login") ||
      errLower.includes("unauthorized") ||
      errLower.includes("unauthenticated") ||
      errLower.includes("invalid or expired") ||
      errLower.includes("session") ||
      errLower.includes("expired") ||
      errLower.includes("401")
    ) {
      const isLoggedIn = Boolean(user?.id || user?.email || getUsernameCookie());
      return (
        <>
          <StatusBox>
            <div className="flex flex-col items-center gap-3 py-1">
              <span className="text-base font-bold text-slate-800">{error}</span>
              {isLoggedIn ? (
                <>
                  <p className="text-xs text-slate-500 max-w-sm">
                    You are currently signed in as <span className="font-semibold text-slate-700">{userName}</span>. If this exam requires an active subscription or your session needs to be refreshed:
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <Link
                      href={packagesHref}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                    >
                      Subscription Packages
                    </Link>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
                    >
                      Re-Authenticate / Switch Account
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500">
                    Kindly log in to your account to access this exam.
                  </p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="mt-1 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    Log In
                  </button>
                </>
              )}
              <button
                onClick={() => window.history.back()}
                className="text-xs text-slate-400 hover:text-slate-600 underline mt-2"
              >
                Go Back
              </button>
            </div>
          </StatusBox>
          <ImpelUserAuthetication
            open={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={() => window.location.reload()}
          />
        </>
      );
    }
    return <StatusBox>{error}</StatusBox>;
  }

  if (!examSession) return <StatusBox>No Exam Data Found</StatusBox>;
  if (flatTotal === 0) {
    return (
      <StatusBox>
        <div className="flex flex-col items-center gap-2.5 py-1">
          <p className="text-base font-bold text-slate-800">
            No Questions Available for this Exam
          </p>
          <p className="text-xs font-normal text-slate-500 leading-relaxed">
            This exam currently has 0 questions in the system database. Please select another exam that contains questions.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
          >
            ← Back to Exams
          </button>
        </div>
      </StatusBox>
    );
  }

  const isCurrentFlagged = Boolean(current && flaggedIds[current.question.id]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{ fontFamily: "'Calibre', 'Calibri', Candara, 'Segoe UI', Arial, sans-serif" }}
      className="min-h-screen bg-white dark:bg-[#001326] text-slate-900 dark:text-slate-100 flex flex-col select-none transition-colors duration-200"
    >
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER (ROW 1: EXAM INFO, CENTERED BRAND FAVICON & NAME, STATS/USER) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <header className="relative z-50 w-full bg-[#EBF1FA] dark:bg-[#071321] text-slate-900 dark:text-slate-100 px-4 sm:px-8 py-1.5 sm:py-2 border-b border-blue-200/60 dark:border-white/10 transition-colors">
        <div className="max-w-[1440px] mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* Left: Exam Title & Total Questions */}
          <div className="min-w-0 flex flex-col justify-center space-y-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 tracking-tight truncate max-w-[240px] sm:max-w-md">
                {examSession?.exam?.title || "Exam"}
              </span>
              {(() => {
                const s = resolveExamSeason(examSession?.exam?.season, examSession?.exam?.title, examSession?.exam?.description);
                if (!s) return null;
                return (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/25 shrink-0">
                    {s} {examSession?.exam?.year ? examSession.exam.year : ""}
                  </span>
                );
              })()}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span>Total Questions: <span className="font-bold text-slate-900 dark:text-white">{flatTotal}</span></span>
              {isSubscribed && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Full Access
                </span>
              )}
            </div>
          </div>

          {/* Center: Brand Favicon & Name Placeholder */}
          <div className="flex items-center justify-center shrink-0">
            <Link
              href="/"
              title="Return to Home"
              className="inline-flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity duration-150"
            >
              <div className="relative w-6 h-6 sm:w-7 sm:h-7 shrink-0 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo/logo.webp"
                  alt="PubNurse"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Pub<span className="text-teal-600 dark:text-teal-400">Nurse</span>
              </span>
            </Link>
          </div>

          {/* Right: Username, Questions Left, Time Left */}
          <div className="shrink-0 flex flex-col items-end justify-center space-y-0.5 whitespace-nowrap">
            <div className="flex items-center justify-end gap-1.5">
              <UserAccountDropdown
                currentDashboard={programSlug}
                align="right"
                customTrigger={({ isOpen, toggle, userName: uName, userInitial: uInitial, avatarSrc }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    className="group inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                    aria-expanded={isOpen}
                    title="Account Menu"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden flex items-center justify-center bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] sm:text-[11px] font-bold shrink-0 border border-teal-300/60 dark:border-teal-700/60">
                      {avatarSrc ? (
                        <Image
                          src={avatarSrc}
                          alt={isDevPreview ? "MACHOKOMBO" : (uName || userName || "User")}
                          width={24}
                          height={24}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        isDevPreview ? "M" : (uInitial || userInitial || "U")
                      )}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wide truncate max-w-[100px] sm:max-w-[160px]">
                      {isDevPreview ? "MACHOKOMBO" : (uName || userName)}
                    </span>
                    <FiChevronDown
                      className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                )}
              />
              {isSubscribed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/40 shadow-xs">
                  PubNurse Pro
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              <span>
                Questions Left: <span className="font-bold text-teal-600 dark:text-teal-400">{questionsRemaining}</span>
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>
                Time Left:{" "}
                <span className="text-red-600 dark:text-red-400 font-bold font-mono inline-block">
                  {totalSeconds > 0 ? formatCountdown(secondsLeft) : "Untimed"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. ACTION BAR (ROW 2: NAVIGATOR, CALCULATOR, THEME TOGGLE, SETTINGS, PAUSE, END) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div className="w-full bg-slate-100/90 dark:bg-[#0A1E34] border-b border-slate-200/80 dark:border-white/10 px-4 sm:px-10 py-2 transition-colors">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          {/* Left: Question Navigator, Settings, Calculator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-50/30 transition cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
              title="Open Question Navigator"
            >
              <LayoutList size={15} />
              <span className="hidden sm:inline">Navigator</span>
            </button>

            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-50/30 transition cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
              title="Exam Settings & Help"
            >
              <Settings size={15} />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setCalcOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/80 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-50/30 transition cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-semibold"
              title="Open Calculator"
            >
              <Calculator size={15} />
              <span className="hidden sm:inline">Calculator</span>
            </button>
          </div>

          {/* Right: Theme Toggle, Pause, End */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-300/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition cursor-pointer shadow-2xs"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun size={15} className="text-amber-500 dark:text-amber-300" />
              ) : (
                <Moon size={15} className="text-slate-700 dark:text-slate-300" />
              )}
            </button>

            <button
              type="button"
              onClick={handleTogglePause}
              className="px-3 py-1.5 rounded-lg border border-amber-400/80 dark:border-amber-600 text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title={examPaused ? "Resume Exam" : "Pause Exam"}
            >
              <Pause size={13} className="fill-current" />
              <span>{examPaused ? "Resume" : "Pause"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="px-3 py-1.5 rounded-lg border border-rose-400/80 dark:border-rose-600 text-rose-800 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="End Exam"
            >
              <SquarePower size={13} />
              <span>End</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. MAIN CONTENT: QUESTION AREA */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <main
        id="exam-question-viewport"
        className="flex-1 max-w-[1440px] mx-auto w-full px-6 sm:px-10 py-3.5 sm:py-4 pb-20 sm:pb-24"
        style={{
          ["--exam-font-desktop-base" as string]: `${fontSizes?.content?.base ?? 13.5}px`,
          ["--exam-font-desktop-sm" as string]: `${fontSizes?.content?.sm ?? 11}px`,
          ["--exam-font-desktop-lg" as string]: `${fontSizes?.content?.lg ?? 16.5}px`,
          ["--exam-font-desktop-xl" as string]: `${fontSizes?.content?.xl ?? 20}px`,

          ["--exam-font-mobile-base" as string]: `${Math.max(12, (fontSizes?.content?.base ?? 13.5) - 1.5)}px`,
          ["--exam-font-mobile-sm" as string]: `${Math.max(10, (fontSizes?.content?.sm ?? 11) - 1)}px`,
          ["--exam-font-mobile-lg" as string]: `${(fontSizes?.content?.lg ?? 16.5) - 1.5}px`,
          ["--exam-font-mobile-xl" as string]: `${(fontSizes?.content?.xl ?? 20) - 2}px`,
        }}
      >
        <style>{`
          #exam-question-viewport,
          #exam-question-viewport * {
            font-family: 'Calibre', 'Calibri', Candara, 'Segoe UI', Arial, sans-serif !important;
          }

          /* Default Phone Mode (< 640px) */
          #exam-question-viewport {
            font-size: var(--exam-font-mobile-base, 12px);
          }
          #exam-question-viewport .text-xs {
            font-size: var(--exam-font-mobile-sm, 10px) !important;
          }
          #exam-question-viewport .text-sm {
            font-size: calc(var(--exam-font-mobile-base, 12px) - 1px) !important;
          }
          #exam-question-viewport .text-base {
            font-size: var(--exam-font-mobile-base, 12px) !important;
          }
          #exam-question-viewport .text-lg {
            font-size: var(--exam-font-mobile-lg, 15px) !important;
          }
          #exam-question-viewport .text-xl {
            font-size: var(--exam-font-mobile-xl, 18px) !important;
          }
          #exam-question-viewport .exhibit-content-body {
            font-size: calc(var(--exam-font-mobile-base, 12px) + 1.5px) !important;
          }
          #exam-question-viewport .exhibit-tab-btn {
            font-size: calc(var(--exam-font-mobile-sm, 10px) + 1.5px) !important;
          }
          #exam-question-viewport table th,
          #exam-question-viewport table td,
          #exam-question-viewport label:has(input[type="checkbox"]),
          #exam-question-viewport label:has(input[type="radio"]),
          #exam-question-viewport label:has(input[type="checkbox"]) span,
          #exam-question-viewport label:has(input[type="radio"]) span {
            font-size: calc(var(--exam-font-mobile-base, 12px) + 1.5px) !important;
          }

          /* Computer & Tablet Mode (>= 640px) */
          @media (min-width: 640px) {
            #exam-question-viewport {
              font-size: var(--exam-font-desktop-base, 13.5px);
            }
            #exam-question-viewport .text-xs,
            #exam-question-viewport .sm\\:text-xs {
              font-size: var(--exam-font-desktop-sm, 11px) !important;
            }
            #exam-question-viewport .text-sm,
            #exam-question-viewport .sm\\:text-sm {
              font-size: calc(var(--exam-font-desktop-base, 13.5px) - 1.5px) !important;
            }
            #exam-question-viewport .text-base,
            #exam-question-viewport .sm\\:text-base {
              font-size: var(--exam-font-desktop-base, 13.5px) !important;
            }
            #exam-question-viewport .text-lg,
            #exam-question-viewport .sm\\:text-lg {
              font-size: var(--exam-font-desktop-lg, 16.5px) !important;
            }
            #exam-question-viewport .text-xl,
            #exam-question-viewport .sm\\:text-xl {
              font-size: var(--exam-font-desktop-xl, 20px) !important;
            }
            #exam-question-viewport .exhibit-content-body {
              font-size: calc(var(--exam-font-desktop-base, 13.5px) + 1.5px) !important;
            }
            #exam-question-viewport .exhibit-tab-btn {
              font-size: calc(var(--exam-font-desktop-sm, 11px) + 1.5px) !important;
            }
            #exam-question-viewport table th,
            #exam-question-viewport table td,
            #exam-question-viewport label:has(input[type="checkbox"]),
            #exam-question-viewport label:has(input[type="radio"]),
            #exam-question-viewport label:has(input[type="checkbox"]) span,
            #exam-question-viewport label:has(input[type="radio"]) span {
              font-size: calc(var(--exam-font-desktop-base, 13.5px) + 1.5px) !important;
            }
          }

          /* Unify font size: Main Question, Meta Question, VERIFIED CORRECT ANSWER, and CLINICAL RATIONALE */
          #exam-question-viewport .exam-title-heading,
          #exam-question-viewport .exam-title-heading * {
            font-size: var(--exam-font-desktop-lg, 16.5px) !important;
          }
          @media (max-width: 639px) {
            #exam-question-viewport .exam-title-heading,
            #exam-question-viewport .exam-title-heading * {
              font-size: var(--exam-font-mobile-lg, 15px) !important;
            }
          }

          #exam-question-viewport [data-no-font-scale] .text-xs,
          #exam-question-viewport [data-no-font-scale] .sm\\:text-xs,
          #exam-question-viewport [data-no-font-scale] .text-sm,
          #exam-question-viewport [data-no-font-scale] .sm\\:text-sm {
            font-size: 0.75rem !important;
          }

          /* Exhibit content: runs naturally without scroll box and supports dynamic paragraph spacing */
          #exam-question-viewport .exhibit-content-body {
            max-height: none !important;
            overflow-y: visible !important;
            width: 100% !important;
            white-space: normal !important;
          }
          #exam-question-viewport .exhibit-content-body p {
            margin-top: 0.2rem !important;
            margin-bottom: 0.3rem !important;
            line-height: 1.45 !important;
          }
          #exam-question-viewport .exhibit-content-body p:first-child {
            margin-top: 0 !important;
          }
          #exam-question-viewport .exhibit-content-body p:last-child {
            margin-bottom: 0 !important;
          }
          #exam-question-viewport .exhibit-content-body .exhibit-spacer,
          #exam-question-viewport .exhibit-content-body p:empty,
          #exam-question-viewport .exhibit-content-body p:has(> br:only-child) {
            margin-top: 0.3rem !important;
            margin-bottom: 0.3rem !important;
            min-height: 0.65rem;
          }

          /* Tables inside exhibits - seen as a whole without altering font size */
          #exam-question-viewport .exhibit-content-body table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 0.5rem !important;
            margin-bottom: 0.5rem !important;
            border: 1px solid #cbd5e1 !important;
          }
          .dark #exam-question-viewport .exhibit-content-body table {
            border-color: #334155 !important;
          }

          #exam-question-viewport .exhibit-content-body th,
          #exam-question-viewport .exhibit-content-body td {
            border: 1px solid #cbd5e1 !important;
            white-space: normal !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            hyphens: auto !important;
            min-width: 0 !important;
            width: auto !important;
          }
          .dark #exam-question-viewport .exhibit-content-body th,
          .dark #exam-question-viewport .exhibit-content-body td {
            border-color: #334155 !important;
          }

          /* On mobile phones (< 640px): tight horizontal padding so all columns fit within the screen as a whole */
          @media (max-width: 639px) {
            #exam-question-viewport .exhibit-content-body table {
              font-size: var(--exam-font-mobile-base, 12px) !important;
              display: table !important;
            }
            #exam-question-viewport .exhibit-content-body th,
            #exam-question-viewport .exhibit-content-body td {
              padding: 4px 2px !important;
              text-align: center !important;
              line-height: 1.25 !important;
            }
            #exam-question-viewport .exhibit-content-body th:first-child,
            #exam-question-viewport .exhibit-content-body td:first-child {
              text-align: left !important;
              padding-left: 4px !important;
            }
          }

          /* On computer & tablet: comfortable padding */
          @media (min-width: 640px) {
            #exam-question-viewport .exhibit-content-body th,
            #exam-question-viewport .exhibit-content-body td {
              padding: 6px 10px !important;
              text-align: left !important;
            }
          }
        `}</style>
        {current && (
          <div className={splitLayout ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "w-full"}>
            {QuestionTypes.render(
              current.question,
              current.globalIndex,
              examSession.exam.selectedMode,
              {
                examId: realIds(current.question)._realExamId ?? examSession.exam.id ?? 0,
                examGuidId: realIds(current.question)._realExamGuidId ?? examSession.exam.guidId ?? "",
                sectionId: current.sectionId,
                sectionGuidId: current.sectionGuidId,
              }
            )}
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. STICKY BOTTOM FOOTER NAVIGATION */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#071321] backdrop-blur-md border-t border-slate-200 dark:border-white/10 py-2.5 px-3 sm:px-6 shadow-lg z-40 transition-colors">
        {/* DESKTOP & TABLET MODE (sm: and up) - exactly original computer mode */}
        <div className="hidden sm:flex max-w-[1440px] mx-auto items-center justify-between gap-2 sm:gap-4">
          {/* Left: Previous */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm transition cursor-pointer shadow-2xs shrink-0 active:scale-[0.98]"
              >
                ← Previous
              </button>
            )}
          </div>

          {/* Center: Choose Different Exam & Font Resizing Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => setChooseExamOpen(true)}
              className="px-3.5 sm:px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/70 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-400 dark:hover:bg-teal-950/30 dark:hover:text-teal-300 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs shrink-0"
            >
              ← Choose Different Exam
            </button>

            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => scaleGlobal(-1)}
                title="Decrease Font Size (A-)"
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => scaleGlobal(1)}
                title="Increase Font Size (A+)"
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-teal-600 dark:text-teal-400 bg-slate-50 dark:bg-white/5 hover:bg-teal-50 dark:hover:bg-teal-950/30 active:scale-95 transition cursor-pointer"
              >
                A+
              </button>
              <button
                type="button"
                onClick={resetFontSizes}
                title="Reset Font Size"
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              >
                Reset Font
              </button>
            </div>
          </div>

          {/* Right: Next / Submit Exam Button */}
          {currentIndex === flatTotal - 1 ? (
            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="shrink-0 flex items-center gap-1.5 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition cursor-pointer active:scale-[0.98]"
            >
              <span>Submit Exam</span>
              <CheckCircle2 size={16} />
            </button>
          ) : false ? (
            <button
              type="button"
              onClick={() => handleNext(flatTotal)}
              className="shrink-0 flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer active:scale-[0.98]"
            >
              <span>{isGuest ? "Next (Sign in to Continue) 🔒" : "Unlock Full Exam 👑"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNext(flatTotal)}
              className="shrink-0 flex items-center gap-1.5 px-7 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition cursor-pointer active:scale-[0.98]"
            >
              <span>Next →</span>
            </button>
          )}
        </div>

        {/* MOBILE PHONES MODE (< sm) - 2 rows */}
        <div className="flex sm:hidden flex-col gap-2 w-full max-w-[1440px] mx-auto">
          {/* Upper row: Left (A-, A+, Reset font) ... space ... Right (Star, Bookmark, Pin, Flag) */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scaleGlobal(-1)}
                title="Decrease Font Size (A-)"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => scaleGlobal(1)}
                title="Increase Font Size (A+)"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-teal-600 dark:text-teal-400 bg-slate-50 dark:bg-white/5 hover:bg-teal-50 dark:hover:bg-teal-950/30 active:scale-95 transition cursor-pointer"
              >
                A+
              </button>
              <button
                type="button"
                onClick={resetFontSizes}
                title="Reset Font Size"
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
              >
                Reset font
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Star */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("exam:star"))}
                title="Star"
                className={`p-1.5 rounded-lg border transition cursor-pointer shadow-2xs ${mobileToolbarState.starred
                  ? "bg-amber-400 border-amber-400 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-600 bg-white/80 dark:bg-white/5"
                  }`}
              >
                <Star size={14} className={mobileToolbarState.starred ? "fill-current" : ""} />
              </button>

              {/* Bookmark */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("exam:bookmark"))}
                title="Bookmark"
                className={`p-1.5 rounded-lg border transition cursor-pointer shadow-2xs ${mobileToolbarState.bookmarked
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-teal-50 hover:text-teal-600 bg-white/80 dark:bg-white/5"
                  }`}
              >
                <Bookmark size={14} className={mobileToolbarState.bookmarked ? "fill-current" : ""} />
              </button>

              {/* Pin */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("exam:pin"))}
                title="Pin"
                className={`p-1.5 rounded-lg border transition cursor-pointer shadow-2xs ${mobileToolbarState.pinned
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 bg-white/80 dark:bg-white/5"
                  }`}
              >
                <Pin size={14} className={mobileToolbarState.pinned ? "fill-current" : ""} />
              </button>

              {/* Flag */}
              {mobileToolbarState.canShowFlag && (
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("exam:flag"))}
                  title="Flag"
                  className={`p-1.5 rounded-lg border transition cursor-pointer shadow-2xs ${mobileToolbarState.flagged
                    ? "bg-rose-600 border-rose-600 text-white"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 bg-white/80 dark:bg-white/5"
                    }`}
                >
                  <Flag size={14} className={mobileToolbarState.flagged ? "fill-current" : ""} />
                </button>
              )}
            </div>
          </div>

          {/* Lower row: Left (Previous) ... Middle (Choose Different Exam) ... Right (Next / Submit) */}
          <div className="flex items-center justify-between gap-1.5 w-full">
            {currentIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition cursor-pointer shadow-2xs shrink-0 active:scale-[0.98] whitespace-nowrap"
              >
                ← Previous
              </button>
            ) : (
              <div className="w-[72px]" />
            )}

            <button
              type="button"
              onClick={() => setChooseExamOpen(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/70 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/30 text-xs font-semibold transition cursor-pointer shadow-2xs truncate text-center"
            >
              ← Choose Different Exam
            </button>

            {currentIndex === flatTotal - 1 ? (
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                className="shrink-0 flex items-center justify-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-[0.98] whitespace-nowrap"
              >
                <span>Submit</span>
                <CheckCircle2 size={14} />
              </button>
            ) : false ? (
              <button
                type="button"
                onClick={() => handleNext(flatTotal)}
                className="shrink-0 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-[0.98] whitespace-nowrap"
              >
                <span>{isGuest ? "Login 🔒" : "Subscribe 👑"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNext(flatTotal)}
                className="shrink-0 flex items-center gap-1 px-5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition cursor-pointer active:scale-[0.98] whitespace-nowrap"
              >
                <span>Next →</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. MODALS & TOASTS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <SubmitToast />

      <QuestionNavigatorModal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        total={flatTotal}
        currentIndex={currentIndex}
        onSelect={(idx) => setCurrentIndex(idx)}
        answeredMap={answeredMap}
        allowedMaxIndex={allowedMaxIndex}
        onRequireLogin={() => setShowLoginModal(true)}
        onRequireSubscribe={() => setShowSubscriptionModal(true)}
        isGuest={isGuest}
        isSubscribed={isSubscribed}
      />

      {examPaused && (
        <div className="fixed inset-0 z-[10005] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c1929] border border-amber-300 dark:border-amber-700/60 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Pause size={24} className="fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Exam Paused</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The timer has stopped. You can resume at any time.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTogglePause}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition cursor-pointer shadow-xs"
            >
              Resume Exam
            </button>
          </div>
        </div>
      )}

      <CalculatorModal open={calcOpen} onClose={() => setCalcOpen(false)} />

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      {resumeToast && storageKey && (
        <ResumePositionToast
          savedIndex={resumeToast.savedIndex}
          flatTotal={flatTotal}
          storageKey={storageKey}
          onAccept={() => {
            setCurrentIndex(resumeToast.savedIndex);
            setResumeToast(null);
          }}
          onDismiss={() => {
            setResumeToast(null);
          }}
        />
      )}

      <AttemptsExceededModal
        open={attemptsBlocked}
        attemptsAllowed={examSession?.exam?.attemptsAllowed ?? 0}
        onExit={() => window.history.back()}
        examSession={examSession}
        submitTool={submitTool}
      />

      <ChooseExamModal
        open={chooseExamOpen}
        onClose={() => setChooseExamOpen(false)}
        examSession={examSession}
      />

      <SubmitConfirmModal
        open={showSubmitConfirm}
        onConfirm={handleConfirmedSubmit}
        onCancel={() => setShowSubmitConfirm(false)}
        onChooseDifferentExam={() => {
          setShowSubmitConfirm(false);
          setChooseExamOpen(true);
        }}
        examTitle={examSession?.exam?.title ?? "Exam"}
        totalQuestions={flatTotal}
        answeredCount={answeredCount}
      />

      <SubmitResultModal
        open={submitResult.open}
        success={submitResult.success}
        message={submitResult.message}
        onChooseDifferentExam={() => {
          setSubmitResult({ open: false, success: false, message: null });
          setChooseExamOpen(true);
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

      <ImpelUserAuthetication
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />

      {showSubscriptionModal && (
        <div
          className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseSubscriptionModal();
            }
          }}
        >
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#0c1929] p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={handleCloseSubscriptionModal}
              aria-label="Close"
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff6b35]/15 text-[#ea580c]">
              <Lock size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Upgrade To Unlock Full Access
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              You need an active subscription to unlock all {flatTotal} questions in this exam.
            </p>
            <button
              type="button"
              disabled={navigatingPackages}
              onClick={() => {
                setNavigatingPackages(true);
                router.push(packagesHref);
              }}
              className="inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-[#ff6b35] hover:bg-[#ea580c] text-white transition disabled:opacity-70 cursor-pointer"
            >
              {navigatingPackages ? "Opening . . ." : "View Packages"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}