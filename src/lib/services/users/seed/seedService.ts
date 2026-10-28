import { apiFetch } from "@/lib/api/api/api";

export interface SeedDeveloperResponse {
  message?: string;
  error?: string;
}


//  Seed the system developer user
//  Calls the INTERNAL Next.js API route
export const seedDeveloper = async (): Promise<SeedDeveloperResponse> => {
  console.log("🌱 [developerService] seedDeveloper() called");

  try {
 
    //  INTERNAL NEXT.JS API ROUTE
    //   src/app/api/management/developer/route.ts
    const result = await apiFetch<SeedDeveloperResponse>(
      "/api/users/seed",
      {
        method: "POST",
        credentials: "include",
      }
    );

    console.log("🌱 [developerService] Response:", result);

    return result;
  } catch (err: unknown) {
    console.error("❌ [developerService] seedDeveloper() failed:", err);

    return {
      error: err instanceof Error ? err.message : "Unknown seed error",
    };
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

