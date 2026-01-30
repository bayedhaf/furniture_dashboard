"use client";
import React, { useEffect, useState } from "react";
import PurchaseForm, { Purchase } from "./PurchaseForm";
import PurchaseTable from "./PurchaseTable";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedForEdit, setSelectedForEdit] = useState<Purchase | null>(null);

  // Load purchases
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/manager/purchase");
      if (res.ok) {
        const data = await res.json();
        const mapped: Purchase[] = (data as Array<Record<string, unknown>>).map((r) => ({
          id: String(r._id ?? r.id ?? ""),
          item: String(r.item ?? ""),
          category: String(r.category ?? ""),
          supplier: String(r.supplier ?? ""),
          quantity: Number(r.quantity ?? 0),
          unitPrice: Number(r.unitPrice ?? 0),
          total: Number(r.total ?? 0),
          date: String(r.createdAt ?? new Date().toISOString()),
          status: String(r.status ?? ""),
          notes: String(r.notes ?? ""),
        }));
        setPurchases(mapped);
      }
    })();
  }, []);

  const removePurchase = async (id?: string) => {
    if (!id) return;
    const res = await fetch(`/api/manager/purchase?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) {
      setPurchases((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = async (payload: Purchase, editingId: string | null) => {
    if (editingId) {
      const res = await fetch("/api/manager/purchase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          item: payload.item,
          category: payload.category,
          supplier: payload.supplier,
          quantity: payload.quantity,
          unitPrice: payload.unitPrice,
          date: payload.date,
          status: payload.status,
          notes: payload.notes,
        }),
      });
      if (res.ok) {
        setPurchases((prev) => prev.map((p) => (p.id === editingId ? { ...payload, id: editingId } : p)));
        setSelectedForEdit(null);
      }
    } else {
      const res = await fetch("/api/manager/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: payload.item,
          category: payload.category,
          supplier: payload.supplier,
          quantity: payload.quantity,
          unitPrice: payload.unitPrice,
          date: payload.date,
          status: payload.status,
          notes: payload.notes,
        }),
      });
      if (res.ok) {
        const { id } = await res.json();
        setPurchases((prev) => [...prev, { ...payload, id }]);
      }
    }
  };

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
  <PurchaseForm onSubmit={handleSubmit} selectedForEdit={selectedForEdit} />
  <PurchaseTable purchases={purchases} startEdit={(p) => setSelectedForEdit(p)} removePurchase={removePurchase} />
    </div>
  );
}
