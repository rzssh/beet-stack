import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppSidebar } from "~/components/app-layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/signin" });
    }
  },
});

function ProtectedLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
