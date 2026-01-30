"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ManagersSideBar from "@/components/ManagersSideBar";
import { LogoutButton } from "@/components/LogoutButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const name = session?.user?.name ?? session?.user?.email?.split('@')[0] ?? "Manager";

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-neutral-200">
          <ManagersSideBar />
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200 shadow-sm px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile sidebar trigger */}
              <div className="md:hidden">
                <SidebarTrigger 
                  aria-label="Toggle menu"
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 transition"
                >
                  Menu
                </SidebarTrigger>
              </div>
              
              {/* Title + Welcome */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1B3A57]">Manager Dashboard</h1>
                <p className="text-sm text-neutral-500 mt-1">
                  Welcome back, <span className="font-semibold text-neutral-700">{name}</span>
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <div className="sm:ml-auto mt-2 sm:mt-0">
              <LogoutButton
                label="Logout"
                redirectTo="/auth/login"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
              />
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}