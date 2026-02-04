"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type WageRecord = {
  _id: string;
  name: string;
  phone?: string;
  location?: string;
  managerId?: string;
  baseSalary?: number;
  bonus?: number;
  overtimePay?: number;
  totalWage?: number;
};

type AdminUser = { id: string; name: string };

function asNumber(val: unknown): number | undefined {
  const n = typeof val === "number" ? val : Number(val);
  return Number.isFinite(n) ? n : undefined;
}

function asString(val: unknown): string | undefined {
  return typeof val === "string" && val.length > 0 ? val : undefined;
}

function asWageRecord(obj: unknown): WageRecord | null {
  const r = obj as Record<string, unknown>;
  const _id = asString(r?._id) ?? asString(r?.id) ?? "";
  const name = asString(r?.name) ?? asString(r?.fullName) ?? "";
  if (!_id || !name) return null;
  const phone = asString(r?.phone);
  const location = asString(r?.location) ?? asString(r?.department) ?? undefined;
  const managerId = asString(r?.managerId) ?? asString(r?.manager_id) ?? undefined;
  const baseSalary = asNumber(r?.baseSalary) ?? asNumber(r?.salary);
  const bonus = asNumber(r?.bonus);
  const overtimePay = asNumber(r?.overtimePay) ?? asNumber(r?.overtime);
  const totalWage =
    asNumber(r?.totalWage) ??
    ((baseSalary ?? 0) + (bonus ?? 0) + (overtimePay ?? 0));
  return {
    _id,
    name,
    phone,
    location,
    managerId,
    baseSalary,
    bonus,
    overtimePay,
    totalWage,
  };
}

function WagesReportInner() {
  const search = useSearchParams();
  const queryManagerId = search.get("managerId") ?? undefined;

  const [wages, setWages] = useState<WageRecord[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>(queryManagerId ?? "");

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/manager/employees", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed employees: ${res.status}`);
        const json = (await res.json()) as unknown;
        const obj = json as Record<string, unknown>;
        const listCandidate = Array.isArray(json) ? json : (obj?.data as unknown) ?? (obj?.employees as unknown);
        const arr = Array.isArray(listCandidate) ? listCandidate : [];
        const mapped = arr.map(asWageRecord).filter(Boolean) as WageRecord[];
        if (!cancelled) setWages(mapped);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed users: ${res.status}`);
        const json = (await res.json()) as unknown;
        const obj = json as Record<string, unknown>;
        const listCandidate = Array.isArray(json) ? json : (obj?.data as unknown) ?? (obj?.users as unknown);
        const arr = Array.isArray(listCandidate) ? listCandidate : [];
        const mapped = arr
          .map((u: unknown) => {
            const r = u as Record<string, unknown>;
            const id = String(r?.id ?? r?._id ?? "");
            const name = String(r?.name ?? "");
            if (!id || !name) return null;
            return { id, name } as AdminUser;
          })
          .filter(Boolean) as AdminUser[];
        if (!cancelled) setUsers(mapped);
      } catch {
        /* ignore */
      }
    }
    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, []);

  const managerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, u.name);
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    return wages.filter((w) => {
      const locOk = selectedLocation ? (w.location ?? "") === selectedLocation : true;
      const manOk = selectedManagerId ? (w.managerId ?? "") === selectedManagerId : true;
      return locOk && manOk;
    });
  }, [wages, selectedLocation, selectedManagerId]);

  const summary = useMemo(() => {
    const totalEmployees = filtered.length;
    const totalWage = filtered.reduce((acc, w) => acc + (w.totalWage ?? 0), 0);
    const avgWage = totalEmployees ? totalWage / totalEmployees : 0;
    return { totalEmployees, totalWage, avgWage };
  }, [filtered]);

  const locations = useMemo(() => {
    return Array.from(new Set(wages.map((w) => w.location).filter(Boolean))) as string[];
  }, [wages]);

  return (
    <div className="space-y-4 p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-semibold">Employee Wages Report</h1>

      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium">Location</label>
            <select
              className="mt-1 w-full rounded border p-2"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">All</option>
              {locations.map((loc) => (
                <option key={loc} value={loc ?? ""}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Manager</label>
            <select
              className="mt-1 w-full rounded border p-2"
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
            >
              <option value="">All</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading…" : error ? error : `${filtered.length} records`}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4">
        <h2 className="text-lg font-medium">Summary</h2>
        <Separator className="my-2" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded bg-muted p-3">
            <div className="text-xs text-muted-foreground">Total Employees</div>
            <div className="text-xl font-semibold">{summary.totalEmployees}</div>
          </div>
          <div className="rounded bg-muted p-3">
            <div className="text-xs text-muted-foreground">Total Wage</div>
            <div className="text-xl font-semibold">{summary.totalWage.toFixed(2)}</div>
          </div>
          <div className="rounded bg-muted p-3">
            <div className="text-xs text-muted-foreground">Average Wage</div>
            <div className="text-xl font-semibold">{summary.avgWage.toFixed(2)}</div>
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-3xl w-full">
            <thead className="sticky top-0 bg-background">
              <tr className="text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Location</th>
                <th className="p-2">Manager</th>
                <th className="p-2">Base</th>
                <th className="p-2">Bonus</th>
                <th className="p-2">Overtime</th>
                <th className="p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w._id} className="border-t">
                  <td className="p-2">{w.name}</td>
                  <td className="p-2">{w.phone ?? ""}</td>
                  <td className="p-2">{w.location ?? ""}</td>
                  <td className="p-2">{managerNameById.get(w.managerId ?? "") ?? ""}</td>
                  <td className="p-2">{(w.baseSalary ?? 0).toFixed(2)}</td>
                  <td className="p-2">{(w.bonus ?? 0).toFixed(2)}</td>
                  <td className="p-2">{(w.overtimePay ?? 0).toFixed(2)}</td>
                  <td className="p-2 font-medium">{(w.totalWage ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function WagesReportPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-neutral-500">Loading wages…</div>}>
      <WagesReportInner />
    </Suspense>
  );
}