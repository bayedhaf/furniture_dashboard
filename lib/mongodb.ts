import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

// Use a global cached client to avoid creating multiple connections in dev
declare global {
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;
if (!global._mongoClient) {
  client = new MongoClient(uri);
  global._mongoClient = client;
} else {
  client = global._mongoClient;
}

export async function getMongoClient(): Promise<MongoClient> {
  // Connect if not already connected
  // In modern drivers, .topology is internal; we just attempt connect safely.
  await client.connect();
  return client;
}
