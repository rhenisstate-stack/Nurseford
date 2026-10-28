"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// NON-STICKY RIBBON CONTEXT
// Controls visibility of NonStickyNavBar
// Persisted in localStorage
// Default = hidden
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "exam_nonsticky_ribbon_open";

interface NonStickyRibbonCtx {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
}

const NonStickyRibbonContext =
    createContext<NonStickyRibbonCtx | null>(null);

export function NonStickyRibbonProvider({
    children,
}: {
    children: ReactNode;
}) {
    // default hidden
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);

            if (stored !== null) {
                setIsOpen(stored === "true");
            }
        } catch {
            // noop
        }
    }, []);

    const persist = (next: boolean) => {
        setIsOpen(next);

        try {
            localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
            // noop
        }
    };

    return (
        <NonStickyRibbonContext.Provider
            value={{
                isOpen,
                toggle: () => persist(!isOpen),
                open: () => persist(true),
                close: () => persist(false),
            }}
        >
            {children}
        </NonStickyRibbonContext.Provider>
    );
}

export function useNonStickyRibbon() {
    const ctx = useContext(NonStickyRibbonContext);

    if (!ctx) {
        throw new Error(
            "useNonStickyRibbon must be used inside <NonStickyRibbonProvider>"
        );
    }

    return ctx;
}