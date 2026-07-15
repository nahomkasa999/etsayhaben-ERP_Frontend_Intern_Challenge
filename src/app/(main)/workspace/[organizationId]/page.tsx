"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, Building2Icon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CreateCompanyDialog } from "@/modules/company/components/CreateCompanyDialog";
import { useCompany } from "@/modules/company/hooks/useCompany";
import { CompanyCard } from "@/modules/workspace/components/CompanyCard";
import { useWorkspace } from "@/modules/workspace/hooks/useWorkspace";

export default function OrganizationDetailPage() {
  const router = useRouter();
  const params = useParams<{ organizationId: string }>();
  const organizationId = params.organizationId;
  const [createOpen, setCreateOpen] = useState(false);

  const {
    workspaces,
    activeOrganizationId,
    isLoading: isLoadingWorkspaces,
    setActiveWorkspace,
    getWorkspaceById,
  } = useWorkspace();
  const {
    companies,
    activeCompanyId,
    selectCompany,
    isLoading: isLoadingCompanies,
    isMutating: isSelectingCompany,
  } = useCompany();

  const workspace = getWorkspaceById(organizationId);
  const organizationCompanies = workspace?.companies ?? companies;

  useEffect(() => {
    if (!organizationId || isLoadingWorkspaces) {
      return;
    }

    const exists = workspaces.some((item) => item.id === organizationId);
    if (!exists) {
      router.replace("/workspace");
      return;
    }

    if (activeOrganizationId !== organizationId) {
      void setActiveWorkspace(organizationId);
    }
  }, [
    activeOrganizationId,
    isLoadingWorkspaces,
    organizationId,
    router,
    setActiveWorkspace,
    workspaces,
  ]);

  if (isLoadingWorkspaces) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!workspace) {
    return null;
  }

  const companyLabel =
    organizationCompanies.length === 1
      ? "1 company"
      : `${organizationCompanies.length} companies`;

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/workspace" />}
        className="w-fit px-0 hover:bg-transparent"
      >
        <ArrowLeftIcon />
        Organizations
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{workspace.name}</h2>
          <p className="text-muted-foreground">
            Manage companies inside this organization.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{companyLabel}</p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          + Create company
        </Button>
      </div>

      {isLoadingCompanies ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : organizationCompanies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Building2Icon className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No companies yet</p>
              <p className="text-sm text-muted-foreground">
                Create a company to start using this organization.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {organizationCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              isActive={company.id === activeCompanyId}
              isSelecting={isSelectingCompany}
              onSelect={async (companyId) => {
                if (companyId !== activeCompanyId) {
                  await selectCompany(companyId);
                }
                router.push("/dashboard");
              }}
            />
          ))}
        </div>
      )}

      <CreateCompanyDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
