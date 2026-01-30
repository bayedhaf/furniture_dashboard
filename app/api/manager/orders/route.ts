import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

// Shape expectations (for reference):
// order: { customer, item, category, quantity, unitPrice, status, notes, location?, createdAt }

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
		// optionally scope by locations if present
		// if (Array.isArray(session.locations) && session.locations.length) {
		//   filter.location = { $in: session.locations };
		// }
	}

	const rows = await db.collection("orders").find(filter).sort({ createdAt: -1 }).toArray();
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
	const { customer, item, category, quantity, unitPrice, status, notes, location, date, phone, advancePaid } = body || {};
	if (!customer || !item) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

	const qty = Number(quantity) || 0;
	const price = Number(unitPrice) || 0;

	// Manager restriction: location must be among allowed locations if provided
	const role = session.role?.toString().toLowerCase();
		const chosenLocation = location ?? (Array.isArray(session.locations) ? session.locations[0] : undefined);
	if (role === "manager") {
		const locs = Array.isArray(session.locations) ? session.locations : [];
		if (chosenLocation && locs.length && !locs.includes(chosenLocation)) {
			return NextResponse.json({ error: "Forbidden location" }, { status: 403 });
		}
	}

	const doc: Record<string, unknown> = {
		customer,
		item,
		category: category ?? "",
		quantity: qty,
		unitPrice: price,
		total: qty * price,
		status: status ?? "",
		notes: notes ?? "",
		phone: phone ?? "",
		advancePaid: Number(advancePaid ?? 0),
		location: chosenLocation ?? null,
		managerId: session.userId ? new ObjectId(String(session.userId)) : undefined,
		createdAt: date ? new Date(String(date)) : new Date(),
	};

	const client = await getMongoClient();
	const db = client.db();
	const res = await db.collection("orders").insertOne(doc);
	return NextResponse.json({ ok: true, id: String(res.insertedId) });
}

export async function PUT(request: Request) {
	const session = await getServerSession(authConfig);
	if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json().catch(() => ({}));
	const { id, customer, item, category, quantity, unitPrice, status, notes, location, date, phone, advancePaid } = body || {};
	if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

	const client = await getMongoClient();
	const db = client.db();

	const filter: Record<string, unknown> = { _id: new ObjectId(String(id)) };
	const role = session.role?.toString().toLowerCase();
	if (role === "manager" && session.userId) {
		filter.managerId = new ObjectId(String(session.userId));
	}

	const update: Record<string, unknown> = {};
	if (customer !== undefined) update.customer = customer;
	if (item !== undefined) update.item = item;
	if (category !== undefined) update.category = category;
	if (quantity !== undefined) update.quantity = Number(quantity) || 0;
	if (unitPrice !== undefined) update.unitPrice = Number(unitPrice) || 0;
	if (status !== undefined) update.status = status ?? "";
	if (notes !== undefined) update.notes = notes ?? "";
	if (location !== undefined) update.location = location;
	if (date !== undefined) update.createdAt = new Date(String(date));
	if (phone !== undefined) update.phone = phone ?? "";
	if (advancePaid !== undefined) update.advancePaid = Number(advancePaid ?? 0);

	// recompute total if quantity or unitPrice changed
	if (update.quantity !== undefined || update.unitPrice !== undefined) {
		const existing = await db.collection("orders").findOne({ _id: new ObjectId(String(id)) });
		const q = (update.quantity as number) ?? Number(existing?.quantity ?? 0);
		const p = (update.unitPrice as number) ?? Number(existing?.unitPrice ?? 0);
		update.total = q * p;
	}

	const res = await db.collection("orders").updateOne(filter, { $set: update });
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

	const res = await db.collection("orders").deleteOne(filter);
	if (!res.deletedCount) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
	return NextResponse.json({ ok: true });
}

