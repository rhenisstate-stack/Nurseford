// castoline/src/lib/api.ts
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

// Unified Frontend API Wrapper
// -------------------------------------------------------------------------------------------------
// IMPORTANT (OPTION A — Secure Architecture):
 
// - Frontend DOES NOT generate signatures
// - Frontend DOES NOT call backend directly
// - Frontend ONLY calls Next.js API routes
// - Next.js server routes handle signing + backend selection
 
// -------------------------------------------------------------------------------------------------

const ACTIVE_BACKEND = process.env.SKEW_LINE_ACTIVE_BACKEND || "dotnet";


// Resolve backend base URL based on active backend type.
// Used by Next.js API routes (server-side), NOT directly by frontend.
// But frontend must send the correct backend ID to internal routes.

export function getBackendBaseUrl(): string {
  switch (ACTIVE_BACKEND) {
    case "laravel": {
      const url = process.env.SKEW_LINE_LARAVEL_BASE_URL?.split(",")[0] || "http://localhost:5000";
      return url;
    }

    case "dotnet": {
      const url = process.env.SKEW_LINE_DOTNET_BASE_URL || "http://localhost:5000";
      return url;
    }

    case "fastapi":
    default: {
      const url = process.env.SKEW_LINE_FASTAPI_BASE_URL?.split(",")[1] || "http://localhost:5000";
      return url;
    }
  }
}

// -------------------------------------------------------------------------------------------------

// Unified frontend fetcher
// 🚫 Frontend NEVER talks to backend directly
// ✔ Always calls: /api/{backend}/{path}
 

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isInternalApi = path.startsWith("/api");

  // ❌ Block any direct backend access
  if (path.startsWith("http://") || path.startsWith("https://")) {
    throw new Error("Direct backend calls are NOT allowed. Use /api/* internal routes.");
  }

  // -------------------------------------------------------------------------------------------------

  // Final internal API route:
  // /api/{fastapi|laravel|dotnet}/{...path}
  const backendPrefix = `/api/${ACTIVE_BACKEND}`;
  const finalPath = isInternalApi ? path : `${backendPrefix}${path}`;

  // 🔥 DETECT FORMDATA
  const isFormData = options.body instanceof FormData;

  // Build headers as a real Headers object (TypeScript-safe)
  const headers = new Headers({
    ...renderSystemSessionHeaders(),
    ...(options.headers || {}),
  });

  // 🔥 CRITICAL CONTENT-TYPE RULE
  if (isFormData) {
    // ❌ NEVER set Content-Type for FormData
    headers.delete("Content-Type");
  } else if (!headers.has("Content-Type")) {
    // Default to JSON only when not multipart
    headers.set("Content-Type", "application/json");
  }

 const res = await fetch(finalPath, {
    ...options,
    headers,
    body: options.body, // ← DO NOT TOUCH / DO NOT STRINGIFY
  });

  if (!res.ok) {
    let errorMessage = `API Error: ${res.status}`;

    try {
      const data = await res.json();

      if (data?.error) {
        errorMessage = data.error;
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (data?.errors && typeof data.errors === "object") {
        errorMessage = Object.entries(data.errors)
          .flatMap(([field, msgs]) =>
            Array.isArray(msgs) ? msgs.map((m) => `${field}: ${m}`) : [`${field}: ${msgs}`]
          )
          .join(" | ");
      } else if (data?.detail) {
        errorMessage = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      } else if (data?.title) {
        errorMessage = data.title;
      }

      console.error(`[API ERROR] ${res.status}:`, data);
    } catch {
      const txt = await res.text();
      console.error(`[API ERROR] ${res.status}: ${txt}`);
    }

    throw new Error(errorMessage);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new Error(`Failed to parse JSON from: ${finalPath}`);
  }
}

// -------------------------------------------------------------------------------------------------
