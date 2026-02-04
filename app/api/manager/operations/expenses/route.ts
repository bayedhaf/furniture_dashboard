import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Collection name for operational expenses
const COLLECTION = "expenses" as const;

export async function GET() {
  // Return all expenses for reporting (no auth filter)
  const client = await getMongoClient();
  const db = client.db();
  const rows = await db.collection(COLLECTION).find({}).sort({ createdAt: -1 }).toArray();
  const out = rows.map((r) => {
    const title = String((r as Record<string, unknown>).title ?? (r as Record<string, unknown>).name ?? "");
    const amount = Number((r as Record<string, unknown>).amount ?? (r as Record<string, unknown>).cost ?? 0);
    const category = String((r as Record<string, unknown>).category ?? (r as Record<string, unknown>).type ?? "");
    const date = r.createdAt ? r.createdAt.toISOString().slice(0, 10) : String((r as Record<string, unknown>).date ?? "");
    const location = String((r as Record<string, unknown>).location ?? (r as Record<string, unknown>).department ?? "");
    const managerIdVal = (r as Record<string, unknown>).managerId;
    const managerId = managerIdVal ? String(managerIdVal) : undefined;
    const note = String((r as Record<string, unknown>).note ?? (r as Record<string, unknown>).description ?? "");
    return {
      _id: String(r._id),
      title,
      amount,
      category,
      date,
      location,
      managerId,
      note,
    };
  });
  return NextResponse.json(out);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const client = await getMongoClient();
  const db = client.db();
  const res = await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(String(id)) });
  if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// Other methods (POST/PUT/DELETE) can be implemented later as needed.

// PUT/DELETE omitted for reporting-only endpoint.

// DELETE omitted for reporting-only endpoint.
