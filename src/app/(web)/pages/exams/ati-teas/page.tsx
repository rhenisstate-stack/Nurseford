import ExamLandingPage from "@/app/(web)/includes/components/exams/ExamLandingPage";
import { ATI_TEAS_SUBJECTS } from "@/lib/data/subject-breakdown";
import { ATI_TEAS_SAMPLES } from "@/lib/data/sample-questions";
import { ATI_TEAS_SHOP_DOCS } from "@/lib/data/study-materials";

const DASHBOARD_NAME = "ati-teas";    // Lowercase hyphened as per dashboard path expectation 
const PROGRAM_NAME = "ATI TEAS";      // UPPER CASE with Space
const PARENT_TABLE_NAME = "program";  // Learning Level in All Lowercase
const PARENT_NAME = "ATI_TEAS";       // Uppercase and Underscore as per backend program Segment column expectation

export default function AtiTeasPage() {
  return (
    <ExamLandingPage
      config={{
        dashboardName: DASHBOARD_NAME,
        programName: PROGRAM_NAME,
        parentTableName: PARENT_TABLE_NAME,
        parentName: PARENT_NAME,
        tagline: "TEAS 7 Prep",
        title: "TEAS 7 Prep with Rhenis Nursing",
        heroImage: "/images/home-bg/ati-teas.jpg",
        heroImageLight: "/images/home-bg/ati-teas-light.jpg",
        taglineColor: "text-green",
        barColor: "bg-green",
        intro:
          "Dreaming of a career in nursing? The TEAS 7 Exam is your critical first step—and Rhenis Nursing has everything you need to pass.",
        introPoints: [
          {
            icon: "sparkles",
            label:
              "Dreaming of a career in nursing? The TEAS 7 Exam is your critical first step—and Rhenis Nursing has everything you need to pass.",
          },
          {
            icon: "trendingUp",
            label: "Our proven prep boosts your confidence and gets you exam-ready faster.",
          },
          {
            icon: "clipboardList",
            label:
              "Realistic practice questions and strategies trusted by thousands of aspiring nurses.",
          },
        ],
        subjects: ATI_TEAS_SUBJECTS,
        samples: ATI_TEAS_SAMPLES,
        shopDocs: ATI_TEAS_SHOP_DOCS,
        stats: [
          { value: "4", label: "Subject Areas" },
          { value: "2,000+", label: "Practice Questions" },
          { value: "TEAS 7", label: "Latest Test Plan" },
          { value: "96%", label: "Pass Rate" },
        ],
        accent: "coral",
      }}
    />
  );
}
