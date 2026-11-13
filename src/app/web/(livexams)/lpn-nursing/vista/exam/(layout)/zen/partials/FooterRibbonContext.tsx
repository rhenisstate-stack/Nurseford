"use client";

import {
    createContext,
    useContext,
    useState,
    ReactNode,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER RIBBON CONTEXT
// Controls StickyFooter visibility
// Default = OPEN
// Session-only state (in-memory)
// ─────────────────────────────────────────────────────────────────────────────

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

    const persist = (next: boolean) => {
        setIsOpen(next);
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