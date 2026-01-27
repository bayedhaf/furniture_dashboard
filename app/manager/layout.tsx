import type { Metadata } from "next";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ManagersSideBar from "@/components/ManagersSideBar";

export const metadata: Metadata = {
  title: {
    default: "Manager Dashboard | A.W.G Wandiye Furniture",
    template: "%s | A.W.G Wandiye Furniture",
  },

  description:
    "Manager dashboard for A.W.G Wandiye Furniture. Manage products, orders, customers, and operations for furniture services in Shashemene and Negele Arsi, Ethiopia.",

  keywords: [
    "A.W.G Wandiye Furniture",
    "Furniture Manager Dashboard",
    "Ethiopian Furniture Company",
    "Shashemene Furniture",
    "Negele Arsi Furniture",
    "Oromia Furniture",
    "Furniture Management System",
    "Admin Panel Furniture App",
  ],

  authors: [{ name: "A.W.G Wandiye Furniture" }],
  creator: "A.W.G Wandiye Furniture",
  publisher: "A.W.G Wandiye Furniture",

  metadataBase: new URL("https://www.awgwandiyefurniture.com"),

  alternates: {
    canonical: "/admin",
  },

  openGraph: {
    title: "A.W.G Wandiye Furniture Admin",
    description:
      "Administrative dashboard for managing furniture operations in Ethiopia.",
    url: "https://www.awgwandiyefurniture.com/admin",
    siteName: "A.W.G Wandiye Furniture",
    locale: "en_ET",
    type: "website",
    images: [
      {
        url: "/og-admin.jpg",
        width: 1200,
        height: 630,
        alt: "A.W.G Wandiye Furniture Admin Dashboard",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "A.W.G Wandiye Furniture Admin",
    description: "Manage furniture products and operations.",
    images: ["/og-admin.jpg"],
  },

  robots: {
    index: false, // 👈 admin should NOT be indexed
    follow: false,
  },

  category: "Business Software",
};

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 lg:w-72 bg-white border-r border-neutral-200">
          <ManagersSideBar />
        </aside>

        {/* Mobile Trigger */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <SidebarTrigger className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-lg hover:bg-indigo-700 transition">
            Menu
          </SidebarTrigger>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
