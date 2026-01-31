"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Expense = {
  id: string;
  type: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
  createdAt: string;
};

export default function ExpenseTable() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const r = await fetch("/api/manager/operations/expenses");
        if (!r.ok) {
          setError(await r.text());
          setExpenses([]);
          return;
        }
        const data = await r.json();
        const arr: Array<Record<string, unknown>> = Array.isArray(data) ? data : [];
        const mapped: Expense[] = arr.map((e) => ({
          id: String(e.id ?? e._id ?? ""),
          type: String(e.type ?? "Other"),
          amount: Number(e.amount ?? 0),
          paid: Number(e.paid ?? 0),
          balance: Number(e.balance ?? 0),
          status: String(e.status ?? "No Paid"),
          createdAt: String(e.createdAt ?? ""),
        }));
        setExpenses(mapped);
      } catch {
        setError("Failed to load expenses");
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="bg-white rounded-lg border overflow-x-auto">
      {error && <div className="p-3 text-sm text-red-600">{error}</div>}
      <Table className="min-w-250">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-neutral-500">
                Loading...
              </TableCell>
            </TableRow>
          )}

          {!loading && expenses.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                {Number.isNaN(Date.parse(e.createdAt))
                  ? "-"
                  : new Date(e.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>{e.type}</TableCell>
              <TableCell>ETB {e.amount}</TableCell>
              <TableCell>ETB {e.paid}</TableCell>
              <TableCell>ETB {e.balance}</TableCell>
              <TableCell>
                <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs text-indigo-700">
                  {e.status}
                </span>
              </TableCell>
            </TableRow>
          ))}

          {!loading && expenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                No expenses recorded
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
