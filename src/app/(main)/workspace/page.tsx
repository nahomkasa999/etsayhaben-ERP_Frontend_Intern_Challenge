"use client";

import { useState } from "react";
import { Building2Icon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CreateOrganizationDialog } from "@/modules/workspace/components/CreateOrganizationDialog";
import { OrganizationCard } from "@/modules/workspace/components/OrganizationCard";
import { useWorkspace } from "@/modules/workspace/hooks/useWorkspace";

export default function WorkspacePage() {
  const [createOpen, setCreateOpen] = useState(false);
  const {
    workspaces,
    activeOrganizationId,
    isLoading,
    setActiveWorkspace,
  } = useWorkspace();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">
            Choose an organization to view and manage its companies.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          + Create organization
        </Button>
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
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Building2Icon className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No organizations yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first organization to get started.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <OrganizationCard
              key={workspace.id}
              workspace={workspace}
              isActive={workspace.id === activeOrganizationId}
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
