"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Separator } from "@/shared/components/ui/separator";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { useTenantStore } from "@/modules/fiscalyear/store/fiscalYearStore";
import { useWorkspace } from "@/modules/workspace/hooks/useWorkspace";

type Crumb = {
  label: string;
  href?: string;
};

const sectionTitles: Record<string, string> = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  hr: "HR",
  fiscalyear: "Fiscal Year",
  profile: "Profile",
  workspace: "Workspaces",
};

const nestedLabels: Record<string, string> = {
  add: "Add",
};

function buildCrumbs(
  pathname: string,
  sectionHref: string,
  organizationName?: string,
): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ label: "EthioERP" }];
  }

  const section = segments[0];
  const sectionLabel = sectionTitles[section] ?? section;

  if (section === "workspace" && segments.length >= 2) {
    return [
      { label: sectionLabel, href: "/workspace" },
      { label: organizationName ?? "Organization" },
    ];
  }

  if (segments.length === 1) {
    return [{ label: sectionLabel }];
  }

  const nested = segments[1];
  const nestedLabel =
    nestedLabels[nested] ??
    (nested === undefined ? "Details" : "Edit");

  return [{ label: sectionLabel, href: sectionHref }, { label: nestedLabel }];
}

export function SiteHeader() {
  const pathname = usePathname();
  const { tenantId, companyId } = useTenantStore();
  const { getWorkspaceById } = useWorkspace();

  const segments = pathname.split("/").filter(Boolean);
  const section = segments[0] ?? "";
  const organizationId =
    section === "workspace" && segments.length >= 2 ? segments[1] : undefined;
  const organizationName = organizationId
    ? getWorkspaceById(organizationId)?.name
    : undefined;

  const sectionHref =
    section === "fiscalyear" && tenantId && companyId
      ? `/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`
      : `/${section}`;

  const crumbs = buildCrumbs(pathname, sectionHref, organizationName);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;

              return (
                <Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<Link href={crumb.href} />}>
                        {crumb.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
