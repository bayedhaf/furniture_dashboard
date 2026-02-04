"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ExpenseRecord = {
	_id: string;
	title: string;
	category?: string;
	amount: number;
	date?: string;
	location?: string;
	managerId?: string;
	note?: string;
};

type AdminUser = { id: string; name: string };

function asNumber(x: unknown): number | undefined {
	const n = typeof x === "number" ? x : Number(x);
	return Number.isFinite(n) ? n : undefined;
}

function asString(x: unknown): string | undefined {
	return typeof x === "string" && x.length > 0 ? x : undefined;
}

function asExpense(obj: unknown): ExpenseRecord | null {
	const r = obj as Record<string, unknown>;
	const _id = asString(r?._id) ?? asString(r?.id) ?? "";
	const titleRaw = asString(r?.title) ?? asString(r?.name);
	const amount = asNumber(r?.amount) ?? asNumber(r?.cost) ?? 0;
	if (!_id) return null;
	const category = asString(r?.category) ?? asString(r?.type);
	const date = asString(r?.date);
	const location = asString(r?.location) ?? asString(r?.department);
	const managerId = asString(r?.managerId) ?? asString(r?.manager_id);
	const note = asString(r?.note) ?? asString(r?.description);
	const title = titleRaw ?? (category ? `${category} expense` : "Untitled");
	return { _id, title, amount, category, date, location, managerId, note };
}

