import { ObjectId } from "mongodb";

export interface CatalogItemSchema {
  _id?: ObjectId;
  name: string;
  brand: string;
  subCategory: string;
  originalPrice: string;
  defaultPrice: string;
  stock: string;
  image?: string;
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
    originalPrice: { bsonType: "string", description: "Original price in Rs." },
    defaultPrice: { bsonType: "string", description: "Default price in Rs." },
    stock: { bsonType: "string", description: "Stock status" },
    image: { bsonType: "string", description: "Image URL" },
    createdAt: { bsonType: "date", description: "Creation timestamp" },
    updatedAt: { bsonType: "date", description: "Last update timestamp" },
  },
};
