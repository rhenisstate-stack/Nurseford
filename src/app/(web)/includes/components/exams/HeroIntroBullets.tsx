import {
  Award,
  BarChart3,
  BookOpen,
  Brain,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  Rocket,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
} from "lucide-react";
import BrandText from "../BrandText";

export const HERO_INTRO_ICONS = {
  award: Award,
  barChart3: BarChart3,
  bookOpen: BookOpen,
  brain: Brain,
  clipboardCheck: ClipboardCheck,
  clipboardList: ClipboardList,
  fileText: FileText,
  graduationCap: GraduationCap,
  rocket: Rocket,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  target: Target,
  trendingUp: TrendingUp,
} as const;

export type HeroIntroIconKey = keyof typeof HERO_INTRO_ICONS;

export interface HeroIntroBullet {
  icon: HeroIntroIconKey;
  label: string;
}

export default function HeroIntroBullets({
  bullets,
  iconClass = "bg-coral",
  maxWidth = "max-w-fit mx-auto",
}: {
  bullets: HeroIntroBullet[];
  iconClass?: string;
  maxWidth?: string;
}) {
  return (
    <ul className={`${maxWidth} mb-3 space-y-1.5 text-left`}>
      {bullets.map((bullet) => {
        const Icon = HERO_INTRO_ICONS[bullet.icon] ?? Sparkles;
        return (
          <li
            key={bullet.label}
            className="flex items-center gap-2.5 text-xs sm:text-[13px] md:text-sm text-black dark:text-white font-normal leading-normal whitespace-normal md:whitespace-nowrap"
          >
            <span
              className={`flex h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full text-[#0c1929] ${iconClass}`}
            >
              <Icon size={11} />
            </span>
            <span>
              <BrandText text={bullet.label} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
