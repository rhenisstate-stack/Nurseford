import type { MetadataRoute } from "next";
import { SEO } from "@/lib/config/config";

function resolveBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || SEO.siteUrl || "https://www.nurseford.com").trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/courses",
          "/subjects",
          "/pages/sample-questions",
          "/pages/resources",
          "/pages/entrance",
          "/pages/about",
          "/pages/contact-us",
          "/pages/privacy-policy",
          "/pages/terms",
          "/pages/subscription/package",
        ],
        disallow: [
          "/api/",
          "/auth/",
          "/login",
          "/register",
          "/signin",
          "/logout",
          "/dashboards/",
          "/web/",
          "/pages/heed/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
