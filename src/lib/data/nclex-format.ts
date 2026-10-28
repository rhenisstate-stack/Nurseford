export interface PrepFormatStep {
  step: number;
  icon: string;
  title: string;
  description: string;
  topics: string[];
  footer?: string;
}

export const NCLEX_PREP_FORMAT = (
  examName: "NCLEX-RN" | "NCLEX-PN"
): PrepFormatStep[] => [
  {
    step: 1,
    icon: "1️⃣",
    title: "Standalone Questions & Custom Exam Builder",
    description:
      "Thousands of NCLEX-style questions created by nurse educators.",
    topics: [
      "Custom exam creation to focus on your study priorities:",
      "Adult Health",
      "Child Health",
      "Med-Surg Pharmacology",
      "Mental Health",
      "Critical Care",
      "Maternal & Newborn",
      "Case Study category for advanced clinical reasoning practice.",
    ],
    footer:
      "Immediate feedback and clear rationales ensure you understand each concept thoroughly.",
  },
  {
    step: 2,
    icon: "2️⃣",
    title: "Comprehensive Practice Tests",
    description: `Full-length, timed practice exams simulate the ${examName} testing environment.`,
    topics: [
      "Build test-taking stamina, refine pacing, and enhance decision-making under pressure.",
      "Category-level performance reports identify knowledge gaps and inform your study plan.",
    ],
  },
  {
    step: 3,
    icon: "3️⃣",
    title: "Refined Readiness Exams",
    description:
      "Gauge your true exam preparedness with professional-level readiness assessments.",
    topics: [
      "Advanced analytics reveal strengths and weaknesses, guiding final study focus.",
      "Enter test day with confidence, knowing you've practiced under realistic conditions.",
    ],
  },
];
