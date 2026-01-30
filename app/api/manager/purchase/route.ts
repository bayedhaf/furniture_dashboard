import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

// GET: list purchases; managers only see their own
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

	const rows = await db.collection("purchases").find(filter).sort({ createdAt: -1 }).toArray();
	const out = rows.map((r) => ({
		...r,
		_id: String(r._id),
		createdAt: r.createdAt ? r.createdAt.toISOString() : null,
	}));
	return NextResponse.json(out);
}

// POST: create a purchase
export async function POST(request: Request) {
	const session = await getServerSession(authConfig);
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json().catch(() => ({}));
	const { item, category, supplier, quantity, unitPrice, date, status, notes } = body || {};

	if (!item || !supplier) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}

	const qty = Number(quantity) || 0;
	const price = Number(unitPrice) || 0;
	const doc: Record<string, unknown> = {
		item,
		category: category ?? "",
		supplier,
		quantity: qty,
		unitPrice: price,
		total: qty * price,
		status: status ?? "paid",
		notes: notes ?? "",
		managerId: session.userId ? new ObjectId(String(session.userId)) : undefined,
		createdAt: date ? new Date(String(date)) : new Date(),
	};

	const client = await getMongoClient();
	const db = client.db();
	const res = await db.collection("purchases").insertOne(doc);
	return NextResponse.json({ ok: true, id: String(res.insertedId) });
}

// PUT: update a purchase (managers restricted to their own)
export async function PUT(request: Request) {
	const session = await getServerSession(authConfig);
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json().catch(() => ({}));
	const { id, item, category, supplier, quantity, unitPrice, date, status, notes } = body || {};
	if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

	const client = await getMongoClient();
	const db = client.db();

	const filter: Record<string, unknown> = { _id: new ObjectId(String(id)) };
	const role = session.role?.toString().toLowerCase();
	if (role === "manager" && session.userId) {
		filter.managerId = new ObjectId(String(session.userId));
	}

	const update: Record<string, unknown> = {};
	if (item !== undefined) update.item = item;
	if (category !== undefined) update.category = category;
	if (supplier !== undefined) update.supplier = supplier;
	if (quantity !== undefined) update.quantity = Number(quantity) || 0;
	if (unitPrice !== undefined) update.unitPrice = Number(unitPrice) || 0;
	if (status !== undefined) update.status = status ?? "";
	if (notes !== undefined) update.notes = notes ?? "";
	if (date !== undefined) update.createdAt = new Date(String(date));

	// recompute total if quantity or unitPrice changed
	if (update.quantity !== undefined || update.unitPrice !== undefined) {
		const existing = await db.collection("purchases").findOne({ _id: new ObjectId(String(id)) });
		const q = (update.quantity as number) ?? Number(existing?.quantity ?? 0);
		const p = (update.unitPrice as number) ?? Number(existing?.unitPrice ?? 0);
		update.total = q * p;
	}

	const res = await db.collection("purchases").updateOne(filter, { $set: update });
	if (!res.matchedCount) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
	return NextResponse.json({ ok: true });
}

// DELETE: remove a purchase by id (managers restricted to their own)
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

	const res = await db.collection("purchases").deleteOne(filter);
	if (!res.deletedCount) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
	return NextResponse.json({ ok: true });
}

