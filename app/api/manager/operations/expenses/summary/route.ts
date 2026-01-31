import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

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

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch all matching docs once; dataset expected small to moderate.
  const rows = await db.collection(COLLECTION).find(filter).toArray();
  let totalExpenses = 0;
  let weeklyExpenses = 0;
  let monthlyExpenses = 0;
  let unpaidBalance = 0;

  for (const r of rows) {
    const amt = Number(r.amount ?? 0);
    const bal = Number(r.balance ?? 0);
    const createdAt: Date | null = r.createdAt instanceof Date ? r.createdAt : (r.createdAt ? new Date(r.createdAt) : null);
    totalExpenses += amt;
    unpaidBalance += bal;
    if (createdAt) {
      if (createdAt >= startOfWeek) weeklyExpenses += amt;
      if (createdAt >= startOfMonth) monthlyExpenses += amt;
    }
  }

  return NextResponse.json({ totalExpenses, weeklyExpenses, monthlyExpenses, unpaidBalance });
}
