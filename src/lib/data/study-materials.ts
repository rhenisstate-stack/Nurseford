export interface StudyDoc {
  id: string;
  title: string;
  price: number;
  formats: ("pdf" | "word")[];
}

export const PUBNURSE_SHOP_DOCS: StudyDoc[] = [];
