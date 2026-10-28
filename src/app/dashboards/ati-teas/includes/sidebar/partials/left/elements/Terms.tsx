"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { Tooltip } from "@/components/dashboards/includes/sidebar/tooltips/SidebarTooltip";

interface Props {
  isOpened: boolean;
  hoveredItem: string | null;
  handleItemHover: (itemName: string, e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  tooltipPosition: { x: number; y: number };
  handleItemClick: () => void;
  side?: "left" | "right";
}

export default function TermsOfService({
  isOpened,
  hoveredItem,
  handleItemHover,
  handleMouseLeave,
  tooltipPosition,
  handleItemClick,
}: Props) {
  const { theme } = useThemeContext();

  const isLightSidebar =
    (theme.rightSidebar === "system" ? theme.global : theme.rightSidebar) === "light";

  return (
    <Link href="/dashboards/ati-teas/vista/pages/terms-of-service">
      <div
        onClick={handleItemClick}
        onMouseEnter={(e) => handleItemHover("Terms of Service", e)}
        onMouseLeave={handleMouseLeave}
        className={`relative flex items-center py-2 px-1 rounded-lg transition
    border-1 border-transparent hover:border-[var(--text-color)] select-none
    ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
    ${!isOpened && "justify-center"}`}
      >
        <FileText className="w-5 h-5" />
        {isOpened && <span className="ml-3">Terms of Service</span>}

        {!isOpened && hoveredItem === "Terms of Service" && (
          <Tooltip
            x={tooltipPosition.x}
            y={tooltipPosition.y}
            position="left"
          >
            Terms of Service
          </Tooltip>
        )}
      </div>
    </Link>
  );
}