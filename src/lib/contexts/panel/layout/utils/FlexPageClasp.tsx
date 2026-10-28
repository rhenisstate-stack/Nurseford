"use client";

import { useEffect, useState } from "react";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { useLeftSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/LeftSidebarContext";
import { useRightSidebar } from "@/lib/contexts/panel/layout/includes/sidebar/RightSidebarContext";

type SidebarState = {
  isOpened: boolean;
  isCollapsed: boolean;
  isClosed: boolean;
};

export function useFlexPageClasp() {
  const { theme } = useThemeContext();
  const leftSidebar = useLeftSidebar();
  const rightSidebar = useRightSidebar();

  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* --------------------------------------------
   Theme Resolution
  --------------------------------------------- */
  const effectiveContentTheme =
    theme.content === "system" ? theme.global : theme.content;

  const isLightContent = effectiveContentTheme === "light";

  /* --------------------------------------------
   Sidebar Width Calculation
  --------------------------------------------- */
  const effectiveMobile = isMobile || leftSidebar.isMobile;

  const getSidebarWidth = (sidebar: SidebarState) => {
    if (!isClient) return 0;
    // On mobile / phone mode, sidebars are overlay drawers and must never push or collapse content
    if (effectiveMobile) return 0;
    if (sidebar.isClosed) return 0;
    if (sidebar.isOpened) return 256;
    return 0;
  };

  const leftWidth = getSidebarWidth(leftSidebar);
  const rightWidth = getSidebarWidth(rightSidebar);

  /* --------------------------------------------
   Layout Metrics
  --------------------------------------------- */
  const navHeight = 64;

  return {
    isClient,
    isMobile: effectiveMobile,
    isLightContent,
    effectiveContentTheme,

    leftWidth,
    rightWidth,
    navHeight,
  };
}
