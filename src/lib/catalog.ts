import { ObjectId } from "mongodb";

export type CatalogItem = {
  _id?: string | ObjectId;
  id?: number;
  name: string;
  brand: string;
  subCategory: string;
  defaultPrice: string;
  originalPrice: string;
  stock: string;
  image?: string;
};

export const DEFAULT_ITEMS: CatalogItem[] = [
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra Battery",
    brand: "Samsung",
    subCategory: "S Series",
    originalPrice: "",
    defaultPrice: "Rs. 14,999",
    stock: "In Stock",
    image: "",
  },
  {
    id: 2,
    name: "Samsung Galaxy Note 20 Battery",
    brand: "Samsung",
    subCategory: "Note Series",
    originalPrice: "Rs. 10,500",
    defaultPrice: "Rs. 10,500",
    stock: "In Stock",
    image: "",
  }
];

// Database-backed catalog functions
export async function loadCatalogItems(): Promise<CatalogItem[]> {
  try {
    const response = await fetch("/api/items");
    if (!response.ok) {
      console.error("Failed to load items from database");
      return DEFAULT_ITEMS;
    }
    const result = await response.json();
    return result.data || DEFAULT_ITEMS;
  } catch (error) {
    console.error("Error loading catalog items:", error);
    return DEFAULT_ITEMS;
  }
}

export async function saveCatalogItems(items: CatalogItem[]): Promise<boolean> {
  try {
    // Create new items not in database
    for (const item of items) {
      if (!item._id && !item.id) {
        const response = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            brand: item.brand,
            subCategory: item.subCategory,
            defaultPrice: item.defaultPrice,
            originalPrice: item.originalPrice,
            stock: item.stock,
            image: item.image || "",
          }),
        });
        if (!response.ok) {
          console.error("Failed to create item");
          return false;
        }
      } else if (item._id) {
        // Update existing item
        const response = await fetch(`/api/items/${item._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            brand: item.brand,
            subCategory: item.subCategory,
            defaultPrice: item.defaultPrice,
            originalPrice: item.originalPrice,
            stock: item.stock,
            image: item.image || "",
          }),
        });
        if (!response.ok) {
          console.error("Failed to update item");
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    console.error("Error saving catalog items:", error);
    return false;
  }
}

export async function deleteItemFromCatalog(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/items/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting item:", error);
    return false;
  }
}
