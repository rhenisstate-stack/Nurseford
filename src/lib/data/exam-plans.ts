export interface ExamPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  durationDays: number;
  badge?: string;
  ctaLabel: string;
  features: string[];
  excludedFeatures?: string[];
}

export async function getExamPlans(_examId: string): Promise<ExamPlan[]> {
  return [];
}
