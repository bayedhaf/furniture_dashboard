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
  const { email, password, name } = body || {};
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  await db.collection("users").updateOne(
    { email },
    { $setOnInsert: { email, password: hashed, role: "manager", name: name ?? email } },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
