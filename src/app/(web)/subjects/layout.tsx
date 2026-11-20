import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: `Clinical Nursing Subjects & Med-Surg Practice | ${APP_NAME}`,
  description:
    "Master Medical-Surgical, Pharmacology, Fundamentals, Pediatrics, Maternal-Newborn, and mental health nursing with comprehensive practice question banks and detailed clinical rationales.",
  alternates: {
    canonical: "/subjects",
  },
  openGraph: {
    title: `Clinical Nursing Subjects & Med-Surg Practice | ${APP_NAME}`,
    description:
      "Master Medical-Surgical, Pharmacology, Fundamentals, Pediatrics, Maternal-Newborn, and mental health nursing with realistic practice questions and rationales.",
    url: "/subjects",
  },
};

export default function SubjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
