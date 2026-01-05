import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI as string;
const adminEmail = process.env.ADMIN_EMAIL as string;
const adminPassword = process.env.ADMIN_PASSWORD as string;

if (!uri || !adminEmail || !adminPassword) {
  console.error("Missing MONGODB_URI, ADMIN_EMAIL, or ADMIN_PASSWORD env vars.");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const hashed = await bcrypt.hash(adminPassword, 10);
  const result = await db.collection("users").updateOne(
    { email: adminEmail },
    { $set: { email: adminEmail, password: hashed, role: "admin" } },
    { upsert: true }
  );
  const user = await db.collection("users").findOne({ email: adminEmail });
  await client.close();
  console.log("Admin user upserted:", adminEmail, "result:", {
    matchedCount: result.matchedCount,
    modifiedCount: result.modifiedCount,
    upsertedId: ("upsertedId" in result ? (result as { upsertedId?: unknown }).upsertedId : undefined),
  });
  console.log("Current admin doc:", user);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
