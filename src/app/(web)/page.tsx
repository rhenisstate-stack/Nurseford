import type { Metadata } from "next";
import HomePage from "@/app/(web)/pages/home/home";
import JsonLd, {
  buildFaqPageSchema,
  buildOrganizationSchema,
  buildWebsiteSchema,
} from "@/components/seo/JsonLd";
import { APP_NAME } from "@/lib/config/config";
import { ALL_FAQS } from "@/lib/data/faqs";

export const metadata: Metadata = {
  title: `${APP_NAME} | RN Nursing, LPN Nursing & Exit Exam Q-Bank`,
  description:
    "Prepare with confidence for RN Nursing, LPN Nursing, and RN/LPN Exit Exams with realistic practice questions, detailed rationales, and real-time performance tracking.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePageRoot() {
  return (
    <>
      <JsonLd
        data={[
          buildOrganizationSchema(),
          buildWebsiteSchema(),
          buildFaqPageSchema(ALL_FAQS),
        ]}
      />
      <HomePage />
    </>
  );
}
