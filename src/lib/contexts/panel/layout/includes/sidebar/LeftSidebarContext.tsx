"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";

export type SidebarState = "opened" | "collapsed" | "closed";

interface LeftSidebarContextProps {
  state: SidebarState;
  isOpened: boolean;
  isCollapsed: boolean;
  isClosed: boolean;
  isMobile?: boolean;
  open: () => void;
  collapse: () => void;
  close: () => void;
  toggle: () => void;
}

const LeftSidebarContext = createContext<LeftSidebarContextProps | null>(null);

export const LeftSidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<SidebarState>("opened");
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  // Check if currently in mobile / phone mode (< 1024px)
  const checkIsMobile = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  }, []);

  // Sync state based on viewport width: phone mode defaults to CLOSED, computer mode defaults to OPENED
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");

    const syncStateForViewport = (isPhone: boolean) => {
      setIsMobile(isPhone);
      if (isPhone) {
        // PHONE MODE: Always closed by default
        setState("closed");
      } else {
        // COMPUTER MODE: Default is opened (respect user desktop preference if saved)
        const saved = localStorage.getItem("leftSidebarDesktopState") as SidebarState | null;
        setState(saved === "closed" ? "closed" : "opened");
      }
    };

    // Initial sync on mount
    syncStateForViewport(mq.matches);

    const handler = (e: MediaQueryListEvent) => {
      syncStateForViewport(e.matches);
    };

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // On mobile / phone mode: automatically close the sidebar upon navigating to a new route
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (checkIsMobile()) {
        setState("closed");
      }
    }
  }, [pathname, checkIsMobile]);

  const open = useCallback(() => {
    setState("opened");
    if (!checkIsMobile()) {
      try {
        localStorage.setItem("leftSidebarDesktopState", "opened");
      } catch {}
    }
  }, [checkIsMobile]);

  const collapse = useCallback(() => {
    setState("closed");
    if (!checkIsMobile()) {
      try {
        localStorage.setItem("leftSidebarDesktopState", "closed");
      } catch {}
    }
  }, [checkIsMobile]);

  const close = useCallback(() => {
    setState("closed");
    if (!checkIsMobile()) {
      try {
        localStorage.setItem("leftSidebarDesktopState", "closed");
      } catch {}
    }
  }, [checkIsMobile]);

  // 2-step toggle: opened ↔ closed
  const toggle = useCallback(() => {
    setState((prev) => {
      const next = prev === "opened" ? "closed" : "opened";
      if (!checkIsMobile()) {
        try {
          localStorage.setItem("leftSidebarDesktopState", next);
        } catch {}
      }
      return next;
    });
  }, [checkIsMobile]);

  return (
    <LeftSidebarContext.Provider
      value={{
        state,
        isOpened: state === "opened",
        isCollapsed: false,
        isClosed: state === "closed",
        isMobile,
        open,
        collapse,
        close,
        toggle,
      }}
    >
      {children}
    </LeftSidebarContext.Provider>
  );
};

export const useLeftSidebar = () => {
  const context = useContext(LeftSidebarContext);
  if (!context) throw new Error("useLeftSidebar must be used inside LeftSidebarProvider");
  return context;
};
