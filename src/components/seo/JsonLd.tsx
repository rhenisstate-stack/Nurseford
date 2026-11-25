import { APP_DESCRIPTION, APP_NAME, CONTACT, SEO } from "@/lib/config/config";
import type { FaqItem } from "@/lib/data/faqs";

function resolveBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || SEO.siteUrl || "https://pubnurse.com").trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export function buildOrganizationSchema() {
  const baseUrl = resolveBaseUrl();
  const sameAs = [
    CONTACT.FACEBOOK,
    CONTACT.TWITTER,
    CONTACT.INSTAGRAM,
    CONTACT.LINKEDIN,
    CONTACT.YOUTUBE,
    CONTACT.TIKTOK,
  ].filter((url) => Boolean(url && /^https?:\/\//i.test(url)));

  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: APP_NAME,
    description: APP_DESCRIPTION,
    url: baseUrl,
    logo: `${baseUrl}/logo/logo.png`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildWebsiteSchema() {
  const baseUrl = resolveBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: baseUrl,
    description: APP_DESCRIPTION,
  };
}

export function buildFaqPageSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildQuizSchema(
  questions: Array<{
    id: string;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    rationale: string;
    subject?: string;
  }>
) {
  const baseUrl = resolveBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "RN, LPN & Exit Exam Sample Practice Questions",
    description:
      "Free board-standard nursing practice questions with comprehensive clinical rationales across Med-Surg, Pharmacology, Pediatrics, and Prioritization.",
    url: `${baseUrl}/pages/sample-questions`,
    educationalLevel: "Professional Nursing Licensure Preparation",
    hasPart: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      text: q.question,
      learningResourceType: "Practice problem",
      eduQuestionType: "Multiple choice",
      suggestedAnswer: q.options.map((opt, idx) => ({
        "@type": "Answer",
        position: idx + 1,
        text: opt,
        encodingFormat: "text/plain",
        comment: {
          "@type": "Comment",
          text: idx === q.correctIndex ? q.rationale : "Incorrect choice for this scenario.",
        },
      })),
      acceptedAnswer: {
        "@type": "Answer",
        position: q.correctIndex + 1,
        text: q.options[q.correctIndex],
        encodingFormat: "text/plain",
        comment: {
          "@type": "Comment",
          text: q.rationale,
        },
      },
    })),
  };
}

export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
