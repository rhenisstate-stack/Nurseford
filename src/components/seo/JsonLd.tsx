import { APP_DESCRIPTION, APP_NAME, CONTACT, SEO } from "@/lib/config/config";
import type { FaqItem } from "@/lib/data/faqs";

function resolveBaseUrl(): string {
  const raw = (SEO.siteUrl || "https://nurseford.com").trim().replace(/\/+$/, "");
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
