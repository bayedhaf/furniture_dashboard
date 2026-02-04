import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.role?.toString().toLowerCase();
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const client = await getMongoClient();
  const db = client.db();
  const rows = await db
    .collection("users")
    .find({}, { projection: { name: 1, locations: 1 } })
    .toArray();
  const out = rows.map((u: any) => ({ id: String(u._id), name: String(u.name ?? ""), locations: Array.isArray(u.locations) ? u.locations : [] }));
  return NextResponse.json(out);
}
