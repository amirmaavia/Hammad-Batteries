import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import type { ProductVideoSchema } from "./models";

const COLLECTION_NAME = "product_videos";

async function getCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<ProductVideoSchema>(COLLECTION_NAME);
}

export async function createProductVideo(video: Omit<ProductVideoSchema, "_id">): Promise<string> {
  const collection = await getCollection();
  const result = await collection.insertOne({
    ...video,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function getProductVideoById(id: string): Promise<ProductVideoSchema | null> {
  const collection = await getCollection();
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function deleteProductVideo(id: string): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
