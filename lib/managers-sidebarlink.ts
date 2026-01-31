import {
  Home,
  TrendingUp,
  ShoppingCart,
  Package,
  Wallet,
  Activity,
  Settings,
} from "lucide-react";

export const items = [
  {
    title: "Home",
    url: "/manager/dashboard",
    description: "Overview of the dashboard",
    icon: Home,
  },
  {
    title: "Sales",
    url: "/manager/sales",
    description: "View and manage sales data",
    icon: TrendingUp,
  },
  {
    title: "Purchases",
    url: "/manager/purchases",
    description: "View and manage purchase data",
    icon: ShoppingCart,
  },
  {
    title: "Orders",
    url: "/manager/orders",
    description: "View and manage order data",
    icon: Package,
  },
  {
    title: "Wages",
    url: "/manager/employeelist",
    description: "View and manage wage data",
    icon: Wallet,
  },
  {
    title: "Operations",
    url: "/manager/operations",
    description: "View and manage operations data",
    icon: Activity,
  },
  {
    title: "Settings",
    url: "/manager/settings",
    icon: Settings,
  },
];
