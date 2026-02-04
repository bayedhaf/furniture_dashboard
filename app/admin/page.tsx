"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  UserPlus,
  TrendingUp,
  ShoppingCart,
  Activity,
  Wallet,
  Package,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

function DashboardCard({
  title,
  icon: Icon,
  href,
  accent = 'bg-[#007B7F]',
  children,
}: {
  title: string;
  icon: React.ElementType;
  href?: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  const content = (
    <Card
      className={`
        group relative overflow-hidden p-8 xl:p-10
        border-neutral-200 bg-white
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl
      `}
    >
      {/* Accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 ${accent}`}
      />

      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={`
            flex h-14 w-14 items-center justify-center rounded-xl
            bg-neutral-100 text-[#1B3A57]
            transition-all duration-300
            group-hover:scale-110 group-hover:bg-[#007B7F]/10
          `}
        >
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-semibold text-[#1B3A57]">
          {title}
        </h3>

        {children ? (
          <div className="w-full text-neutral-600 text-sm">
            {children}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">View details</p>
        )}
      </div>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function PurchasesSummaryCardDashboard() {
  const [rows, setRows] = useState<Array<{ total?: number; unitPrice?: number; quantity?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/manager/purchase', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setRows(
          arr.map((x: unknown) => {
            const o = x as Record<string, unknown>;
            return {
              total: typeof o.total === 'number' ? (o.total as number) : Number(o.total ?? 0),
              unitPrice: typeof o.unitPrice === 'number' ? (o.unitPrice as number) : Number(o.unitPrice ?? 0),
              quantity: typeof o.quantity === 'number' ? (o.quantity as number) : Number(o.quantity ?? 0),
            };
          })
        );
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load purchases');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalSpend = rows.reduce((sum, r) => sum + (typeof r.total === 'number' && !isNaN(r.total) ? r.total : (r.unitPrice || 0) * (r.quantity || 0)), 0);
    const totalItems = rows.reduce((sum, r) => sum + (r.quantity || 0), 0);
    return { totalSpend, totalItems, count: rows.length };
  }, [rows]);

  return (
    <DashboardCard
      title="Purchase Reports"
      icon={ShoppingCart}
      href="/admin/reports/purchases"
      accent="bg-blue-600"
    >
      {loading ? (
        <div className="text-center text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-neutral-500 text-sm">Total Spend</p>
            <p className="text-base font-semibold">ETB {totals.totalSpend.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Items Purchased</p>
            <p className="text-base font-semibold">{totals.totalItems}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Purchases</p>
            <p className="text-base font-semibold">{totals.count}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function OrdersSummaryCardDashboard() {
  const [rows, setRows] = useState<Array<{ total?: number; unitPrice?: number; quantity?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/manager/orders', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : (data as Record<string, unknown>)?.data;
        const arr = Array.isArray(list) ? list : [];
        setRows(
          arr.map((x: unknown) => {
            const o = x as Record<string, unknown>;
            return {
              total: typeof o.total === 'number' ? (o.total as number) : Number(o.total ?? 0),
              unitPrice: typeof o.unitPrice === 'number' ? (o.unitPrice as number) : Number(o.unitPrice ?? 0),
              quantity: typeof o.quantity === 'number' ? (o.quantity as number) : Number(o.quantity ?? 0),
            };
          })
        );
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load orders');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalRevenue = rows.reduce((sum, r) => sum + (typeof r.total === 'number' && !isNaN(r.total) ? r.total : (r.unitPrice || 0) * (r.quantity || 0)), 0);
    const totalItems = rows.reduce((sum, r) => sum + (r.quantity || 0), 0);
    return { totalRevenue, totalItems, count: rows.length };
  }, [rows]);

  return (
    <DashboardCard
      title="Orders Reports"
      icon={Package}
      href="/admin/reports/orders"
      accent="bg-rose-600"
    >
      {loading ? (
        <div className="text-center text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-neutral-500 text-sm">Total Revenue</p>
            <p className="text-base font-semibold">ETB {totals.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Items</p>
            <p className="text-base font-semibold">{totals.totalItems}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Orders</p>
            <p className="text-base font-semibold">{totals.count}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
function SalesSummaryCardDashboard() {
  const [rows, setRows] = useState<Array<{ total?: number; price?: number; quantity?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/manager/sales', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setRows(
          arr.map((x: unknown) => {
            const o = x as Record<string, unknown>;
            return {
              total: typeof o.total === 'number' ? (o.total as number) : Number(o.total ?? 0),
              price: typeof o.price === 'number' ? (o.price as number) : Number(o.price ?? 0),
              quantity: typeof o.quantity === 'number' ? (o.quantity as number) : Number(o.quantity ?? 0),
            };
          })
        );
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load sales');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalRevenue = rows.reduce((sum, s) => sum + (typeof s.total === 'number' && !isNaN(s.total) ? s.total : (s.price || 0) * (s.quantity || 0)), 0);
    const totalItems = rows.reduce((sum, s) => sum + (s.quantity || 0), 0);
    return { totalRevenue, totalItems, count: rows.length };
  }, [rows]);

  return (
    <DashboardCard
      title="Sales Reports"
      icon={TrendingUp}
      href="/admin/reports/sales"
      accent="bg-emerald-600"
    >
      {loading ? (
        <div className="text-center text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-neutral-500 text-sm">Total Revenue</p>
            <p className="text-base font-semibold">ETB {totals.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Items Sold</p>
            <p className="text-base font-semibold">{totals.totalItems}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Sales</p>
            <p className="text-base font-semibold">{totals.count}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

export default function AdminDashboard() {
  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-6 xl:gap-10">

       
        <DashboardCard
          title="Add Manager"
          icon={UserPlus}
          href="/admin/add-managers"
          accent="bg-indigo-600"
        />

        {/* Sales & Purchase */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 xl:gap-10">
          <SalesSummaryCardDashboard />
          <PurchasesSummaryCardDashboard />
        </div>

        {/* Operational + Wages + Orders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6  xl:gap-10">
          <OperationsSummaryCardDashboard />

          <div className="grid grid-rows-2 gap-6 xl:gap-10">
            <WagesSummaryCardDashboard />
            <OrdersSummaryCardDashboard />
          </div>
        </div>

        {/* Settings */}
        <DashboardCard
          title="Settings"
          icon={Settings}
          href="/admin/settings"
          accent="bg-neutral-700"
        />
      </div>
    </div>
  );
}

function WagesSummaryCardDashboard() {
  const [rows, setRows] = useState<Array<{ gross?: number; balance?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/manager/wages', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setRows(
          arr.map((x: unknown) => {
            const o = x as Record<string, unknown>;
            return {
              gross: typeof o.gross === 'number' ? (o.gross as number) : Number(o.gross ?? 0),
              balance: typeof o.balance === 'number' ? (o.balance as number) : Number(o.balance ?? 0),
            };
          })
        );
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load wages');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalGross = rows.reduce((sum, r) => sum + (r.gross || 0), 0);
    const totalBalance = rows.reduce((sum, r) => sum + (r.balance || 0), 0);
    return { totalGross, totalBalance, count: rows.length };
  }, [rows]);

  return (
    <DashboardCard
      title="Wages Reports"
      icon={Wallet}
  href="/admin/reports/employeelist/wages"
      accent="bg-purple-600"
    >
      {loading ? (
        <div className="text-center text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-neutral-500 text-sm">Total Gross</p>
            <p className="text-base font-semibold">ETB {totals.totalGross.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Balance Due</p>
            <p className="text-base font-semibold">ETB {totals.totalBalance.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Records</p>
            <p className="text-base font-semibold">{totals.count}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}

function OperationsSummaryCardDashboard() {
  const [rows, setRows] = useState<Array<{ amount?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/manager/operations/expenses', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setRows(
          arr.map((x: unknown) => {
            const o = x as Record<string, unknown>;
            return { amount: typeof o.amount === 'number' ? (o.amount as number) : Number(o.amount ?? 0) };
          })
        );
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load expenses');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(() => {
    const totalSpend = rows.reduce((sum, r) => sum + (r.amount || 0), 0);
    const count = rows.length;
    const avg = count ? totalSpend / count : 0;
    return { totalSpend, avg, count };
  }, [rows]);

  return (
    <DashboardCard
      title="Operational Reports"
      icon={Activity}
      href="/admin/reports/operations"
      accent="bg-orange-500"
    >
      {loading ? (
        <div className="text-center text-neutral-500">Loading…</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <p className="text-neutral-500 text-sm">Total Spend</p>
            <p className="text-base font-semibold">ETB {totals.totalSpend.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Avg Expense</p>
            <p className="text-base font-semibold">ETB {totals.avg.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-neutral-500 text-sm">Expenses</p>
            <p className="text-base font-semibold">{totals.count}</p>
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
