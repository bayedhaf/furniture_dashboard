"use client";

import RequireRole from "@/components/RequireRole";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { items } from "@/lib/managers-sidebarlink";

export default function ManagerDashboard() {
  const { data: session } = useSession();
  // const name = session?.user?.name ?? session?.user?.email ?? "";
  const locations =
    (session as typeof session & { locations?: string[] })?.locations || [];

  return (
    <RequireRole roles={["manager"]}>
      <div className="y-overflow-scroll">
         <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
        
     <header className="mb-12 flex justify-center">
  <Card className="w-full max-w-3xl bg-white shadow-md border border-[#E1E4E8]">
    <CardHeader className="text-center">
<CardDescription className="text-[#6C757D]">
        Assigned Locations: {locations.length ? locations.join(", ") : "None"}
      </CardDescription>
    </CardHeader>
  </Card>
</header>

          {/* ================= Cards ================= */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Link key={i} href={item.url}>
                <Card className="cursor-pointer bg-white hover:bg-[#007B7F]/10 transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-[#1B3A57]">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#6C757D]">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
      </div>
    
     
    </RequireRole>
  );
}
