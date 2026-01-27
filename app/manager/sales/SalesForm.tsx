"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

type Product = {
  id?: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description: string;
  status: string;
  date?: string;
};

export default function SalesForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({
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

  // fetch persisted sales
  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/manager/sales")
      .then((r) => r.json())
      .then((data: unknown) => {
          if (!mounted) return;
          if (Array.isArray(data)) {
            const mapped = (data as Array<Record<string, unknown>>).map((d, i) => ({
              id: String(d._id ?? d.id ?? i),
              name: String(d.name ?? ""),
              category: String(d.category ?? ""),
              price: Number(d.price ?? 0),
              quantity: Number(d.quantity ?? 0),
              description: String(d.description ?? ""),
              status: String(d.status ?? ""),
            }));
            setProducts(mapped);
          }
        })
      .catch(() => setError("Failed to load sales"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field: keyof Product, value: Product[keyof Product]) => {
    setForm({ ...form, [field]: value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.category || !form.status) return setError("Please fill required fields");
    try {
      setLoading(true);
      const res = await fetch("/api/manager/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create sale");
      }
      // refresh list
    const list = await fetch("/api/manager/sales").then((r) => r.json());
      if (Array.isArray(list)) {
        const mapped = (list as Array<Record<string, unknown>>).map((d, i) => ({
          id: String(d._id ?? d.id ?? i),
          name: String(d.name ?? ""),
          category: String(d.category ?? ""),
          price: Number(d.price ?? 0),
          quantity: Number(d.quantity ?? 0),
          description: String(d.description ?? ""),
          status: String(d.status ?? ""),
      date: d.createdAt ? String(d.createdAt).slice(0, 10) : "",
        }));
        setProducts(mapped);
      }
      setForm({ name: "", category: "", price: 0, quantity: 0, description: "", status: "", date: new Date().toISOString().slice(0, 10) });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  async function startEdit(p: Product) {
    setEditingId(p.id ?? null);
    setForm({ ...p });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    try {
      setLoading(true);
      const res = await fetch("/api/manager/sales", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update sale");
      }
      const list = await fetch("/api/manager/sales").then((r) => r.json());
      if (Array.isArray(list)) {
        const mapped = (list as Array<Record<string, unknown>>).map((d, i) => ({
          id: String(d._id ?? d.id ?? i),
          name: String(d.name ?? ""),
          category: String(d.category ?? ""),
          price: Number(d.price ?? 0),
          quantity: Number(d.quantity ?? 0),
          description: String(d.description ?? ""),
          status: String(d.status ?? ""),
          date: d.createdAt ? String(d.createdAt).slice(0, 10) : "",
        }));
        setProducts(mapped);
      }
      setEditingId(null);
      setForm({ name: "", category: "", price: 0, quantity: 0, description: "", status: "", date: new Date().toISOString().slice(0, 10) });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen">
      {/* ================= Form ================= */}
  <form onSubmit={editingId ? handleUpdate : handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Input
          placeholder="Product Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <Select
          value={form.category}
          onValueChange={(value) => handleChange("category", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wood">Wood</SelectItem>
            <SelectItem value="metal">Metal</SelectItem>
          </SelectContent>
        </Select>
        <Label>Unit Price</Label>
        <Input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => handleChange("price", Number(e.target.value))}
        />
       <Label>Quantity</Label>
        <Input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => handleChange("quantity", Number(e.target.value))}
        />
        <Input
          type="date"
          placeholder="Date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
        />
       
        <Textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="col-span-1 md:col-span-2"
        />

        <Select
          value={form.status}
          onValueChange={(value) => handleChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sales Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="half paid">Half Paid</SelectItem>
            <SelectItem value="full paid">Full Paid</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit" className="col-span-1 md:col-span-3 bg-[#007B7F] hover:bg-[#00686C] text-white">
          {editingId ? "Update Product" : "Add Product"}
        </Button>
      </form>

      {/* ================= Table ================= */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date of recorded</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-[#6C757D]">
                No products added yet.
              </TableCell>
            </TableRow>
          )}
          {products.map((p, idx) => (
            <TableRow key={idx}>
              <TableHead>{p.date}</TableHead>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.category}</TableCell>
              <TableCell><strong className="font-semibold text-xs">ETB</strong>{p.price}</TableCell>
              <TableCell>{p.quantity}</TableCell>
              <TableCell>{p.description}</TableCell>
              <TableCell>{p.status}</TableCell>
              <TableCell>{p.date ?? ""}</TableCell>
              <TableCell><strong className="font-semibold text-xs">ETB</strong>{p.price * p.quantity}</TableCell>
              <TableCell>
                <Button className="text-[#007B7F] hover:text-[#005f5f]" variant="link" onClick={() => startEdit(p)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>

      {/* Total outside of table to avoid invalid HTML structure */}
      <div className="mt-4 text-right pr-2">
        <p className="font-semibold">Total sales</p>
        <p className="text-[#1B3A57]"><strong className="font-semibold text-xs">ETB</strong>
          {products.reduce((sum, p) => sum + p.price * p.quantity, 0)}
        </p>
      </div>

      {/* ================= Comment / Status ================= */}
      <div className="mt-4 text-[#6C757D] text-sm italic">
        Products appear in the table after clicking &quot;Add Product&quot;.
      </div>
      {loading && <div className="mt-2 text-sm text-gray-500">Loading…</div>}
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}

// removed unused handleEdit stub; edit is handled via startEdit
