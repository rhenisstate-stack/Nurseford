"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SidebarState } from "./LeftSidebarContext";

interface RightSidebarContextProps {
  state: SidebarState;
  isOpened: boolean;
  isCollapsed: boolean;
  isClosed: boolean;
  open: () => void;
  collapse: () => void;
  close: () => void;
  toggle: () => void;
}

const RightSidebarContext = createContext<RightSidebarContextProps | null>(null);

export const RightSidebarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<SidebarState>("collapsed");

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("rightSidebarState") as SidebarState;
    if (saved === "opened" || saved === "collapsed" || saved === "closed") {
      setState(saved);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem("rightSidebarState", state);
  }, [state]);

  const open = () => setState("opened");
  const collapse = () => setState("collapsed");
  const close = () => setState("closed");

  // 3-step toggle: opened → collapsed → closed → opened
  const toggle = () => {
    setState(prev => {
      if (prev === "opened") return "collapsed";
      if (prev === "collapsed") return "closed";
      return "opened"; // closed
    });
  };

  return (
    <RightSidebarContext.Provider
      value={{
        state,
        isOpened: state === "opened",
        isCollapsed: state === "collapsed",
        isClosed: state === "closed",
        open,
        collapse,
        close,
        toggle,
      }}
    >
      {children}
    </RightSidebarContext.Provider>
  );
};

export const useRightSidebar = () => {
  const context = useContext(RightSidebarContext);
  if (!context) throw new Error("useRightSidebar must be used inside RightSidebarProvider");
  return context;
};
