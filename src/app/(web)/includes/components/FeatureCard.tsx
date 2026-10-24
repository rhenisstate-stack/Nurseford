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
    btn: "bg-gradient-to-r from-coral to-coral-hover",
  },
  purple: {
    bar: "bg-purple",
    badge: "border-purple/20 bg-purple/10 text-purple",
    text: "text-purple",
    btn: "bg-gradient-to-r from-purple to-purple-light",
  },
  green: {
    bar: "bg-green",
    badge: "border-green/20 bg-green/10 text-green",
    text: "text-green",
    btn: "bg-gradient-to-r from-green to-green-light",
  },
  blue: {
    bar: "bg-sage",
    badge: "border-sage/20 bg-sage/10 text-sage",
    text: "text-sage",
    btn: "bg-gradient-to-r from-sage to-sage-light",
  },
  teal: {
    bar: "bg-teal",
    badge: "border-teal/20 bg-teal/10 text-teal",
    text: "text-teal",
    btn: "bg-gradient-to-r from-teal to-teal-light",
  },
};

interface FeatureCardProps {
  icon?: LucideIcon;
  image?: string;
  eyebrow: string;
  title: string;
  description: string;
  tags?: string[];
  ctaLabel?: string;
  href?: string;
  accent: keyof typeof accent;
  children?: React.ReactNode;
}

export default function FeatureCard({
  icon: Icon,
  image,
  eyebrow,
  title,
  description,
  tags,
  ctaLabel,
  href,
  accent: accentKey,
  children,
}: FeatureCardProps) {
  const s = accent[accentKey];
  const hex = hexColor[accentKey];

  const body = (
    <>
      {Icon && (
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${s.badge} mb-4`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <span className={`inline-block font-mono text-xs tracking-widest uppercase mb-3 ${s.text}`}>
        {eyebrow}
      </span>
      <h3 className="font-serif text-xl font-semibold text-navy mb-3">
        {title}
      </h3>
      <p className="text-sm text-navy/60 leading-relaxed mb-6 flex-1">
        {description}
      </p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/80 dark:bg-paper-dim text-navy/60 border border-[#CBDCF8] dark:border-border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {ctaLabel && href && (
        <Link
          href={href}
          className={`inline-flex items-center justify-center px-7 py-3 rounded-full text-sm font-semibold text-[#0c1929] ${s.btn} transition-colors self-start`}
        >
          {ctaLabel}
        </Link>
      )}
      {children}
    </>
  );

  if (image) {
    return (
      <article className="relative rounded-2xl border border-black/50 dark:border-border bg-[#EEF3FE] dark:bg-paper overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
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
          <div className="absolute inset-0 z-[3] bg-gradient-to-r from-[#EEF3FE]/90 sm:from-[#EEF3FE] via-[#EEF3FE]/70 to-transparent dark:from-paper/80 dark:sm:from-paper dark:via-paper/60" />
        </div>
        <div className={`absolute left-0 top-0 bottom-0 w-1 z-10 ${s.bar}`} />
        <div className="relative z-10 p-7 md:p-8 md:max-w-[58%]">
          {body}
        </div>
      </article>
    );
  }

  return (
    <article className="relative rounded-2xl border border-black/50 dark:border-border bg-[#EEF3FE] dark:bg-paper p-7 md:p-8 flex flex-col overflow-hidden shadow-xs hover:shadow-md transition-all duration-200">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
      {body}
    </article>
  );
}
