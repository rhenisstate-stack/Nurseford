// src\app\web\(nursing)\atiteas\vista\exam\(layout)\glacial\partials\StickyFooter.tsx
"use client";

import { useEffect, useState } from "react";
import { useFooterRibbon } from "./FooterRibbonContext";
import { ArrowLeft, ArrowRight, RotateCcw, ClipboardList, Share2, Copy, Check, X } from "lucide-react";
import { useExamFontSize } from "@/lib/contexts/web/assessment/theme/ExamFontSizeContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveStrataExamContext } from "@/lib/contexts/panel/assessment/LiveStrataExamContext";

const VISTA_STRATA_PANEL = "atiteas";
const VISTA_STRATA = "exams";
const BASE_TOGGLE_ROUTE = `/dashboards/${VISTA_STRATA_PANEL}/vista/${VISTA_STRATA}`;

// ─────────────────────────────────────────────────────────────────────────────
// CHOOSE EXAM CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ChooseExamModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { examSession } = useLiveStrataExamContext();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const identifier = searchParams.get("identifier") ?? "";

  if (!open) return null;

  // Prefer assessmentGuidId from session, fall back to URL identifier
  const resolvedIdentifier =
    examSession?.exam?.assessmentGuidId ??
    examSession?.exam?.assessmentId?.toString() ??
    identifier;

  const overviewUrl = `${BASE_TOGGLE_ROUTE}/distinct/overview${resolvedIdentifier ? `?identifier=${resolvedIdentifier}` : ""}`;
  const outlineUrl = `${BASE_TOGGLE_ROUTE}/distinct/outline${resolvedIdentifier ? `?identifier=${resolvedIdentifier}` : ""}`;


  return (
    <div
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-black text-white">Choose a Different Exam ⚓</h2>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-gray-700 text-center font-medium">
            You are about to leave this exam session to pick a different exam.
          </p>

          <p className="text-xs text-gray-500 text-center">
            Your current progress has been saved. Choose how you want to browse exams ⚓
          </p>

          <div className="space-y-2 pt-1">
            {/* Card + List on same row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => router.push(overviewUrl)}
                className="w-full py-2.5 rounded-xl bg-indigo-200 hover:bg-yellow-400 text-black text-sm font-bold transition"
              >
                Open Exam Cards
              </button>

              <button
                onClick={() => router.push(outlineUrl)}
                className="w-full py-2.5 rounded-xl bg-slate-200 hover:bg-yellow-400 text-black text-sm font-bold transition"
              >
                Open Exams List
              </button>
            </div>

            {/* Cancel remains full width */}
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl border border-gray-300 bg-green-200 hover:bg-yellow-400 text-black text-sm font-semibold transition"
            >
              ✕ Cancel — Stay on Current Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARE MODAL
// ─────────────────────────────────────────────────────────────────────────────

function FooterShareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { examSession } = useLiveStrataExamContext();

  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail.currentIndex === "number") setCurrentIndex(detail.currentIndex);
    };
    window.addEventListener("exam:state", handler);
    setTimeout(() => window.dispatchEvent(new CustomEvent("exam:state:request")), 0);
    return () => window.removeEventListener("exam:state", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const activeQuestionGuid = (() => {
    if (!examSession) return null;
    let i = 0;
    for (const section of examSession.sections ?? []) {
      for (const q of section.questions ?? []) {
        if (i === currentIndex) return q.guidId;
        i++;
      }
    }
    return null;
  })();

  const currentUrl = (() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    if (activeQuestionGuid) { params.set("question", activeQuestionGuid); } else { params.delete("question"); }
    const base = window.location.href.split("?")[0];
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  })();

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(currentUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10010] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-xl shadow-2xl border bg-white animate-in fade-in zoom-in-95 duration-200">

        <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between rounded-t-xl">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Share2 size={16} /> Share Exam
          </h2>
          <button onClick={onClose} className="bg-red-500 hover:bg-red-600 rounded-lg p-1.5 transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 bg-gray-50 space-y-4">
          {activeQuestionGuid && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
              <span className="text-xs text-indigo-700 font-medium">
                Sharing Link To <span className="font-bold">Question {currentIndex + 1}</span> — Recipient Will Land Directly on This Question ⚓
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Shareable URL</label>
            <div className="flex gap-2">
              <input readOnly value={currentUrl} className="flex-1 bg-white border rounded-lg px-3 py-2 text-xs text-gray-600 outline-none truncate" />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${copied ? "bg-green-600 text-white" : "bg-gray-800 hover:bg-black text-white"}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Share via</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(currentUrl)}`, "_blank")}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
              <button
                onClick={async () => { if (navigator.share) { try { await navigator.share({ url: currentUrl, title: `${document.title} — Question ${currentIndex + 1}` }); } catch { } } }}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
              >
                <Share2 size={16} /> More Options
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────

export default function Footer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const { isOpen } = useFooterRibbon();
  const { scaleGlobal, resetFontSizes } = useExamFontSize();

  const [chooseExamOpen, setChooseExamOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ currentIndex: number; total: number }>).detail;
      setCurrentIndex(detail.currentIndex ?? 0);
      setTotal(detail.total ?? 0);
    };
    window.addEventListener("exam:state", handler);
    return () => window.removeEventListener("exam:state", handler);
  }, []);

  const goUp = () => window.dispatchEvent(new CustomEvent("exam:prev"));
  const goDown = () => window.dispatchEvent(new CustomEvent("exam:next", { detail: { total } }));
  const handleSubmit = () => window.dispatchEvent(new CustomEvent("exam:submit"));

  const isFirst = currentIndex === 0;
  const isLast = total > 0 && currentIndex === total - 1;

  if (!isOpen) return null;

  return (
    <>
      <footer
        className="sticky bottom-0 z-40 w-full select-none border-t transition-colors duration-300 overflow-x-auto"
        style={{
          backgroundColor: "var(--exam-footer-bg)",
          color: "var(--exam-footer-text)",
          fontSize: "var(--exam-footer-font-lg)",
        }}
      >
        <div className="flex items-center justify-between gap-1 px-2 py-1 min-w-max">

          {/* LEFT — exam utilities */}
          <div className="flex items-center gap-1 min-w-0">
            <button
              onClick={() => setChooseExamOpen(true)}
              className="flex items-center gap-1 px-2 py-1 border border-green-600 text-green-700 hover:bg-green-100 rounded font-medium transition whitespace-nowrap"
            >
              <RotateCcw size={12} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
              <span className="sm:hidden">Switch</span>
              <span className="hidden sm:inline">Choose Different Exam</span>
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1 px-2 py-1 border border-gray-700 hover:bg-gray-100 rounded font-medium transition whitespace-nowrap"
            >
              <ClipboardList size={12} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
              Share
            </button>
          </div>

          {/* CENTER — font controls */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <button onClick={() => scaleGlobal(-1)} className="px-3 py-1.5 border border-blue-700 text-red-800 hover:bg-red-50 rounded font-semibold transition whitespace-nowrap">A-</button>
            <button onClick={() => scaleGlobal(+1)} className="px-3 py-1.5 border border-blue-400 text-blue-600 hover:bg-blue-50 rounded font-semibold transition whitespace-nowrap">A+</button>
            <button onClick={resetFontSizes} className="px-3 py-1.5 border border-gray-800 text-gray-500 hover:bg-gray-100 rounded font-medium transition whitespace-nowrap">Reset Font</button>
          </div>

          {/* RIGHT — scroll up / down / submit */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Scroll Up */}
            <div className="relative group">
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-end z-50 pointer-events-none">
                <div className="bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap">Scroll to Previous</div>
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 mr-3" />
              </div>
              <button
                onClick={goUp}
                disabled={isFirst}
                className="flex items-center justify-center w-8 h-8 border border-gray-700 hover:bg-indigo-100 rounded font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} className="rotate-90" />
              </button>
            </div>

            {/* Scroll Down */}
            {isLast ? (
              <div className="relative group">
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-end z-50 pointer-events-none">
                  <div className="bg-emerald-800 text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap">Submit Exam</div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-emerald-800 mr-3" />
                </div>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold transition whitespace-nowrap"
                >
                  Submit <ArrowRight size={12} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            ) : (
              <div className="relative group">
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-end z-50 pointer-events-none">
                  <div className="bg-gray-800 text-white text-[10px] font-medium px-2 py-1 rounded whitespace-nowrap">Scroll to Next</div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 mr-3" />
                </div>
                <button
                  onClick={goDown}
                  className="flex items-center justify-center w-8 h-8 border border-indigo-500 hover:bg-indigo-50 rounded font-medium transition"
                >
                  <ArrowRight size={14} className="rotate-90" />
                </button>
              </div>
            )}

          </div>
        </div>
      </footer>

      <ChooseExamModal open={chooseExamOpen} onClose={() => setChooseExamOpen(false)} />
      <FooterShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  );
}
// ───────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  -  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────