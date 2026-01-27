import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

type SessionWithUserId = {
  userId?: string;
};

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const userId = (session as unknown as SessionWithUserId)?.userId;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await getMongoClient();
  const db = client.db();
  let isAdmin = false;
  // Allow env-admin by email
  const adminEmail = process.env.ADMIN_EMAIL;
  if (session?.user?.email && adminEmail && session.user.email === adminEmail) {
    isAdmin = true;
  }
  // Fallback to DB role check if we have a userId from session
  if (!isAdmin && userId) {
    const currentUser = await db
      .collection<{ _id: ObjectId; role?: string }>("users")
      .findOne({ _id: new ObjectId(userId) });
    if (currentUser?.role === "admin") {
      isAdmin = true;
    }
  }
  if (!isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { email, password, name, phone, locations } = body || {};
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const normalizedEmail = String(email).trim().toLowerCase();

  // Reject duplicate emails (case-insensitive)
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const existing = await db
    .collection("users")
    .findOne({ email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 409 });
  }

  // Build insert document
  const doc: {
    email: string;
    role: string;
    name: string;
    phone?: string;
    locations?: string[];
    password?: string;
  } = {
    email: normalizedEmail,
    role: "manager",
    name: typeof name === "string" && name.trim() ? name.trim() : normalizedEmail,
  };

  if (typeof phone === "string" && phone.trim()) {
    doc.phone = phone.trim();
  }
  if (Array.isArray(locations)) {
    doc.locations = locations.filter((l: unknown) => typeof l === "string");
  }
  if (typeof password === "string" && password.length >= 6) {
    const hashed = await bcrypt.hash(password, 10);
    doc.password = hashed;
  }

  await db.collection("users").insertOne(doc);

  return NextResponse.json({ ok: true });
}
