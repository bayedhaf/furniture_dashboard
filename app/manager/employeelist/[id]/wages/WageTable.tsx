"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Wage = {
  id: string;
  salaryType: "daily" | "weekly";
  daysWorked: number;
  dailyRate?: number;
  weeklyRate?: number;
  saturdayDate?: string;
  saturdayBonus?: number;
  advancePaid: number;
  gross: number;
  balance: number;
  status: "No Paid" | "Partial Paid" | "Full Paid";
  createdAt: string;
};

export default function WageTable({ employeeId }: { employeeId: string }) {
  const [wages, setWages] = useState<Wage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const r = await fetch(`/api/manager/employees/${employeeId}/wages`);
        if (!r.ok) {
          setError(await r.text());
          setWages([]);
          return;
        }
        const data = await r.json();
        const arr: Array<Record<string, unknown>> = Array.isArray(data) ? data : [];
        const mapped: Wage[] = arr.map((w) => ({
          id: String(w.id ?? w._id ?? ""),
          salaryType: (w.salaryType === "weekly" ? "weekly" : "daily") as Wage["salaryType"],
          daysWorked: Number(w.daysWorked ?? 0),
          dailyRate: w.dailyRate !== undefined ? Number(w.dailyRate) : undefined,
          weeklyRate: w.weeklyRate !== undefined ? Number(w.weeklyRate) : undefined,
          saturdayDate: w.saturdayDate ? String(w.saturdayDate) : undefined,
          saturdayBonus: w.saturdayBonus !== undefined ? Number(w.saturdayBonus) : undefined,
          advancePaid: Number(w.advancePaid ?? 0),
          gross: Number(w.gross ?? 0),
          balance: Number(w.balance ?? 0),
          status: (String(w.status ?? "No Paid") as Wage["status"]).replace("no paid", "No Paid") as Wage["status"],
          createdAt: String(w.createdAt ?? ""),
        }));
        setWages(mapped);
      } catch {
        setError("Failed to load wages");
        setWages([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="h-32 bg-neutral-100 animate-pulse rounded-lg" />
    );
  }

  return (
    <div className="bg-white border rounded-lg overflow-x-auto">
      {error && <div className="p-3 text-sm text-red-600">{error}</div>}
      <Table className="min-w-250">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Saturday</TableHead>
            <TableHead>Gross</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {wages.map((w) => (
            <TableRow key={w.id}>
              <TableCell className="whitespace-nowrap">
                {Number.isNaN(Date.parse(w.createdAt))
                  ? "-"
                  : new Date(w.createdAt).toLocaleDateString()}
              </TableCell>

              <TableCell className="capitalize">
                {w.salaryType}
              </TableCell>

              <TableCell>
                {w.daysWorked}
              </TableCell>

              <TableCell>
                {w.salaryType === "daily"
                  ? `ETB ${w.dailyRate}`
                  : `ETB ${w.weeklyRate}`}
              </TableCell>

              <TableCell>
                {w.saturdayDate ? (
                  <div className="text-xs">
                    <p>{w.saturdayDate}</p>
                    <p className="text-neutral-500">
                      + ETB {w.saturdayBonus}
                    </p>
                  </div>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </TableCell>

              <TableCell className="font-medium">
                ETB {w.gross}
              </TableCell>

              <TableCell>
                ETB {w.advancePaid}
              </TableCell>

              <TableCell>
                ETB {w.balance}
              </TableCell>

              <TableCell>
                <Badge
                  variant={
                    w.status === "Full Paid"
                      ? "secondary"
                      : w.status === "Partial Paid"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {w.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}

          {wages.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center text-neutral-500"
              >
                No wage records found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
