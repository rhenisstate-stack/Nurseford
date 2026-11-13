import type { MetadataRoute } from "next";
import { SEO } from "@/lib/config/config";

function resolveBaseUrl(): string {
  const raw = (SEO.siteUrl || "https://nurseford.com").trim().replace(/\/+$/, "");
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
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/pages/sample-questions", changeFrequency: "weekly", priority: 0.9 },
    { path: "/pages/resources", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pages/entrance", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pages/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/pages/contact-us", changeFrequency: "monthly", priority: 0.5 },
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
