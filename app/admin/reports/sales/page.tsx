"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

type Sale = {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  total: number;
  status?: string;
  location?: string | null;
  managerId?: string | null;
  createdAt?: string | null;
};

export default function AdminSalesReportPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; locations: string[] }[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/manager/sales")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        const mapped: Sale[] = arr.map((r: unknown) => {
          const o = r as Record<string, unknown>;
          return {
            _id: String(o._id ?? ""),
            name: String(o.name ?? ""),
            category: String(o.category ?? ""),
            price: Number(o.price ?? 0),
            quantity: Number(o.quantity ?? 0),
            total: Number(o.total ?? (Number(o.price ?? 0) * Number(o.quantity ?? 0))),
            status: o.status ? String(o.status as string) : undefined,
            location: o.location ? String(o.location as string) : null,
            managerId: o.managerId ? String(o.managerId as string) : null,
            createdAt: typeof o.createdAt === "string" ? (o.createdAt as string) : null,
          };
        });
        setSales(mapped);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load sales");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    // fetch users for admin mapping
    fetch("/api/admin/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (!mounted) return;
        const arr = Array.isArray(list) ? list : [];
        setUsers(
          arr.map((u: unknown) => {
            const o = u as Record<string, unknown>;
            return {
              id: String(o.id ?? ""),
              name: String(o.name ?? ""),
              locations: Array.isArray(o.locations) ? (o.locations as string[]) : [],
            };
          })
        );
      })
      .catch(() => {})
      .finally(() => {})
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
    const totalItems = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
    return { totalRevenue, totalItems, count: sales.length };
  }, [sales]);

  const byLocation = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number; items: number }>();
    const source = selectedLocation ? sales.filter((s) => (s.location || "Unknown") === selectedLocation) : sales;
    for (const s of source) {
      const key = s.location || "Unknown";
      const curr = map.get(key) || { revenue: 0, count: 0, items: 0 };
      curr.revenue += s.total || 0;
      curr.count += 1;
      curr.items += s.quantity || 0;
      map.set(key, curr);
    }
    return Array.from(map.entries()).map(([location, stats]) => ({ location, ...stats }));
  }, [sales, selectedLocation]);

  const byManager = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number; items: number }>();
    const source = sales
      .filter((s) => (selectedLocation ? (s.location || "Unknown") === selectedLocation : true))
      .filter((s) => (selectedManager ? (s.managerId || "Unassigned") === selectedManager : true));
    for (const s of source) {
      const key = s.managerId || "Unassigned";
      const curr = map.get(key) || { revenue: 0, count: 0, items: 0 };
      curr.revenue += s.total || 0;
      curr.count += 1;
      curr.items += s.quantity || 0;
      map.set(key, curr);
    }
    return Array.from(map.entries()).map(([managerId, stats]) => ({ managerId, ...stats }));
  }, [sales, selectedLocation, selectedManager]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A57]">Sales Reports</h1>
        <p className="text-sm text-neutral-500">Aggregated sales across all managers and locations</p>
      </div>

      <Card className="border-neutral-200"> 
        <CardTitle className="text-center">Total Sales Summary</CardTitle>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-neutral-500 text-sm">Total Revenue</p>
            <p className="text-lg font-semibold">ETB {totals.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Total Items Sold</p>
            <p className="text-lg font-semibold">{totals.totalItems}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Total Sales</p>
            <p className="text-lg font-semibold">{totals.count}</p>
          </div>
        </CardContent>
      </Card>
     {/* The only summary card to display in the /admin/page.tsx the card that sales or i mention in that by comment see it in the admin/  */}
      <Separator />

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-neutral-200">
          <CardContent className="p-0">
            <div className="p-4">
              <h2 className="text-lg font-semibold">By Location</h2>
              <p className="text-sm text-neutral-500">Revenue, sales count, and items</p>
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
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
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
                        title="View sales for this location"
                      >
                        {row.location}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">ETB {row.revenue.toLocaleString()}</TableCell>
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
              <p className="text-sm text-neutral-500">Revenue, sales count, and items</p>
              <div className="mt-2 flex items-center gap-2">
                <label className="text-sm text-neutral-600">Filter:</label>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={selectedManager ?? ""}
                  onChange={(e) => setSelectedManager(e.target.value || null)}
                >
                  <option value="">All managers</option>
                  {Array.from(new Set(sales.map((s) => s.managerId || "Unassigned"))).map((id) => {
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
                  <TableHead>Manager ID</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byManager.map((row) => (
                   <TableRow key={row.managerId}>
                     <TableCell className="truncate max-w-50">
                       {users.find((u) => u.id === row.managerId)?.name || (row.managerId || "")}
                     </TableCell>
                    <TableCell className="text-right">ETB {row.revenue.toLocaleString()}</TableCell>
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
            <h2 className="text-lg font-semibold">All Sales</h2>
            <p className="text-sm text-neutral-500">
              Raw records across all managers and locations
              {selectedLocation && (
                <>
                  {" "}— filtered by <span className="font-medium">{selectedLocation}</span>
                </>
              )}
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(selectedLocation ? sales.filter((s) => (s.location || "Unknown") === selectedLocation) : sales)
                .filter((s) => (selectedManager ? (s.managerId || "Unassigned") === selectedManager : true))
                .map((s) => (
                <TableRow key={s._id}>
                  <TableCell>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell className="text-right">ETB {s.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{s.quantity}</TableCell>
                  <TableCell className="text-right">ETB {s.total.toLocaleString()}</TableCell>
                  <TableCell>{s.location || ""}</TableCell>
                  <TableCell className="truncate max-w-50">
                    {users.find((u) => u.id === (s.managerId || ""))?.name || (s.managerId || "")}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={async () => {
                        const ok = confirm("Delete this sale?");
                        if (!ok) return;
                        try {
                          const resp = await fetch(`/api/manager/sales?id=${encodeURIComponent(s._id)}`, { method: "DELETE" });
                          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                          setSales((prev) => prev.filter((x) => x._id !== s._id));
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
              {(selectedLocation ? sales.filter((s) => (s.location || "Unknown") === selectedLocation) : sales).length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-neutral-500 py-6">
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
