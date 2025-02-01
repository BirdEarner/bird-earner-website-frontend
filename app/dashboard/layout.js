import { cookies } from "next/headers"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function Layout({ children }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-14 items-center gap-4 border-b border-purple-200 bg-purple-50/80 px-6 backdrop-blur">
          <SidebarTrigger className="text-purple-600 hover:bg-purple-100" />
          <div className="flex-1" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
