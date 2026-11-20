import { useEffect, useRef } from "react";

export const CLEAR_QUESTION_EVENT = "exam:question:clear";

// Question components call this with their own reset logic
export function useClearOnEvent(questionId: number, onClear: () => void) {
  const ref = useRef(onClear);
  ref.current = onClear;

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ questionId: number }>).detail?.questionId;
      if (id === questionId) ref.current();
    };
    window.addEventListener(CLEAR_QUESTION_EVENT, handler);
    return () => window.removeEventListener(CLEAR_QUESTION_EVENT, handler);
  }, [questionId]);
}