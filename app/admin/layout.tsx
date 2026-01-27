"use client";

import AdminSideBar from "@/components/AdminSideBar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-gray-200 shadow-sm">
          <AdminSideBar />
        </aside>

        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <SidebarTrigger className="p-2 rounded-md bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition">
            Menu
          </SidebarTrigger>
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
