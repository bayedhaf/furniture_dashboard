import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

// Employee shape reference
// { fullName, phone, role, department, salaryType, dailyRate?, weeklyRate?, startDate, status, address? }

export async function GET() {
  // Always return all employees (no 401, no role-based filter) per requirement to fetch all data
  const client = await getMongoClient();
  const db = client.db();

  const rows = await db.collection("employees").find({}).sort({ createdAt: -1 }).toArray();
  const out = rows.map((r) => ({
    id: String(r._id),
    fullName: String(r.fullName ?? ""),
    phone: String(r.phone ?? ""),
    role: String(r.role ?? ""),
    department: String(r.department ?? ""),
    salaryType: r.salaryType === "weekly" ? "weekly" : "daily",
    status: r.status === "inactive" ? "inactive" : "active",
    startDate: r.startDate instanceof Date ? r.startDate.toISOString().slice(0, 10) : String(r.startDate ?? ""),
  }));
  return NextResponse.json(out);
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { fullName, phone, role, department, salaryType, dailyRate, weeklyRate, startDate, status, address } = body || {};
  if (!fullName || !phone || !role || !department || !salaryType || !startDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const doc: Record<string, unknown> = {
    fullName,
    phone,
    role,
    department,
    salaryType: salaryType === "weekly" ? "weekly" : "daily",
    dailyRate: Number(dailyRate ?? 0),
    weeklyRate: Number(weeklyRate ?? 0),
    startDate: new Date(String(startDate)),
    status: status === "inactive" ? "inactive" : "active",
    address: address ?? "",
    managerId: session.userId ? new ObjectId(String(session.userId)) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const client = await getMongoClient();
  const db = client.db();
  const res = await db.collection("employees").insertOne(doc);
  return NextResponse.json({ ok: true, id: String(res.insertedId) });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { id, fullName, phone, role, department, salaryType, dailyRate, weeklyRate, startDate, status, address } = body || {};
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const client = await getMongoClient();
  const db = client.db();

  const filter: Record<string, unknown> = { _id: new ObjectId(String(id)) };
  const roleName = session.role?.toString().toLowerCase();
  if (roleName === "manager" && session.userId) {
    filter.managerId = new ObjectId(String(session.userId));
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (fullName !== undefined) update.fullName = fullName;
  if (phone !== undefined) update.phone = phone;
  if (role !== undefined) update.role = role;
  if (department !== undefined) update.department = department;
  if (salaryType !== undefined) update.salaryType = salaryType === "weekly" ? "weekly" : "daily";
  if (dailyRate !== undefined) update.dailyRate = Number(dailyRate ?? 0);
  if (weeklyRate !== undefined) update.weeklyRate = Number(weeklyRate ?? 0);
  if (startDate !== undefined) update.startDate = new Date(String(startDate));
  if (status !== undefined) update.status = status === "inactive" ? "inactive" : "active";
  if (address !== undefined) update.address = address ?? "";

  const res = await db.collection("employees").updateOne(filter, { $set: update });
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
  const roleName = session.role?.toString().toLowerCase();
  if (roleName === "manager" && session.userId) {
    filter.managerId = new ObjectId(String(session.userId));
  }

  const res = await db.collection("employees").deleteOne(filter);
  if (!res.deletedCount) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
