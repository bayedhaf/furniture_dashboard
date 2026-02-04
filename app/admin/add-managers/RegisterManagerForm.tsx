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
  const { addManager } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableLocations = [
    "Negele",
    "Shashemen 1",
    "Shashemen 2",
    "Addis Ababa",
  ];

  const toggleLocation = (loc: string) => {
    setLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/users/create-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim() || email,
          email: email.trim().toLowerCase(),
          password,
          phone,
          locations,
        }),
      });

      if (!res.ok) throw new Error("Failed to register manager.");

      addManager({
        id: Date.now().toString(),
        name,
        email,
        role: "MANAGER",
        locations,
      });

      setSuccess("Manager registered successfully");
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setLocations([]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
      <h2 className="mb-6 text-center text-2xl font-bold text-[#1B3A57]">
        Register Manager
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-950">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        {/* Locations */}
        <div className="space-y-2">
          <Label>Locations</Label>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {locations.length ? `${locations.length} selected` : "Select locations"}
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Assign Locations</SheetTitle>
                <SheetDescription>
                  Choose one or more locations
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-2">
                {availableLocations.map((loc) => (
                  <label
                    key={loc}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      checked={locations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                    />
                    <span>{loc}</span>
                  </label>
                ))}
              </div>

              <SheetFooter>
                <SheetClose asChild>
                  <Button className="w-full bg-[#007B7F] hover:bg-[#00686C]">Done</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {locations.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {locations.map((loc) => (
                <span
                  key={loc}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs"
                >
                  {loc}
                </span>
              ))}
            </div>
          )}
        </div>

        <Button
          disabled={submitting}
          className="w-full bg-[#007B7F] hover:bg-[#00686C]"
        >
          {submitting ? "Registering..." : "Register Manager"}
        </Button>
      </form>
    </div>
  );
}
