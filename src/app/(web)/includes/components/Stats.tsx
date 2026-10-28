"use client";

const stats = [
  "31,000+ Active Users",
  "94% Pass Rate",
  "Flash Cards",
  "Free Study Notes",
];

export default function Stats() {
  const repeated = [...stats, ...stats, ...stats, ...stats];

  return (
    <section className="overflow-hidden py-6">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div
        className="flex w-fit"
        style={{
          animation: "marquee 20s linear infinite",
        }}
      >
        {repeated.map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-8 whitespace-nowrap"
          >
            <span className="text-coral text-2xl font-bold font-serif">
              {stat}
            </span>
            <span className="text-border">•</span>
          </div>
        ))}
      </div>
    </section>
  );
}
