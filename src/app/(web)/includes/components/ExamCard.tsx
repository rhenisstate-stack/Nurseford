import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const hexColor: Record<string, string> = {
  coral: "#ff6b35",
  purple: "#a78bfa",
  green: "#34d399",
  blue: "#5ba8d9",
  teal: "#2dd4bf",
};

const accent = {
  coral: {
    bar: "bg-coral",
    badge: "border-coral/20 bg-coral/10 text-coral",
    text: "text-coral",
    btn: "border border-[#ff6b35]/80 dark:border-[#ff6b35]/60 bg-[#ff6b35]/15 dark:bg-[#ff6b35]/20 hover:bg-[#ff6b35]/25 dark:hover:bg-[#ff6b35]/30 text-[#ea580c] dark:text-[#ff8a65] shadow-2xs active:scale-[0.98]",
  },
  purple: {
    bar: "bg-purple",
    badge: "border-purple/20 bg-purple/10 text-purple",
    text: "text-purple",
    btn: "border border-purple-500/80 dark:border-purple-400/60 bg-purple-500/15 dark:bg-purple-500/20 hover:bg-purple-500/25 dark:hover:bg-purple-500/30 text-purple-700 dark:text-purple-300 shadow-2xs active:scale-[0.98]",
  },
  green: {
    bar: "bg-green",
    badge: "border-green/20 bg-green/10 text-green",
    text: "text-green",
    btn: "border border-emerald-500/80 dark:border-emerald-400/60 bg-emerald-500/15 dark:bg-emerald-500/20 hover:bg-emerald-500/25 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-2xs active:scale-[0.98]",
  },
  blue: {
    bar: "bg-sage",
    badge: "border-sage/20 bg-sage/10 text-sage",
    text: "text-sage",
    btn: "border border-blue-500/80 dark:border-blue-400/60 bg-blue-500/15 dark:bg-blue-500/20 hover:bg-blue-500/25 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 shadow-2xs active:scale-[0.98]",
  },
  teal: {
    bar: "bg-teal",
    badge: "border-teal/20 bg-teal/10 text-teal",
    text: "text-teal",
    btn: "border border-[#2FD9C4]/80 dark:border-[#2FD9C4]/60 bg-[#2FD9C4]/15 dark:bg-[#2FD9C4]/20 hover:bg-[#2FD9C4]/25 dark:hover:bg-[#2FD9C4]/30 text-teal-800 dark:text-[#2FD9C4] shadow-2xs active:scale-[0.98]",
  },
};

interface Feature {
  icon: string;
  label: string;
  description: string;
}

interface ExamCardProps {
  icon?: LucideIcon;
  image?: string;
  eyebrow?: string;
  title: string;
  features: Feature[];
  ctaLabel: string;
  href: string;
  accent: keyof typeof accent;
}

export default function ExamCard({
  icon: Icon,
  image,
  eyebrow,
  title,
  features,
  ctaLabel,
  href,
  accent: accentKey,
}: ExamCardProps) {
  const s = accent[accentKey];
  const hex = hexColor[accentKey];

  const body = (
    <>
      {Icon && (
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${s.badge} mb-4`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      {eyebrow && (
        <span className={`inline-block font-mono text-xs tracking-widest uppercase mb-3 ${s.text}`}>
          {eyebrow}
        </span>
      )}
      <h3 className="font-serif text-xl font-semibold text-navy mb-5">
        {title}
      </h3>
      <ul className="space-y-4 mb-6 flex-1">
        {features.map((f) => (
          <li key={f.label} className="flex gap-3 text-sm leading-relaxed">
            <span className="shrink-0 text-base mt-0.5" aria-hidden="true">
              {f.icon}
            </span>
            <span className="text-navy/60">
              <span className="font-semibold text-navy">{f.label}</span>
              {" – "}
              {f.description}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold ${s.btn} transition-all duration-200 self-start`}
      >
        {ctaLabel}
      </Link>
    </>
  );

  if (image) {
    return (
      <article className="relative rounded-2xl border border-black/50 dark:border-border bg-paper overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 z-[1]"
            style={{
              backgroundImage: `radial-gradient(circle, ${hex} 0.75px, transparent 0.75px)`,
              backgroundSize: "20px 20px",
              opacity: 0.25,
              maskImage: "radial-gradient(ellipse 80% 60% at 80% 50%, black 20%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 80% 50%, black 20%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0 z-[2] opacity-60 sm:opacity-100 sm:[mask-image:linear-gradient(to_right,transparent_0%,black_45%)]"
          >
            <Image
              src={image}
              alt=""
              fill
              className="object-cover sm:object-[right_center]"
            />
          </div>
          <div className="absolute inset-0 z-[3] bg-gradient-to-r from-paper/80 sm:from-paper via-paper/60 to-transparent" />
        </div>
        <div className={`absolute left-0 top-0 bottom-0 w-1 z-10 ${s.bar}`} />
        <div className="relative z-10 p-7 md:p-8 md:max-w-[58%]">
          {body}
        </div>
      </article>
    );
  }

  return (
    <article className="relative rounded-2xl border border-black/50 dark:border-border bg-paper p-7 md:p-8 flex flex-col overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
      {body}
    </article>
  );
}
