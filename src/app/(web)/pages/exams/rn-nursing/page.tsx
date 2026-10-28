import ExamLandingPage from "@/app/(web)/includes/components/exams/ExamLandingPage";
import { RN_NURSING_CATEGORIES } from "@/lib/data/subject-breakdown";
import { RN_NURSING_SAMPLES } from "@/lib/data/sample-questions";
import { RHENIS_SHOP_DOCS } from "@/lib/data/study-materials";

const DASHBOARD_NAME = "rn-nursing";   // Lowercase hyphened as per dashboard path expectation 
const PROGRAM_NAME = "RN NURSING";   // UPPER CASE With Space
const PARENT_TABLE_NAME = "program";  // Learning Level in All Lowercase
const PARENT_NAME = "RN_NURSING";       // Uppercase and Underscore as per backend program Segment column expectation

export default function RnNursingPage() {
  return (
    <ExamLandingPage
      config={{
        dashboardName: DASHBOARD_NAME,
        programName: PROGRAM_NAME,
        parentTableName: PARENT_TABLE_NAME,
        parentName: PARENT_NAME,
        tagline: "RN Nursing Q-Bank",
        heroImage: "/images/home-bg/rn-nursing.jpg",
        heroImageLight: "/images/home-bg/rn-nursing-light.jpg",
        title: "RN Nursing Q-Bank Exam Prep with Rhenis Nursing",
        titleHighlight: "RN Nursing Q-Bank",
        titleHighlightClass: "text-[#2563EB] dark:text-[#2FD9C4]",
        intro:
          "Master your RN nursing exams with Rhenis Nursing's Q-Bank, designed to mirror real test formats and clinical scenarios.",
        introPoints: [
          {
            icon: "clipboardList",
            label:
              "Master your RN nursing exams with Rhenis Nursing's Q-Bank, designed to mirror real test formats and clinical scenarios.",
          },
          {
            icon: "barChart3",
            label:
              "Our comprehensive question bank builds confidence across all major nursing subjects—preparing you for classroom tests, exit exams, and professional assessments.",
          },
          {
            icon: "trendingUp",
            label:
              "Whether you're focusing on fundamentals or advanced specialties, Rhenis Nursing helps you study smarter and achieve a competitive edge.",
          },
        ],
        subjects: RN_NURSING_CATEGORIES,
        samples: RN_NURSING_SAMPLES,
        shopDocs: RHENIS_SHOP_DOCS,
        stats: [
          { value: "25,000+", label: "NCLEX-Style Questions" },
          { value: "9+", label: "Specialties Covered" },
          { value: "CAT", label: "Adaptive Format" },
          { value: "96%", label: "Pass Rate" },
        ],
        accent: "blue",
      }}
    />
  );
}
