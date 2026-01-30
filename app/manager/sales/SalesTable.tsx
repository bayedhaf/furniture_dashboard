"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sale } from "./SalesForm";

type Props = {
  data: Sale[];
  onEdit: (sale: Sale) => void;
};

export default function SalesTable({ data, onEdit }: Props) {
  return (
    <>
      <div className="overflow-x-auto">
        <Table className="min-w-[950px]">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500">
                  No sales recorded
                </TableCell>
              </TableRow>
            )}

            {data.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.date}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="hidden sm:table-cell">{s.category}</TableCell>
                <TableCell>ETB {s.price}</TableCell>
                <TableCell>{s.quantity}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>ETB {s.price * s.quantity}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" onClick={() => onEdit(s)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 text-right">
        <p className="font-semibold">Total Sales</p>
        <p className="font-bold text-[#1B3A57]">
          ETB {data.reduce((sum, s) => sum + s.price * s.quantity, 0)}
        </p>
      </div>
    </>
  );
}
