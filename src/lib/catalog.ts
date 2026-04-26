export type CatalogItem = {
  id: number;
  name: string;
  brand: string;
  subCategory: string;
  price: string;
  stock: string;
  image?: string;
};

export const DEFAULT_ITEMS: CatalogItem[] = [
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra Battery",
    brand: "Samsung",
    subCategory: "S Series",
    price: "Rs. 14,999",
    stock: "In Stock",
    image: "",
  },
  {
    id: 2,
    name: "Samsung Galaxy Note 20 Battery",
    brand: "Samsung",
    subCategory: "Note Series",
    price: "Rs. 10,500",
    stock: "In Stock",
    image: "",
  },
  {
    id: 3,
    name: "Samsung Galaxy A54 Battery",
    brand: "Samsung",
    subCategory: "A Series",
    price: "Rs. 8,999",
    stock: "In Stock",
    image: "",
  },
  {
    id: 4,
    name: "iPhone 15 Pro Max Battery",
    brand: "Apple",
    subCategory: "Pro Max Series",
    price: "Rs. 18,500",
    stock: "Out of Stock",
    image: "",
  },
];

export const CATALOG_STORAGE_KEY = "hammad-batteries-items";

export function loadCatalogItems(): CatalogItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_ITEMS;
  }

  const rawItems = window.localStorage.getItem(CATALOG_STORAGE_KEY);

  if (!rawItems) {
    return DEFAULT_ITEMS;
  }

  try {
    const parsedItems = JSON.parse(rawItems) as CatalogItem[];

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return DEFAULT_ITEMS;
    }

    return parsedItems.map(normalizeCatalogItem).filter(Boolean) as CatalogItem[];
  } catch {
    return DEFAULT_ITEMS;
  }
}

export function saveCatalogItems(items: CatalogItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(items));
}

function normalizeCatalogItem(item: CatalogItem): CatalogItem | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  return {
    id: Number(item.id),
    name: typeof item.name === "string" ? item.name : "",
    brand: typeof item.brand === "string" ? item.brand : "",
    subCategory: typeof item.subCategory === "string" ? item.subCategory : "",
    price: typeof item.price === "string" ? item.price : "",
    stock: typeof item.stock === "string" ? item.stock : "",
    image: typeof item.image === "string" ? item.image : "",
  };
}
