interface PulseLineProps {
  className?: string;
  showWaypoints?: boolean;
  variant?: "hero" | "divider";
}

export default function PulseLine({
  className = "",
  showWaypoints = false,
  variant = "hero",
}: PulseLineProps) {
  const waypoints = [
    { label: "TEAS 7/HESI A2", x: 90, y: -18 },
    { label: "RN/LPN Exams", x: 430, y: -18 },
    { label: "NCLEX RN/LPN", x: 840, y: -18 },
  ];

  if (variant === "divider") {
    return (
      <div className={`w-full overflow-hidden ${className}`} aria-hidden="true">
        <svg
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          className="w-full h-8 md:h-10"
          fill="none"
        >
          <path
            d="M0 20 L180 20 L200 20 L210 8 L225 32 L240 4 L255 36 L270 12 L280 20 L500 20 L520 20 L530 8 L545 32 L560 4 L575 36 L590 12 L600 20 L820 20 L840 20 L850 8 L865 32 L880 4 L895 36 L910 12 L920 20 L1200 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-border-light"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1000 80"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-20 md:h-28"
        fill="none"
      >
        <path
          d="M0 40 L160 40 L180 40 L195 18 L210 62 L225 5 L240 75 L255 25 L270 50 L280 40 L420 40 L440 40 L580 40 L595 18 L610 62 L625 5 L640 75 L655 25 L670 50 L680 40 L1000 40"
          stroke="url(#pulseGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="25%" stopColor="#e5573f" />
            <stop offset="50%" stopColor="#e5573f" />
            <stop offset="75%" stopColor="#5ba8d9" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {showWaypoints &&
          waypoints.map((wp) => (
            <g key={wp.label}>
              <circle cx={wp.x} cy={40} r="5" fill="#e5573f" />
              <circle cx={wp.x} cy={40} r="9" fill="#e5573f" opacity="0.2" />
              <text
                x={wp.x}
                y={40 + wp.y}
                textAnchor="middle"
                className="fill-navy"
                fontSize="13"
                fontWeight="600"
                fontFamily="var(--font-mono), monospace"
              >
                {wp.label}
              </text>
            </g>
          ))}
      </svg>
    </div>
  );
}
