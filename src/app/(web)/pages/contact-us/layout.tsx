import type { Metadata } from "next";
import { APP_NAME } from "@/lib/config/config";

export const metadata: Metadata = {
  title: `Contact Us & Student Support | ${APP_NAME}`,
  description:
    "Get in touch with the Nurseford academic support team for assistance with nursing exams, question rationales, and subscriptions.",
  alternates: {
    canonical: "/pages/contact-us",
  },
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
