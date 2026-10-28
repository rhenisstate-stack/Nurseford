"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LOWER RIBBON CONTEXT
// Shared between UpperStickyNavBar (toggle button) and LowerStickyNavBar
// State is persisted in localStorage so it survives page reloads.
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "exam_lower_ribbon_open";

interface LowerRibbonCtx {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
}

const LowerRibbonContext = createContext<LowerRibbonCtx | null>(null);

export function LowerRibbonProvider({ children }: { children: ReactNode }) {
    // Default closed; hydrate from localStorage on mount
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored !== null) setIsOpen(stored === "true");
        } catch {
            // localStorage unavailable (SSR / private mode)
        }
    }, []);

    const persist = (next: boolean) => {
        setIsOpen(next);
        try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* noop */ }
    };

    return (
        <LowerRibbonContext.Provider
            value={{
                isOpen,
                toggle: () => persist(!isOpen),
                open:   () => persist(true),
                close:  () => persist(false),
            }}
        >
            {children}
        </LowerRibbonContext.Provider>
    );
}

export function useLowerRibbon() {
    const ctx = useContext(LowerRibbonContext);
    if (!ctx) throw new Error("useLowerRibbon must be used inside <LowerRibbonProvider>");
    return ctx;
}