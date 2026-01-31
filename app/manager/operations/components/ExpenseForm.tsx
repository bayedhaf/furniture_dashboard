"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function ExpenseForm() {
  const [type, setType] = useState("");
  const [amount, setAmount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [description, setDescription] = useState("");

  const balance = amount - paid;

  const status =
    paid === 0
      ? "No Paid"
      : paid < amount
      ? "Partial Paid"
      : "Full Paid";

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/manager/operations/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        amount,
        paid,
        balance,
        status,
        description,
      }),
    });

    location.reload();
  }

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg border"
    >
      <Select value={type} onValueChange={setType}>
        <SelectTrigger>
          <SelectValue placeholder="Expense Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Transport">Transport</SelectItem>
          <SelectItem value="Fuel">Fuel</SelectItem>
          <SelectItem value="Maintenance">Maintenance</SelectItem>
          <SelectItem value="Tools">Tools</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="number"
        placeholder="Total Amount"
        onChange={(e) => setAmount(+e.target.value)}
      />

      <Input
        type="number"
        placeholder="Paid Amount"
        onChange={(e) => setPaid(+e.target.value)}
      />

      <Input
        className="md:col-span-3"
        placeholder="Description / Notes"
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="md:col-span-3 text-sm">
        <p>Balance: <strong>ETB {balance}</strong></p>
        <p>Status: <strong>{status}</strong></p>
      </div>

      <Button className="md:col-span-3 bg-[#007B7F]">
        Save Expense
      </Button>
    </form>
  );
}
