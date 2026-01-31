"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Employee = {
  id: string;
  fullName: string;
  phone: string;
  role: string;
  department: string;
  salaryType: "daily" | "weekly";
  status: "active" | "inactive";
  startDate: string;
};

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      try {
        const r = await fetch("/api/manager/employees");
        if (!r.ok) {
          setError(await r.text());
          return;
        }
  const data = await r.json();
  const mapped: Employee[] = (Array.isArray(data) ? data : []).map((e: Record<string, unknown>) => ({
          id: String(e.id ?? e._id ?? ""),
          fullName: String(e.fullName ?? ""),
          phone: String(e.phone ?? ""),
          role: String(e.role ?? ""),
          department: String(e.department ?? ""),
          salaryType: (e.salaryType === "weekly" ? "weekly" : "daily") as Employee["salaryType"],
          status: (e.status === "inactive" ? "inactive" : "active") as Employee["status"],
          startDate: String(e.startDate ?? ""),
        }));
        setEmployees(mapped);
      } catch {
        setError("Failed to load employees");
      }
    };
    load();
  }, []);

  return (
    <div className="overflow-x-auto bg-white rounded-lg border">
      {error && (
        <div className="p-3 text-sm text-red-600">{error}</div>
      )}
  <Table className="min-w-250">
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Salary Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {employees.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-medium">
                {e.fullName}
              </TableCell>

              <TableCell>{e.phone}</TableCell>

              <TableCell>{e.role}</TableCell>

              <TableCell>{e.department}</TableCell>

              <TableCell className="capitalize">
                {e.salaryType}
              </TableCell>

              <TableCell>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium
                    ${
                      e.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {e.status}
                </span>
              </TableCell>

              <TableCell>{e.startDate}</TableCell>

              <TableCell className="text-right space-x-2">
                <Button variant="link" asChild>
                  <Link href={`/manager/employeelist/${e.id}`}>
                    View
                  </Link>
                </Button>

                <Button variant="link" asChild>
                  <Link href={`/manager/employeelist/${e.id}/wages`}>
                    Wages
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {employees.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-gray-500 py-6"
              >
                No employees registered
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
