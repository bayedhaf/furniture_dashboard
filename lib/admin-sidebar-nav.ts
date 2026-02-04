
import {
  Home,
  UserPlus,

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
    url: "/admin",
    icon: Home,
  },
  {
    title: "Add Managers",
    url: "/admin/add-managers",
    icon: UserPlus,
  },
  {
    title: "Sales Reports",
    url: "/admin/reports/sales",
    icon: TrendingUp,
  },
  {
    title: "Purchase Reports",
    url: "/admin/reports/purchases",
    icon: ShoppingCart,
  },
  {
    title: "Orders Reports",
    url: "/admin/reports/orders",
    icon: Package,
  },
  {
    title: "Wages Reports",
    url: "/admin/reports/employeelist",
    icon: Wallet,
  },
  {
    title: "Operational Reports",
    url: "/admin/reports/operations",
    icon: Activity,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];
