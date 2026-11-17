export interface SampleQuestion {
  id: string;
  track: "RN Nursing" | "LPN Nursing" | "Exit Exam";
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  rationale: string;
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [];
