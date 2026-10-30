import ExamLandingPage from "@/app/(web)/includes/components/exams/ExamLandingPage";
import { LPN_NURSING_CATEGORIES } from "@/lib/data/subject-breakdown";
import { LPN_NURSING_SAMPLES } from "@/lib/data/sample-questions";
import { NURSEFORD_SHOP_DOCS } from "@/lib/data/study-materials";

const DASHBOARD_NAME = "nclex-pn";   // Lowercase hyphened as per dashboard path expectation 
const PROGRAM_NAME = "NCLEX PN";   // UPPER CASE With Space
const PARENT_TABLE_NAME = "program";  // Learning Level in All Lowercase
const PARENT_NAME = "NCLEX_PN";       // Uppercase and Underscore as per backend program Segment column expectation

export default function NclexPnPage() {
  return (
    <ExamLandingPage
      config={{
        dashboardName: DASHBOARD_NAME,
        programName: PROGRAM_NAME,
        parentTableName: PARENT_TABLE_NAME,
        parentName: PARENT_NAME,
        tagline: "NCLEX-PN",
        heroImage: "/images/home-bg/nclex-pn.jpg",
        heroImageLight: "/images/home-bg/nclex-pn-light.jpg",
        title: "🩺 NCLEX-PN Prep with NurseFord",
        titleHighlight: "NCLEX-PN",
        titleHighlightClass: "text-green",
        intro:
          "Step confidently into your practical nursing career with NurseFord's NCLEX-PN Prep.",
        introPoints: [
          {
            icon: "graduationCap",
            label:
              "Step confidently into your practical nursing career with NurseFord's NCLEX-PN Prep.",
          },
          {
            icon: "clipboardCheck",
            label:
              "Designed to match the style and difficulty of the official NCLEX-PN exam, our resources strengthen your clinical judgment and reinforce key content areas.",
          },
          {
            icon: "target",
            label:
              "Prepare to excel on your first attempt—whether reviewing fundamentals or tackling advanced topics.",
          },
          {
            icon: "sparkles",
            label: "NurseFord gives you the tools to study smarter and succeed.",
          },
        ],
        subjects: LPN_NURSING_CATEGORIES,
        samples: LPN_NURSING_SAMPLES,
        shopDocs: NURSEFORD_SHOP_DOCS,
        stats: [
          { value: "25,000+", label: "NCLEX-Style Questions" },
          { value: "9+", label: "Specialties Covered" },
          { value: "CAT", label: "Adaptive Format" },
          { value: "96%", label: "Pass Rate" },
        ],
        accent: "green",
        showSubjects: false,
        showSamples: false,
        prepFormatLabel: "NCLEX-PN PREP FORMAT",
        prepFormatCards: [
          {
            title: "Standalone Questions & Custom Exam Builder",
            intro: "Thousands of NCLEX-style questions created by nurse educators.",
            subtitle: "Custom exam creation to focus on your study priorities:",
            items: [
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
            title: "Comprehensive Practice Tests",
            intro:
              "Full-length, timed practice exams simulate the NCLEX-PN testing environment.",
            items: [
              "Build test-taking stamina, refine pacing, and enhance decision-making under pressure.",
              "Category-level performance reports identify knowledge gaps and inform your study plan.",
            ],
          },
          {
            title: "Refined Readiness Exams",
            intro: "Gauge your true exam preparedness with professional-level readiness assessments.",
            items: [
              "Advanced analytics reveal strengths and weaknesses, guiding final study focus.",
              "Enter test day with confidence, knowing you've practiced under realistic conditions.",
            ],
          },
        ],
      }}
    />
  );
}

