"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { Tooltip } from "@/components/dashboards/includes/sidebar/tooltips/SidebarTooltip";

interface Props {
  isOpened: boolean;
  hoveredItem: string | null;
  handleItemHover: (itemName: string, e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  tooltipPosition: { x: number; y: number };
  handleItemClick: () => void;
  side?: "left" | "right"; //  explicit, no context guessing
}

export default function About({
  isOpened,
  hoveredItem,
  handleItemHover,
  handleMouseLeave,
  tooltipPosition,
  handleItemClick,
}: Props) {
  const { theme } = useThemeContext();

  const isLightSidebar =
    (theme.leftSidebar === "system" ? theme.global : theme.leftSidebar) === "light";

  return (
    <Link href="/dashboards/ati-teas/vista/pages/about-us">
      <div
        onClick={handleItemClick}
        onMouseEnter={(e) => handleItemHover("About", e)}
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center py-2 px-1 rounded-lg transition
    border-1 border-transparent hover:border-[var(--text-color)] select-none
    ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
    ${!isOpened && "justify-center"}`}
      >
        <Info className="w-5 h-5" />
        {isOpened && <span className="ml-3">About Us</span>}

        {!isOpened && hoveredItem === "About" && (
          <Tooltip
            x={tooltipPosition.x}
            y={tooltipPosition.y}
          >
            About Us
          </Tooltip>
        )}
      </div>
    </Link>
  );
}
