export const SELECTED_EXAM_STORAGE_KEY = "rhenis_dashboard_selection";

export const getStoredSelectedExam = (): string => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SELECTED_EXAM_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

export const setStoredSelectedExam = (slug: string) => {
  if (typeof window === "undefined") return;
  try {
    if (slug) {
      window.localStorage.setItem(SELECTED_EXAM_STORAGE_KEY, slug);
    } else {
      window.localStorage.removeItem(SELECTED_EXAM_STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable (private mode, etc.) — ignore
  }
};