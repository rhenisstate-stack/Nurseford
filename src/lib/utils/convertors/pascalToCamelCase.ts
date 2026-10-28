/**
 * Converts PascalCase string to camelCase
 * Example: UserName -> userName
 */
export const pascalToCamel = (str: string): string => {
  if (!str) return str;
  if (str[0] === str[0].toLowerCase()) return str;
  return str[0].toLowerCase() + str.slice(1);
};

/**
 * Recursively converts object keys from PascalCase to camelCase
 */
export const convertKeysToCamel = <T>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamel(item)) as unknown as T;
  } else if (obj !== null && typeof obj === "object") {
    const entries = Object.entries(obj).map(([key, value]) => [
      pascalToCamel(key),
      convertKeysToCamel(value),
    ]);
    return Object.fromEntries(entries) as T;
  }
  return obj;
};

/**
 * Conditionally convert keys only for dotnet backend
 */
const backend = process.env.SKEW_LINE_ACTIVE_BACKEND || "dotnet";

export const convertBackendKeysToCamel = <T>(obj: T): T => {
  if (backend === "dotnet") {
    return convertKeysToCamel(obj);
  }
  return obj;
};
