"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/super-admin-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useAdminAuth } from "@/hooks/AdminAuthContext";

export default function Layout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAdminAuth();

  useEffect(() => {
    // Skip auth check for sign-in page or while loading
    if (pathname === "/money_plant/sign-in" || loading) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/money_plant/sign-in");
    }
  }, [pathname, router, isAuthenticated, loading]);

  // Don't show sidebar on sign-in page
  if (pathname === "/money_plant/sign-in") {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <SuperAdminSidebar />
      <SidebarInset>
        <div className="flex h-14 items-center gap-4 border-b border-purple-200 bg-purple-50/80 px-6 backdrop-blur">
          <SidebarTrigger className="text-purple-600 hover:bg-purple-100" />
          <div className="flex-1" />
        </div>
        {children}
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
} 