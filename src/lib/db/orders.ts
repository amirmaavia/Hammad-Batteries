import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { STANDARD_DELIVERY_CHARGE, type StoreOrder } from "@/lib/ecommerce";

type OrderDocument = Omit<StoreOrder, "id" | "createdAt" | "shippedAt" | "paymentStatus" | "status"> & {
  _id?: ObjectId;
  paymentStatus?: StoreOrder["paymentStatus"];
  status: StoreOrder["status"] | "Paid";
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
};

const COLLECTION_NAME = "orders";

function normalizeStatus(status: StoreOrder["status"] | "Paid"): StoreOrder["status"] {
  return status === "Paid" ? "Pending" : status;
}

function defaultPaymentStatus(order: OrderDocument): StoreOrder["paymentStatus"] {
  if (order.paymentStatus) return order.paymentStatus;
  if (order.paymentMethod === "cod") return "COD";
  return order.status === "Paid" ? "Online Paid" : "Online Pending";
}

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
    deliveryCharge: order.deliveryCharge ?? STANDARD_DELIVERY_CHARGE,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: defaultPaymentStatus(order),
    stripePaymentId: order.stripePaymentId,
    status: normalizeStatus(order.status),
    createdAt: order.createdAt.toISOString(),
    shippedAt: order.shippedAt?.toISOString(),
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

export async function createOrder(order: Omit<StoreOrder, "id" | "createdAt" | "shippedAt">) {
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
  const updates: Partial<OrderDocument> = { status, updatedAt: new Date() };

  if (status === "Shipped") {
    updates.shippedAt = new Date();
  }

  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  const order = await collection.findOne({ _id: new ObjectId(id) });

  if (!order) {
    throw new Error("Order not found.");
  }

  return toStoreOrder(order);
}

export async function updateOrderPaymentStatus(id: string, paymentStatus: StoreOrder["paymentStatus"], stripePaymentId?: string) {
  const collection = await getCollection();
  const updates: Partial<OrderDocument> = { paymentStatus, updatedAt: new Date() };

  if (stripePaymentId) {
    updates.stripePaymentId = stripePaymentId;
  }

  await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  const order = await collection.findOne({ _id: new ObjectId(id) });

  if (!order) {
    throw new Error("Order not found.");
  }

  return toStoreOrder(order);
}
