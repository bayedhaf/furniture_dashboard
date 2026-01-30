

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { items } from "@/lib/admin-sidebar-nav"
import { LogoutButton } from "./LogoutButton"
import { LogOut } from "lucide-react"

export default function  AdminSideBar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>A.W.G/Wandiye</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 bg-[#1B3A57] p-4">
      <LogoutButton
        redirectTo="/auth/login"
        label={
          <div className="flex items-center justify-center gap-2">
            <LogOut size={18} className="text-red-400" />
            <span className="text-red-400 font-medium text-sm">Logout</span>
          </div>
        }
        className="
          w-full
          rounded-md
          bg-transparent
          px-4 py-2
          hover:bg-red-500/10
          focus:outline-none focus:ring-2 focus:ring-red-500/40
          transition
        "
      />
    </SidebarFooter>
    </Sidebar>
  )
}