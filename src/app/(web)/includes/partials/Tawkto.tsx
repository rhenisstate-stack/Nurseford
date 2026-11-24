'use client';

import { useEffect, useState } from 'react';
import { Headset, X } from 'lucide-react';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      toggle?: () => void;
      maximize?: () => void;
      minimize?: () => void;
      onLoad?: () => void;
      onChatMaximized?: () => void;
      onChatMinimized?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
  }
}

export default function Tawkto() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Hide Tawk's default bubble once loaded
    window.Tawk_API.onLoad = function () {
      try {
        window.Tawk_API?.hideWidget?.();
      } catch {}
    };

    // Ensure default widget is hidden even if onLoad fired early or attention grabber popped up
    const hideTimer = setInterval(() => {
      try {
        if (window.Tawk_API?.hideWidget) {
          window.Tawk_API.hideWidget();
        }
      } catch {}
    }, 400);

    const stopTimer = setTimeout(() => {
      clearInterval(hideTimer);
    }, 6000);

    window.Tawk_API.onChatMaximized = function () {
      setIsOpen(true);
    };

    window.Tawk_API.onChatMinimized = function () {
      setIsOpen(false);
      try {
        window.Tawk_API?.hideWidget?.();
      } catch {}
    };

    if (!document.getElementById('tawkto-script')) {
      const s1 = document.createElement('script');
      s1.id = 'tawkto-script';
      s1.async = true;
      s1.src = 'https://embed.tawk.to/68da4de8438b6919521c9f99/default';
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');
      document.body.appendChild(s1);
    }

    return () => {
      clearInterval(hideTimer);
      clearTimeout(stopTimer);
    };
  }, []);

  const handleToggle = () => {
    if (window.Tawk_API) {
      if (isOpen) {
        window.Tawk_API.minimize?.();
        setIsOpen(false);
      } else {
        window.Tawk_API.maximize?.();
        setIsOpen(true);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Clinical Support Chat"
      className="fixed bottom-6 right-6 z-50 group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-600 via-teal-700 to-sky-700 hover:from-teal-500 hover:to-sky-600 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-teal-300 active:scale-95 cursor-pointer"
    >
      {/* Active Pulse Status Beacon */}
      <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
      </span>

      {isOpen ? (
        <X className="h-6 w-6 stroke-[2.5] transition-transform duration-200 group-hover:rotate-90" />
      ) : (
        <Headset className="h-6 w-6 stroke-[2.2] transition-transform duration-200 group-hover:scale-110" />
      )}

      {/* Hover Tooltip */}
      <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 border border-slate-700">
        Clinical Support Chat
      </span>
    </button>
  );
}
