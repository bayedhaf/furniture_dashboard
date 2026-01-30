"use client";

import React, { useEffect, useState } from "react";
import SalesForm, { Sale } from "./SalesForm";
import SalesTable from "./SalesTable";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [editing, setEditing] = useState<Sale | null>(null);

  async function loadSales() {
    const res = await fetch("/api/manager/sales");
    const data = await res.json();
    if (Array.isArray(data)) {
      const mapped: Sale[] = data.map((r: Record<string, unknown>) => ({
        id: String(r._id ?? r.id ?? ""),
        name: String(r.name ?? ""),
        category: String(r.category ?? ""),
        price: Number(r.price ?? 0),
        quantity: Number(r.quantity ?? 0),
        description: String(r.description ?? ""),
        status: String(r.status ?? ""),
        date: r.createdAt ? String(r.createdAt).slice(0, 10) : new Date().toISOString().slice(0, 10),
      }));
      setSales(mapped);
    } else {
      setSales([]);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      void loadSales();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      <SalesForm
        editing={editing}
        clearEdit={() => setEditing(null)}
        onSaved={loadSales}
      />
      <SalesTable data={sales} onEdit={setEditing} />
    </div>
  );
}
