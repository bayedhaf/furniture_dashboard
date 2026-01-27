
import {
  Home,
  UserPlus,
  FileBarChart2,
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
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Add Managers",
    url: "/admin/add-managers",
    icon: UserPlus,
  },
  {
    title: "Manage Reports",
    url: "/reports",
    icon: FileBarChart2,
  },
  {
    title: "Sales Reports",
    url: "/reports/sales",
    icon: TrendingUp,
  },
  {
    title: "Purchase Reports",
    url: "/reports/purchases",
    icon: ShoppingCart,
  },
  {
    title: "Orders Reports",
    url: "/reports/orders",
    icon: Package,
  },
  {
    title: "Wages Reports",
    url: "/reports/wages",
    icon: Wallet,
  },
  {
    title: "Operational Reports",
    url: "/reports/operations",
    icon: Activity,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
