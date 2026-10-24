// SkewLine\castoline\next.config.ts

import type { NextConfig } from "next";
import path from "path";

const CLIENT_ENV_KEYS: string[] = [
  "SKEW_LINE_APP_NAME",
  "SKEW_LINE_APP_TITLE",
  "SKEW_LINE_APP_ACRONNYM",
  "SKEW_LINE_APP_DESCRIPTION",
  "SKEW_LINE_APP_VERSION",
  "SKEW_LINE_APP_ENV",
  "SKEW_LINE_APP_DEBUG",
  "SKEW_LINE_APP_TIMEZONE",
  "SKEW_LINE_APP_LOCALE",
  "SKEW_LINE_APP_DOMAIN",
  "SKEW_LINE_APP_AREA",
  "SKEW_LINE_APP_ADDRESS",
  "SKEW_LINE_APP_TELLUNO",
  "SKEW_LINE_APP_PHONEUNO",
  "SKEW_LINE_APP_TELTOS",
  "SKEW_LINE_APP_PHONETOS",
  "SKEW_LINE_APP_EMAILUNO",
  "SKEW_LINE_APP_EMAILTOS",
  "SKEW_LINE_APP_WHATSAPP",
  "SKEW_LINE_APP_INSTAGRAM",
  "SKEW_LINE_APP_FACEBOOK",
  "SKEW_LINE_APP_TWITTER",
  "SKEW_LINE_APP_LINKEDIN",
  "SKEW_LINE_APP_TELEGRAM",
  "SKEW_LINE_APP_TIKTOK",
  "SKEW_LINE_APP_REDDIT",
  "SKEW_LINE_APP_YOUTUBE",
  "SKEW_LINE_APP_PINTEREST",
  "SKEW_LINE_APP_WECHAT",
  "SKEW_LINE_APP_DISCORD",
  "SKEW_LINE_APP_GITHUB",
  "SKEW_LINE_APP_MEDIUM",
  "SKEW_LINE_APP_SNAPCHAT",
  "SKEW_LINE_APP_SLACK",
  "SKEW_LINE_APP_CANONICALLINK",
  "SKEW_LINE_APP_DEVELOPER",
  "SKEW_LINE_APP_DEVLINK",
  "SKEW_LINE_APP_SENDWHATSAPP",
  "SKEW_LINE_SUPPORT_EMAIL",
  "SKEW_LINE_SYSTEM_EMAIL",
  "SKEW_LINE_HELP_EMAIL",
  "SKEW_LINE_TELL_PHONE",
  "SKEW_LINE_SUPPORT_PHONE",
  "SKEW_LINE_HELP_PHONE",
  "SKEW_LINE_DEVELOPER_NAME",
  "SKEW_LINE_DEVELOPER_PHONE",
  "SKEW_LINE_DEVELOPER_EMAIL",
  "SKEW_LINE_DEVELOPER_WEBSITE",
  "SKEW_LINE_DEVELOPER_GITHUB",
  "SKEW_LINE_API_BASE_URL",
  "SKEW_LINE_ACTIVE_BACKEND",
  "SKEW_LINE_APP_KEY",
  "SKEW_LINE_LARAVEL_BASE_URL",
  "SKEW_LINE_FASTAPI_BASE_URL",
  "SKEW_LINE_DOTNET_BASE_URL",
  "SKEW_LINE_GOOGLE_CLIENT_ID",
  "SKEW_LINE_NCLEX_RN_URL",
  "SKEW_LINE_NCLEX_PN_URL",
];

