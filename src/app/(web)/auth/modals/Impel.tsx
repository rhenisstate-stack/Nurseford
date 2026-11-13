"use client";

import { LogIn, UserPlus, X, ShieldCheck } from "lucide-react";
import { APP_NAME } from "@/lib/config/config";

interface ImpelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChooseLogin: () => void;
  onChooseRegister: () => void;
}

export default function ImpelModal({
  isOpen,
  onClose,
  onChooseLogin,
  onChooseRegister,
}: ImpelModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 shadow-2xl p-7 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Modern Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Shield Icon */}
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800/60 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center mb-3 shadow-2xs">
          <ShieldCheck className="w-6 h-6" />
        </div>

        {/* Modal Title */}
        <h2 className="text-2xl font-black text-[#0A2540] dark:text-white tracking-tight">
          Welcome to {APP_NAME}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
          Sign in or create an account to access your full exam results, rationales, and progress analytics.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            type="button"
            onClick={onChooseLogin}
            className="w-full py-3 px-4 rounded-xl bg-[#0A2540] hover:bg-[#081B2E] text-white text-sm font-bold flex items-center justify-center gap-2.5 transition shadow-sm"
          >
            <LogIn className="w-4 h-4 text-teal-400" />
            I already have an account — Login
          </button>

          <button
            type="button"
            onClick={onChooseRegister}
            className="w-full py-3 px-4 rounded-xl border border-teal-600/30 dark:border-teal-500/40 bg-teal-50/70 dark:bg-teal-950/30 hover:bg-teal-100/70 dark:hover:bg-teal-950/50 text-teal-800 dark:text-teal-300 text-sm font-bold flex items-center justify-center gap-2.5 transition"
          >
            <UserPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            I&apos;m new here — Register Now
          </button>
        </div>

        {/* Trust Note */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 pt-4 mt-1 border-t border-slate-100 dark:border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>NCLEX-aligned clinical preparation</span>
        </div>
      </div>
    </div>
  );
}
