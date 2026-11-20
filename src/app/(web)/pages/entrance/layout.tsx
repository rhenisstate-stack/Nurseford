import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: `Nursing Programs & Entrance Exams | ${APP_NAME}`,
  description:
    "Explore nursing entrance and preparation programs including RN Nursing, LPN Nursing, NCLEX-RN, NCLEX-PN, ATI TEAS, and HESI A2.",
  alternates: {
    canonical: "/pages/entrance",
  },
};

export default function EntranceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