const define: Record<string, string> = {};
for (const key of CLIENT_ENV_KEYS) {
  const value = process.env[key];
  if (value != null) {
    define[`process.env.${key}`] = value;
  }
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compiler: {
    define,
  },
  async redirects() {
    return [
      {
        source: "/register",
        destination: "/auth/register",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/Nclex-Rn/Panel/Special/Hybrid/Exams/Domains/:id/view",
        destination: "/dashboards/nclex-rn/practice/domains/:id",
      },
      {
        source: "/nclex-rn/panel/special/hybrid/exams/domains/:id/view",
        destination: "/dashboards/nclex-rn/practice/domains/:id",
      },
      {
        source: "/Nclex-Rn/Panel/Special/Hybrid/Examinations/:id/view",
        destination: "/dashboards/nclex-rn/practice/examinations/:id",
      },
      {
        source: "/nclex-rn/panel/special/hybrid/examinations/:id/view",
        destination: "/dashboards/nclex-rn/practice/examinations/:id",
      },
      {
        source: "/Nclex-Pn/Panel/Special/Hybrid/Exams/Domains/:id/view",
        destination: "/dashboards/nclex-pn/practice/domains/:id",
      },
      {
        source: "/nclex-pn/panel/special/hybrid/exams/domains/:id/view",
        destination: "/dashboards/nclex-pn/practice/domains/:id",
      },
      {
        source: "/Nclex-Pn/Panel/Special/Hybrid/Examinations/:id/view",
        destination: "/dashboards/nclex-pn/practice/examinations/:id",
      },
      {
        source: "/nclex-pn/panel/special/hybrid/examinations/:id/view",
        destination: "/dashboards/nclex-pn/practice/examinations/:id",
      },
      // HESI A2 - exact legacy domain mappings to .NET courses
      {
        source: "/hesi-a2/exams/special-hybrid-domains/17",
        destination: "/dashboards/hesi-a2/exams/reading-comprehension/16",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/17/view",
        destination: "/dashboards/hesi-a2/exams/reading-comprehension/16",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/18",
        destination: "/dashboards/hesi-a2/exams/biology/17",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/18/view",
        destination: "/dashboards/hesi-a2/exams/biology/17",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/19",
        destination: "/dashboards/hesi-a2/exams/math/18",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/19/view",
        destination: "/dashboards/hesi-a2/exams/math/18",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/20",
        destination: "/dashboards/hesi-a2/exams/grammar/19",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/20/view",
        destination: "/dashboards/hesi-a2/exams/grammar/19",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/21",
        destination: "/dashboards/hesi-a2/exams/vocabularies/20",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/21/view",
        destination: "/dashboards/hesi-a2/exams/vocabularies/20",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/22",
        destination: "/dashboards/hesi-a2/exams/comprehensive-hesi-a2-exams/21",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/22/view",
        destination: "/dashboards/hesi-a2/exams/comprehensive-hesi-a2-exams/21",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/33",
        destination: "/dashboards/hesi-a2/exams/anatomy-physiology/22",
      },
      {
        source: "/hesi-a2/exams/special-hybrid-domains/33/view",
        destination: "/dashboards/hesi-a2/exams/anatomy-physiology/22",
      },
      // HESI A2 - legacy special-hybrid subject routes (e.g. 73 = Math 2023, 79 = Grammar 2023)
      {
        source: "/hesi-a2/exams/special-hybrid/73",
        destination: "/dashboards/hesi-a2/exams/math/18/exams/31?subjectName=MATH%202023",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/73/view",
        destination: "/dashboards/hesi-a2/exams/math/18/exams/31?subjectName=MATH%202023",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/74",
        destination: "/dashboards/hesi-a2/exams/math/18/exams/32?subjectName=MATH%202024",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/74/view",
        destination: "/dashboards/hesi-a2/exams/math/18/exams/32?subjectName=MATH%202024",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/75",
        destination: "/dashboards/hesi-a2/exams/math/18/exams/33?subjectName=MATH%202025",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/75/view",
        destination: "/dashboards/hesi-a2/exams/math/18/exams/33?subjectName=MATH%202025",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/76",
        destination: "/dashboards/hesi-a2/exams/math/18/exams/48?subjectName=MATH%202026",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/76/view",
        destination: "/dashboards/hesi-a2/exams/math/18/exams/48?subjectName=MATH%202026",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/77",
        destination: "/dashboards/hesi-a2/exams/grammar/19/exams/36?subjectName=GRAMMAR%202025",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/77/view",
        destination: "/dashboards/hesi-a2/exams/grammar/19/exams/36?subjectName=GRAMMAR%202025",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/78",
        destination: "/dashboards/hesi-a2/exams/grammar/19/exams/35?subjectName=GRAMMAR%202024",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/78/view",
        destination: "/dashboards/hesi-a2/exams/grammar/19/exams/35?subjectName=GRAMMAR%202024",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/79",
        destination: "/dashboards/hesi-a2/exams/grammar/19/exams/34?subjectName=GRAMMAR%202023",
      },
      {
        source: "/hesi-a2/exams/special-hybrid/79/view",
        destination: "/dashboards/hesi-a2/exams/grammar/19/exams/34?subjectName=GRAMMAR%202023",
      },
      // ATI TEAS - exact legacy domain mappings to .NET courses
      {
        source: "/ati-teas/exams/special-hybrid-domains/8",
        destination: "/dashboards/ati-teas/exams/science/5",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/8/view",
        destination: "/dashboards/ati-teas/exams/science/5",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/10",
        destination: "/dashboards/ati-teas/exams/reading-comprehension/6",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/10/view",
        destination: "/dashboards/ati-teas/exams/reading-comprehension/6",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/11",
        destination: "/dashboards/ati-teas/exams/math/7",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/11/view",
        destination: "/dashboards/ati-teas/exams/math/7",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/12",
        destination: "/dashboards/ati-teas/exams/english/8",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/12/view",
        destination: "/dashboards/ati-teas/exams/english/8",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/35",
        destination: "/dashboards/ati-teas/exams/comprehensive-ati-teas-tests/9",
      },
      {
        source: "/ati-teas/exams/special-hybrid-domains/35/view",
        destination: "/dashboards/ati-teas/exams/comprehensive-ati-teas-tests/9",
      },
      // Legacy Exam Player mode URLs (e.g. /Hesi-A2/Generic/Restricted/Exams/115/Review-Mode-Assessment)
      {
        source: "/:panel(Hesi-A2|hesi-a2|ati-teas|Ati-Teas|rn-nursing|lpn-nursing)/:layout(Generic|Glacial)/:access(Restricted|Free)/Exams/:id/:mode(Practice|Review|Exam)-Mode-Assessment",
        destination: "/web/ati-teas/vista/exam/generic?mode=:mode&identifier=:id",
      },
      {
        source: "/:panel(Hesi-A2|hesi-a2|ati-teas|Ati-Teas|rn-nursing|lpn-nursing)/:layout(Generic|Glacial)/Exams/:id/:mode(Practice|Review|Exam)-Mode-Assessment",
        destination: "/web/ati-teas/vista/exam/generic?mode=:mode&identifier=:id",
      },
      // Generic special-hybrid-domains rewrites for HESI A2, ATI TEAS, RN Nursing, LPN Nursing
      {
        source: "/:panel(hesi-a2|ati-teas|rn-nursing|lpn-nursing)/exams/special-hybrid-domains/:id",
        destination: "/dashboards/:panel/exams/special-hybrid-domains/:id",
      },
      {
        source: "/:panel(hesi-a2|ati-teas|rn-nursing|lpn-nursing)/exams/special-hybrid-domains/:id/view",
        destination: "/dashboards/:panel/exams/special-hybrid-domains/:id",
      },
      {
        source: "/:panel(hesi-a2|ati-teas|rn-nursing|lpn-nursing)/exams/special-hybrid-examinations/:id",
        destination: "/dashboards/:panel/exams/special-hybrid-domains/:id",
      },
      {
        source: "/:panel(hesi-a2|ati-teas|rn-nursing|lpn-nursing)/exams/special-hybrid-examinations/:id/view",
        destination: "/dashboards/:panel/exams/special-hybrid-domains/:id",
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
