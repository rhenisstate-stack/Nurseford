import { apiFetch } from "@/lib/api/api/api";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

// Types 

export interface SystemRoleInput {
  name: string;
  rank: number;
  description: string;
}

// Generic service response
export interface ServiceResponse<GenericPayloadType = unknown> {
  message?: string;
  error?: string;
  data?: GenericPayloadType;
}

// Create System Role Service 
// Calls INTERNAL Next.js API route
// src/app/api/users/management/developer/system-roles/route.ts

export const createSystemRole = async <GenericPayloadType = unknown>(
  input: SystemRoleInput
): Promise<ServiceResponse<GenericPayloadType>> => {
  console.log("🛡️ [manageRoleService] createSystemRole() called", input);

  try {

    // PARTIAL HELPER AS A SINGLE SOURCE OF TRUTH FOR SESSION HEADERS
    //  If a function returns part of an object,you must use the spread operator (...) to merge it.
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...renderSystemSessionHeaders(),
    };

    const result = await apiFetch<ServiceResponse<GenericPayloadType>>(
      "/api/system/role",
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(input),
        headers,  // Include the Session Headers Info 

      }
    );

    console.log("🛡️ [manageRoleService] Response:", result);

    return result;
  } catch (err: unknown) {
    console.error("❌ [manageRoleService] createSystemRole() failed:", err);

    return {
      error: err instanceof Error
        ? err.message
        : "Unknown system role creation error",
    };
  }
};
