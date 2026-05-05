import {
  Book,
  FileUser,
  LayoutDashboard,
  LibraryBig,
  PlusCircle,
  Settings2,
  Verified,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../ui/sidebar"
import { Button } from "../ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import Link from "next/link"
import { apiFetch } from "@/lib/api/server"
import type { User } from "@/lib/api/types"
import { LogoutButton } from "./logout-button"

async function getUserData(): Promise<User | null> {
  try {
    return await apiFetch<User>("/auth/me")
  } catch {
    return null
  }
}

export default async function SideNav() {
  const user = await getUserData()
  const menu = [
    {
      name: "Dashboard",
      url: "/app",
      icon: LayoutDashboard,
    },
    {
      name: "Verify",
      url: "/app/verify",
      icon: Verified,
    },
    {
      name: "Portfolio",
      url: "/app/portfolio",
      icon: FileUser,
    },
  ]

  return (
    <Sidebar className="py-8">
      <SidebarHeader className="px-4">
        <h1 className="text-md mb-8 flex items-center justify-center gap-2 font-semibold">
          <span className="flex items-center gap-2 font-semibold">
            <Book />
            Skill Collection
          </span>
        </h1>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarMenu>
            {menu.map((menu) => (
              <SidebarMenuItem key={menu.name} className="py-2">
                <SidebarMenuButton asChild>
                  <Link href={menu.url}>
                    <menu.icon />
                    <span>{menu.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4">
        <SidebarMenu>
          <SidebarMenuItem className="py-2">
            <SidebarMenuButton asChild>
              <Link href="/app/settings">
                <Settings2 />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex w-full items-center rounded-md bg-muted px-2 py-1 flex-col gap-3">
              <div className="flex w-full items-center gap-2">
                <Avatar className="h-9 w-9 rounded-none">
                  <AvatarImage src="/wallpaper.png" alt="User Avatar" />
                  <AvatarFallback>
                    {user?.name?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="leading-tight">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
