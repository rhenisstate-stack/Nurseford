import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: `All Nursing Courses & Exam Curriculums | ${APP_NAME}`,
  description:
    "Explore comprehensive RN & LPN nursing courses, Med-Surg, Pediatrics, Maternal, Pharmacology, and exit exam practice resources with realistic questions and rationales.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: `All Nursing Courses & Exam Curriculums | ${APP_NAME}`,
    description:
      "Explore comprehensive RN & LPN nursing courses, Med-Surg, Pediatrics, Maternal, Pharmacology, and exit exam practice resources.",
    url: "/courses",
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
