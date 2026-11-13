"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiAlertTriangle, FiX } from "react-icons/fi";

type DeleteAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isDeleting: boolean;
  error?: string | null;
};

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  error,
}: DeleteAccountModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  const close = () => {
    if (!isDeleting) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#15273e] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          disabled={isDeleting}
          className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <FiX />
        </button>

        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <FiAlertTriangle className="h-7 w-7" />
        </div>

        <h3 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
          Delete your account?
        </h3>
        <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
          This will deactivate and delete your account and remove your access.
        </p>

        <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-200">
          Reason for leaving (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isDeleting}
          maxLength={300}
          rows={3}
          placeholder="Tell us why you're leaving"
          className="w-full resize-none rounded-lg border border-red-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500"
        />

        {error && <p className="mt-2 text-xs font-medium text-red-700 dark:text-red-300">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={isDeleting}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Yes, Delete Account"}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={isDeleting}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}