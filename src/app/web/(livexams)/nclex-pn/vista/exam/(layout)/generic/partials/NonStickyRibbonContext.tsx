"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// NON-STICKY RIBBON CONTEXT
// Controls visibility of NonStickyNavBar
// Session-only state (in-memory)
// Default = hidden
// ─────────────────────────────────────────────────────────────────────────────

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
    // default Hidden NonStickyNavbar Now Open
    const [isOpen, setIsOpen] = useState(true);

    const persist = (next: boolean) => {
        setIsOpen(next);
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