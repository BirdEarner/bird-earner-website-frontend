"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Settings,
  Bird,
  Users,
  Upload,
  Clock,
  HardDrive,
  FolderOpen,
  MessageSquare,
  LogOut,
  HelpCircle,
  RefreshCw,
  Briefcase,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);
  const { role, logout, switchRole, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const isActive = (path) => pathname === path;

  const isDualRole = role?.freelancer && role?.client;

  if (!isLoaded) {
    return (
      <Sidebar className="border-r border-purple-200 bg-purple-100/50">
        <SidebarHeader className="border-b border-purple-200 bg-purple-100 backdrop-blur">
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3">
            <Image
              src="/bird.png"
              alt="Bird Earner Logo"
              width={32}
              height={32}
            />
            <h1 className="text-lg font-semibold tracking-tight text-purple-900">
              Bird Earner
            </h1>
          </Link>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-purple-200 bg-purple-100/50">
      <SidebarHeader className="border-b border-purple-200 bg-purple-100 backdrop-blur">
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-1">
          <div className="rounded-full bg-purple-800 p-1">
            <Image
              src="/bird.png"
              alt="Bird Earner Logo"
              width={28}
              height={28}
              className="text-purple-600"
            />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-purple-600">
            Bird Earner
          </h1>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <>
          {/* Role Switcher – only visible to dual-role users */}
          {isDualRole && (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>Active Role</SidebarGroupLabel>
                <div className="mx-2 mb-1 flex items-center gap-1 rounded-lg border border-purple-200 bg-white/60 p-1">
                  <button
                    onClick={() => switchRole('freelancer')}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${role.active === 'freelancer'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-700 hover:bg-purple-100'
                      }`}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    Freelancer
                  </button>
                  <button
                    onClick={() => switchRole('client')}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${role.active === 'client'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-700 hover:bg-purple-100'
                      }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Client
                  </button>
                </div>
              </SidebarGroup>
              <SidebarSeparator />
            </>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>Project Management</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard"
                  isActive={isActive("/dashboard")}
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="text-muted-foreground" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Inbox"
                  isActive={isActive("/dashboard/chat")}
                >
                  <Link href="/dashboard/chat">
                    <MessageSquare className="text-muted-foreground" />
                    <span>Inbox</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="FAQs"
                  isActive={isActive("/faqs")}
                >
                  <Link href="/faqs">
                    <HelpCircle className="text-muted-foreground" />
                    <span>FAQs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Profile"
                isActive={isActive("/dashboard/profile")}
              >
                <Link href="/dashboard/profile">
                  <Settings className="text-muted-foreground" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                <LogOut className="text-muted-foreground" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* User info at the bottom */}
      {user && (
        <SidebarFooter className="border-t border-purple-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-purple-900">{user.name || 'User'}</p>
              <p className="truncate text-xs text-purple-500 capitalize">{role.active}</p>
            </div>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