export default function AdminOperationsReportPage() {
	const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [selectedLocation, setSelectedLocation] = useState<string>("");
	const [selectedManagerId, setSelectedManagerId] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState<string>("");
		const [deletingId, setDeletingId] = useState<string>("");

	useEffect(() => {
		let cancelled = false;
		async function fetchExpenses() {
			setLoading(true);
			setError(null);
			try {
		console.log("[Operations] Fetching expenses…");
		const res = await fetch("/api/manager/operations/expenses", { cache: "no-store" });
		console.log("[Operations] Response status:", res.status);
				if (!res.ok) throw new Error(`Failed expenses: ${res.status}`);
		const json = (await res.json()) as unknown;
		console.log("[Operations] Raw JSON:", json);
				const obj = json as Record<string, unknown>;
				const listCandidate = Array.isArray(json) ? json : (obj?.data as unknown) ?? (obj?.expenses as unknown);
				const arr = Array.isArray(listCandidate) ? listCandidate : [];
		console.log("[Operations] Parsed items count:", arr.length);
				const mapped = arr.map(asExpense).filter(Boolean) as ExpenseRecord[];
		console.log("[Operations] Mapped items count:", mapped.length);
				if (!cancelled) setExpenses(mapped);
			} catch (e: unknown) {
				const msg = e instanceof Error ? e.message : String(e);
		console.error("[Operations] Fetch error:", msg);
				if (!cancelled) setError(msg);
			} finally {
		console.log("[Operations] Fetch complete.");
				if (!cancelled) setLoading(false);
			}
		}
		async function fetchUsers() {
			try {
			console.log("[Operations] Fetching admin users…");
			const res = await fetch("/api/admin/users", { cache: "no-store" });
			console.log("[Operations] Users response status:", res.status);
				if (!res.ok) return;
				const json = (await res.json()) as unknown;
			console.log("[Operations] Users raw JSON:", json);
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
			console.log("[Operations] Users mapped count:", mapped.length);
				setUsers(mapped);
			} catch {
				/* ignore */
			}
		}
		fetchExpenses();
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
		return expenses.filter((e) => {
			const locOk = selectedLocation ? (e.location ?? "") === selectedLocation : true;
			const manOk = selectedManagerId ? (e.managerId ?? "") === selectedManagerId : true;
			const catOk = selectedCategory ? (e.category ?? "") === selectedCategory : true;
			return locOk && manOk && catOk;
		});
	}, [expenses, selectedLocation, selectedManagerId, selectedCategory]);

		async function handleDelete(id: string) {
			if (!id) return;
			try {
				setDeletingId(id);
				const res = await fetch(`/api/manager/operations/expenses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
				if (!res.ok) {
					const j = await res.json().catch(() => ({}));
					throw new Error(String((j as Record<string, unknown>)?.error ?? res.status));
				}
				// Remove from local state for instant UI update
				setExpenses((prev) => prev.filter((e) => e._id !== id));
			} catch (err) {
				console.error("[Operations] Delete failed:", err);
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setDeletingId("");
			}
		}

	const summary = useMemo(() => {
		const total = filtered.reduce((acc, e) => acc + (e.amount ?? 0), 0);
		const count = filtered.length;
		const avg = count ? total / count : 0;
		return { total, count, avg };
	}, [filtered]);

	const locations = useMemo(() => Array.from(new Set(expenses.map((e) => e.location).filter(Boolean))) as string[], [expenses]);
	const categories = useMemo(() => Array.from(new Set(expenses.map((e) => e.category).filter(Boolean))) as string[], [expenses]);

	return (
		<div className="space-y-4 p-2 sm:p-4">
			{/* Debug/status section to help visibility */}
			<Card className="p-3 sm:p-4">
				<div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
					<div>
						<div className="text-muted-foreground">API status</div>
						<div>{loading ? "Loading" : error ? `Error: ${error}` : "OK"}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Fetched (total)</div>
						<div>{expenses.length}</div>
					</div>
					<div>
						<div className="text-muted-foreground">After filters</div>
						<div>{filtered.length}</div>
					</div>
					<div>
						<div className="text-muted-foreground">Sample title</div>
						<div>{expenses[0]?.title ?? "-"}</div>
					</div>
				</div>
			</Card>
				<div className="flex items-center justify-between">
					<h1 className="text-xl sm:text-2xl font-semibold">Operations Report (Expenses)</h1>
					<div className="text-sm text-muted-foreground">
						{loading ? "Loading…" : error ? error : `${expenses.length} total records`}
					</div>
				</div>

			<Card className="p-3 sm:p-4">
				<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
					<div>
						<label className="text-sm font-medium">Category</label>
						<select
							className="mt-1 w-full rounded border p-2"
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
						>
							<option value="">All</option>
							{categories.map((c) => (
								<option key={c} value={c ?? ""}>
									{c}
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
						<div className="text-xs text-muted-foreground">Total Expenses</div>
						<div className="text-xl font-semibold">{summary.total.toFixed(2)}</div>
					</div>
					<div className="rounded bg-muted p-3">
						<div className="text-xs text-muted-foreground">Count</div>
						<div className="text-xl font-semibold">{summary.count}</div>
					</div>
					<div className="rounded bg-muted p-3">
						<div className="text-xs text-muted-foreground">Average</div>
						<div className="text-xl font-semibold">{summary.avg.toFixed(2)}</div>
					</div>
				</div>
			</Card>

					<Card className="p-0">
				<div className="overflow-x-auto">
							{filtered.length === 0 && !loading && !error && (
								<div className="p-4 text-sm text-muted-foreground">No expenses to display. Try adjusting filters.</div>
							)}
							<table className="min-w-3xl w-full">
						<thead className="sticky top-0 bg-background">
							<tr className="text-left">
								<th className="p-2">Title</th>
								<th className="p-2">Category</th>
								<th className="p-2">Amount</th>
								<th className="p-2">Date</th>
								<th className="p-2">Location</th>
								<th className="p-2">Manager</th>
								<th className="p-2">Note</th>
								<th className="p-2">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((e) => (
								<tr key={e._id} className="border-t">
									<td className="p-2">{e.title}</td>
									<td className="p-2">{e.category ?? ""}</td>
									<td className="p-2 font-medium">{(e.amount ?? 0).toFixed(2)}</td>
									<td className="p-2">{e.date ?? ""}</td>
									<td className="p-2">{e.location ?? ""}</td>
									  <td className="p-2">{managerNameById.get(e.managerId ?? "") ?? (e.managerId ?? "")}</td>
									<td className="p-2">{e.note ?? ""}</td>
													<td className="p-2">
														<button
															className="inline-flex items-center rounded border px-2 py-1 bg-red-600 text-white text-xs"
															disabled={deletingId === e._id}
															onClick={() => handleDelete(e._id)}
															title="Delete expense"
														>
															{deletingId === e._id ? "Deleting…" : "Delete"}
														</button>
													</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Card>
		</div>
	);
}
