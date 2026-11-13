"use client";

import { useId, useMemo } from "react";
import { CheckCircle2, Target, TrendingUp } from "lucide-react";

const BARREL_X = 44;
const BARREL_Y = 30;
const BARREL_W = 208;
const BARREL_H = 34;

const SCALE_MARKERS = [
  { pct: 0, label: "0%", x: BARREL_X },
  { pct: 50, label: "50%", x: BARREL_X + BARREL_W * 0.5 },
  { pct: 100, label: "100%", x: BARREL_X + BARREL_W },
] as const;

// 21 graduation marks along the top edge of the syringe barrel (every 5%)
const BARREL_TICKS = Array.from({ length: 21 }, (_, i) => i * 5);

function getPerformanceStatus(score: number) {
  if (score < 40) {
    return {
      subtext: "Complete a practice test to fill your progress.",
      pillClass:
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
      liquidStart: "#FB7185",
      liquidEnd: "#E11D48",
    };
  }
  if (score < 70) {
    return {
      subtext: "Good foundation — keep practicing weak areas.",
      pillClass:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
      liquidStart: "#FBBF24",
      liquidEnd: "#D97706",
    };
  }
  if (score < 90) {
    return {
      subtext: "Keep up the great work toward readiness.",
      pillClass:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
      liquidStart: "#4ADE80",
      liquidEnd: "#16A34A",
    };
  }
  return {
    subtext: "Outstanding mastery across core topics.",
    pillClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    liquidStart: "#34D399",
    liquidEnd: "#059669",
  };
}

export interface PerformanceIndexGaugeProps {
  score?: number;
  className?: string;
}

