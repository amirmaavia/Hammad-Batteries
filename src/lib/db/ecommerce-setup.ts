import clientPromise from "@/lib/mongodb";

const COLLECTIONS = [
  "users",
  "catalog_items",
  "orders",
  "discounts",
  "carts",
  "payments",
  "addresses",
];

export async function setupEcommerceCollections() {
  const client = await clientPromise;
  const db = client.db();
  const existingCollections = new Set((await db.listCollections().toArray()).map((collection) => collection.name));
  const created: string[] = [];

  for (const collection of COLLECTIONS) {
    if (!existingCollections.has(collection)) {
      await db.createCollection(collection);
      created.push(collection);
    }
  }

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("catalog_items").createIndex({ name: "text", brand: "text", subCategory: "text" });
  await db.collection("orders").createIndex({ userId: 1, createdAt: -1 });
  await db.collection("orders").createIndex({ status: 1, createdAt: -1 });
  await db.collection("discounts").createIndex({ code: 1 }, { unique: true });
  await db.collection("carts").createIndex({ userId: 1 }, { unique: true });
  await db.collection("payments").createIndex({ orderId: 1 });
  await db.collection("addresses").createIndex({ userId: 1 });

  return {
    collections: COLLECTIONS,
    created,
  };
}
