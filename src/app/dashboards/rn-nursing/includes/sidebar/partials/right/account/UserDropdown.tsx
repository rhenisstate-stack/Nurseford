"use client";

import Link from "next/link";
import { Users, ChevronDown, ChevronRight } from "lucide-react";
import { Tooltip } from "@/components/dashboards/includes/sidebar/tooltips/SidebarTooltip";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";

interface Props {
  isOpened: boolean;
  activeDropdown: string | null;
  toggleDropdown: (dropdown: string) => void;
  hoveredItem: string | null;
  handleItemHover: (itemName: string, e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  tooltipPosition: { x: number; y: number };
  handleItemClick: () => void;
}

export default function UserDropdown({
  isOpened,
  activeDropdown,
  toggleDropdown,
  hoveredItem,
  handleItemHover,
  handleMouseLeave,
  tooltipPosition,
  handleItemClick,
}: Props) {
  const { theme } = useThemeContext();

  const isLightSidebar =
    (theme.rightSidebar === "system" ? theme.global : theme.rightSidebar) === "light";

  const dropdownKey = "users";
  const isActive = activeDropdown === dropdownKey;

  return (
    <div className="relative">
      {/* Header */}
      <div
        target-scroll-item-accordion-key={dropdownKey}   // USED TO AUTO SCROLL WHEN ACTIVE BY src\lib\hooks\dashboards\includes\sidebars\useSidebarAutoScroll.ts
        onClick={() => toggleDropdown(dropdownKey)}
        onMouseEnter={(e) => handleItemHover("Users", e)}
        onMouseLeave={handleMouseLeave}
        className={`flex items-center py-2 px-1 rounded-lg transition cursor-pointer
        border-1 border-transparent hover:border-[var(--text-color)] select-none
        ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}
        ${!isOpened ? "justify-center" : "justify-between"}`}
      >
        <div className="flex items-center">
          <Users className="w-5 h-5" />
          {isOpened && <span className="ml-3">Users</span>}
        </div>

        {isOpened &&
          (isActive ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          ))}
      </div>

      {/* Tooltip (collapsed only) */}
      {!isOpened && hoveredItem === "Users" && (
        <Tooltip x={tooltipPosition.x} y={tooltipPosition.y} position="left">
          Users
        </Tooltip>
      )}

      {/* Dropdown items */}
      {isOpened && isActive && (
        <div className="ml-8 mt-1 space-y-1">
          <Link href="/dashboards/admin/users">
            <div
              onClick={handleItemClick}
              className={`p-2 text-sm rounded-lg transition flex items-center gap-2 select-none
                  border-1 border-transparent hover:border-solid hover:border-[var(--text-color)]
                  ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}`}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--text-color)]" />
              <span>Registered Users</span>
            </div>
          </Link>

          <Link href="/dashboards/admin/users/create">
            <div
              onClick={handleItemClick}
              className={`p-2 text-sm rounded-lg transition flex items-center gap-2 select-none
                  border-1 border-transparent hover:border-solid hover:border-[var(--text-color)]
                  ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}`}
            >
              <span className="w-2 h-2 rounded-full bg-[var(--text-color)]" />
              <span>Add New User</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
