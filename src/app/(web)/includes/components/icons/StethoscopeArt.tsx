export default function StethoscopeArt({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 360"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Barrel */}
      <rect x="40" y="40" width="40" height="160" rx="4" />
      
      {/* Plunger rod */}
      <line x1="60" y1="200" x2="60" y2="310" />
      
      {/* Plunger thumb rest */}
      <rect x="45" y="305" width="30" height="12" rx="3" />
      <line x1="50" y1="311" x2="70" y2="311" />
      
      {/* Plunger rubber stopper */}
      <rect x="38" y="190" width="44" height="14" rx="3" />
      
      {/* Measurement marks */}
      <line x1="82" y1="60" x2="92" y2="60" />
      <line x1="82" y1="80" x2="92" y2="80" />
      <line x1="82" y1="100" x2="92" y2="100" />
      <line x1="82" y1="120" x2="92" y2="120" />
      <line x1="82" y1="140" x2="92" y2="140" />
      <line x1="82" y1="160" x2="92" y2="160" />
      <line x1="82" y1="180" x2="89" y2="180" />
      
      {/* Luer lock / needle hub */}
      <path d="M48 40c-4 0-8 4-8 8v4c0 4 4 8 8 8" />
      <path d="M72 40c4 0 8 4 8 8v4c0 4-4 8-8 8" />
      <line x1="48" y1="48" x2="48" y2="52" />
      <line x1="72" y1="48" x2="72" y2="52" />
      
      {/* Needle */}
      <line x1="60" y1="32" x2="60" y2="4" />
      
      {/* Needle bevel */}
      <path d="M60 4 l4 6 h-8 z" />
      
      {/* Liquid inside barrel */}
      <rect x="42" y="140" width="36" height="54" rx="2" opacity="0.15" />
    </svg>
  );
}
