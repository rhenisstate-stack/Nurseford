"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";
import { useDistinctStrataCourses } from "@/lib/hooks/nexus/strata/learning/courses/distinct/useDistinctStrataCourses";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const SEGMENT_DASHBOARD_MAP: Record<string, string> = {
  NCLEX_PN: 'nclex-pn',
  HESI_A2: 'hesi-a2',
  PRE_NURSING: 'pre-nursing',
  RN_NURSING: 'rn-nursing',
  LPN_NURSING: 'lpn-nursing',
  NCLEX_RN: 'nclex-rn',
  ATI_TEAS: 'ati-teas',
  CERTIFICATION: 'certification',
};

// Shared "learning" group + "subjects" child-strata slug used for the
// course -> subjects redirect. Mirrors BASE_CHILD_ROUTE in SubCategoriesPage.
const VISTA_STRATA_GROUP = "learning";
const VISTA_CHILD_STRATA = "subjects";

interface Props {
  isOpened: boolean;
  hoveredItem: string | null;
  handleItemHover: (itemName: string, e: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  tooltipPosition: { x: number; y: number };
  handleItemClick: () => void;
  side?: "left" | "right";
}

// ───────────────────────────────────────────────────────────────────────────
// Courses List (courses of the current program only)
// ───────────────────────────────────────────────────────────────────────────
interface ProgramCoursesListProps {
  parentIdentifier: string;
  dashboardSlug: string;
}

function ProgramCoursesList({
  parentIdentifier,
  dashboardSlug,
}: ProgramCoursesListProps) {
  const { filteredCourses } = useDistinctStrataCourses({
    parentIdentifier,
    page: 1,
    perPage: 50,
    sortColumn: null,
    sortDirection: "asc",
  });

  // Order ascending (1 at the top). Non-numeric or missing order goes to the bottom,
  // ties fall back to the name so the list is always stable.
  const sortedCourses = useMemo(() => {
    const orderOf = (value: unknown) => {
      const n = parseInt(String(value ?? "").trim(), 10);
      return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
    };

    return [...(filteredCourses ?? [])].sort(
      (a, b) =>
        orderOf(a.order) - orderOf(b.order) ||
        String(a.name ?? "").localeCompare(String(b.name ?? ""))
    );
  }, [filteredCourses]);

  const baseChildRoute = `/dashboards/${dashboardSlug}/vista/${VISTA_STRATA_GROUP}/${VISTA_CHILD_STRATA}`;

  if (sortedCourses.length === 0) {
    return (
      <div className="py-1 text-[11px] italic opacity-50 text-[var(--text-color)]">
        No Courses Yet
      </div>
    );
  }

  return (
    <div>
      {sortedCourses.map((course) => {
        const courseIdentifier = course.guidId ?? course.id;

        return (
          <Link
            key={courseIdentifier}
            href={`${baseChildRoute}/distinct/overview?identifier=${courseIdentifier}`}
            className="
              flex items-center gap-2 px-2 py-3 rounded-md
              text-sm font-semibold truncate
              text-[var(--text-color)] opacity-80
              hover:opacity-100 hover:bg-white/10
              transition
            "
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{course.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────────────────────
export default function VistaHierarchyProgramOutline({ isOpened }: Props) {
  const { programs } = useRelativeStrataPrograms();
  const pathname = usePathname();

  // Nothing to show when the sidebar is collapsed
  if (!isOpened) return null;

  // Current program = the one whose dashboard slug matches the current URL
  const currentProgram = programs.find((program) => {
    const slug = SEGMENT_DASHBOARD_MAP[program.segment ?? ""];
    if (!slug || !pathname) return false;

    const base = `/dashboards/${slug}`;
    return pathname === base || pathname.startsWith(`${base}/`);
  });

  if (!currentProgram) return null;

  const dashboardSlug = SEGMENT_DASHBOARD_MAP[currentProgram.segment ?? ""];

  return (
    <div className="relative mt-1 mb-2">
      <ProgramCoursesList
        parentIdentifier={currentProgram.guidId}
        dashboardSlug={dashboardSlug}
      />
    </div>
  );
}