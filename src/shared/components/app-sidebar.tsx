"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  PackageIcon,
  UsersIcon,
  CalendarRangeIcon,
} from "lucide-react";

import { NavMain } from "@/shared/components/nav-main";
import { NavUser } from "@/shared/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { useInventoryStatsStore } from "@/shared/store/inventoryStatsStore";
import { useEmployeeStatsStore } from "@/shared/store/employeeStatsStore";
import { useTenantStore } from "@/modules/fiscalyear/store/FiscalYearStore";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const lowStockCount = useInventoryStatsStore((s) => s.lowStockCount);
  const employeesOnLeave = useEmployeeStatsStore((s) => s.employeesOnLeave);
  const { tenantId, companyId } = useTenantStore();

  const fiscalYearUrl = `/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`;

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: pathname.startsWith("/dashboard"),
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: <PackageIcon />,
      isActive: pathname.startsWith("/inventory"),
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      title: "HR",
      url: "/hr",
      icon: <UsersIcon />,
      isActive: pathname.startsWith("/hr"),
      badge: employeesOnLeave > 0 ? employeesOnLeave : undefined,
    },
    {
      title: "Fiscal Year",
      url: fiscalYearUrl,
      icon: <CalendarRangeIcon />,
      isActive: pathname.startsWith("/fiscalyear"),
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <span className="text-base font-semibold">EthioERP</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
