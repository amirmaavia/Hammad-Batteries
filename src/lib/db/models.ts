import { ObjectId } from "mongodb";

export interface CatalogItemSchema {
  _id?: ObjectId;
  name: string;
  brand: string;
  subCategory: string;
  description?: string;
  originalPrice: string;
  defaultPrice: string;
  stock: string;
  image?: string;
  images?: string[];
  video?: string;
  videoId?: string;
  featured?: boolean;
  imageFit?: "fit" | "fill" | "zoom";
  createdAt?: Date;
  updatedAt?: Date;
}

export const catalogItemSchema = {
  bsonType: "object",
  required: ["name", "brand", "subCategory", "price", "stock"],
  properties: {
    _id: { bsonType: "objectId" },
    name: { bsonType: "string", description: "Product name" },
    brand: { bsonType: "string", description: "Brand name" },
    subCategory: { bsonType: "string", description: "Sub category" },
    description: { bsonType: "string", description: "Product description" },
    originalPrice: { bsonType: "string", description: "Original price in Rs." },
    defaultPrice: { bsonType: "string", description: "Default price in Rs." },
    stock: { bsonType: "string", description: "Stock status" },
    image: { bsonType: "string", description: "Image URL" },
    images: {
      bsonType: "array",
      description: "Product gallery image URLs",
      items: { bsonType: "string" },
    },
    video: { bsonType: "string", description: "Product video URL or data URL" },
    videoId: { bsonType: "string", description: "Linked product video ID" },
    featured: { bsonType: "bool", description: "Show product in featured sections" },
    imageFit: { bsonType: "string", description: "Product card image sizing" },
    createdAt: { bsonType: "date", description: "Creation timestamp" },
    updatedAt: { bsonType: "date", description: "Last update timestamp" },
  },
};

export interface ProductVideoSchema {
  _id?: ObjectId;
  productId?: string;
  productName: string;
  data: string;
  createdAt?: Date;
  updatedAt?: Date;
}
