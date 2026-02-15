"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Users,
  Settings,
  LogOut,
  HelpCircle,
  DollarSign,
  UserCheck,
  History,
  UserCog,
  Bell,
  Briefcase,
  MessageSquare
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
import { useAdminAuth } from "@/hooks/AdminAuthContext";
import { useRouter } from "next/navigation";

export function SuperAdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);
  const { logout, admin } = useAdminAuth();

  const handleLogout = async () => {
    logout();
    router.push("/money_plant/sign-in");
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const isActive = (path) => pathname === path;

  if (!isLoaded) {
    return (
      <Sidebar className="border-r border-purple-200 bg-purple-100/50">
        <SidebarHeader className="border-b border-purple-200 bg-purple-100 backdrop-blur">
          <Link href="/money_plant" className="flex items-center gap-2 px-4 py-3">
            <Image
              src="/bird.png"
              alt="Bird Earner Logo"
              width={32}
              height={32}
            />
            <h1 className="text-lg font-semibold tracking-tight text-purple-900">
              Money Plant
            </h1>
          </Link>
        </SidebarHeader>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-purple-200 bg-purple-100/50">
      <SidebarHeader className="border-b border-purple-200 bg-purple-100 backdrop-blur">
        <Link href="/money_plant" className="flex items-center gap-2 px-4 py-1">
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
            Money Plant
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {admin?.role !== 'admin' && (
              <SidebarMenuItem>
                <Link href="/money_plant/admin_management">
                  <SidebarMenuButton
                    tooltip="Admin Management"
                    isActive={isActive("/money_plant/admin_management")}
                  >
                    <UserCog className="text-muted-foreground" />
                    <span>Admin Management</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <Link href="/money_plant/clients">
                <SidebarMenuButton
                  tooltip="Clients"
                  isActive={isActive("/money_plant/clients")}
                >
                  <Users className="text-muted-foreground" />
                  <span>Clients</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/money_plant/freelancers">
                <SidebarMenuButton
                  tooltip="Freelancers"
                  isActive={isActive("/money_plant/freelancers")}
                >
                  <UserCheck className="text-muted-foreground" />
                  <span>Freelancers</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/money_plant/payouts">
                <SidebarMenuButton
                  tooltip="Payout Requests"
                  isActive={isActive("/money_plant/payouts")}
                >
                  <DollarSign className="text-muted-foreground" />
                  <span>Payout Requests</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/money_plant/payment_history">
                <SidebarMenuButton
                  tooltip="Payment History"
                  isActive={isActive("/money_plant/payment_history")}
                >
                  <History className="text-muted-foreground" />
                  <span>Payment History</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/money_plant/faqs">
                <SidebarMenuButton
                  tooltip="FAQs"
                  isActive={isActive("/money_plant/faqs")}
                >
                  <HelpCircle className="text-muted-foreground" />
                  <span>FAQs</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/money_plant/services">
                <SidebarMenuButton
                  tooltip="Services"
                  isActive={isActive("/money_plant/services")}
                >
                  <Briefcase className="text-muted-foreground" />
                  <span>Services</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/money_plant/notification_management">
                <SidebarMenuButton
                  tooltip="Notification Management"
                  isActive={isActive("/money_plant/notification_management")}
                >
                  <Bell className="text-muted-foreground" />
                  <span>Notification Management</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/money_plant/contact_submissions">
                <SidebarMenuButton
                  tooltip="Contact Submissions"
                  isActive={isActive("/money_plant/contact_submissions")}
                >
                  <MessageSquare className="text-muted-foreground" />
                  <span>Contact Submissions</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/money_plant/settings">
                <SidebarMenuButton
                  tooltip="Settings"
                  isActive={isActive("/money_plant/settings")}
                >
                  <Settings className="text-muted-foreground" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
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
    </Sidebar>
  );
} 