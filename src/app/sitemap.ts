import type { MetadataRoute } from "next";
import { SEO } from "@/lib/config/config";

function resolveBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || SEO.siteUrl || "https://www.nurseford.com").trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = resolveBaseUrl();
  const lastModified = new Date();

  const publicRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "daily", priority: 1.0 },
    { path: "/courses", changeFrequency: "daily", priority: 0.95 },
    { path: "/pages/sample-questions", changeFrequency: "weekly", priority: 0.85 },
    { path: "/pages/entrance", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pages/resources", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pages/subscription/package", changeFrequency: "weekly", priority: 0.75 },
    { path: "/pages/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/pages/contact-us", changeFrequency: "monthly", priority: 0.6 },
    { path: "/pages/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/pages/terms", changeFrequency: "yearly", priority: 0.3 },
  ];

  return publicRoutes.map((route) => ({
    url: route.path === "/" ? baseUrl : `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
