import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getMongoClient();
  const db = client.db();

  // If manager, restrict to their sales (by managerId) or by location
  const filter: Record<string, unknown> = {};
  const role = session.role?.toString().toLowerCase();
  if (role === "manager") {
  const userId = session.userId ?? (session.user as Record<string, unknown>)?.id;
    if (userId) filter.managerId = new ObjectId(String(userId));
    else if (Array.isArray(session.locations) && session.locations.length)
      filter.location = { $in: session.locations };
  }

  const rows = await db.collection("sales").find(filter).sort({ createdAt: -1 }).toArray();
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
  const { name, category, price, quantity, description, status, location, date } = body || {};
  if (!name || !category) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const client = await getMongoClient();
  const db = client.db();

  // Manager restriction: location must be one the manager has access to
  const role = session.role?.toString().toLowerCase();
  if (role === "manager") {
    const locs = Array.isArray(session.locations) ? session.locations : [];
    const chosen = location ?? locs[0];
    if (!chosen || (locs.length && !locs.includes(chosen))) {
      return NextResponse.json({ error: "Forbidden location" }, { status: 403 });
    }
  }

  const doc: Record<string, unknown> = {
    name,
    category,
    price: Number(price) || 0,
    quantity: Number(quantity) || 0,
    description: description ?? "",
    status: status ?? "",
    total: (Number(price) || 0) * (Number(quantity) || 0),
    location: location ?? (Array.isArray(session.locations) ? session.locations[0] : null),
    managerId: session.userId ? new ObjectId(String(session.userId)) : undefined,
    createdAt: date ? new Date(String(date)) : new Date(),
  };

  const res = await db.collection("sales").insertOne(doc);
  return NextResponse.json({ ok: true, id: String(res.insertedId) });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const { id, name, category, price, quantity, description, status, location, date } = body || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const client = await getMongoClient();
  const db = client.db();

  // Restrict managers to their own documents
  const filter: Record<string, unknown> = { _id: new ObjectId(String(id)) };
  const role = session.role?.toString().toLowerCase();
  if (role === "manager" && session.userId) {
    filter.managerId = new ObjectId(String(session.userId));
  }

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (category !== undefined) update.category = category;
  if (price !== undefined) update.price = Number(price) || 0;
  if (quantity !== undefined) update.quantity = Number(quantity) || 0;
  if (description !== undefined) update.description = description ?? "";
  if (status !== undefined) update.status = status ?? "";
  if (location !== undefined) update.location = location;
  if (date !== undefined) update.createdAt = new Date(String(date));
  // recompute total if price/quantity changed
  if (update.price !== undefined || update.quantity !== undefined) {
    const p = (update.price as number) ?? undefined;
    const q = (update.quantity as number) ?? undefined;
    if (p !== undefined || q !== undefined) {
      // need existing doc for missing fields
      const existing = await db.collection("sales").findOne({ _id: new ObjectId(String(id)) });
      const priceVal = p ?? Number(existing?.price ?? 0);
      const qtyVal = q ?? Number(existing?.quantity ?? 0);
      update.total = priceVal * qtyVal;
    }
  }

  const res = await db.collection("sales").updateOne(filter, { $set: update });
  if (!res.matchedCount) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
