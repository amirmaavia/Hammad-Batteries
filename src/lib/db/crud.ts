import clientPromise from "@/lib/mongodb";
import { CatalogItemSchema } from "./models";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "catalog_items";

async function getCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<CatalogItemSchema>(COLLECTION_NAME);
}

// CREATE
export async function createItem(item: Omit<CatalogItemSchema, "_id">): Promise<string> {
  const collection = await getCollection();
  const result = await collection.insertOne({
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId.toString();
}

// READ - Get all items
export async function getAllItems(): Promise<CatalogItemSchema[]> {
  const collection = await getCollection();
  return collection.find({}).toArray();
}

// READ - Get single item by ID
export async function getItemById(id: string): Promise<CatalogItemSchema | null> {
  const collection = await getCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

// READ - Get items by brand
export async function getItemsByBrand(brand: string): Promise<CatalogItemSchema[]> {
  const collection = await getCollection();
  return collection.find({ brand }).toArray();
}

// READ - Get items by sub-category
export async function getItemsBySubCategory(subCategory: string): Promise<CatalogItemSchema[]> {
  const collection = await getCollection();
  return collection.find({ subCategory }).toArray();
}

// UPDATE
export async function updateItem(
  id: string,
  updates: Partial<Omit<CatalogItemSchema, "_id">>
): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    }
  );
  return result.modifiedCount > 0;
}

// DELETE
export async function deleteItem(id: string): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// DELETE - Delete all items
export async function deleteAllItems(): Promise<number> {
  const collection = await getCollection();
  const result = await collection.deleteMany({});
  return result.deletedCount;
}

// BULK INSERT - for initial data loading
export async function insertManyItems(items: Omit<CatalogItemSchema, "_id">[]): Promise<string[]> {
  const collection = await getCollection();
  const itemsWithTimestamps = items.map((item) => ({
    ...item,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  const result = await collection.insertMany(itemsWithTimestamps);
  return Object.values(result.insertedIds).map((id) => id.toString());
}

// SEARCH - Search items by name or brand
export async function searchItems(query: string): Promise<CatalogItemSchema[]> {
  const collection = await getCollection();
  return collection
    .find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
      ],
    })
    .toArray();
}
