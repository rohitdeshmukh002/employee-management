import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  CalendarDays,
  Wallet,
  UserCircle,
  Building2,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Role, useAuth } from "@/lib/auth";


interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const items: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users, roles: ["admin"] },
  { title: "Attendance", url: "/attendance", icon: CalendarClock },
  { title: "Leave", url: "/leave", icon: CalendarDays },
  { title: "Salary", url: "/salary", icon: Wallet },
  { title: "Profile", url: "/profile", icon: UserCircle },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const visible = items.filter((i) => !i.roles || (user && i.roles.includes(user.role)));

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3 font-heading text-base font-semibold text-sidebar-foreground">
          <Building2 className="h-5 w-5 text-sidebar-primary" />
          WorkforceHub
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visible.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
            <p className="truncate text-xs capitalize text-sidebar-foreground/60">{user?.role}</p>
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
