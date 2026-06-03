import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { StoreOrder } from "@/lib/ecommerce";

type OrderDocument = Omit<StoreOrder, "id" | "createdAt"> & {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION_NAME = "orders";

function toStoreOrder(order: OrderDocument): StoreOrder {
  return {
    id: order._id?.toString() || "",
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress,
    deliveryCity: order.deliveryCity,
    items: order.items,
    subtotal: order.subtotal,
    discountCode: order.discountCode,
    discountAmount: order.discountAmount,
    total: order.total,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  };
}

async function getCollection() {
  const client = await clientPromise;
  return client.db().collection<OrderDocument>(COLLECTION_NAME);
}

export async function getAllOrders() {
  const collection = await getCollection();
  const orders = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return orders.map(toStoreOrder);
}

export async function getOrdersByUser(userId: string) {
  const collection = await getCollection();
  const orders = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  return orders.map(toStoreOrder);
}

export async function createOrder(order: Omit<StoreOrder, "id" | "createdAt">) {
  const collection = await getCollection();
  const now = new Date();
  const document: OrderDocument = {
    ...order,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(document);
  return toStoreOrder({ ...document, _id: result.insertedId });
}

export async function updateOrderStatus(id: string, status: StoreOrder["status"]) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  );
  const order = await collection.findOne({ _id: new ObjectId(id) });

  if (!order) {
    throw new Error("Order not found.");
  }

  return toStoreOrder(order);
}
