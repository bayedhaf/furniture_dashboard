"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

type Order = {
  _id: string;
  customer: string;
  item: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: string;
  notes?: string;
  location: string;
  phone?: string;
  advancePaid?: number;
  managerId?: string;
  createdAt?: string;
};

type AdminUser = {
  id: string;
  name: string;
  locations?: string[];
};

function asOrder(obj: unknown): Order | null {
  const o = obj as Record<string, unknown>;
  if (!o || typeof o !== "object") return null;
  const _id = String(o._id ?? "");
  const customer = String(o.customer ?? "");
  const item = String(o.item ?? "");
  const category = String(o.category ?? "");
  const quantity = Number(o.quantity ?? 0);
  const unitPrice = Number(o.unitPrice ?? 0);
  const total = Number(o.total ?? quantity * unitPrice);
  const status = String(o.status ?? "");
  const notes = o.notes != null ? String(o.notes) : undefined;
  const location = String(o.location ?? "");
  const phone = o.phone != null ? String(o.phone) : undefined;
  const advancePaid = o.advancePaid != null ? Number(o.advancePaid) : undefined;
  const managerId = o.managerId != null ? String(o.managerId) : undefined;
  const createdAt = o.createdAt != null ? String(o.createdAt) : undefined;
  if (!_id) return null;
  return {
    _id,
    customer,
    item,
    category,
    quantity,
    unitPrice,
    total,
    status,
    notes,
    location,
    phone,
    advancePaid,
    managerId,
    createdAt,
  };
}

