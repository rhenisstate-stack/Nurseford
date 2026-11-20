export interface StudyDoc {
  id: string;
  title: string;
  price: number;
  formats: ("pdf" | "word")[];
}

export const NURSEFORD_SHOP_DOCS: StudyDoc[] = [];
