"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2Icon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { CreateOrganizationDialog } from "@/modules/workspace/components/CreateOrganizationDialog";
import { CreateWorkspaceForm } from "@/modules/workspace/components/CreateWorkspaceForm";
import { OrganizationCard } from "@/modules/workspace/components/OrganizationCard";
import { useWorkspace } from "@/modules/workspace/hooks/useWorkspace";

export default function WorkspacePage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const {
    workspaces,
    isLoading,
    setActiveWorkspace,
  } = useWorkspace();

  useEffect(() => {
    if (isLoading || workspaces.length !== 1) {
      return;
    }

    const onlyWorkspace = workspaces[0];
    if (onlyWorkspace.companyCount === 0) {
      router.replace(`/workspace/${onlyWorkspace.id}`);
    }
  }, [isLoading, router, workspaces]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">
            Create an organization, then add a company to start using the ERP.
          </p>
        </div>
        {workspaces.length > 0 ? (
          <Button type="button" onClick={() => setCreateOpen(true)}>
            + Create organization
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Create your first organization</CardTitle>
            <CardDescription>
              Organizations group your companies. You will add a company in the
              next step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkspaceForm
              onSuccess={(workspace) => {
                router.push(`/workspace/${workspace.id}`);
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <OrganizationCard
              key={workspace.id}
              workspace={workspace}
              onSelect={(organizationId) => {
                void setActiveWorkspace(organizationId);
              }}
            />
          ))}
        </div>
      )}

      <CreateOrganizationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
