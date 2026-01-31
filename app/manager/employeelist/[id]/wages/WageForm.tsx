"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

export default function WageForm({ employeeId }: { employeeId: string }) {
  const [salaryType, setSalaryType] = useState<"daily" | "weekly">("daily");
  const [dailyRate, setDailyRate] = useState(0);
  const [weeklyRate, setWeeklyRate] = useState(0);
  const [daysWorked, setDaysWorked] = useState(0);
  const [saturdayBonus, setSaturdayBonus] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [saturdayDate, setSaturdayDate] = useState<string>("");

  /* Generate last 8 Saturdays for dropdown */
  const saturdayOptions =[
    { day: "Monday" },
    { day: "Tuesday" },
    { day: "Wednesday" },
    { day: "Thursday" },
    { day: "Friday" },
    { day: "Saturday" },
   
  ];
  const weekdays = Math.min(daysWorked, 5);
  const saturdayWorked = Boolean(saturdayDate);

  let gross = 0;
  if (salaryType === "daily") {
    gross = weekdays * dailyRate + (saturdayWorked ? saturdayBonus : 0);
  } else {
    gross = weeklyRate + (saturdayWorked ? saturdayBonus : 0);
  }

  const balance = gross - advancePaid;

  const status =
    advancePaid === 0
      ? "No Paid"
      : advancePaid < gross
      ? "Partial Paid"
      : "Full Paid";

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await fetch(`/api/manager/employees/${employeeId}/wages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salaryType,
        dailyRate,
        weeklyRate,
        daysWorked,
        saturdayDate,
        saturdayBonus,
        advancePaid,
        gross,
        balance,
        status,
      }),
    });

    location.reload();
  }

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-lg border"
    >
      {/* Salary Type */}
      <Select value={salaryType} onValueChange={(v) => setSalaryType(v as any)}>
        <SelectTrigger>
          <SelectValue placeholder="Salary Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
        </SelectContent>
      </Select>

      {/* Rates */}
      {salaryType === "daily" && (
        <Input
          type="number"
          placeholder="Daily Rate (Mon–Fri)"
          onChange={(e) => setDailyRate(+e.target.value)}
        />
      )}

      {salaryType === "weekly" && (
        <Input
          type="number"
          placeholder="Weekly Rate"
          onChange={(e) => setWeeklyRate(+e.target.value)}
        />
      )}

      {/* Days */}
      <Input
        type="number"
        max={6}
        placeholder="Days Worked (Mon–Fri)"
        onChange={(e) => setDaysWorked(+e.target.value)}
      />

      {/* Saturday selection */}
      <Select
        value={saturdayDate || "none"}
        onValueChange={(v: string) => setSaturdayDate(v === "none" ? "" : v)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Saturday Worked (Optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Saturday</SelectItem>
          {saturdayOptions.map((d,k) => (
            <SelectItem key={k} value={d.day}>
              {d.day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {saturdayWorked && (
        <Input
          type="number"
          placeholder="Saturday Payment"
          onChange={(e) => setSaturdayBonus(+e.target.value)}
        />
      )}

      <Input
        type="number"
        placeholder="Advance Paid"
        onChange={(e) => setAdvancePaid(+e.target.value)}
      />

      {/* Summary */}
      <div className="md:col-span-3 text-sm space-y-1">
        <p>
          Gross Salary: <strong>ETB {gross}</strong>
        </p>
        <p>
          Balance: <strong>ETB {balance}</strong>
        </p>
        <p>
          Payment Status: <strong>{status}</strong>
        </p>
      </div>

      <Button className="md:col-span-3 bg-[#007B7F] hover:bg-[#00686C]">
        Save Wage
      </Button>
    </form>
  );
}
