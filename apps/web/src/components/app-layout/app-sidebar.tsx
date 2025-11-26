import {
  BarChart3,
  CreditCard,
  FileUp,
  Home,
  MessageSquare,
  Settings,
  User,
} from "lucide-react";
import type * as React from "react";

import { NavMain } from "~/components/app-layout/nav-main";
import { NavProjects } from "~/components/app-layout/nav-projects";
import { NavUser } from "~/components/app-layout/nav-user";
import { TeamSwitcher } from "~/components/app-layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    { name: "TanStack Start", logo: Home, plan: "Demo" },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
      items: [
        { title: "All Messages", url: "/messages" },
        { title: "Create New", url: "/messages/new" },
      ],
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
  ],
  projects: [
    { name: "Billing", url: "/billing", icon: CreditCard },
    { name: "Storage", url: "/storage", icon: FileUp },
    { name: "Settings", url: "/settings", icon: Settings },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
