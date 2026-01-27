"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterManagerForm() {
  type User = {
    id: string;
    name: string;
    email?: string;
    password?: string;
    phone?: string;
    role: string;
    locations: string[];
  };

  const { addManager } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleLocation = (loc: string) => {
    setLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim() || email.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phone: phone.trim(),
        locations,
      };

      const res = await fetch("/api/users/create-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("You are not signed in.");
        if (res.status === 403) throw new Error("You don't have permission.");
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to register manager.");
      }

      // Optimistic UI: add to local list
      const newManager: User = {
        id: Date.now().toString(),
        name: payload.name,
        email: payload.email,
        password: undefined,
        phone: payload.phone,
        role: "MANAGER",
        locations: payload.locations || [],
      };
      addManager(newManager);

  setSuccess("Manager registered successfully.");

  // Reset form
  setName("");
  setEmail("");
  setPassword("");
  setPhone("");
  setLocations([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Correctly separate available locations
  const availableLocations = [
    "Nagelle",
    "Shashemen 1",
    "Shashemen 2",
    "Addis Ababa",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-3xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-gray-900">
          Register Manager
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

          {error && (
            <Alert variant="destructive" role="alert" className="mb-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success" aria-live="polite" className="mb-3 flex items-center justify-between">
              <AlertDescription>{success}</AlertDescription>
              <button
                type="button"
                className="ml-4 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-200"
                aria-label="Dismiss success message"
                onClick={() => setSuccess(null)}
              >
                ×
              </button>
            </Alert>
          )}

          {/* Name */}
          <div className="flex flex-col">
            <Label htmlFor="name" className="mb-1">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter manager name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <Label htmlFor="email" className="mb-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter manager email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <Label htmlFor="password" className="mb-1">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <Label htmlFor="phone" className="mb-1">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Locations multi-select (responsive Sheet) */}
          <div className="flex flex-col gap-2">
            <Label className="mb-1">Locations</Label>
            <Sheet>
              <SheetTrigger asChild>
                <Button type="button" variant="outline" className="justify-between w-full">
                  {locations.length > 0 ? `${locations.length} selected` : "Choose locations"}
                  <span className="text-muted-foreground text-xs hidden sm:inline">Tap to select</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90%] sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Select locations</SheetTitle>
                  <SheetDescription>Pick one or more locations for this manager.</SheetDescription>
                </SheetHeader>
                <div className="mt-2 grid grid-cols-1 gap-2 px-4">
                  {availableLocations.map((loc) => {
                    const checked = locations.includes(loc);
                    return (
                      <label
                        key={loc}
                        className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-accent/40"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-black"
                          checked={checked}
                          onChange={() => toggleLocation(loc)}
                        />
                        <span className="text-sm sm:text-base">{loc}</span>
                      </label>
                    );
                  })}
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="button" className="w-full">Done</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {locations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs sm:text-sm"
                  >
                    {loc}
                    <button
                      type="button"
                      aria-label={`Remove ${loc}`}
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => toggleLocation(loc)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting} className="w-full py-3 mt-2 text-base sm:text-lg">
            {submitting ? "Registering..." : "Register Manager"}
          </Button>
        </form>
      </div>
    </div>
  );
}
