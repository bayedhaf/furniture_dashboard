"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type Purchase = {
  id?: string;
  item: string;
  category: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  date: string;
  status: string;
  notes?: string;
};

type PurchaseFormProps = {
  onSubmit: (payload: Purchase, editingId: string | null) => Promise<void> | void;
  selectedForEdit?: Purchase | null;
};

export default function PurchaseForm({ onSubmit, selectedForEdit }: PurchaseFormProps) {
  const derivedForm = useMemo<Purchase>(() => {
    if (selectedForEdit) {
      const base = {
        item: "",
        category: "",
        supplier: "",
        quantity: 0,
        unitPrice: 0,
        total: 0,
        date: new Date().toISOString().slice(0, 10),
        status: "paid",
        notes: "",
      };
      const merged = { ...base, ...selectedForEdit };
      return { ...merged, total: (merged.quantity ?? 0) * (merged.unitPrice ?? 0) };
    }
    return {
      item: "",
      category: "",
      supplier: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
      date: new Date().toISOString().slice(0, 10),
      status: "paid",
      notes: "",
    };
  }, [selectedForEdit]);

  const [form, setForm] = useState<Purchase>(derivedForm);
  useEffect(() => {
    setForm(derivedForm);
  }, [derivedForm]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (
    field: keyof Purchase,
    value: string | number | null
  ) => {
    const updatedForm = { ...form, [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      updatedForm.total = updatedForm.quantity * updatedForm.unitPrice;
    }
    setForm(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.item || !form.supplier) return;
    await onSubmit({ ...form, total: form.quantity * form.unitPrice }, editingId);
    setEditingId(null);
    setForm({
      item: "",
      category: "",
      supplier: "",
      quantity: 0,
      unitPrice: 0,
      total: 0,
      date: new Date().toISOString().slice(0, 10),
      status: "paid",
      notes: "",
    });
  };

  // Prefill form when editing
  useEffect(() => {
    setEditingId(selectedForEdit?.id ?? null);
  }, [selectedForEdit]);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-md shadow-sm">
      <Input placeholder="Item Name" value={form.item} onChange={(e) => handleChange("item", e.target.value)} />
      <Select value={form.category} onValueChange={(value) => handleChange("category", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="wood">Wood</SelectItem>
          <SelectItem value="metal">Metal</SelectItem>
          <SelectItem value="fabric">Fabric</SelectItem>
        </SelectContent>
      </Select>
      <Input placeholder="Supplier Name" value={form.supplier} onChange={(e) => handleChange("supplier", e.target.value)} />
      <Input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => handleChange("quantity", Number(e.target.value))} />
      <Input type="number" placeholder="Unit Price" value={form.unitPrice} onChange={(e) => handleChange("unitPrice", Number(e.target.value))} />
      <Input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} />
      <Select value={form.status} onValueChange={(value) => handleChange("status", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="partial">Partial</SelectItem>
          <SelectItem value="credit">Credit</SelectItem>
        </SelectContent>
      </Select>
      <Textarea placeholder="Notes" value={form.notes} onChange={(e) => handleChange("notes", e.target.value)} className="col-span-1 md:col-span-2" />
      <Button type="submit" className="col-span-1 md:col-span-3 bg-[#007B7F] hover:bg-[#00686C] text-white">
        {editingId ? "Update Purchase" : "Add Purchase"}
      </Button>
    </form>
  );
}
