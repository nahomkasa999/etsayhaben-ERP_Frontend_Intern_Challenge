"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { useCompany } from "@/modules/company/hooks/useCompany";
import { useWorkspace } from "@/modules/workspace/hooks/useWorkspace";

function isWorkspaceRoute(pathname: string) {
  return pathname === "/workspace" || pathname.startsWith("/workspace/");
}

export function MainAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeOrganizationId, isLoading: isLoadingWorkspaces } =
    useWorkspace();
  const { activeCompanyId, isLoading: isLoadingCompanies } = useCompany();

  const onWorkspaceRoute = isWorkspaceRoute(pathname);
  const isSelectionLoading = isLoadingWorkspaces || isLoadingCompanies;
  const hasCompleteSelection = Boolean(
    activeOrganizationId && activeCompanyId,
  );
  const showAppChrome = !onWorkspaceRoute && hasCompleteSelection;

  if (onWorkspaceRoute) {
    return (
      <div className="min-h-svh overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </div>
      </div>
    );
  }

  if (isSelectionLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (!showAppChrome) {
    return (
      <div className="min-h-svh overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 56)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="h-svh min-h-0 overflow-hidden md:h-[calc(100svh-1rem)]">
        <SiteHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
