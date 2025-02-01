"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Added missing Image import
import { usePathname } from "next/navigation";
import {
  Settings,
  Bird,
  Users,
  Upload,
  Clock,
  HardDrive,
  FolderOpen,
  LogOut,
  HelpCircle,
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
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);
  const { role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/sign-in");
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const isActive = (path) => pathname === path;

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
          <SidebarGroup>
            <SidebarGroupLabel>Project Management</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard/downloads" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip="Downloads"
                    isActive={isActive("/dashboard/downloads")}
                  >
                    <FolderOpen className="text-muted-foreground" />
                    <span>Downloads</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/upload_files" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip="Upload Files"
                    isActive={isActive("/dashboard/upload_files")}
                  >
                    <Upload className="text-muted-foreground" />
                    <span>Upload Files</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/users" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip="Users"
                    isActive={isActive("/dashboard/users")}
                  >
                    <Users className="text-muted-foreground" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/file_manager" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip="File manager"
                    isActive={isActive("/dashboard/file_manager")}
                  >
                    <FolderOpen className="text-muted-foreground" />
                    <span>File manager</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/dashboard/storage" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip="Storage"
                    isActive={isActive("/dashboard/storage")}
                  >
                    <HardDrive className="text-muted-foreground" />
                    <span>Storage</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/faqs" passHref legacyBehavior>
                  <SidebarMenuButton
                    tooltip="FAQs"
                    isActive={isActive("/faqs")}
                  >
                    <HelpCircle className="text-muted-foreground" />
                    <span>FAQs</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/profile" passHref legacyBehavior>
                <SidebarMenuButton
                  tooltip="Profile"
                  isActive={isActive("/dashboard/profile")}
                >
                  <Settings className="text-muted-foreground" />
                  <span>Profile</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Profile" onClick={handleLogout}>
                <LogOut className="text-muted-foreground" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