export default function AdminOrdersReportPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch orders
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/manager/orders", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
        const json = (await res.json()) as unknown;
        const list = Array.isArray(json) ? json : (json as Record<string, unknown>)?.data;
        const arr = Array.isArray(list) ? list : [];
        const mapped: Order[] = arr.map(asOrder).filter(Boolean) as Order[];
        setOrders(mapped);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    // Fetch admin users for name mapping
    const loadUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) return; // don't block UI if unauthorized or failed
        const json = (await res.json()) as unknown;
        const list = Array.isArray(json) ? json : (json as Record<string, unknown>)?.data;
        const arr = Array.isArray(list) ? list : [];
        const mapped: AdminUser[] = arr
          .map((u) => {
            const r = u as Record<string, unknown>;
            const id = String(r.id ?? r._id ?? "");
            const name = String(r.name ?? "");
            const locations = Array.isArray(r.locations)
              ? (r.locations as unknown[]).map((x) => String(x))
              : undefined;
            if (!id || !name) return null;
            return { id, name, locations } as AdminUser;
          })
          .filter(Boolean) as AdminUser[];
        setUsers(mapped);
      } catch {
        // ignore
      }
    };
    load();
    loadUsers();
  }, []);

  const managerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) map.set(u.id, u.name);
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const byLoc = selectedLocation ? o.location === selectedLocation : true;
      const byMgr = selectedManagerId ? o.managerId === selectedManagerId : true;
      return byLoc && byMgr;
    });
  }, [orders, selectedLocation, selectedManagerId]);

  const summary = useMemo(() => {
    const totalRevenue = filtered.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalItems = filtered.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
    const count = filtered.length;
    return { totalRevenue, totalItems, count };
  }, [filtered]);

  const byLocation = useMemo(() => {
    const map = new Map<string, { total: number; items: number; count: number }>();
    for (const o of filtered) {
      const key = o.location || "Unknown";
      const cur = map.get(key) ?? { total: 0, items: 0, count: 0 };
      cur.total += Number(o.total) || 0;
      cur.items += Number(o.quantity) || 0;
      cur.count += 1;
      map.set(key, cur);
    }
    return Array.from(map.entries()).map(([location, vals]) => ({ location, ...vals }));
  }, [filtered]);

  const byManager = useMemo(() => {
    const map = new Map<string, { total: number; items: number; count: number }>();
    for (const o of filtered) {
      const key = o.managerId || "Unknown";
      const cur = map.get(key) ?? { total: 0, items: 0, count: 0 };
      cur.total += Number(o.total) || 0;
      cur.items += Number(o.quantity) || 0;
      cur.count += 1;
      map.set(key, cur);
    }
    return Array.from(map.entries()).map(([managerId, vals]) => ({ managerId, ...vals }));
  }, [filtered]);

  const deleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/manager/orders?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete (${res.status})`);
      setOrders((prev) => prev.filter((x) => x._id !== id));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    }
  };

  const locations = useMemo(() => {
    return Array.from(new Set(orders.map((o) => o.location).filter(Boolean)));
  }, [orders]);

  const managers = useMemo(() => {
    const ids = Array.from(new Set(orders.map((o) => o.managerId).filter(Boolean))) as string[];
    const enriched = ids.map((id) => ({ id, name: managerNameById.get(id) || id }));
    return enriched;
  }, [orders, managerNameById]);

  return (
    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
  
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
  {/* ================= FILTER + SUMMARY ================= */}
  <div className="grid grid-cols-1 gap-4">
    {/* ================= FILTER CARD ================= */}
    <Card className="xl:col-span-2 border-muted/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold tracking-tight">
          Orders Report
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Location Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              Location:
            </span>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <Button
                  key={loc}
                  variant={selectedLocation === loc ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-3 text-xs sm:text-sm transition-all"
                  onClick={() =>
                    setSelectedLocation((prev) => (prev === loc ? null : loc))
                  }
                >
                  {loc}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 text-xs sm:text-sm text-muted-foreground"
                onClick={() => setSelectedLocation(null)}
              >
                Clear
              </Button>
            </div>
          </div>

          <Separator orientation="horizontal" className="sm:hidden" />
          <Separator orientation="vertical" className="hidden sm:block h-6" />

          {/* Manager Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              Manager:
            </span>

            <select
              className="h-8 rounded-md border bg-background px-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              value={selectedManagerId ?? ""}
              onChange={(e) => setSelectedManagerId(e.target.value || null)}
            >
              <option value="">All</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs sm:text-sm text-muted-foreground"
              onClick={() => setSelectedManagerId(null)}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* ================= SUMMARY ================= */}
    <Card className="border-muted/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base font-semibold tracking-tight">
          Summary
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-x-auto rounded-lg border">
          <Table className="min-w-[320px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow className="sticky top-0 bg-background/95 backdrop-blur z-10">
                <TableHead>Total Revenue</TableHead>
                <TableHead>Total Items</TableHead>
                <TableHead>Orders Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/40 transition-colors">
                <TableCell className="font-medium">
                  ETB {summary.totalRevenue.toFixed(2)}
                </TableCell>
                <TableCell>{summary.totalItems}</TableCell>
                <TableCell>{summary.count}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>

  {/* ================= BY LOCATION + MANAGER ================= */}
  <div className="grid grid-cols-1 gap-4">
    {/* ================= BY LOCATION ================= */}
    <Card className="border-muted/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base font-semibold tracking-tight">
          By Location
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-x-auto rounded-lg border max-h-96">
          <Table className="min-w-[600px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow className="sticky top-0 bg-background/95 backdrop-blur z-10">
                <TableHead>Location</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byLocation.map((r) => (
                <TableRow
                  key={r.location}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell>
                    <Button
                      variant={
                        selectedLocation === r.location
                          ? "default"
                          : "link"
                      }
                      size="sm"
                      className="px-0 h-auto text-xs sm:text-sm"
                      onClick={() =>
                        setSelectedLocation((prev) =>
                          prev === r.location ? null : r.location
                        )
                      }
                    >
                      {r.location}
                    </Button>
                  </TableCell>
                  <TableCell>ETB {r.total.toFixed(2)}</TableCell>
                  <TableCell>{r.items}</TableCell>
                  <TableCell>{r.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    {/* ================= BY MANAGER ================= */}
    <Card className="border-muted/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base font-semibold tracking-tight">
          By Manager
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-x-auto rounded-lg border max-h-56">
          <Table className="min-w-[600px] text-xs sm:text-sm">
            <TableHeader>
              <TableRow className="sticky top-0 bg-background/95 backdrop-blur z-10">
                <TableHead>Manager</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byManager.map((r) => (
                <TableRow
                  key={r.managerId}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <TableCell className="font-medium">
                    {managerNameById.get(r.managerId) || r.managerId}
                  </TableCell>
                  <TableCell>ETB {r.total.toFixed(2)}</TableCell>
                  <TableCell>{r.items}</TableCell>
                  <TableCell>{r.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

      {/* All Orders */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="relative overflow-x-auto max-h-[32rem] rounded-md border">
            <Table className="min-w-225">
            <TableHeader>
              <TableRow className="sticky top-0 bg-background">
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="hidden md:table-cell">Advance</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o._id}>
                  <TableCell>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ""}
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{o.customer}</TableCell>
                  <TableCell className="max-w-40 sm:max-w-50 truncate text-xs sm:text-sm">{o.item}</TableCell>
                  <TableCell>{o.category}</TableCell>
                  <TableCell>ETB {Number(o.unitPrice || 0).toFixed(2)}</TableCell>
                  <TableCell>{o.quantity}</TableCell>
                  <TableCell>ETB {Number(o.total || o.quantity * o.unitPrice).toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {o.advancePaid != null ? `ETB ${Number(o.advancePaid).toFixed(2)}` : "-"}
                  </TableCell>
                  <TableCell>{o.location}</TableCell>
                  <TableCell>{managerNameById.get(o.managerId || "") || o.managerId || ""}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => deleteOrder(o._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
