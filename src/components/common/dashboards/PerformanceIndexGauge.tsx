"use client";

import { useMemo } from "react";

const CX = 150;
const CY = 130;
const R = 92;
const ARC_WIDTH = 28;

const ZONES = [
  { from: 0, to: 25, color: "#EF4444" },
  { from: 25, to: 50, color: "#F97316" },
  { from: 50, to: 75, color: "#FACC15" },
  { from: 75, to: 100, color: "#22C55E" },
] as const;

const LABELS = [
  { text: "0%", x: 26, y: CY, anchor: "middle" },
  { text: "25%", x: 64, y: 44, anchor: "middle" },
  { text: "50%", x: CX, y: 10, anchor: "middle" },
  { text: "75%", x: 236, y: 44, anchor: "middle" },
  { text: "100%", x: 274, y: CY, anchor: "middle" },
] as const;

// 21 radial ticks inside the arc (every 5% from 0 to 100)
const TICKS = Array.from({ length: 21 }, (_, i) => i * 5);

function pctToAngle(pct: number) {
  return 180 - pct * 1.8;
}

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY - r * Math.sin(rad) };
}

function arcPath(fromPct: number, toPct: number) {
  const a1 = pctToAngle(fromPct);
  const a2 = pctToAngle(toPct);
  const p1 = polar(R, a1);
  const p2 = polar(R, a2);
  const span = Math.abs(a1 - a2);
  const largeArc = span > 180 ? 1 : 0;
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

function getPerformanceFeedback(score: number) {
  if (score < 40) {
    return "Performance Low! 'You're at the starting line — practice more to level up.'";
  }
  if (score < 70) {
    return "Performance Average! 'Good foundation — keep practicing to reach higher tiers.'";
  }
  if (score < 90) {
    return "Performance Good! 'Great progress — you're well on your way to mastery.'";
  }
  return "Performance Excellent! 'Outstanding mastery — you're fully prepared to pass!'";
}

export interface PerformanceIndexGaugeProps {
  score?: number;
  className?: string;
}

export default function PerformanceIndexGauge({
  score = 0,
  className = "",
}: PerformanceIndexGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  // 0% -> -90 deg (points left), 50% -> 0 deg (points up), 100% -> 90 deg (points right)
  const needleRotation = (clampedScore - 50) * 1.8;

  const feedbackText = useMemo(() => getPerformanceFeedback(clampedScore), [clampedScore]);

  return (
    <div
      className={`rounded-2xl border border-[#CBDCF8] dark:border-white/10 bg-[#EEF3FE] dark:bg-[var(--card-bg,#15273e)] px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col justify-between items-center text-center h-full lg:h-[190px] shadow-xs hover:shadow-md transition-all duration-200 ${className}`}
    >
      {/* Title */}
      <h2 className="text-sm md:text-base font-bold text-[var(--text-color)] whitespace-nowrap">
        Performance Index!
      </h2>

      {/* Subtitle / Feedback Message (Single line) */}
      <p
        className="text-[11px] sm:text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] text-center whitespace-nowrap truncate w-full px-2"
        title={feedbackText}
      >
        {feedbackText}
      </p>

      {/* Speedometer Gauge SVG */}
      <div className="w-full flex justify-center items-center my-0.5">
        <svg
          viewBox="0 0 300 150"
          className="w-full max-w-[195px] sm:max-w-[210px] overflow-visible"
          role="img"
          aria-label={`Performance index ${clampedScore} percent`}
        >
          {/* Semicircular colored zones */}
          {ZONES.map((zone) => (
            <path
              key={zone.color}
              d={arcPath(zone.from, zone.to)}
              fill="none"
              stroke={zone.color}
              strokeWidth={ARC_WIDTH}
              strokeLinecap="butt"
            />
          ))}

          {/* Radial tick marks inside the arc */}
          {TICKS.map((t) => {
            const angle = pctToAngle(t);
            const pInner = polar(65, angle);
            const pOuter = polar(74, angle);
            return (
              <line
                key={t}
                x1={pInner.x.toFixed(2)}
                y1={pInner.y.toFixed(2)}
                x2={pOuter.x.toFixed(2)}
                y2={pOuter.y.toFixed(2)}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-slate-400 dark:text-slate-400 opacity-60"
              />
            );
          })}

          {/* Percentage labels around the arc */}
          {LABELS.map((lbl) => (
            <text
              key={lbl.text}
              x={lbl.x}
              y={lbl.y}
              textAnchor={lbl.anchor}
              dominantBaseline="middle"
              className="fill-slate-600 dark:fill-slate-300 font-bold text-[11px]"
            >
              {lbl.text}
            </text>
          ))}

          {/* Needle */}
          <g transform={`rotate(${needleRotation} ${CX} ${CY})`}>
            <polygon
              points={`${CX},${CY - 70} ${CX - 3.5},${CY + 3} ${CX + 3.5},${CY + 3}`}
              className="fill-slate-900 dark:fill-white"
            />
          </g>

          {/* Pivot hub */}
          <circle cx={CX} cy={CY} r="6" className="fill-slate-900 dark:fill-white" />
          <circle cx={CX} cy={CY} r="2.5" className="fill-slate-300 dark:fill-slate-800" />

          {/* Big Score percentage in center of arc */}
          <text
            x={CX}
            y={CY - 34}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-slate-900 dark:fill-white font-extrabold text-[26px]"
          >
            {clampedScore}%
          </text>
        </svg>
      </div>

      
      {/* <p className="text-xs sm:text-sm font-semibold text-[var(--text-color)] opacity-80 text-center">
        Score : {score > 0 ? `${clampedScore}%` : ""}
      </p> */}
    </div>
  );
}
