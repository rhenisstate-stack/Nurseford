"use client";

import { FiLogIn, FiX, FiUserPlus } from "react-icons/fi";
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700
            bg-pink-200 text-black shadow-sm backdrop-blur-md transition-all duration-300 ease-out
            hover:scale-110 hover:border-red-500 hover:bg-black hover:text-red-600 hover:shadow-lg
            active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500
          "
        >
          <FiX className="h-7 w-7 stroke-[3.5]" />
        </button>

        <h2 className="text-2xl font-extrabold text-blue-800 mb-2">
          Welcome to {APP_NAME}
        </h2>
        <p className="text-sm text-gray-600">
          Do you already have an account ?
        </p>
        <p className="text-sm text-gray-600 mb-6">
          or would you like to create one?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onChooseLogin}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-pink-900 bg-green-200 text-black py-3 font-semibold hover:bg-blue-200 transition"
          >
            <FiLogIn className="w-4 h-4" />
            I already have an account — Login
          </button>

          <button
            onClick={onChooseRegister}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-yellow-200 text-blue-600 py-3 font-semibold hover:bg-indigo-200 transition"
          >
            <FiUserPlus className="w-4 h-4" />
            I&apos;m new here — Register Now
          </button>
        </div>
             <p className="text-sm py-3 text-gray-600">
          We Guarantee you the Best
        </p>
      </div>
    </div>
  );
}