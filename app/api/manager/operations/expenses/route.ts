import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

// Collection name for operational expenses
const COLLECTION = "expenses" as const;

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getMongoClient();
  const db = client.db();

  const filter: Record<string, unknown> = {};
  const role = session.role?.toString().toLowerCase();
  if (role === "manager") {
    const userId = session.userId ?? (session.user as Record<string, unknown>)?.id;
    if (userId) filter.managerId = new ObjectId(String(userId));
  }

  const rows = await db.collection(COLLECTION).find(filter).sort({ createdAt: -1 }).toArray();
  const out = rows.map((r) => ({
    ...r,
    _id: String(r._id),
    createdAt: r.createdAt ? r.createdAt.toISOString() : null,
  }));
  return NextResponse.json(out);
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { type, amount, paid, description } = body || {};

  const amt = Number(amount) || 0;
  const p = Number(paid) || 0;
  const balance = Math.max(amt - p, 0);
  const status = p <= 0 ? "No Paid" : p < amt ? "Partial Paid" : "Full Paid";

  const doc: Record<string, unknown> = {
    type: type || "Other",
    amount: amt,
    paid: p,
    balance,
    status,
    description: description ?? "",
    managerId: session.userId ? new ObjectId(String(session.userId)) : undefined,
    createdAt: new Date(),
  };

  const client = await getMongoClient();
  const db = client.db();
  const res = await db.collection(COLLECTION).insertOne(doc);
  return NextResponse.json({ ok: true, id: String(res.insertedId) });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { id, type, amount, paid, description } = body || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const client = await getMongoClient();
  const db = client.db();

  const filter: Record<string, unknown> = { _id: new ObjectId(String(id)) };
  const role = session.role?.toString().toLowerCase();
  if (role === "manager" && session.userId) {
    filter.managerId = new ObjectId(String(session.userId));
  }

  const update: Record<string, unknown> = {};
  if (type !== undefined) update.type = type || "Other";
  if (amount !== undefined) update.amount = Number(amount) || 0;
  if (paid !== undefined) update.paid = Number(paid) || 0;
  if (description !== undefined) update.description = description ?? "";

  // If amount or paid changed, recompute balance and status
  if (update.amount !== undefined || update.paid !== undefined) {
    const existing = await db.collection(COLLECTION).findOne({ _id: new ObjectId(String(id)) });
    const a = (update.amount as number) ?? Number(existing?.amount ?? 0);
    const p2 = (update.paid as number) ?? Number(existing?.paid ?? 0);
    const bal = Math.max(a - p2, 0);
    update.balance = bal;
    update.status = p2 <= 0 ? "No Paid" : p2 < a ? "Partial Paid" : "Full Paid";
  }

  const res = await db.collection(COLLECTION).updateOne(filter, { $set: update });
  if (!res.matchedCount) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const client = await getMongoClient();
  const db = client.db();

  const filter: Record<string, unknown> = { _id: new ObjectId(String(id)) };
  const role = session.role?.toString().toLowerCase();
  if (role === "manager" && session.userId) {
    filter.managerId = new ObjectId(String(session.userId));
  }

  const res = await db.collection(COLLECTION).deleteOne(filter);
  if (!res.deletedCount) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
