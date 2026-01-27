"use client";

import RequireRole from "@/components/RequireRole";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ManagerDashboard() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? session?.user?.email ?? "";
  const locations = (session as typeof session & { locations?: string[] })?.locations || [];

  return (
    <RequireRole roles={["manager"]}>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Header */}
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold mb-2">Manager Dashboard</h1>
            <p className="text-gray-600">
              Welcome, <span className="font-semibold">{name}</span>
            </p>
            <p className="text-gray-500 mt-1">
              Assigned Locations: {locations.length ? locations.join(", ") : "None"}
            </p>
          </header>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Reports */}
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View and manage reports for your assigned locations.</p>
              </CardContent>
            </Card>

            {/* Workers */}
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Manage workers under your supervision.</p>
              </CardContent>
            </Card>

            {/* Operations */}
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Monitor operational activities for your assigned areas.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
