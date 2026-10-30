import ExamLandingPage from "@/app/(web)/includes/components/exams/ExamLandingPage";
import { RN_NURSING_CATEGORIES } from "@/lib/data/subject-breakdown";
import { RN_NURSING_SAMPLES } from "@/lib/data/sample-questions";
import { NURSEFORD_SHOP_DOCS } from "@/lib/data/study-materials";

const DASHBOARD_NAME = "nclex-rn";   // Lowercase hyphened as per dashboard path expectation 
const PROGRAM_NAME = "NCLEX RN";   // UPPER CASE With Space
const PARENT_TABLE_NAME = "program";  // Learning Level in All Lowercase
const PARENT_NAME = "NCLEX_RN";       // Uppercase and Underscore as per backend program Segment column expectation

export default function NclexRnPage() {
  return (
    <ExamLandingPage
      config={{
        dashboardName: DASHBOARD_NAME,
        programName: PROGRAM_NAME,
        parentTableName: PARENT_TABLE_NAME,
        parentName: PARENT_NAME,
        tagline: "NCLEX-RN",
        heroImage: "/images/home-bg/nclex-rn.jpg",
        heroImageLight: "/images/home-bg/nclex-rn-light.jpg",
        title: "🩺 NCLEX-RN Prep with NurseFord",
        titleHighlight: "NCLEX-RN",
        titleHighlightClass: "text-sage",
        intro:
          "Launch your nursing career with confidence using NurseFord's NCLEX-RN Prep.",
        introPoints: [
          {
            icon: "rocket",
            label: "Launch your nursing career with confidence using NurseFord's NCLEX-RN Prep.",
          },
          {
            icon: "brain",
            label:
              "Our resources mirror the rigor and format of the official exam—helping you refine clinical judgment, strengthen content mastery, and feel fully prepared.",
          },
          {
            icon: "target",
            label:
              "Whether you're doing targeted drills or full-length simulations, NurseFord gives you the tools to succeed.",
          },
        ],
        subjects: RN_NURSING_CATEGORIES,
        samples: RN_NURSING_SAMPLES,
        shopDocs: NURSEFORD_SHOP_DOCS,
        stats: [
          { value: "25,000+", label: "NCLEX-Style Questions" },
          { value: "9+", label: "Specialties Covered" },
          { value: "CAT", label: "Adaptive Format" },
          { value: "96%", label: "Pass Rate" },
        ],
        accent: "blue",
        showSubjects: false,
        showSamples: false,
        prepFormatLabel: "NCLEX-RN PREP FORMAT",
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
              "Full-length, timed practice exams simulate the NCLEX-RN testing environment.",
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

