"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

type EmployeeRecord = {
	id: string;
	name: string;
	role?: string;
	location?: string;
	managerId?: string;
	wagesCount?: number;
};

type AdminUser = { id: string; name: string };

function asEmployeeRecord(obj: unknown): EmployeeRecord | null {
	const o = obj as Record<string, unknown>;
	if (!o || typeof o !== 'object') return null;
	const id = String(o._id ?? o.id ?? '');
	const name = String(o.name ?? o.fullName ?? '');
	const role = o.role != null ? String(o.role) : undefined;
	// Backend uses `department` instead of `location`.
	const location = (o.location ?? o.department) != null ? String(o.location ?? o.department) : undefined;
	const managerId = o.managerId != null ? String(o.managerId) : undefined;
	const wagesCount = o.wagesCount != null ? Number(o.wagesCount) : undefined;
	if (!id || !name) return null;
	return { id, name, role, location, managerId, wagesCount };
}

export default function AdminEmployeeListPage() {
	const router = useRouter();
	const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
	const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);

	useEffect(() => {
	const loadEmployees = async () => {
			setLoading(true);
			setError(null);
			try {
		console.log('[Employeelist] Fetching employees…');
		const res = await fetch('/api/manager/employees', { cache: 'no-store' });
		console.log('[Employeelist] Employees response status:', res.status);
				if (!res.ok) throw new Error(`Failed to fetch employees: ${res.status}`);
		const json = (await res.json()) as unknown;
		console.log('[Employeelist] Employees raw JSON:', json);
		const obj = json as Record<string, unknown>;
		const listCandidate = Array.isArray(json) ? json : (obj?.data as unknown) ?? (obj?.employees as unknown);
				const arr = Array.isArray(listCandidate) ? listCandidate : [];
				const mapped = arr.map(asEmployeeRecord).filter(Boolean) as EmployeeRecord[];
		console.log('[Employeelist] Parsed items count:', arr.length);
		console.log('[Employeelist] Mapped items count:', mapped.length);
		setEmployees(mapped);
	    } catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('[Employeelist] Fetch employees error:', msg);
		setError(msg);
			} finally {
				setLoading(false);
			}
		};
	const loadUsers = async () => {
			try {
		console.log('[Employeelist] Fetching admin users…');
		const res = await fetch('/api/admin/users', { cache: 'no-store' });
		console.log('[Employeelist] Users response status:', res.status);
				if (!res.ok) return;
		const json = (await res.json()) as unknown;
		console.log('[Employeelist] Users raw JSON:', json);
		const obj = json as Record<string, unknown>;
		const listCandidate = Array.isArray(json) ? json : (obj?.data as unknown) ?? (obj?.users as unknown);
				const arr = Array.isArray(listCandidate) ? listCandidate : [];
		const mapped = arr
							.map((u: unknown) => {
								const r = u as Record<string, unknown>;
								const id = String(r?.id ?? r?._id ?? '');
								const name = String(r?.name ?? '');
						if (!id || !name) return null;
						return { id, name } as AdminUser;
					})
					.filter(Boolean) as AdminUser[];
		console.log('[Employeelist] Users mapped count:', mapped.length);
		setUsers(mapped);
			} catch {
				// ignore
			}
		};
		loadEmployees();
		loadUsers();
	}, []);

	// Do not auto-select manager from session to avoid hiding data by default

	const managerNameById = useMemo(() => {
		const map = new Map<string, string>();
		for (const u of users) map.set(u.id, u.name);
		return map;
	}, [users]);

	const filtered = useMemo(() => {
		return employees.filter((e) => {
			const byLoc = selectedLocation ? (e.location ?? '') === selectedLocation : true;
			const byMgr = selectedManagerId ? (e.managerId ?? '') === selectedManagerId : true;
			return byLoc && byMgr;
		});
	}, [employees, selectedLocation, selectedManagerId]);

	const byLocation = useMemo(() => {
		const map = new Map<string, number>();
		for (const e of filtered) {
			const key = e.location || 'Unknown';
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return Array.from(map.entries()).map(([location, count]) => ({ location, count }));
	}, [filtered]);

	const byManager = useMemo(() => {
		const map = new Map<string, number>();
		for (const e of filtered) {
			const key = e.managerId || 'Unknown';
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return Array.from(map.entries()).map(([managerId, count]) => ({ managerId, count }));
	}, [filtered]);

	const locations = useMemo(() => Array.from(new Set(employees.map((e) => e.location).filter(Boolean))), [employees]);
	const managers = useMemo(() => {
		// Build dropdown from admin users to ensure managers are available even if employees lack managerId
		return users.map((u) => ({ id: u.id, name: u.name }));
	}, [users]);

	// Helper: employees under selected manager by managerId or by manager's locations
	const employeesUnderSelectedManager = useMemo(() => {
		if (!selectedManagerId) return [] as EmployeeRecord[];
		const byId = employees.filter((e) => (e.managerId ?? '') === selectedManagerId);
		if (byId.length > 0) return byId;
		// Fallback: match by manager's locations if provided by admin users API
	const mgr = users.find((u) => u.id === selectedManagerId) as (AdminUser & { locations?: unknown }) | undefined;
	const rawLocs = mgr?.locations as unknown;
	const locs: string[] = Array.isArray(rawLocs) ? rawLocs.map((l) => String(l)) : [];
		if (locs.length === 0) return [] as EmployeeRecord[];
		const set = new Set(locs.map(String));
		return employees.filter((e) => e.location && set.has(String(e.location)));
	}, [selectedManagerId, employees, users]);

	return (
		<div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
			<div className="flex items-center justify-between">
				<span className="text-sm text-muted-foreground">Managers: {users.length}</span>
				<span className="text-sm text-muted-foreground">Employees: {employees.length} (filtered: {filtered.length})</span>
			</div>
					{/* Selected Manager's Employees */}
					<Card>
						<CardHeader>
							<CardTitle>Employees by Selected Manager</CardTitle>
						</CardHeader>
						<CardContent>
									{selectedManagerId && (
										<div className="mb-3 flex items-center justify-between">
											<div className="text-sm text-muted-foreground">
												Manager: {managerNameById.get(selectedManagerId) ?? selectedManagerId}
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() => router.push(`/admin/reports/employeelist/wages?managerId=${encodeURIComponent(selectedManagerId)}`)}
											>
												See all wages under manager
											</Button>
										</div>
									)}
							{!selectedManagerId && (
								<div className="text-sm text-muted-foreground">Select a manager from the dropdown to view their employees.</div>
							)}
							{selectedManagerId && (
								<div className="overflow-x-auto overflow-y-auto max-h-96">
									<Table className="min-w-225">
										<TableHeader>
											<TableRow className="sticky top-0 bg-background">
												<TableHead>Name</TableHead>
												<TableHead className="hidden sm:table-cell">Role</TableHead>
												<TableHead>Location</TableHead>
														<TableHead>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{employeesUnderSelectedManager.length === 0 && (
												<TableRow>
													<TableCell colSpan={4} className="text-xs sm:text-sm text-muted-foreground">No employees under this manager.</TableCell>
												</TableRow>
											)}
											{employeesUnderSelectedManager.map((e) => (
												<TableRow key={e.id}>
													<TableCell className="text-xs sm:text-sm">{e.name}</TableCell>
													<TableCell className="hidden sm:table-cell text-xs sm:text-sm">{e.role || ''}</TableCell>
													<TableCell className="text-xs sm:text-sm">{e.location ?? ''}</TableCell>
													<TableCell>
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																const mid = e.managerId ?? selectedManagerId ?? '';
																router.push(`/admin/reports/employeelist/wages?managerId=${encodeURIComponent(mid)}`);
															}}
														>
															View Wages
														</Button>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
				<CardHeader>
					<CardTitle>Employees</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
						<div className="flex items-center gap-2">
							<span className="text-xs sm:text-sm text-muted-foreground">Location:</span>
							<div className="flex flex-wrap gap-2">
								{locations.map((loc) => (
									<Button
										key={loc}
										variant={selectedLocation === loc ? 'default' : 'outline'}
										size="sm"
											onClick={() => setSelectedLocation((prev) => (prev === (loc as string) ? null : (loc as string)))}
									>
										{loc}
									</Button>
								))}
								<Button variant="ghost" size="sm" onClick={() => setSelectedLocation(null)}>Clear</Button>
							</div>
						</div>

						<Separator orientation="horizontal" className="sm:hidden" />
						<Separator orientation="vertical" className="hidden sm:block h-6" />

						<div className="flex items-center gap-2">
							<span className="text-xs sm:text-sm text-muted-foreground">Manager:</span>
							<select
								className="border rounded px-2 py-1 text-xs sm:text-sm"
								value={selectedManagerId ?? ''}
								onChange={(e) => setSelectedManagerId(e.target.value || null)}
							>
								<option value="">All</option>
								{managers.map((m) => (
									<option key={m.id} value={m.id}>{m.name}</option>
								))}
							</select>
							<Button variant="ghost" size="sm" onClick={() => setSelectedManagerId(null)}>Clear</Button>
						</div>
					</div>
				</CardContent>
				<CardHeader>
					<CardTitle>By Location</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto overflow-y-auto max-h-96">
						<Table className="min-w-150">
							<TableHeader>
								<TableRow className="sticky top-0 bg-background">
									<TableHead>Location</TableHead>
									<TableHead>Count</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{byLocation.map((r) => (
									<TableRow key={r.location}>
										<TableCell>
											<Button
												variant={selectedLocation === r.location ? 'default' : 'link'}
												onClick={() => setSelectedLocation((prev) => (prev === r.location ? null : r.location))}
											>
												{r.location}
											</Button>
										</TableCell>
										<TableCell className="text-xs sm:text-sm">{r.count}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>By Manager</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto overflow-y-auto max-h-96">
						<Table className="min-w-150">
							<TableHeader>
								<TableRow className="sticky top-0 bg-background">
									<TableHead>Manager</TableHead>
									<TableHead>Count</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{byManager.map((r) => (
									<TableRow key={r.managerId}>
										<TableCell className="text-xs sm:text-sm">{managerNameById.get(r.managerId) || r.managerId}</TableCell>
										<TableCell className="text-xs sm:text-sm">{r.count}</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() => router.push(`/admin/reports/employeelist/wages?managerId=${encodeURIComponent(r.managerId)}`)}
											>
												View Wages
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>All Employees</CardTitle>
				</CardHeader>
				<CardContent>
					{loading && <div className="text-sm text-muted-foreground">Loading…</div>}
					{error && <div className="text-sm text-red-600">{error}</div>}
					<div className="overflow-x-auto overflow-y-auto max-h-128">
						<Table className="min-w-225">
							<TableHeader>
								<TableRow className="sticky top-0 bg-background">
									<TableHead>Name</TableHead>
									<TableHead className="hidden sm:table-cell">Role</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Manager</TableHead>
									<TableHead className="hidden md:table-cell">Wages Records</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.length === 0 && !loading && (
									<TableRow>
										<TableCell colSpan={5} className="text-xs sm:text-sm text-muted-foreground">No employees to display. Try clearing filters.</TableCell>
									</TableRow>
								)}
								{filtered.map((e) => (
									<TableRow key={e.id}>
										<TableCell className="text-xs sm:text-sm">{e.name}</TableCell>
										<TableCell className="hidden sm:table-cell text-xs sm:text-sm">{e.role || ''}</TableCell>
										<TableCell className="text-xs sm:text-sm">{e.location ?? ''}</TableCell>
										<TableCell className="text-xs sm:text-sm">{managerNameById.get(e.managerId || '') || e.managerId || ''}</TableCell>
										<TableCell className="hidden md:table-cell text-xs sm:text-sm">{e.wagesCount ?? ''}</TableCell>
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
