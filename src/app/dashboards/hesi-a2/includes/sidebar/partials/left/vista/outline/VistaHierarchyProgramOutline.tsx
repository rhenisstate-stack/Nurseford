"use client";

import Link from "next/link";
import { FolderTree } from "lucide-react";
import { Tooltip } from "@/components/dashboards/includes/sidebar/tooltips/SidebarTooltip";
import { useThemeContext } from "@/lib/contexts/panel/layout/theme/PanelThemeContext";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";
import { usePathname } from "next/navigation";

const SEGMENT_ORDER = [
  "ATI_TEAS",
  "HESI_A2",
  "PRE_NURSING",
  "RN_NURSING",
  "LPN_NURSING",
  "GED",
  "CNA",
  "CERTIFICATION",
] as const;

const SEGMENT_DASHBOARD_MAP: Record<string, string> = {
  ATI_TEAS: "ati-teas",
  HESI_A2: "hesi-a2",
  PRE_NURSING: "pre-nursing",
  RN_NURSING: "rn-nursing",
  LPN_NURSING: "lpn-nursing",
  GED: "ged",
  CNA: "cna",
  CERTIFICATION: "certification",
};

// Segment that has a dedicated distinct-courses overview page wired up so far.
// Extend this map as more segments get their own overview page built.
const SEGMENT_DISTINCT_COURSES_ROUTE: Record<string, string> = {
  ATI_TEAS: "/dashboards/ati-teas/vista/learning/courses/distinct/overview",
};

interface Props {
  isOpened: boolean;
  hoveredItem: string | null;
  handleItemHover: (itemName: string, e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  tooltipPosition: { x: number; y: number };
  handleItemClick: () => void;
  side?: "left" | "right";
}

export default function VistaHierarchyProgramOutline({
  isOpened,
  hoveredItem,
  handleItemHover,
  handleMouseLeave,
  tooltipPosition,
  handleItemClick,
}: Props) {
  const { theme } = useThemeContext();
  const { programs } = useRelativeStrataPrograms();
  const pathname = usePathname();

  const isLightSidebar =
    (theme.leftSidebar === "system" ? theme.global : theme.leftSidebar) === "light";

  const visiblePrograms = SEGMENT_ORDER.flatMap((seg) =>
    programs.filter((program) => program.segment === seg)
  );

  // Split into "wired up" (has a dedicated distinct-courses route) vs "the rest"
  const wiredPrograms = visiblePrograms.filter(
    (program) => SEGMENT_DISTINCT_COURSES_ROUTE[program.segment ?? ""]
  );
  const otherPrograms = visiblePrograms.filter(
    (program) => !SEGMENT_DISTINCT_COURSES_ROUTE[program.segment ?? ""]
  );

  const renderProgramItem = (program: (typeof visiblePrograms)[number]) => {
    const segment = program.segment ?? "";
    const dashboardSlug = SEGMENT_DASHBOARD_MAP[segment];
    if (!dashboardSlug) return null;

    const distinctCoursesRoute = SEGMENT_DISTINCT_COURSES_ROUTE[segment];
    const href = distinctCoursesRoute
      ? `${distinctCoursesRoute}?identifier=${program.guidId}`
      : `/dashboards/${dashboardSlug}`;

    const hoverKey = `Program-${program.guidId}`;
    const isActive = pathname?.startsWith(`/dashboards/${dashboardSlug}`);

    return (
      <div key={program.guidId} className="relative">
        <Link href={href}>
          <div
            onClick={handleItemClick}
            onMouseEnter={(e) => handleItemHover(hoverKey, e)}
            onMouseLeave={handleMouseLeave}
            className={`flex items-center p-1 rounded-lg transition cursor-pointer
            border-1 select-none
            ${isActive
                ? "border-[var(--text-color)] bg-[var(--text-color)]/10 text-[var(--text-color)] font-medium"
                : `border-transparent hover:border-[var(--text-color)] ${isLightSidebar ? "text-[var(--text-color)]" : "text-[var(--text-color)]"}`}
            ${!isOpened ? "justify-center" : "justify-start"}`}
          >
            <FolderTree className="w-5 h-5 shrink-0" />
            {isOpened && <span className="ml-3 text-sm font-bold truncate">{program.name}</span>}
          </div>
        </Link>

        {!isOpened && hoveredItem === hoverKey && (
          <Tooltip x={tooltipPosition.x} y={tooltipPosition.y}>
            {program.name}
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className="relative space-y-1">
      {wiredPrograms.length > 0 && (
        <>
          {isOpened && (
            <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-50 text-[var(--text-color)]">
              You on this Active Program
            </div>
          )}
          {!isOpened && (
            <div className="mx-2 h-px bg-[var(--text-color)]/20" />
          )}
          {wiredPrograms.map(renderProgramItem)}
        </>
      )}

      {wiredPrograms.length > 0 && otherPrograms.length > 0 && (
        <div className="my-3 border-t border-[var(--text-color)]/20" />
      )}

      {otherPrograms.length > 0 && (
        <>
          {isOpened && (
            <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-50 text-[var(--text-color)]">
              Check out Other Programs ?
            </div>
          )}
          {otherPrograms.map(renderProgramItem)}
        </>
      )}
    </div>
  );
}