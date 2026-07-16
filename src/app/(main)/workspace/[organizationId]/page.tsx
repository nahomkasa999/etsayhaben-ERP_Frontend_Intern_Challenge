"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { CreateCompanyDialog } from "@/modules/company/components/CreateCompanyDialog";
import { CreateCompanyForm } from "@/modules/company/components/CreateCompanyForm";
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
            Create or choose a company to open the dashboard.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{companyLabel}</p>
        </div>
        {organizationCompanies.length > 0 ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            + Create company
          </Button>
        ) : null}
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
          <CardHeader>
            <CardTitle>Create your first company</CardTitle>
            <CardDescription>
              Companies scope ERP data inside this organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCompanyForm
              onSuccess={() => {
                router.push("/dashboard");
                router.refresh();
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {organizationCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
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
