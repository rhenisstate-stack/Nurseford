"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// LOWER RIBBON CONTEXT
// Shared between UpperStickyNavBar (toggle button) and LowerStickyNavBar
// Session-only state (in-memory).
// ─────────────────────────────────────────────────────────────────────────────

interface LowerRibbonCtx {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
}

const LowerRibbonContext = createContext<LowerRibbonCtx | null>(null);

export function LowerRibbonProvider({ children }: { children: ReactNode }) {
    // Default closed
    const [isOpen, setIsOpen] = useState(false);

    const persist = (next: boolean) => {
        setIsOpen(next);
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