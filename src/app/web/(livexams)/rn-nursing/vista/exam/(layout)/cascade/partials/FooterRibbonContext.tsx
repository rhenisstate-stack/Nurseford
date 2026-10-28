"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER RIBBON CONTEXT
// Controls StickyFooter visibility
// Default = OPEN
// Persisted in localStorage
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "exam_footer_ribbon_open";

interface FooterRibbonCtx {
    isOpen: boolean;
    toggle: () => void;
    open: () => void;
    close: () => void;
}

const FooterRibbonContext =
    createContext<FooterRibbonCtx | null>(null);

export function FooterRibbonProvider({
    children,
}: {
    children: ReactNode;
}) {

    // DEFAULT OPEN
    const [isOpen, setIsOpen] = useState(true);

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
        <FooterRibbonContext.Provider
            value={{
                isOpen,
                toggle: () => persist(!isOpen),
                open: () => persist(true),
                close: () => persist(false),
            }}
        >
            {children}
        </FooterRibbonContext.Provider>
    );
}

export function useFooterRibbon() {
    const ctx = useContext(FooterRibbonContext);

    if (!ctx) {
        throw new Error(
            "useFooterRibbon must be used inside <FooterRibbonProvider>"
        );
    }

    return ctx;
}