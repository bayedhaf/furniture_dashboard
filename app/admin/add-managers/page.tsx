"use client";
// app/admin/managers/page.tsx
import RegisterManagerForm from "./RegisterManagerForm";
import { useAuth } from "@/context/AuthContext";
import RequireRole from "@/components/RequireRole";

export default function AddManagersPage() {
  const { managers } = useAuth();

  return (
    <RequireRole roles={["admin"]}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Manage Managers</h1>
        <RegisterManagerForm />

        <div className="mt-6">
          <h3 className="font-semibold">Registered Managers:</h3>
          <ul className="list-disc ml-5 mt-2">
            {managers.map((m) => (
              <li key={m.id}>
                {m.name} - {m.locations.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RequireRole>
  );
}
