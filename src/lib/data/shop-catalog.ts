export interface ShopItem {
  id: string;
  title: string;
  examTag: string;
  format: "pdf" | "word";
  description: string;
  year: number;
  difficulty: "easy" | "medium" | "hard";
  price: number;
  rating: number;
  downloads: number;
  badge?: "Featured" | "Hot" | "Top Pick" | "New" | "Popular";
  locked: boolean;
}

export async function getShopCatalog(): Promise<ShopItem[]> {
  // TODO: replace with fetch(`${process.env.SKEW_LINE_API_BASE_URL}/shop/items`)
  // once client's .NET backend is ready
  return MOCK_CATALOG;
}

const MOCK_CATALOG: ShopItem[] = [
  {
    id: "rn-nursing-qbank",
    title: "RN Nursing Test Bank",
    examTag: "RN Nursing Exam",
    format: "pdf",
    description: "Comprehensive Registered Nurse question bank covering Med-Surg, Mental Health, Maternal-Newborn, and Fundamentals.",
    year: 2025,
    difficulty: "medium",
    price: 49,
    rating: 5,
    downloads: 1240,
    badge: "Featured",
    locked: true,
  },
  {
    id: "lpn-nursing-qbank",
    title: "LPN Nursing Test Bank",
    examTag: "LPN Nursing Exam",
    format: "pdf",
    description: "Extensive Practical Nurse question bank and clinical study materials covering core PN curriculum areas.",
    year: 2025,
    difficulty: "medium",
    price: 49,
    rating: 5,
    downloads: 980,
    badge: "Top Pick",
    locked: true,
  },
  {
    id: "rn-exit-exams",
    title: "RN Exit Exams (ATI & HESI)",
    examTag: "RN Exit Exams",
    format: "pdf",
    description: "Comprehensive RN exit exam practice questions and simulation materials modeled after ATI and HESI comprehensive predictors.",
    year: 2025,
    difficulty: "hard",
    price: 49,
    rating: 5,
    downloads: 1530,
    badge: "Hot",
    locked: true,
  },
  {
    id: "lpn-exit-exams",
    title: "LPN Exit Exams (ATI & HESI)",
    examTag: "LPN Exit Exams",
    format: "pdf",
    description: "Comprehensive LPN exit exam practice questions and study materials modeled after end-of-program exit evaluations.",
    year: 2025,
    difficulty: "hard",
    price: 49,
    rating: 5,
    downloads: 870,
    badge: "Popular",
    locked: true,
  },
];
