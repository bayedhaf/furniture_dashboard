"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Order = {
  id?: string;
  customerName: string;
  phone?: string;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  advancePaid: number;
  paymentStatus: "no paid" | "partial paid" | "full paid";
  expectedDelivery?: string;
  notes?: string;
};

type OrderFormProps = {
  editing?: Order | null;
  onSaved?: () => void;
  clearEdit?: () => void;
};

export default function OrderForm({ editing, onSaved, clearEdit }: OrderFormProps) {
  const [form, setForm] = useState<Order>({
    customerName: "",
    phone: "",
    productName: "",
    category: "",
    quantity: 0,
    unitPrice: 0,
    advancePaid: 0,
    paymentStatus: "no paid",
    expectedDelivery: "",
    notes: "",
  });

  const total = form.quantity * form.unitPrice;
  const balance = Math.max(0, total - (form.advancePaid || 0));

  // Auto update payment status based on advancePaid
  useEffect(() => {
    if ((form.advancePaid || 0) <= 0) {
      const t = setTimeout(() => {
        setForm((f) => ({ ...f, paymentStatus: "no paid" }));
      }, 0);
      return () => clearTimeout(t);
    } else if ((form.advancePaid || 0) >= total && total > 0) {
      const t = setTimeout(() => {
        setForm((f) => ({ ...f, paymentStatus: "full paid" }));
      }, 0);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setForm((f) => ({ ...f, paymentStatus: "partial paid" }));
      }, 0);
      return () => clearTimeout(t);
    }
  }, [form.advancePaid, total]);

  function handleChange<K extends keyof Order>(key: K, value: Order[K]) {
    setForm({ ...form, [key]: value });
  }

  // Prefill when editing changes
  useEffect(() => {
    if (editing && editing.id) {
      const t = setTimeout(() => {
        setForm({
          id: editing.id,
          customerName: editing.customerName ?? "",
          phone: editing.phone ?? "",
          productName: editing.productName ?? "",
          category: editing.category ?? "",
          quantity: editing.quantity ?? 0,
          unitPrice: editing.unitPrice ?? 0,
          advancePaid: editing.advancePaid ?? 0,
          paymentStatus: editing.paymentStatus ?? "no paid",
          expectedDelivery: editing.expectedDelivery ?? "",
          notes: editing.notes ?? "",
        });
      }, 0);
      return () => clearTimeout(t);
    }
  }, [editing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      customer: form.customerName,
  phone: form.phone,
      item: form.productName,
      category: form.category,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
  status: form.paymentStatus,
  advancePaid: form.advancePaid,
      notes: form.notes,
      date: form.expectedDelivery || undefined,
      // location: could be added here if you capture it in the form and allowed for manager
    };
    try {
      const isEdit = Boolean(form.id);
      const url = "/api/manager/orders";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit ? JSON.stringify({ id: form.id, ...payload }) : JSON.stringify(payload);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        console.error("Failed to create order", await res.text());
        return;
      }
      // reset form after success
      setForm({
        customerName: "",
        phone: "",
        productName: "",
        category: "",
        quantity: 0,
        unitPrice: 0,
  advancePaid: 0,
  paymentStatus: "no paid",
        expectedDelivery: "",
        notes: "",
      });
      clearEdit?.();
      onSaved?.();
    } catch (err) {
      console.error("Error creating order", err);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-lg border"
    >
      {/* Customer Name */}
      <div>
        <Label>Customer Name</Label>
        <Input
          value={form.customerName}
          onChange={(e) => handleChange("customerName", e.target.value)}
        />
      </div>

      {/* Phone */}
      <div>
        <Label>Phone Number</Label>
        <Input
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      {/* Product */}
      <div>
        <Label>Product Name</Label>
        <Input
          value={form.productName}
          onChange={(e) => handleChange("productName", e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <Label>Category</Label>
        <Select
          value={form.category}
          onValueChange={(v) => handleChange("category", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wood">Wood</SelectItem>
            <SelectItem value="metal">Metal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quantity */}
      <div>
        <Label>Quantity</Label>
        <Input
          type="number"
          value={form.quantity}
          onChange={(e) => handleChange("quantity", Number(e.target.value))}
        />
      </div>

      {/* Unit Price */}
      <div>
        <Label>Unit Price (ETB)</Label>
        <Input
          type="number"
          value={form.unitPrice}
          onChange={(e) => handleChange("unitPrice", Number(e.target.value))}
        />
      </div>

      {/* Advance Paid */}
      <div>
        <Label>Amount Paid (ETB)</Label>
        <Input
          type="number"
          value={form.advancePaid}
          onChange={(e) => handleChange("advancePaid", Number(e.target.value))}
        />
      </div>

      {/* Payment Status (auto) */}
      <div>
        <Label>Payment Status</Label>
        <Select value={form.paymentStatus} disabled>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no paid">No Paid</SelectItem>
            <SelectItem value="partial paid">Partial Paid</SelectItem>
            <SelectItem value="full paid">Full Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expected Delivery */}
      <div>
        <Label>Expected Delivery Date</Label>
        <Input
          type="date"
          value={form.expectedDelivery}
          onChange={(e) => handleChange("expectedDelivery", e.target.value)}
        />
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <Label>Notes / Description</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
        />
      </div>

      {/* Summary */}
      <div className="md:col-span-3 text-sm text-neutral-700 bg-neutral-50 p-3 rounded">
        <p>Total Amount: <strong>ETB {total}</strong></p>
  <p>Balance Remaining: <strong>ETB {balance}</strong></p>
      </div>

      {/* Submit */}
      <Button className="md:col-span-3 bg-[#007B7F] hover:bg-[#00686C]">
        {form.id ? "Update Order" : "Create Order"}
      </Button>
    </form>
  );
}
