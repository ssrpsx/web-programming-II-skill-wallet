import SideNav from "@/components/sidenav/sidenav"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Book } from "lucide-react"
import Link from "next/link"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SideNav />

      {/* Mobile top bar with sidebar trigger */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:hidden">
        <SidebarTrigger />
        <Link href="/app" className="flex items-center gap-2 text-sm font-semibold">
          <Book className="h-4 w-4" />
          Skill Collection
        </Link>
      </div>

      <main className="mx-auto max-w-7xl w-full min-h-screen mt-16 px-4 sm:px-6 md:mt-8">
        {children}
      </main>
    </SidebarProvider>
  )
}