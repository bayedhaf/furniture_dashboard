"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type Employee = {
  fullName: string;
  phone: string;
  role: string;
  department: string;
  salaryType: "daily" | "weekly";
  dailyRate?: number;
  weeklyRate?: number;
  startDate: string;
  status: "active" | "inactive";
  address?: string;
};

export default function EmployeeForm() {
  const [form, setForm] = useState<Employee>({
    fullName: "",
    phone: "",
    role: "",
    department: "",
    salaryType: "daily",
    dailyRate: 0,
    weeklyRate: 0,
    startDate: "",
    status: "active",
    address: "",
  });

  function set<K extends keyof Employee>(key: K, value: Employee[K]) {
    setForm({ ...form, [key]: value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/manager/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    location.reload();
  }

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-6 rounded-lg border"
    >
      {/* Full Name */}
      <Input
        placeholder="Employee Full Name"
        value={form.fullName}
        onChange={(e) => set("fullName", e.target.value)}
      />

      {/* Phone */}
      <Input
        placeholder="Phone Number"
        value={form.phone}
        onChange={(e) => set("phone", e.target.value)}
      />

      {/* Role */}
      <Input
        placeholder="Job Title / Role"
        value={form.role}
        onChange={(e) => set("role", e.target.value)}
      />

      {/* Department */}
      <Input
        placeholder="Department (e.g Carpentry)"
        value={form.department}
        onChange={(e) => set("department", e.target.value)}
      />

      {/* Salary Type */}
      <Select value={form.salaryType} onValueChange={(v) => set("salaryType", v as any)}>
        <SelectTrigger>
          <SelectValue placeholder="Salary Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
        </SelectContent>
      </Select>

      {/* Salary Amount */}
      {form.salaryType === "daily" ? (
        <Input
          type="number"
          placeholder="Daily Rate (ETB)"
          onChange={(e) => set("dailyRate", +e.target.value)}
        />
      ) : (
        <Input
          type="number"
          placeholder="Weekly Rate (ETB)"
          onChange={(e) => set("weeklyRate", +e.target.value)}
        />
      )}

      {/* Start Date */}
      <Input
        type="date"
        value={form.startDate}
        onChange={(e) => set("startDate", e.target.value)}
      />

      {/* Status */}
      <Select value={form.status} onValueChange={(v) => set("status", v as any)}>
        <SelectTrigger>
          <SelectValue placeholder="Employment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Address */}
      <Textarea
        placeholder="Address (optional)"
        className="md:col-span-2"
        value={form.address}
        onChange={(e) => set("address", e.target.value)}
      />

      <Button className="md:col-span-3 bg-[#007B7F]">
        Register Employee
      </Button>
    </form>
  );
}
