// This API route serves media files from the backend. It takes a dynamic path parameter and fetches the corresponding file from the backend, returning it with appropriate headers for caching and content type.
import { NextRequest } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/api/api";
import { getSiteHeaders } from "@/lib/config/siteHeaders";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const backend = getBackendBaseUrl();

  const { path } = await params;
  const filePath = path.join("/");

  const url = `${backend}/${filePath}`;

  const res = await fetch(url, {
    headers: { ...(await getSiteHeaders()) },
  });

  if (!res.ok) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}