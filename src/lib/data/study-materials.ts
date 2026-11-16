export interface StudyDoc {
  id: string;
  title: string;
  price: number;
  formats: ("pdf" | "word")[];
}

export const NURSEFORD_SHOP_DOCS: StudyDoc[] = [
  { id: "rn-nursing", title: "RN Nursing Exams", price: 49, formats: ["pdf", "word"] },
  { id: "rn-exit", title: "RN Exit Exams", price: 49, formats: ["pdf", "word"] },
  { id: "lpn-nursing", title: "LPN Nursing Exams", price: 49, formats: ["pdf", "word"] },
  { id: "lpn-exit", title: "LPN Exit Exams", price: 49, formats: ["pdf", "word"] },
];

export const RHENIS_SHOP_DOCS = NURSEFORD_SHOP_DOCS;
