"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { CreateCompanyForm } from "@/modules/company/components/CreateCompanyForm";
import { useCompany } from "@/modules/company/hooks/useCompany";
import { CreateWorkspaceForm } from "@/modules/workspace/components/CreateWorkspaceForm";
import { useWorkspace } from "@/modules/workspace/hooks/useWorkspace";

export default function WorkspacePage() {
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    isLoading: isLoadingWorkspaces,
  } = useWorkspace();
  const {
    companies,
    activeCompany,
    setActiveCompanyId,
    isLoading: isLoadingCompanies,
  } = useCompany();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workspaces</h2>
        <p className="text-muted-foreground">
          Create organizations (tenants) and manage companies inside them.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create workspace</CardTitle>
            <CardDescription>
              A workspace is your tenant. You can belong to multiple workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateWorkspaceForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create company</CardTitle>
            <CardDescription>
              Companies belong to the active workspace and scope ERP data such as
              fiscal years.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeWorkspace ? (
              <CreateCompanyForm />
            ) : (
              <p className="text-sm text-muted-foreground">
                Select or create a workspace first.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active workspace</CardTitle>
            <CardDescription>
              Tenant ID: {activeWorkspace?.id ?? "Not selected"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Select
              value={activeWorkspace?.id ?? ""}
              onValueChange={(value) => {
                if (value) {
                  void setActiveWorkspace(value);
                }
              }}
              disabled={isLoadingWorkspaces || workspaces.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active company</CardTitle>
            <CardDescription>
              Company ID: {activeCompany?.id ?? "Not selected"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Select
              value={activeCompany?.id ?? ""}
              onValueChange={(value) => {
                if (value) {
                  setActiveCompanyId(value);
                }
              }}
              disabled={isLoadingCompanies || companies.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
