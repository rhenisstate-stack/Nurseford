import type { MetadataRoute } from "next";
import { SEO } from "@/lib/config/config";

function resolveBaseUrl(): string {
  const raw = (SEO.siteUrl || "https://nurseford.com").trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pages/"],
        disallow: [
          "/api/",
          "/auth/",
          "/login",
          "/register",
          "/signin",
          "/logout",
          "/dashboards/",
          "/web/",
          "/pages/subscription/package",
          "/pages/heed/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
