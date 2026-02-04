"use client";

import RegisterManagerForm from "./RegisterManagerForm";
import { useAuth } from "@/context/AuthContext";
import RequireRole from "@/components/RequireRole";

export default function AddManagersPage() {
  const { managers } = useAuth();

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-[#1B3A57]">
          Manage Managers
        </h1>

        <RegisterManagerForm />

        {/* Manager list */}
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold">Registered Managers</h3>

          {managers.length === 0 ? (
            <p className="text-sm text-neutral-500">No managers yet</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {managers.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col sm:flex-row sm:justify-between rounded-md border p-3"
                >
                  <span className="font-medium">{m.name}</span>
                  <span className="text-neutral-500">
                    {m.locations.join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </RequireRole>
  );
}
