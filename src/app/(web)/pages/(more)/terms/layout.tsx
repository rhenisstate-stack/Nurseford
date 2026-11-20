import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${APP_NAME}`,
  description:
    "Review the terms and conditions governing student accounts, exam subscriptions, and access to Nurseford nursing education materials.",
  alternates: {
    canonical: "/pages/terms",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
