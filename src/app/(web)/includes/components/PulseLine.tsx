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
    <div className={`w-full flex items-center justify-center ${className}`}>
      {/* Left ECG pulse trace */}
      <svg
        viewBox="0 0 360 80"
        preserveAspectRatio="none"
        className="flex-1 h-16 md:h-20 min-w-0"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pulseLeftGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="45%" stopColor="#e5573f" />
            <stop offset="100%" stopColor="#e5573f" />
          </linearGradient>
        </defs>
        <path
          d="M0 40 L110 40 L130 40 L145 18 L160 62 L175 5 L190 75 L205 25 L220 50 L230 40 L360 40"
          stroke="url(#pulseLeftGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Center Heart with RN / LPN Exit & Nursing Exams */}
      {showWaypoints && (
        <div className="relative shrink-0 w-[190px] h-[160px] sm:w-[220px] sm:h-[184px] flex items-center justify-center -mx-2">
          <svg
            viewBox="0 0 220 190"
            className="absolute inset-0 w-full h-full drop-shadow-sm"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="heartStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e5573f" />
                <stop offset="55%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#5ba8d9" />
              </linearGradient>
              <linearGradient id="heartFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e5573f" stopOpacity="0.16" />
                <stop offset="55%" stopColor="#ff6b35" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#5ba8d9" stopOpacity="0.18" />
              </linearGradient>
            </defs>
            <path
              d="M110 46 C110 24, 82 10, 56 14 C24 19, 10 49, 14 78 C20 116, 62 146, 110 176 C158 146, 200 116, 206 78 C210 49, 196 19, 164 14 C138 10, 110 24, 110 46 Z"
              fill="var(--content-bg, #ffffff)"
            />
            <path
              d="M110 46 C110 24, 82 10, 56 14 C24 19, 10 49, 14 78 C20 116, 62 146, 110 176 C158 146, 200 116, 206 78 C210 49, 196 19, 164 14 C138 10, 110 24, 110 46 Z"
              fill="url(#heartFillGrad)"
              stroke="url(#heartStrokeGrad)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 -mt-3 leading-tight">
            <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-coral mb-0.5">
              RN / LPN
            </span>
            <span className="font-serif text-xs sm:text-sm font-bold text-navy dark:text-white">
              Nursing &amp; Exit
            </span>
            <span className="font-serif text-xs sm:text-sm font-bold text-navy dark:text-white">
              Exams
            </span>
          </div>
        </div>
      )}

      {/* Right ECG pulse trace */}
      <svg
        viewBox="0 0 360 80"
        preserveAspectRatio="none"
        className="flex-1 h-16 md:h-20 min-w-0"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pulseRightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5ba8d9" />
            <stop offset="55%" stopColor="#5ba8d9" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M0 40 L130 40 L140 50 L155 25 L170 75 L185 5 L200 62 L215 18 L235 40 L250 40 L360 40"
          stroke="url(#pulseRightGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
