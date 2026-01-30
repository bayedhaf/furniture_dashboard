import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authConfig } from "@/lib/auth";
import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
  const session = await getServerSession(authConfig);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await getMongoClient();
  const db = client.db();

  // Scope to manager if applicable
  const role = session.role?.toString().toLowerCase();
  const match: Record<string, unknown> = {};
  if (role === "manager") {
    const userId = session.userId ?? (session.user as Record<string, unknown>)?.id;
    if (userId) match.managerId = new ObjectId(String(userId));
    // If you want to scope by locations, uncomment and ensure orders have location
    // if (Array.isArray(session.locations) && session.locations.length) {
    //   match.location = { $in: session.locations };
    // }
  }

  // Compute time ranges
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);

  // Helper to sum fields
  const sum = (arr: Array<Record<string, unknown>>, field: string) =>
    arr.reduce((acc, x) => acc + Number((x as Record<string, unknown>)[field] ?? 0), 0);

  // Fetch all matching orders (keep simple for now; can replace with Mongo $group pipeline later)
  const rows = await db.collection("orders").find(match).toArray();

  const totalOrders = rows.length;
  const totalRevenue = sum(rows, "total");
  const totalPaid = sum(rows, "advancePaid");
  const totalBalance = Math.max(0, totalRevenue - totalPaid);

  const weekly = rows.filter((r) => (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)) >= startOfWeek);
  const monthly = rows.filter((r) => (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).getMonth() === now.getMonth());

  const weeklyOrders = weekly.length;
  const monthlyOrders = monthly.length;

  return NextResponse.json({
    totalOrders,
    totalRevenue,
    totalPaid,
    totalBalance,
    weeklyOrders,
    monthlyOrders,
  });
}
