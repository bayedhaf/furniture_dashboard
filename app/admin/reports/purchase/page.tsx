"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type Purchase = {
  _id: string;
  item: string;
  category: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status?: string;
  notes?: string;
  location?: string | null;
  managerId?: string | null;
  createdAt?: string | null;
};

export default function AdminPurchaseReportPage() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; locations: string[] }[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/manager/purchase")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        const mapped: Purchase[] = arr.map((r: unknown) => {
          const o = r as Record<string, unknown>;
          return {
            _id: String(o._id ?? ""),
            item: String(o.item ?? ""),
            category: String(o.category ?? ""),
            supplier: String(o.supplier ?? ""),
            quantity: Number(o.quantity ?? 0),
            unitPrice: Number(o.unitPrice ?? 0),
            total: Number(o.total ?? (Number(o.unitPrice ?? 0) * Number(o.quantity ?? 0))),
            status: o.status ? String(o.status as string) : undefined,
            notes: o.notes ? String(o.notes as string) : undefined,
            location: o.location ? String(o.location as string) : null,
            managerId: o.managerId ? String(o.managerId as string) : null,
            createdAt: typeof o.createdAt === "string" ? (o.createdAt as string) : null,
          };
        });
        setRows(mapped);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load purchases");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!mounted) return;
        const arr = Array.isArray(list) ? list : [];
        const mapped = arr.map((u: unknown) => {
          const o = u as Record<string, unknown>;
          return {
            id: String(o.id ?? ""),
            name: String(o.name ?? ""),
            locations: Array.isArray(o.locations) ? (o.locations as string[]) : [],
          };
        });
        setUsers(mapped);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const source = rows
      .filter((r) => (selectedLocation ? (r.location || "Unknown") === selectedLocation : true))
      .filter((r) => (selectedManager ? (r.managerId || "Unassigned") === selectedManager : true));
    const totalSpend = source.reduce((sum, r) => sum + (r.total || 0), 0);
    const totalItems = source.reduce((sum, r) => sum + (r.quantity || 0), 0);
    return { totalSpend, totalItems, count: source.length };
  }, [rows, selectedLocation, selectedManager]);

  const byLocation = useMemo(() => {
    const map = new Map<string, { spend: number; count: number; items: number }>();
    const source = rows
      .filter((r) => (selectedManager ? (r.managerId || "Unassigned") === selectedManager : true));
    for (const r of source) {
      const key = r.location || "Unknown";
      const curr = map.get(key) || { spend: 0, count: 0, items: 0 };
      curr.spend += r.total || 0;
      curr.count += 1;
      curr.items += r.quantity || 0;
      map.set(key, curr);
    }
    return Array.from(map.entries()).map(([location, stats]) => ({ location, ...stats }));
  }, [rows, selectedManager]);

  const byManager = useMemo(() => {
    const map = new Map<string, { spend: number; count: number; items: number }>();
    const source = rows
      .filter((r) => (selectedLocation ? (r.location || "Unknown") === selectedLocation : true));
    for (const r of source) {
      const key = r.managerId || "Unassigned";
      const curr = map.get(key) || { spend: 0, count: 0, items: 0 };
      curr.spend += r.total || 0;
      curr.count += 1;
      curr.items += r.quantity || 0;
      map.set(key, curr);
    }
    return Array.from(map.entries()).map(([managerId, stats]) => ({ managerId, ...stats }));
  }, [rows, selectedLocation]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A57]">Purchases Reports</h1>
        <p className="text-sm text-neutral-500">Aggregated purchases across all managers and locations</p>
      </div>

      <Card className="border-neutral-200">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total Spend</TableCell>
                <TableCell className="text-right">ETB {totals.totalSpend.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Items Purchased</TableCell>
                <TableCell className="text-right">{totals.totalItems}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Purchases</TableCell>
                <TableCell className="text-right">{totals.count}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-neutral-200">
          <CardContent className="p-0">
            <div className="p-4">
              <h2 className="text-lg font-semibold">By Location</h2>
              <p className="text-sm text-neutral-500">Spend, purchases count, and items</p>
              {selectedLocation && (
                <div className="mt-2 text-sm">
                  <span className="text-neutral-600">Filtered by location: </span>
                  <span className="font-medium">{selectedLocation}</span>
                  <button
                    className="ml-2 text-[#007B7F] hover:underline"
                    onClick={() => setSelectedLocation(null)}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byLocation.map((row) => (
                  <TableRow key={row.location}>
                    <TableCell>
                      <button
                        className="text-[#1B3A57] hover:underline"
                        onClick={() => setSelectedLocation(row.location)}
                        title="View purchases for this location"
                      >
                        {row.location}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">ETB {row.spend.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{row.items}</TableCell>
                  </TableRow>
                ))}
                {byLocation.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-neutral-500 py-6">
                      {loading ? "Loading…" : error ? `Error: ${error}` : "No data"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-0">
            <div className="p-4">
              <h2 className="text-lg font-semibold">By Manager</h2>
              <p className="text-sm text-neutral-500">Spend, purchases count, and items</p>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-sm text-neutral-600">Filter:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={selectedManager ?? ""}
                  onChange={(e) => setSelectedManager(e.target.value || null)}
                >
                  <option value="">All managers</option>
                  {Array.from(new Set(rows.map((r) => r.managerId || "Unassigned"))).map((id) => {
                    const name = users.find((u) => u.id === id)?.name || (id === "Unassigned" ? "Unassigned" : id);
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
                {selectedManager && (
                  <button
                    className="text-[#007B7F] hover:underline text-sm"
                    onClick={() => setSelectedManager(null)}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byManager.map((row) => (
                  <TableRow key={row.managerId}>
                    <TableCell className="truncate max-w-50">
                      {users.find((u) => u.id === row.managerId)?.name || (row.managerId || "")}
                    </TableCell>
                    <TableCell className="text-right">ETB {row.spend.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{row.items}</TableCell>
                  </TableRow>
                ))}
                {byManager.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-neutral-500 py-6">
                      {loading ? "Loading…" : error ? `Error: ${error}` : "No data"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card className="border-neutral-200">
        <CardContent className="p-0">
          <div className="p-4">
            <h2 className="text-lg font-semibold">All Purchases</h2>
            <p className="text-sm text-neutral-500">
              Raw records across all managers and locations
              {selectedLocation && (
                <> — filtered by <span className="font-medium">{selectedLocation}</span></>
              )}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows
                .filter((r) => (selectedLocation ? (r.location || "Unknown") === selectedLocation : true))
                .filter((r) => (selectedManager ? (r.managerId || "Unassigned") === selectedManager : true))
                .map((r) => (
                  <TableRow key={r._id}>
                    <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</TableCell>
                    <TableCell>{r.item}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>{r.supplier}</TableCell>
                    <TableCell className="text-right">ETB {r.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{r.quantity}</TableCell>
                    <TableCell className="text-right">ETB {r.total.toLocaleString()}</TableCell>
                    <TableCell>{r.location || ""}</TableCell>
                    <TableCell className="truncate max-w-50">
                      {users.find((u) => u.id === (r.managerId || ""))?.name || (r.managerId || "")}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        className="text-red-600 hover:underline text-sm"
                        onClick={async () => {
                          const ok = confirm("Delete this purchase?");
                          if (!ok) return;
                          try {
                            const resp = await fetch(`/api/manager/purchase?id=${encodeURIComponent(r._id)}`, { method: "DELETE" });
                            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                            setRows((prev) => prev.filter((x) => x._id !== r._id));
                          } catch {
                            alert("Failed to delete");
                          }
                        }}
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              {rows
                .filter((r) => (selectedLocation ? (r.location || "Unknown") === selectedLocation : true))
                .filter((r) => (selectedManager ? (r.managerId || "Unassigned") === selectedManager : true)).length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-neutral-500 py-6">
                    {loading ? "Loading…" : error ? `Error: ${error}` : "No data"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
