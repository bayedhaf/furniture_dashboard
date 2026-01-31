import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: employeeId } = await params;
  if (!employeeId) return NextResponse.json({ error: "Missing employee id" }, { status: 400 });

  const client = await getMongoClient();
  const db = client.db();

  const filter: Record<string, unknown> = { employeeId: new ObjectId(String(employeeId)) };
  const role = session.role?.toString().toLowerCase();
  if (role === "manager" && session.userId) {
    filter.managerId = new ObjectId(String(session.userId));
  }

  const rows = await db.collection("wages").find(filter).sort({ createdAt: -1 }).toArray();
  const out = rows.map((r) => ({
    id: String(r._id),
    salaryType: r.salaryType === "weekly" ? "weekly" : "daily",
    daysWorked: Number(r.daysWorked ?? 0),
    dailyRate: Number(r.dailyRate ?? 0),
    weeklyRate: Number(r.weeklyRate ?? 0),
    saturdayDate: r.saturdayDate ? String(r.saturdayDate) : undefined,
    saturdayBonus: r.saturdayBonus !== undefined ? Number(r.saturdayBonus) : undefined,
    advancePaid: Number(r.advancePaid ?? 0),
    gross: Number(r.gross ?? 0),
    balance: Number(r.balance ?? 0),
    status: String(r.status ?? "No Paid"),
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt ?? ""),
  }));
  return NextResponse.json(out);
}

export async function POST(req: Request, { params }: Params) {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: employeeId } = await params;
  if (!employeeId) return NextResponse.json({ error: "Missing employee id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const {
    salaryType,
    dailyRate,
    weeklyRate,
    daysWorked,
    saturdayDate,
    saturdayBonus,
    advancePaid,
    gross,
    balance,
    status,
  } = body || {};

  // minimal validation
  if (!salaryType) return NextResponse.json({ error: "Missing salaryType" }, { status: 400 });

  const doc: Record<string, unknown> = {
    employeeId: new ObjectId(String(employeeId)),
    managerId: session.userId ? new ObjectId(String(session.userId)) : undefined,
    salaryType: salaryType === "weekly" ? "weekly" : "daily",
    dailyRate: Number(dailyRate ?? 0),
    weeklyRate: Number(weeklyRate ?? 0),
    daysWorked: Number(daysWorked ?? 0),
    saturdayDate: saturdayDate ? String(saturdayDate) : undefined,
    saturdayBonus: saturdayBonus !== undefined ? Number(saturdayBonus) : undefined,
    advancePaid: Number(advancePaid ?? 0),
    gross: Number(gross ?? 0),
    balance: Number(balance ?? 0),
    status: String(status ?? "No Paid"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const client = await getMongoClient();
  const db = client.db();
  const res = await db.collection("wages").insertOne(doc);
  return NextResponse.json({ ok: true, id: String(res.insertedId) });
}