export default function PerformanceIndexGauge({
  score = 0,
  className = "",
}: PerformanceIndexGaugeProps) {
  const uid = useId().replace(/:/g, "");
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const fillWidth = (clampedScore / 100) * BARREL_W;
  const status = useMemo(() => getPerformanceStatus(clampedScore), [clampedScore]);

  const barrelClipId = `syringe-barrel-${uid}`;
  const glassGradId = `syringe-glass-${uid}`;
  const liquidGradId = `syringe-liquid-${uid}`;
  const hubGradId = `syringe-hub-${uid}`;
  const needleGradId = `syringe-needle-${uid}`;

  return (
    <div
      className={`rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[var(--card-bg,#15273e)] px-4 py-2.5 flex flex-col justify-between items-center h-[180px] shadow-xs hover:shadow-md transition-all duration-200 ${className}`}
    >
      {/* Top Header */}
      <div className="w-full flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 shrink-0">
            <TrendingUp className="w-3 h-3" />
          </span>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            Performance Index
          </h2>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30 shrink-0">
          <Target className="w-2.5 h-2.5 shrink-0" />
          Target 100%
        </span>
      </div>

      {/* Syringe Progress SVG */}
      <div className="w-full flex justify-center items-center min-h-0">
        <svg
          viewBox="0 0 340 80"
          className="w-full max-w-[300px] overflow-visible"
          role="img"
          aria-label={`Performance index ${clampedScore} percent`}
        >
          <defs>
            <clipPath id={barrelClipId}>
              <rect
                x={BARREL_X}
                y={BARREL_Y}
                width={BARREL_W}
                height={BARREL_H}
                rx="5"
              />
            </clipPath>

            <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#F8FAFC" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id={liquidGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={status.liquidStart} />
              <stop offset="55%" stopColor={status.liquidEnd} />
              <stop offset="100%" stopColor={status.liquidStart} stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id={hubGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id={needleGradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Top 0% / 50% / 100% scale labels & dotted ticks */}
          {SCALE_MARKERS.map((m) => (
            <g key={m.label}>
              <text
                x={m.x}
                y="11"
                textAnchor="middle"
                className="fill-slate-600 dark:fill-slate-300 font-bold text-[10px]"
              >
                {m.label}
              </text>
              <line
                x1={m.x}
                y1="15"
                x2={m.x}
                y2="27"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeDasharray="2 2"
                className="text-slate-400 dark:text-slate-500"
              />
            </g>
          ))}

          {/* Left Plunger Thumb Flange + Stem */}
          <rect
            x="6"
            y="29"
            width="6"
            height="36"
            rx="3"
            className="fill-slate-300 dark:fill-slate-500 stroke-slate-400 dark:stroke-slate-400"
            strokeWidth="1"
          />
          <rect
            x="12"
            y="41"
            width="25"
            height="12"
            rx="2"
            className="fill-slate-200 dark:fill-slate-600 stroke-slate-400 dark:stroke-slate-500"
            strokeWidth="1"
          />
          {/* Left Barrel Grip Flange */}
          <rect
            x="37"
            y="24"
            width="7"
            height="46"
            rx="3.5"
            className="fill-slate-300 dark:fill-slate-500 stroke-slate-400 dark:stroke-slate-400"
            strokeWidth="1"
          />

          {/* Syringe Barrel Track */}
          <rect
            x={BARREL_X}
            y={BARREL_Y}
            width={BARREL_W}
            height={BARREL_H}
            rx="5"
            fill={`url(#${glassGradId})`}
            className="stroke-slate-300 dark:stroke-slate-500"
            strokeWidth="1.4"
          />

          {/* Liquid Fill & Stopper Clipped Inside Barrel */}
          <g clipPath={`url(#${barrelClipId})`}>
            {fillWidth > 0 && (
              <rect
                x={BARREL_X}
                y={BARREL_Y}
                width={fillWidth}
                height={BARREL_H}
                fill={`url(#${liquidGradId})`}
                className="transition-all duration-500 ease-out"
              />
            )}

            {/* Plunger Stopper Edge */}
            <rect
              x={BARREL_X + Math.max(0, fillWidth - 4)}
              y={BARREL_Y}
              width="5"
              height={BARREL_H}
              className="fill-slate-500/75 dark:fill-slate-400/80 transition-all duration-500 ease-out"
            />

            {/* Top Glass Specular Highlight */}
            <rect
              x={BARREL_X + 3}
              y={BARREL_Y + 3}
              width={BARREL_W - 6}
              height="7"
              rx="3.5"
              fill="#FFFFFF"
              opacity="0.45"
            />
          </g>

          {/* Graduation Tick Marks Inside Barrel */}
          {BARREL_TICKS.map((t) => {
            const x = BARREL_X + (t / 100) * BARREL_W;
            const isMajor = t % 25 === 0;
            return (
              <line
                key={t}
                x1={x}
                y1={BARREL_Y + 1}
                x2={x}
                y2={BARREL_Y + (isMajor ? 10 : 6)}
                stroke="currentColor"
                strokeWidth={isMajor ? 1.4 : 1}
                className="text-slate-600/65"
              />
            );
          })}

          {/* Centered Percentage Readout */}
          <text
            x={BARREL_X + BARREL_W / 2}
            y={BARREL_Y + BARREL_H / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`font-extrabold text-[15px] ${
              clampedScore >= 56
                ? "fill-white"
                : "fill-slate-800"
            }`}
          >
            {clampedScore}%
          </text>

          {/* Right Shoulder + Blue Luer Needle Hub + Needle */}
          <rect
            x={BARREL_X + BARREL_W}
            y="38"
            width="8"
            height="18"
            rx="1.5"
            className="fill-slate-300 dark:fill-slate-500 stroke-slate-400 dark:stroke-slate-400"
            strokeWidth="1"
          />
          <rect
            x={BARREL_X + BARREL_W + 8}
            y="36"
            width="5"
            height="22"
            rx="1.5"
            fill={`url(#${hubGradId})`}
          />
          <path
            d={`M ${BARREL_X + BARREL_W + 13} 39 L ${BARREL_X + BARREL_W + 34} 44 L ${BARREL_X + BARREL_W + 34} 50 L ${BARREL_X + BARREL_W + 13} 55 Z`}
            fill={`url(#${hubGradId})`}
          />
          <path
            d={`M ${BARREL_X + BARREL_W + 34} 45.8 L ${BARREL_X + BARREL_W + 78} 47 L ${BARREL_X + BARREL_W + 74} 48.2 L ${BARREL_X + BARREL_W + 34} 48.2 Z`}
            fill={`url(#${needleGradId})`}
          />
        </svg>
      </div>

      {/* Bottom Status Pill */}
      <div
        className={`w-full rounded-xl border px-2.5 py-1 flex items-center justify-center gap-1.5 text-[11px] shrink-0 ${status.pillClass}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium truncate">{status.subtext}</span>
      </div>
    </div>
  );
}
