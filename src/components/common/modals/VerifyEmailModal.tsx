"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { FiMail, FiX } from "react-icons/fi";

type VerifyEmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  verifyHref: string;
  email?: string | null;
};

export default function VerifyEmailModal({ isOpen, onClose, verifyHref, email }: VerifyEmailModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#15273e] p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <FiX />
        </button>

        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <FiMail className="h-7 w-7" />
        </div>

        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Verify your email</h3>
        <p className="mb-5 text-sm text-gray-600 dark:text-gray-300">
          Please verify
          {email ? <strong> {email}</strong> : " your email address"} to continue.
          You won&apos;t be asked again once it&apos;s done.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={verifyHref}
            onClick={onClose}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Verify Email Now
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            Later
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}