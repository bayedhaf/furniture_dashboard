"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Summary = {
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  totalBalance: number;
  weeklyOrders: number;
  monthlyOrders: number;
};

export default function OrdersSummaryPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const r = await fetch("/api/manager/orders/summary");
        if (!r.ok) {
          setError(await r.text());
          return;
        }
        const data = await r.json();
        setSummary(data as Summary);
      } catch {
        setError("Failed to load summary");
      }
    })();
  }, []);

  if (!summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-neutral-200 rounded-lg" />
        ))}
      </div>
    );
  }

  const formatETB = (v: number) => `ETB ${Number(v || 0).toLocaleString()}`;

  const stats = [
    {
      label: "Total Orders",
      value: summary.totalOrders,
    },
    {
      label: "Weekly Orders",
      value: summary.weeklyOrders,
    },
    {
      label: "Monthly Orders",
      value: summary.monthlyOrders,
    },
    {
      label: "Total Revenue",
      value: formatETB(summary.totalRevenue),
    },
    {
      label: "Total Paid",
      value: formatETB(summary.totalPaid),
    },
    {
      label: "Outstanding Balance",
      value: formatETB(summary.totalBalance),
    },
  ];

  return (
    <div className="space-y-6 w-[1000px]">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A57]">
          Orders Summary
        </h1>
        <p className="text-sm text-neutral-500">
          Weekly & Monthly overview
        </p>
      </div>

      {/* Summary cards */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-sm text-neutral-500">{s.label}</p>
              <p className="text-2xl font-semibold text-[#007B7F]">
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
