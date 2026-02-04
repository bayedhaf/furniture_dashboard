"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Order = {
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
};

function statusStyle(status: Order["paymentStatus"]) {
  switch (status) {
    case "full paid":
      return "bg-green-100 text-green-700";
    case "partial paid":
      return "bg-yellow-100 text-yellow-700";
    case "no paid":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

type FormOrder = {
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

export default function OrderTable({
  orders,
  onEdit,
  error,
}: {
  orders: Order[];
  onEdit?: (order: FormOrder) => void;
  error?: string | null;
}) {
  const [localError] = useState<string | null>(error ?? null);

  return (
    <div className="bg-white rounded-lg border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1B3A57]">
          Orders List
        </h2>

        <Link
          href="/manager/orders/summary"
          className="text-sm font-medium text-[#007B7F] hover:underline"
        >
          View Weekly / Monthly Summary →
        </Link>
      </div>

  {/* Table */}
      <div className="overflow-x-scroll">
  <Table className="min-w-242 overflow-x-scroll">
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {localError && (
              <TableRow>
                <TableCell colSpan={10} className="text-red-600">
                  {localError}
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">
                  {o.orderNumber}
                </TableCell>

                <TableCell>{o.customerName}</TableCell>
                <TableCell>{o.phone || "-"}</TableCell>
                <TableCell>{o.productName}</TableCell>
                <TableCell>{o.quantity}</TableCell>

                <TableCell>
                  <span className="text-xs font-semibold">ETB</span>{" "}
                  {o.totalPrice}
                </TableCell>

                <TableCell>
                  <span className="text-xs font-semibold">ETB</span>{" "}
                  {o.advancePaid}
                </TableCell>

                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle(
                      o.paymentStatus
                    )}`}
                  >
                    {o.paymentStatus}
                  </span>
                </TableCell>

                <TableCell>{o.expectedDelivery || "-"}</TableCell>

                <TableCell className="text-right">
                  <Button
                    variant="link"
                    className="text-[#007B7F] hover:text-[#005f5f]"
                    onClick={() => {
                      const mapped: FormOrder = {
                        id: o.id,
                        customerName: o.customerName,
                        phone: o.phone ?? "",
                        // carry phone via notes if your form supports it separately
                        productName: o.productName,
                        category: o.category ?? "",
                        quantity: o.quantity,
                        unitPrice: Number((o.totalPrice ?? 0) / (o.quantity || 1)) || 0,
                        advancePaid: o.advancePaid ?? 0,
                        paymentStatus: o.paymentStatus,
                        expectedDelivery: o.expectedDelivery,
                        notes: o.notes ?? "",
                      };
                      onEdit?.(mapped);
                    }}
                    title={onEdit ? "Edit order" : "Connect onEdit prop to enable editing"}
                    disabled={!onEdit}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-gray-500 py-6"
                >
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
