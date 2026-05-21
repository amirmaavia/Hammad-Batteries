import { ObjectId } from "mongodb";
import { API_ROUTES } from "./api-routes";

export type CatalogItem = {
  _id?: string | ObjectId;
  id?: number;
  name: string;
  brand: string;
  subCategory: string;
  description?: string;
  defaultPrice: string;
  originalPrice: string;
  stock: string;
  image?: string;
  imageFit?: "fit" | "fill" | "zoom";
};

export const DEFAULT_ITEMS: CatalogItem[] = [
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra Battery",
    brand: "Samsung",
    subCategory: "S Series",
    description: "",
    originalPrice: "",
    defaultPrice: "Rs. 14,999",
    stock: "In Stock",
    image: "",
    imageFit: "fit",
  },
  {
    id: 2,
    name: "Samsung Galaxy Note 20 Battery",
    brand: "Samsung",
    subCategory: "Note Series",
    description: "",
    originalPrice: "Rs. 10,500",
    defaultPrice: "Rs. 10,500",
    stock: "In Stock",
    image: "",
    imageFit: "fit",
  }
];

// Database-backed catalog functions
export async function loadCatalogItems(): Promise<CatalogItem[]> {
  try {
    const response = await fetch(API_ROUTES.items);
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

export async function loadCatalogItemsById(id: string): Promise<CatalogItem | null> {
  try {
    const response = await fetch(`${API_ROUTES.items}/${id}`);
    if (!response.ok) {
      console.error("Failed to load item from database");
      return null;
    }
    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error("Error loading catalog item:", error);
    return null;
  }
}

export async function saveCatalogItems(items: CatalogItem): Promise<boolean> {
  try {
    // Create new items not in database
    // for (const item of items) {
      if (!items._id && !items.id) {
        const response = await fetch(API_ROUTES.items, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: items.name,
            brand: items.brand,
            subCategory: items.subCategory,
            description: items.description || "",
            defaultPrice: items.defaultPrice,
            originalPrice: items.originalPrice,
            stock: items.stock,
            image: items.image || "",
            imageFit: items.imageFit || "fit",
          }),
        });
        if (!response.ok) {
          console.error("Failed to create items");
          return false;
        }
      } else if (items._id) {
        // Update existing items
        const response = await fetch(`${API_ROUTES.items}/${items._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: items.name,
            brand: items.brand,
            subCategory: items.subCategory,
            description: items.description || "",
            defaultPrice: items.defaultPrice,
            originalPrice: items.originalPrice,
            stock: items.stock,
            image: items.image || "",
            imageFit: items.imageFit || "fit",
          }),
        });
        if (!response.ok) {
          console.error("Failed to update item");
          return false;
        }
      // }/
    }
    return true;
  } catch (error) {
    console.error("Error saving catalog items:", error);
    return false;
  }
}

export async function deleteItemFromCatalog(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_ROUTES.items}/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting item:", error);
    return false;
  }
}
