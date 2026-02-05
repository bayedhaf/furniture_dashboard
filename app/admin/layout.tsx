
"use client";

import AdminSideBar from "@/components/AdminSideBar";
import { LayoutProvider } from "@/components/LayoutContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Footer from "@/components/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider isAdminLayout={true}>
      <SidebarProvider>
        <div className="flex min-h-screen flex-col bg-gray-50">
          <div className="flex flex-1">
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
          
          {/* Footer will automatically adjust based on LayoutContext */}
          <Footer />
        </div>
      </SidebarProvider>
    </LayoutProvider>
  );
}