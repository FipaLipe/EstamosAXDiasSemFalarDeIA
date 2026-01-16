// lib/mongodb.ts
import { MongoClient, type MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the connection across HMR
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise =
      globalWithMongo._mongoClient.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client for each cold start
  // But reuse it within the same instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
