"use client";

import { useState } from "react";
import { X } from "lucide-react";
import DeveloperLoginForm from "@/components/auth/forms/DynamicLoginForm";
import DynamicRegisterForm from "@/components/auth/forms/DynamicRegisterForm";

type Mode = "login" | "register";

export default function ImpelUserLogin({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("login");

  if (!open) return null;

  const handleLoginSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">

      <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-6 relative animate-in fade-in zoom-in-95">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        {/* HEADER */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Authentication Required ⚓
          </h2>
          <p className="text-sm text-gray-600">
            Kindly continue your exam
          </p>
        </div>

        {/* FORMS */}
        <div className="transition-all duration-300">
          {mode === "login" && (
            <DeveloperLoginForm
              onSuccess={handleLoginSuccess}
            />
          )}

          {mode === "register" && (
            <DynamicRegisterForm
              onSuccess={() => {
                // after successful registration → go back to login
                setMode("login");
              }}
            />
          )}
        </div>

        {/* CONTEXTUAL TOGGLE + CLOSE */}
        <div className="flex justify-between items-center my-5 text-xs">

          {/* TOGGLE BUTTON */}
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => setMode("register")}
              className="px-4 py-1 border rounded transition bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Create Account ?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="px-4 py-1 border rounded transition bg-white text-indigo-600 hover:bg-indigo-50"
            >
              Back to Login ?
            </button>
          )}

          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border rounded text-gray-500 hover:text-red-600 hover:border-red-400 transition"
          >
            Cancel &amp; Close
          </button>

        </div>

      </div>
    </div>
  );
}