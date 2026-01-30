"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type Sale = {
  id?: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
  status: string;
  date?: string;
};

type Props = {
  editing: Sale | null;
  onSaved: () => void;
  clearEdit: () => void;
};

export default function SalesForm({ editing, onSaved, clearEdit }: Props) {
  const [form, setForm] = useState<Sale>({
    name: "",
    category: "",
    price: 0,
    quantity: 0,
    description: "",
    status: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) setForm(editing);
  }, [editing]);

  const handleChange = (key: keyof Sale, value: any) =>
    setForm({ ...form, [key]: value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.category || !form.status) {
      return setError("Required fields missing");
    }

    try {
      setLoading(true);
      await fetch("/api/manager/sales", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      });

      clearEdit();
      onSaved();
      setForm({
        name: "",
        category: "",
        price: 0,
        quantity: 0,
        description: "",
        status: "",
        date: new Date().toISOString().slice(0, 10),
      });
    } catch {
      setError("Failed to save sale");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-md shadow-sm"
    >
      <Input placeholder="Product name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />

      <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="wood">Wood</SelectItem>
          <SelectItem value="metal">Metal</SelectItem>
        </SelectContent>
      </Select>

      <div>
        <Label>Unit Price</Label>
        <Input type="number" value={form.price} onChange={(e) => handleChange("price", +e.target.value)} />
      </div>

      <div>
        <Label>Quantity</Label>
        <Input type="number" value={form.quantity} onChange={(e) => handleChange("quantity", +e.target.value)} />
      </div>

      <Input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} />

      <Textarea
        className="md:col-span-2"
        placeholder="Description"
        value={form.description}
        onChange={(e) => handleChange("description", e.target.value)}
      />

      <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
        <SelectTrigger><SelectValue placeholder="Payment Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="half paid">Half Paid</SelectItem>
          <SelectItem value="full paid">Full Paid</SelectItem>
        </SelectContent>
      </Select>

      <Button type="submit" className="md:col-span-3 bg-[#007B7F] text-white">
        {editing ? "Update Sale" : "Add Sale"}
      </Button>

      {error && <p className="text-sm text-red-600 md:col-span-3">{error}</p>}
      {loading && <p className="text-sm text-gray-500 md:col-span-3">Saving…</p>}
    </form>
  );
}
