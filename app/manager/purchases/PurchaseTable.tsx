"use client";
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Purchase } from "./PurchaseForm";

type PurchaseTableProps = {
  purchases: Purchase[];
  startEdit: (p: Purchase) => void;
  removePurchase: (id?: string) => void;
};

export default function PurchaseTable({ purchases, startEdit, removePurchase }: PurchaseTableProps) {
  const today = new Date();
  const weekStart = new Date();
  weekStart.setDate(today.getDate() - 7);

  const weeklyTotal = purchases
    .filter((p) => new Date(p.date) >= weekStart)
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const monthlyTotal = purchases
    .filter((p) => new Date(p.date).getMonth() === today.getMonth())
    .reduce((sum, p) => sum + (p.total || 0), 0);

  return (
    <div>
      {/* Summary Cards */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="bg-white p-4 rounded-md shadow flex-1">
          <p className="text-sm text-gray-500">Weekly Purchases</p>
          <p className="text-xl font-bold text-[#1B3A57]">ETB {weeklyTotal}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow flex-1">
          <p className="text-sm text-gray-500">Monthly Purchases</p>
          <p className="text-xl font-bold text-[#1B3A57]">ETB {monthlyTotal}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-[950px]">
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No purchases yet
                </TableCell>
              </TableRow>
            )}
            {purchases.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.item}</TableCell>
                <TableCell className="hidden sm:table-cell">{p.category}</TableCell>
                <TableCell>{p.supplier}</TableCell>
                <TableCell>{p.quantity}</TableCell>
                <TableCell>{p.unitPrice}</TableCell>
                <TableCell>{p.total}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs rounded-full bg-[#007B7F]/10 text-[#007B7F]">
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="link" onClick={() => startEdit(p)} className="text-blue-600">
                    Edit
                  </Button>
                  <Button variant="link" onClick={() => removePurchase(p.id)} className="text-red-600 ml-2">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
