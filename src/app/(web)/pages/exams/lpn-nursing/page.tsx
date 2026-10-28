import ExamLandingPage from "@/app/(web)/includes/components/exams/ExamLandingPage";
import { LPN_NURSING_CATEGORIES } from "@/lib/data/subject-breakdown";
import { LPN_NURSING_SAMPLES } from "@/lib/data/sample-questions";
import { RHENIS_SHOP_DOCS } from "@/lib/data/study-materials";

const DASHBOARD_NAME = "lpn-nursing";   // Lowercase hyphened as per dashboard path expectation 
const PROGRAM_NAME = "LPN NURSING";   // UPPER CASE With Space
const PARENT_TABLE_NAME = "program";  // Learning Level in All Lowercase
const PARENT_NAME = "LPN_NURSING";       // Uppercase and Underscore as per backend program Segment column expectation

export default function LpnNursingPage() {
  return (
    <ExamLandingPage
      config={{
        dashboardName: DASHBOARD_NAME,
        programName: PROGRAM_NAME,
        parentTableName: PARENT_TABLE_NAME,
        parentName: PARENT_NAME,
        tagline: "LPN Nursing Q-Bank",
        heroImage: "/images/home-bg/lpn-nursing.jpg",
        heroImageLight: "/images/home-bg/lpn-nursing-light.jpg",
        title: "LPN Nursing Q-Bank Exam Success with Rhenis Nursing",
        titleHighlight: "LPN Nursing Q-Bank",
        titleHighlightClass: "text-[#2563EB] dark:text-[#2FD9C4]",
        intro:
          "Step confidently into your practical nursing exams with Rhenis Nursing's LPN Q-Bank.",
        introPoints: [
          {
            icon: "graduationCap",
            label:
              "Step confidently into your practical nursing exams with Rhenis Nursing's LPN Q-Bank.",
          },
          {
            icon: "clipboardCheck",
            label:
              "Built to simulate authentic testing conditions, our extensive question bank strengthens your clinical reasoning and subject knowledge across all major LPN topics.",
          },
          {
            icon: "trendingUp",
            label:
              "Whether you're reviewing fundamentals or advanced care areas, Rhenis equips you with the tools to study efficiently and perform at your best.",
          },
        ],
        subjects: LPN_NURSING_CATEGORIES,
        samples: LPN_NURSING_SAMPLES,
        shopDocs: RHENIS_SHOP_DOCS,
        stats: [
          { value: "25,000+", label: "NCLEX-Style Questions" },
          { value: "9+", label: "Specialties Covered" },
          { value: "CAT", label: "Adaptive Format" },
          { value: "96%", label: "Pass Rate" },
        ],
        accent: "green",
      }}
    />
  );
}
