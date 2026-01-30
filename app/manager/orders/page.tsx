"use client";

import OrderForm from "./OrderForm";
import OrderTable from "./OrderTable";
import { useEffect, useState } from "react";
import type { Order as FormOrder } from "./OrderForm";

export default function OrdersPage() {
  // Orders for the form (editing payload)
  // const [ordersForForm, setOrdersForForm] = useState<FormOrder[]>([]);
  // Orders for the table (display payload)
  const [ordersForTable, setOrdersForTable] = useState<Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    phone?: string;
    productName: string;
    category?: string;
    quantity: number;
    totalPrice: number;
    advancePaid: number;
    paymentStatus: "no paid" | "partial paid" | "full paid";
    expectedDelivery?: string;
    notes?: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<FormOrder | null>(null);

  const loadOrders = async () => {
    setError(null);
    try {
      const res = await fetch("/api/manager/orders");
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "Failed to load orders");
        return;
      }
      const data = await res.json();
      const arr: Array<Record<string, unknown>> = Array.isArray(data) ? data : [];
  // Map for form (not used directly; editing is passed from table onEdit)

      // Map for table
      const tableMapped = arr.map((r, idx) => ({
        id: String(r._id ?? r.id ?? ""),
        orderNumber: String((r.orderNumber ?? (idx + 1)) as unknown as string),
        customerName: String(r.customer ?? ""),
        phone: String(r.phone ?? ""),
        productName: String(r.item ?? ""),
        category: String(r.category ?? ""),
        quantity: Number(r.quantity ?? 0),
        totalPrice: Number(r.total ?? Number(r.quantity ?? 0) * Number(r.unitPrice ?? 0)),
        advancePaid: Number(r.advancePaid ?? 0),
        paymentStatus: String(r.status ?? "no paid") as FormOrder["paymentStatus"],
        expectedDelivery: r.createdAt ? String(r.createdAt).slice(0, 10) : "",
        notes: String(r.notes ?? ""),
      }));
      setOrdersForTable(tableMapped);
    } catch {
      setError("Network error loading orders");
    }
  };

  useEffect(() => {
    const t = setTimeout(() => void loadOrders(), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-8">
  <OrderForm onSaved={loadOrders} editing={editing} clearEdit={() => setEditing(null)} />
  {error && <p className="text-sm text-red-600">{error}</p>}
  <OrderTable orders={ordersForTable} onEdit={(o) => setEditing(o)} error={error} />
    </div>
  );
}
