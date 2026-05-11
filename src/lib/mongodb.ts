import { MongoClient, type MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

const options: MongoClientOptions = {
  maxPoolSize: 10,
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri, options);
const clientPromise: Promise<MongoClient> =
  process.env.NODE_ENV === "development"
    ? global._mongoClientPromise ?? (global._mongoClientPromise = client.connect())
    : client.connect();

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    console.log("✅ MongoDB connected successfully to:", uri);
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    return false;
  }
}

export default clientPromise;
