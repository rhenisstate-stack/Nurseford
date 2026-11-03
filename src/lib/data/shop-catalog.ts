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
  return [];
}
