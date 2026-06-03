import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { StoreUser, UserRole } from "@/lib/ecommerce";
import { createHash } from "crypto";

type UserDocument = {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  address?: string;
  city?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};

const COLLECTION_NAME = "users";

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function toStoreUser(user: UserDocument): StoreUser {
  return {
    id: user._id?.toString() || "",
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

async function getCollection() {
  const client = await clientPromise;
  return client.db().collection<UserDocument>(COLLECTION_NAME);
}

export async function getAllUsers() {
  const collection = await getCollection();
  const users = await collection.find({}).sort({ createdAt: 1 }).toArray();
  return users.map(toStoreUser);
}

export async function getUserById(id: string) {
  const collection = await getCollection();
  const user = await collection.findOne({ _id: new ObjectId(id) });
  return user ? toStoreUser(user) : null;
}

export async function createUser(name: string, email: string, password: string) {
  const collection = await getCollection();
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await collection.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const now = new Date();
  const user: UserDocument = {
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    phone: "",
    address: "",
    city: "",
    role: "user",
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(user);
  return toStoreUser({ ...user, _id: result.insertedId });
}

export async function loginUserByPassword(email: string, password: string) {
  const collection = await getCollection();
  const user = await collection.findOne({
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword(password),
  });

  if (!user) {
    throw new Error("Wrong email or password.");
  }

  return toStoreUser(user);
}

export async function updateUser(id: string, updates: Partial<Pick<StoreUser, "name" | "phone" | "address" | "city" | "role">>) {
  const collection = await getCollection();
  const cleanUpdates = {
    ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
    ...(updates.phone !== undefined ? { phone: updates.phone.trim() } : {}),
    ...(updates.address !== undefined ? { address: updates.address.trim() } : {}),
    ...(updates.city !== undefined ? { city: updates.city.trim() } : {}),
    ...(updates.role !== undefined ? { role: updates.role } : {}),
    updatedAt: new Date(),
  };

  await collection.updateOne({ _id: new ObjectId(id) }, { $set: cleanUpdates });
  const updatedUser = await collection.findOne({ _id: new ObjectId(id) });

  if (!updatedUser) {
    throw new Error("User not found.");
  }

  return toStoreUser(updatedUser);
}
