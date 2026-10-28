"use client";

import Link from "next/link";
import {
    ClipboardList,
    Stethoscope,
    HeartPulse,
    GraduationCap,
    Award,
    BookOpen,
    Syringe,
    School,
    ArrowRight,
    Layers,
    LucideIcon,
} from "lucide-react";
import { useRelativeStrataPrograms } from "@/lib/hooks/nexus/strata/learning/programs/relative/useRelativeStrataPrograms";

// ─────────────────────────────────────────────────────────────────────────────
// Segment → presentation mapping (icons/colors aren't stored in the DB,
// so we key visual presentation off the known segment enum values)
// ─────────────────────────────────────────────────────────────────────────────
interface SegmentPresentation {
    icon: LucideIcon;
    accent: string; // gradient classes for the icon badge
    ring: string;   // hover ring color
}

const SEGMENT_PRESENTATION: Record<string, SegmentPresentation> = {
    ATI_TEAS: { icon: ClipboardList, accent: "from-indigo-500 to-indigo-700", ring: "hover:ring-indigo-400" },
    HESI_A2: { icon: Stethoscope, accent: "from-sky-500 to-sky-700", ring: "hover:ring-sky-400" },
    RN_NURSING: { icon: HeartPulse, accent: "from-rose-500 to-rose-700", ring: "hover:ring-rose-400" },
    LPN_NURSING: { icon: Syringe, accent: "from-emerald-500 to-emerald-700", ring: "hover:ring-emerald-400" },
    PRE_NURSING: { icon: School, accent: "from-amber-500 to-amber-700", ring: "hover:ring-amber-400" },
    CERTIFICATION: { icon: Award, accent: "from-purple-500 to-purple-700", ring: "hover:ring-purple-400" },
    GED: { icon: GraduationCap, accent: "from-teal-500 to-teal-700", ring: "hover:ring-teal-400" },
    CNA: { icon: BookOpen, accent: "from-orange-500 to-orange-700", ring: "hover:ring-orange-400" },
};

const DEFAULT_PRESENTATION: SegmentPresentation = {
    icon: Layers,
    accent: "from-slate-500 to-slate-700",
    ring: "hover:ring-slate-400",
};

const SEGMENT_DASHBOARD_MAP: Record<string, string> = {
    RN_NURSING: "rn-nursing",
    LPN_NURSING: "lpn-nursing",
};

const SEGMENT_ORDER = [
    "RN_NURSING",
    "LPN_NURSING",
] as const;

export default function EntrancePage() {
    const { programs, isLoading } = useRelativeStrataPrograms();

    // Only display RN and LPN nursing programs
    const filteredPrograms = programs.filter(
        (p) => p.segment === "RN_NURSING" || p.segment === "LPN_NURSING"
    );

    // Order programs to match the intended display order
    const orderedPrograms = [...filteredPrograms].sort((a, b) => {
        const aIndex = SEGMENT_ORDER.indexOf((a.segment ?? "") as (typeof SEGMENT_ORDER)[number]);
        const bIndex = SEGMENT_ORDER.indexOf((b.segment ?? "") as (typeof SEGMENT_ORDER)[number]);
        const aRank = aIndex === -1 ? SEGMENT_ORDER.length : aIndex;
        const bRank = bIndex === -1 ? SEGMENT_ORDER.length : bIndex;
        return aRank - bRank;
    });

    return (
        <div className="min-h-screen px-4 py-12 sm:px-8" style={{ backgroundColor: "var(--content-bg)" }}>
            <div className="mx-auto max-w-7xl">
                <div className="mb-10 text-center">
                    <h1 className="font-serif text-3xl font-semibold text-navy sm:text-4xl tracking-tight">
                        Where would you like to start?
                    </h1>
                    <p className="mt-3 text-navy/60">
                        Pick a track below to jump into practice exams, study resources, and progress tracking built for that path.
                    </p>
                </div>

                {isLoading && (
                    <p className="text-center text-navy/50">Loading Programs…</p>
                )}

                {!isLoading && orderedPrograms.length === 0 && (
                    <p className="text-center text-navy/50">No Programs Found ⚓</p>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {orderedPrograms.map((program) => {
                        const segment = program.segment ?? "";
                        const presentation = SEGMENT_PRESENTATION[segment] ?? DEFAULT_PRESENTATION;
                        const Icon = presentation.icon;

                        const dashboardSlug = SEGMENT_DASHBOARD_MAP[segment];
                        if (!dashboardSlug) return null;

                        const accessHref = `/dashboards/${dashboardSlug}`;
                        const subscriptionsHref = `/pages/subscription/items?parentTableName=program&parentName=${encodeURIComponent(
                            program.name
                        )}`;

                        return (
                            <div
                                key={program.guidId}
                                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-black/50 dark:border-border bg-paper p-6 shadow-sm ring-2 ring-transparent transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${presentation.ring}`}
                            >
                                {/* Featured badge */}
                                {program.isFeatured && (
                                    <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-coral px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0c1929] shadow">
                                        ⭐ Featured
                                    </div>
                                )}

                                <div>
                                    {/* Icon + Name on the same row */}
                                    <div className="mb-3 flex items-center gap-3 pr-16">
                                        <div
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${presentation.accent} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            <Icon size={24} />
                                        </div>
                                        <h2 className="font-serif text-lg font-semibold leading-snug text-navy">
                                            {program.name}
                                        </h2>
                                    </div>

                                    {/* Description */}
                                    {program.description && (
                                        <p className="mt-1 text-sm leading-relaxed text-navy/60">
                                            {program.description}
                                        </p>
                                    )}

                                    {/* Meta row — courses count + level, if present */}
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        {typeof program.coursesCount === "number" && (
                                            <span className="rounded-full bg-paper-dim px-2.5 py-1 text-xs font-semibold text-navy/60">
                                                {program.coursesCount} Course{program.coursesCount !== 1 ? "s" : ""}
                                            </span>
                                        )}
                                        {program.level && (
                                            <span className="rounded-full bg-paper-dim px-2.5 py-1 text-xs font-semibold text-navy/60">
                                                {program.level}
                                            </span>
                                        )}
                                        {program.difficulty && (
                                            <span className="rounded-full bg-paper-dim px-2.5 py-1 text-xs font-semibold text-navy/60">
                                                {program.difficulty}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action row — two buttons side by side */}
                                <div className="mt-6 grid grid-cols-2 gap-2">
                                    <Link
                                        href={subscriptionsHref}
                                        className="flex items-center justify-center rounded-lg border border-border-light px-3 py-2 text-xs font-semibold text-navy transition-colors hover:bg-paper-dim"
                                    >
                                        View Subscriptions
                                    </Link>

                                    <Link
                                        href={accessHref}
                                        className={`flex items-center justify-center gap-1 rounded-lg bg-gradient-to-br ${presentation.accent} px-3 py-2 text-xs font-semibold text-white shadow transition-transform duration-300 hover:opacity-90`}
                                    >
                                        Access Exams Now
                                        <ArrowRight
                                            size={14}
                                            className="transition-transform duration-300 group-hover:translate-x-1"
                                        />
                                    </Link>
                                </div>

                                {/* Decorative corner glow on hover */}
                                <div
                                    className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${presentation.accent} opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End By : B.L.S.M.C ;  Skewblanc - The Winds Chase Us ⚓
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────