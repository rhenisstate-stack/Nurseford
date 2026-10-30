export interface StudyDoc {
  id: string;
  title: string;
  price: number;
  formats: ("pdf" | "word")[];
}

export const ATI_TEAS_SHOP_DOCS: StudyDoc[] = [
  { id: "science", title: "TEAS 7 Prep - Science", price: 49, formats: ["pdf", "word"] },
  { id: "english", title: "TEAS 7 Prep - English", price: 49, formats: ["pdf", "word"] },
  { id: "reading", title: "TEAS 7 Prep - Reading", price: 49, formats: ["pdf", "word"] },
  { id: "math", title: "TEAS 7 Prep - Math", price: 49, formats: ["pdf", "word"] },
  { id: "comprehensive", title: "TEAS 7 Prep - Comprehensive", price: 49, formats: ["pdf", "word"] },
];

export const HESI_A2_SHOP_DOCS: StudyDoc[] = [
  { id: "biology", title: "HESI-A2 - Biology", price: 49, formats: ["pdf", "word"] },
  { id: "grammar", title: "HESI-A2 - Grammar", price: 49, formats: ["pdf", "word"] },
  { id: "vocabulary", title: "HESI-A2 - Vocabulary", price: 49, formats: ["pdf", "word"] },
  { id: "math", title: "HESI-A2 - Math", price: 49, formats: ["pdf", "word"] },
  { id: "reading-comprehension", title: "HESI-A2 - Reading Comprehension", price: 49, formats: ["pdf", "word"] },
  { id: "anatomy-physiology", title: "HESI-A2 - Anatomy & Physiology", price: 49, formats: ["pdf", "word"] },
];

export const NURSEFORD_SHOP_DOCS: StudyDoc[] = [
  { id: "rn-nursing", title: "RN Nursing Test Bank", price: 49, formats: ["pdf", "word"] },
  { id: "lpn-nursing", title: "LPN Nursing Test Bank", price: 49, formats: ["pdf", "word"] },
  { id: "rn-exit", title: "RN Exit Exams", price: 49, formats: ["pdf", "word"] },
  { id: "lpn-exit", title: "LPN Exit Exams", price: 49, formats: ["pdf", "word"] },
];
export const RHENIS_SHOP_DOCS = NURSEFORD_SHOP_DOCS;
