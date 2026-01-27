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
    icon: Home,
  },
  {
    title: "Sales",
    url: "/manager/sales",
    icon: TrendingUp,
  },
  {
    title: "Purchases",
    url: "/manager/purchases",
    icon: ShoppingCart,
  },
  {
    title: "Orders",
    url: "/manager/orders",
    icon: Package,
  },
  {
    title: "Wages",
    url: "/manager/wages",
    icon: Wallet,
  },
  {
    title: "Operations",
    url: "/manager/operations",
    icon: Activity,
  },
  {
    title: "Settings",
    url: "/manager/settings",
    icon: Settings,
  },
];
