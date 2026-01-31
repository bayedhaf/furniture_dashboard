"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type ExpenseSummary = {
  totalExpenses: number;
  weeklyExpenses: number;
  monthlyExpenses: number;
  unpaidBalance: number;
};

export default function ExpenseSummaryPage() {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);

  useEffect(() => {
    fetch("/api/manager/operations/expenses/summary")
      .then((r) => r.json())
      .then(setSummary);
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

  const stats = [
    { label: "Total Expenses", value: `ETB ${summary.totalExpenses}` },
    { label: "Weekly Expenses", value: `ETB ${summary.weeklyExpenses}` },
    { label: "Monthly Expenses", value: `ETB ${summary.monthlyExpenses}` },
    { label: "Outstanding Balance or unpaid", value: `ETB ${summary.unpaidBalance}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A57]">
          Expense Summary
        </h1>
        <p className="text-sm text-neutral-500">
          Weekly & Monthly operational expenses
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
