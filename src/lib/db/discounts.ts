import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { StoreDiscount } from "@/lib/ecommerce";

type DiscountDocument = Omit<StoreDiscount, "id" | "createdAt"> & {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION_NAME = "discounts";

function toStoreDiscount(discount: DiscountDocument): StoreDiscount {
  return {
    id: discount._id?.toString() || "",
    code: discount.code,
    type: discount.type,
    value: discount.value,
    active: discount.active,
    createdAt: discount.createdAt.toISOString(),
  };
}

async function getCollection() {
  const client = await clientPromise;
  return client.db().collection<DiscountDocument>(COLLECTION_NAME);
}

export async function getAllDiscounts() {
  const collection = await getCollection();
  const discounts = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return discounts.map(toStoreDiscount);
}

export async function createDiscount(discount: Omit<StoreDiscount, "id" | "createdAt">) {
  const collection = await getCollection();
  const now = new Date();
  const document: DiscountDocument = {
    ...discount,
    code: discount.code.trim().toUpperCase(),
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return toStoreDiscount({ ...document, _id: result.insertedId });
}

export async function updateDiscount(id: string, updates: Partial<Omit<StoreDiscount, "id" | "createdAt">>) {
  const collection = await getCollection();
  const cleanUpdates = {
    ...updates,
    ...(updates.code ? { code: updates.code.trim().toUpperCase() } : {}),
    updatedAt: new Date(),
  };

  await collection.updateOne({ _id: new ObjectId(id) }, { $set: cleanUpdates });
  const discount = await collection.findOne({ _id: new ObjectId(id) });

  if (!discount) {
    throw new Error("Discount not found.");
  }

  return toStoreDiscount(discount);
}

export async function deleteDiscount(id: string) {
  const collection = await getCollection();
  await collection.deleteOne({ _id: new ObjectId(id) });
}
