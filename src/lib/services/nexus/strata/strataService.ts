import { apiFetch } from "@/lib/api/api/api";
import { convertBackendKeysToCamel } from "@/lib/utils/convertors/pascalToCamelCase";

// Supported actions
export type StrataAction = "Store" | "Update" | "Delete" | "AbsoluteFetch" | "RelativeFetch" | "CurrentFetch" | "DistinctFetch"| "NominalFetch" | "LiveFetch";
import { renderSystemSessionHeaders } from "@/lib/services/partial/helper/systemSessionHeaders";

// Supported types
export type StrataType =
  | "Category"
  | "SubCategory"
  | "Domain"
  | "Program"
  | "Course"
  | "Subject"
  | "Unit"
  | "Lesson"
  | "Topic"
  | "Concept"
  | "Fact"
  | "Assessment"
  | "Exam"
  | "Section"
  | "Question"
  | "Document"
  | "Content"
  | "Cognition"
  | "Institution"
  | "School"
  | "Department"
  | "Division"
  | "Cohort"
  | "StrataClass"
  
  ;

// Generic response type
export interface StrataResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Map Each combination of StrataType + Action to Internal API route
const ROUTE_MAP: Record<StrataType, Record<StrataAction, string>> = {
  Category: {
    Store: "/api/nexus/strata/main/category",
    Update: "/api/nexus/strata/main/category",
    Delete: "/api/nexus/strata/main/category",
    AbsoluteFetch: "/api/nexus/strata/main/category",
    RelativeFetch: "/api/nexus/strata/main/category",
    CurrentFetch: "/api/nexus/strata/main/category",
    DistinctFetch: "/api/nexus/strata/main/category",
    NominalFetch: "/api/nexus/strata/main/category",
    LiveFetch: "/api/nexus/strata/main/category",
  },
  SubCategory: {
    Store: "/api/nexus/strata/main/subcategory",
    Update: "/api/nexus/strata/main/subcategory",
    Delete: "/api/nexus/strata/main/subcategory",
    AbsoluteFetch: "/api/nexus/strata/main/subcategory",
    RelativeFetch: "/api/nexus/strata/main/subcategory",
    CurrentFetch: "/api/nexus/strata/main/subcategory",
    DistinctFetch: "/api/nexus/strata/main/subcategory",
    NominalFetch: "/api/nexus/strata/main/subcategory",
    LiveFetch: "/api/nexus/strata/main/subcategory",
  },
  Domain: {
    Store: "/api/nexus/strata/main/domain",
    Update: "/api/nexus/strata/main/domain",
    Delete: "/api/nexus/strata/main/domain",
    AbsoluteFetch: "/api/nexus/strata/main/domain",
    RelativeFetch: "/api/nexus/strata/main/domain",
    CurrentFetch: "/api/nexus/strata/main/domain",
    DistinctFetch: "/api/nexus/strata/main/domain",
    NominalFetch: "/api/nexus/strata/main/domain",
    LiveFetch: "/api/nexus/strata/main/domain",
  },
  Program: {
    Store: "/api/nexus/strata/learning/program",
    Update: "/api/nexus/strata/learning/program",
    Delete: "/api/nexus/strata/learning/program",
    AbsoluteFetch: "/api/nexus/strata/learning/program",
    RelativeFetch: "/api/nexus/strata/learning/program",
    CurrentFetch: "/api/nexus/strata/learning/program",
    DistinctFetch: "/api/nexus/strata/learning/program",
    NominalFetch: "/api/nexus/strata/learning/program",
    LiveFetch: "/api/nexus/strata/learning/program",
  },
  Course: {
    Store: "/api/nexus/strata/learning/course",
    Update: "/api/nexus/strata/learning/course",
    Delete: "/api/nexus/strata/learning/course",
    AbsoluteFetch: "/api/nexus/strata/learning/course",
    RelativeFetch: "/api/nexus/strata/learning/course",
    CurrentFetch: "/api/nexus/strata/learning/course",
    DistinctFetch: "/api/nexus/strata/learning/course",
    NominalFetch: "/api/nexus/strata/learning/course",
    LiveFetch: "/api/nexus/strata/learning/course",
  },
  Subject: {
    Store: "/api/nexus/strata/learning/subject",
    Update: "/api/nexus/strata/learning/subject",
    Delete: "/api/nexus/strata/learning/subject",
    AbsoluteFetch: "/api/nexus/strata/learning/subject",
    RelativeFetch: "/api/nexus/strata/learning/subject",
    CurrentFetch: "/api/nexus/strata/learning/subject",
    DistinctFetch: "/api/nexus/strata/learning/subject",
    NominalFetch: "/api/nexus/strata/learning/subject",
    LiveFetch: "/api/nexus/strata/learning/subject",
  },
  Unit: {
    Store: "/api/nexus/strata/learning/unit",
    Update: "/api/nexus/strata/learning/unit",
    Delete: "/api/nexus/strata/learning/unit",
    AbsoluteFetch: "/api/nexus/strata/learning/unit",
    RelativeFetch: "/api/nexus/strata/learning/unit",
    CurrentFetch: "/api/nexus/strata/learning/unit",
    DistinctFetch: "/api/nexus/strata/learning/unit",
    NominalFetch: "/api/nexus/strata/learning/unit",
    LiveFetch: "/api/nexus/strata/learning/unit",
  },
  Lesson: {
    Store: "/api/nexus/strata/learning/lesson",
    Update: "/api/nexus/strata/learning/lesson",
    Delete: "/api/nexus/strata/learning/lesson",
    AbsoluteFetch: "/api/nexus/strata/learning/lesson",
    RelativeFetch: "/api/nexus/strata/learning/lesson",
    CurrentFetch: "/api/nexus/strata/learning/lesson",
    DistinctFetch: "/api/nexus/strata/learning/lesson",
    NominalFetch: "/api/nexus/strata/learning/lesson",
    LiveFetch: "/api/nexus/strata/learning/lesson",
  }, 
  Topic: {
    Store: "/api/nexus/strata/learning/topic",
    Update: "/api/nexus/strata/learning/topic",
    Delete: "/api/nexus/strata/learning/topic",
    AbsoluteFetch: "/api/nexus/strata/learning/topic",
    RelativeFetch: "/api/nexus/strata/learning/topic",
    CurrentFetch: "/api/nexus/strata/learning/topic",
    DistinctFetch: "/api/nexus/strata/learning/topic",
    NominalFetch: "/api/nexus/strata/learning/topic",
    LiveFetch: "/api/nexus/strata/learning/topic",
  },
  Concept: {
    Store: "/api/nexus/strata/learning/concept",
    Update: "/api/nexus/strata/learning/concept",
    Delete: "/api/nexus/strata/learning/concept",
    AbsoluteFetch: "/api/nexus/strata/learning/concept",
    RelativeFetch: "/api/nexus/strata/learning/concept",
    CurrentFetch: "/api/nexus/strata/learning/concept",
    DistinctFetch: "/api/nexus/strata/learning/concept",
    NominalFetch: "/api/nexus/strata/learning/concept",
    LiveFetch: "/api/nexus/strata/learning/concept",
  }, 
  Fact: {
    Store: "/api/nexus/strata/learning/fact",
    Update: "/api/nexus/strata/learning/fact",
    Delete: "/api/nexus/strata/learning/fact",
    AbsoluteFetch: "/api/nexus/strata/learning/fact",
    RelativeFetch: "/api/nexus/strata/learning/fact",
    CurrentFetch: "/api/nexus/strata/learning/fact",
    DistinctFetch: "/api/nexus/strata/learning/fact",
    NominalFetch: "/api/nexus/strata/learning/fact",
    LiveFetch: "/api/nexus/strata/learning/fact",
  },  
  Assessment: {
    Store: "/api/nexus/strata/assessment/assessment",
    Update: "/api/nexus/strata/assessment/assessment",
    Delete: "/api/nexus/strata/assessment/assessment",
    AbsoluteFetch: "/api/nexus/strata/assessment/assessment",
    RelativeFetch: "/api/nexus/strata/assessment/assessment",
    CurrentFetch: "/api/nexus/strata/assessment/assessment",
    DistinctFetch: "/api/nexus/strata/assessment/assessment",
    NominalFetch: "/api/nexus/strata/assessment/assessment",
    LiveFetch: "/api/nexus/strata/assessment/assessment",
  }, 
  Exam: {
    Store: "/api/nexus/strata/assessment/exam",
    Update: "/api/nexus/strata/assessment/exam",
    Delete: "/api/nexus/strata/assessment/exam",
    AbsoluteFetch: "/api/nexus/strata/assessment/exam",
    RelativeFetch: "/api/nexus/strata/assessment/exam",
    CurrentFetch: "/api/nexus/strata/assessment/exam",
    DistinctFetch: "/api/nexus/strata/assessment/exam",
    NominalFetch: "/api/nexus/strata/assessment/exam",
    LiveFetch: "/api/nexus/strata/assessment/exam",
  },
  Section: {
    Store: "/api/nexus/strata/assessment/section",
    Update: "/api/nexus/strata/assessment/section",
    Delete: "/api/nexus/strata/assessment/section",
    AbsoluteFetch: "/api/nexus/strata/assessment/section",
    RelativeFetch: "/api/nexus/strata/assessment/section",
    CurrentFetch: "/api/nexus/strata/assessment/section",
    DistinctFetch: "/api/nexus/strata/assessment/section",
    NominalFetch: "/api/nexus/strata/assessment/section",
    LiveFetch: "/api/nexus/strata/assessment/section",
  },
  Question: {
    Store: "/api/nexus/strata/assessment/question",
    Update: "/api/nexus/strata/assessment/question",
    Delete: "/api/nexus/strata/assessment/question",
    AbsoluteFetch: "/api/nexus/strata/assessment/question",
    RelativeFetch: "/api/nexus/strata/assessment/question",
    CurrentFetch: "/api/nexus/strata/assessment/question",
    DistinctFetch: "/api/nexus/strata/assessment/question",
    NominalFetch: "/api/nexus/strata/assessment/question",
    LiveFetch: "/api/nexus/strata/assessment/question",
  },
  Document: {
    Store: "/api/nexus/strata/content/document",
    Update: "/api/nexus/strata/content/document",
    Delete: "/api/nexus/strata/content/document",
    AbsoluteFetch: "/api/nexus/strata/content/document",
    RelativeFetch: "/api/nexus/strata/content/document",
    CurrentFetch: "/api/nexus/strata/content/document",
    DistinctFetch: "/api/nexus/strata/content/document",
    NominalFetch: "/api/nexus/strata/content/document",
    LiveFetch: "/api/nexus/strata/content/document",
  },
  Content: {
    Store: "/api/nexus/strata/content/content",
    Update: "/api/nexus/strata/content/content",
    Delete: "/api/nexus/strata/content/content",
    AbsoluteFetch: "/api/nexus/strata/content/content",
    RelativeFetch: "/api/nexus/strata/content/content",
    CurrentFetch: "/api/nexus/strata/content/content",
    DistinctFetch: "/api/nexus/strata/content/content",
    NominalFetch: "/api/nexus/strata/content/content",
    LiveFetch: "/api/nexus/strata/content/content",
  },
  Cognition: {
    Store: "/api/nexus/strata/content/cognition",
    Update: "/api/nexus/strata/content/cognition",
    Delete: "/api/nexus/strata/content/cognition",
    AbsoluteFetch: "/api/nexus/strata/content/cognition",
    RelativeFetch: "/api/nexus/strata/content/cognition",
    CurrentFetch: "/api/nexus/strata/content/cognition",
    DistinctFetch: "/api/nexus/strata/content/cognition",
    NominalFetch: "/api/nexus/strata/content/cognition",
    LiveFetch: "/api/nexus/strata/content/cognition",
  },
  Institution: {
    Store: "/api/nexus/strata/institution/institution",
    Update: "/api/nexus/strata/institution/institution",
    Delete: "/api/nexus/strata/institution/institution",
    AbsoluteFetch: "/api/nexus/strata/institution/institution",
    RelativeFetch: "/api/nexus/strata/institution/institution",
    CurrentFetch: "/api/nexus/strata/institution/institution",
    DistinctFetch: "/api/nexus/strata/institution/institution",
    NominalFetch: "/api/nexus/strata/institution/institution",
    LiveFetch: "/api/nexus/strata/institution/institution",
  },
  School: {
    Store: "/api/nexus/strata/institution/school",
    Update: "/api/nexus/strata/institution/school",
    Delete: "/api/nexus/strata/institution/school",
    AbsoluteFetch: "/api/nexus/strata/institution/school",
    RelativeFetch: "/api/nexus/strata/institution/school",
    CurrentFetch: "/api/nexus/strata/institution/school",
    DistinctFetch: "/api/nexus/strata/institution/school",
    NominalFetch: "/api/nexus/strata/institution/school",
    LiveFetch: "/api/nexus/strata/institution/school",
  },
  Department: {
    Store: "/api/nexus/strata/institution/department",
    Update: "/api/nexus/strata/institution/department",
    Delete: "/api/nexus/strata/institution/department",
    AbsoluteFetch: "/api/nexus/strata/institution/department",
    RelativeFetch: "/api/nexus/strata/institution/department",
    CurrentFetch: "/api/nexus/strata/institution/department",
    DistinctFetch: "/api/nexus/strata/institution/department",
    NominalFetch: "/api/nexus/strata/institution/department",
    LiveFetch: "/api/nexus/strata/institution/department",
  },
  Division: {
    Store: "/api/nexus/strata/institution/division",
    Update: "/api/nexus/strata/institution/division",
    Delete: "/api/nexus/strata/institution/division",
    AbsoluteFetch: "/api/nexus/strata/institution/division",
    RelativeFetch: "/api/nexus/strata/institution/division",
    CurrentFetch: "/api/nexus/strata/institution/division",
    DistinctFetch: "/api/nexus/strata/institution/division",
    NominalFetch: "/api/nexus/strata/institution/division",
    LiveFetch: "/api/nexus/strata/institution/division",
  },
  Cohort: {
    Store: "/api/nexus/strata/institution/cohort",
    Update: "/api/nexus/strata/institution/cohort",
    Delete: "/api/nexus/strata/institution/cohort",
    AbsoluteFetch: "/api/nexus/strata/institution/cohort",
    RelativeFetch: "/api/nexus/strata/institution/cohort",
    CurrentFetch: "/api/nexus/strata/institution/cohort",
    DistinctFetch: "/api/nexus/strata/institution/cohort",
    NominalFetch: "/api/nexus/strata/institution/cohort",
    LiveFetch: "/api/nexus/strata/institution/cohort",
  },
  StrataClass: {
    Store: "/api/nexus/strata/institution/strataclass",
    Update: "/api/nexus/strata/institution/strataclass",
    Delete: "/api/nexus/strata/institution/strataclass",
    AbsoluteFetch: "/api/nexus/strata/institution/strataclass",
    RelativeFetch: "/api/nexus/strata/institution/strataclass",
    CurrentFetch: "/api/nexus/strata/institution/strataclass",
    DistinctFetch: "/api/nexus/strata/institution/strataclass",
    NominalFetch: "/api/nexus/strata/institution/strataclass",
    LiveFetch: "/api/nexus/strata/institution/strataclass",
  },
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

// Main service function
export const strataService = async <T = unknown, Payload = Record<string, unknown>>(
  strataType: StrataType,
  targetAction: StrataAction,
  payload?: Payload
): Promise<StrataResponse<T>> => {
  try {
    // console.log("🚨 strataService payload inspection:");
    Object.entries(payload ?? {}).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        // console.log(k, "→ array", v.map(x => x?.constructor?.name));
      } else {
        console.log(k, "→", v?.constructor?.name);
      }
    });

    // Determine HTTP method
    const methodMap: Record<StrataAction, "POST" | "PUT" | "DELETE" | "GET"> = {
      Store: "POST",
      Update: "PUT",
      Delete: "DELETE",
      AbsoluteFetch: "GET",
      RelativeFetch: "GET",
      CurrentFetch: "GET",
      DistinctFetch: "GET",
      NominalFetch: "GET",
      LiveFetch: "GET",
    };
    const method = methodMap[targetAction];

    // Determine route
    const baseRoute =
      targetAction === "AbsoluteFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=absolute`
        : targetAction === "CurrentFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=current`  
        : targetAction === "RelativeFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=relative`
        : targetAction === "DistinctFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=distinct`
        : targetAction === "NominalFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=nominal`
        : targetAction === "LiveFetch"
        ? `${ROUTE_MAP[strataType][targetAction]}?fetchtype=live`
        : ROUTE_MAP[strataType][targetAction];

    // Append payload as query params for GET (clean empty/null/undefined)
    const cleanPayload: Record<string, string> = {};
    if (payload && typeof payload === "object") {
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          cleanPayload[k] = String(v);
        }
      });
    }
    const searchParams = new URLSearchParams(cleanPayload).toString();
    const route =
      methodMap[targetAction] === "GET" && searchParams
        ? `${baseRoute}&${searchParams}`
        : baseRoute;
  
    // Session headers
    const sessionHeaders = renderSystemSessionHeaders();

    // 🔥 IMPROVED FILE DETECTION
    const hasFiles = payload && Object.values(payload).some((v) => {
      if (v instanceof File) return true;
      if (Array.isArray(v)) {
        return v.some(item => item instanceof File);
      }
      return false;
    });

    console.log(`🔍 [strataService] Has files? ${hasFiles}`);
    console.log(`🔍 [strataService] Method: ${method}`);

    let body: BodyInit | undefined;
    const headers: HeadersInit = {
      ...sessionHeaders,
    };

    // MULTIPART (FILES) ONLY FOR FILES
