"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ManagersSideBar from "@/components/ManagersSideBar";


import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import AvatarProfile from "../setting/ProfileImage";
import { LayoutProvider } from "@/components/LayoutContext";
import Footer from "@/components/Footer";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const name =
    session?.user?.name ??
    session?.user?.email?.split("@")[0] ??
    "Manager";

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-neutral-500">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (

   <LayoutProvider isAdminLayout={true}>
    <SidebarProvider>
      <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex md:w-64 lg:w-72 border-r bg-white">
          <ManagersSideBar />
        </aside>

        {/* Main */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              {/* Left */}
              <div className="flex items-center gap-3">
                {/* Mobile menu */}
                <div className="md:hidden">
                  <SidebarTrigger
                    aria-label="Toggle menu"
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Menu
                  </SidebarTrigger>
                </div>

                {/* Title */}
                <div className="hidden md:block">
                  <h1 className="text-lg font-bold text-[#1B3A57] sm:text-xl">
                    Manager Dashboard
                  </h1>
                  <p className="text-xs text-neutral-500 sm:text-sm">
                    Welcome back,{" "}
                    <span className="font-semibold text-neutral-700">
                      {name}
                    </span>
                  </p>
                </div>
              </div>

              {/* Right (profile) */}
              <div className="flex justify-end">
                <Link
                  href="/manager/settings"
                  className="inline-flex items-center gap-2 rounded-full p-2 transition hover:bg-neutral-100"
                >
                  <AvatarProfile className="h-6 w-6 text-neutral-600" />
                </Link>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 md:px-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
               
            </div>
           
          </main>
            <Footer />
        </div>
        
      </div>
    </SidebarProvider>
    </LayoutProvider>
  );
}
