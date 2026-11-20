import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: `Nursing Study Resources & Guides | ${APP_NAME}`,
  description:
    "Access free nursing study guides, practice test tips, dosage calculation formulas, and clinical resources for RN and LPN students.",
  alternates: {
    canonical: "/pages/resources",
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