if (hasFiles && method !== "GET") {
  console.log("🔍 [strataService] Creating FormData for file upload");

  const formData = new FormData();

  // Only append actual File objects
  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
      console.log(`  📁 Appended single file: ${key} = ${value.name}`);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) formData.append(key, item);
      });
    }
    // Ignore non-file values entirely — metadata goes to JSON
  });

  // Create a JSON blob for metadata
  const metadata: Record<string, unknown> = {};
  Object.entries(payload ?? {}).forEach(([key, value]) => {
    if (!(value instanceof File) && !(Array.isArray(value) && value.some(v => v instanceof File))) {
      metadata[key] = value;
    }
  });

  // Attach metadata as JSON blob
  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));

  body = formData;
      
      // Log FormData contents for debugging
      console.log("🔍 [strataService] FormData entries:");
      for (const [key, val] of formData.entries()) {
        if (val instanceof File) {
          console.log(`  ${key}: File(${val.name}, ${val.size} bytes, ${val.type})`);
        } else {
          console.log(`  ${key}: ${val}`);
        }
      }
      
    // JSON (NO FILES)
    } else if (method !== "GET") {
      console.log("🔍 [strataService] Creating JSON payload");
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(payload ?? {});
      console.log("🔍 [strataService] JSON body:", body);
    }

    // console.log(`🔍 [strataService] Final headers:`, headers);
    // console.log(`🔍 [strataService] Route: ${route}`);
    // console.log(`🔍 [strataService] Body type: ${body?.constructor?.name}`);

    // Send request via internal API
    const result = await apiFetch<StrataResponse<T>>(route, {
      method,
      headers,
      body,
      credentials: "include",
    });

    console.log(`🌿 [strataService] ${strataType} -> ${targetAction}:`, result);
    return convertBackendKeysToCamel(result) as StrataResponse<T>;
  } catch (err: unknown) {
    console.error(`❌ [strataService] ${strataType} -> ${targetAction} failed:`, err);
    return { error: err instanceof Error ? err.message : "Unknown strata service error" };
  }
};

// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────






// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The End by B.L.S.M.A.C -  The Winds Chase US !
// ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────

