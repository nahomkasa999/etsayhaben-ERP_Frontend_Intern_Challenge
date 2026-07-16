"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
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
import { Button } from "@/shared/components/ui/button";
import { CreateCompanyForm } from "@/modules/company/components/CreateCompanyForm";
import { useCompany } from "@/modules/company/hooks/useCompany";
import { CreateWorkspaceForm } from "@/modules/workspace/components/CreateWorkspaceForm";
import { useWorkspace } from "@/modules/workspace/hooks/useWorkspace";

type OnboardingStep =
  | "create-organization"
  | "select-organization"
  | "create-company"
  | "select-company"
  | "complete";

function getOnboardingStep(input: {
  organizationsCount: number;
  hasActiveOrganization: boolean;
  companiesCount: number;
  hasActiveCompany: boolean;
}): OnboardingStep {
  if (input.organizationsCount === 0) {
    return "create-organization";
  }

  if (!input.hasActiveOrganization) {
    return "select-organization";
  }

  if (input.companiesCount === 0) {
    return "create-company";
  }

  if (!input.hasActiveCompany) {
    return "select-company";
  }

  return "complete";
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    isLoading: isLoadingWorkspaces,
    isMutating: isWorkspaceMutating,
  } = useWorkspace();
  const {
    companies,
    activeCompany,
    selectCompany,
    isLoading: isLoadingCompanies,
    isMutating: isCompanyMutating,
  } = useCompany();
  const [pickedOrganizationId, setPickedOrganizationId] = useState<string | null>(
    null,
  );
  const [pickedCompanyId, setPickedCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const organizationSelection =
    pickedOrganizationId ?? activeWorkspace?.id ?? workspaces[0]?.id ?? "";
  const companySelection =
    pickedCompanyId ?? activeCompany?.id ?? companies[0]?.id ?? "";
  const selectedOrganization =
    workspaces.find((workspace) => workspace.id === organizationSelection) ??
    null;
  const selectedCompany =
    companies.find((company) => company.id === companySelection) ?? null;

  const step = getOnboardingStep({
    organizationsCount: workspaces.length,
    hasActiveOrganization: Boolean(activeWorkspace?.id),
    companiesCount: companies.length,
    hasActiveCompany: Boolean(activeCompany?.id),
  });

  useEffect(() => {
    if (!isSessionPending && !session) {
      router.replace("/signin");
    }
  }, [isSessionPending, session, router]);

  useEffect(() => {
    if (step !== "complete") {
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }, [step, router]);

  async function handleSetActiveOrganization() {
    if (!organizationSelection) {
      return;
    }

    setError(null);

    try {
      await setActiveWorkspace(organizationSelection);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to set active organization",
      );
    }
  }

  async function handleSelectCompany() {
    if (!companySelection) {
      return;
    }

    setError(null);

    try {
      await selectCompany(companySelection);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to select company",
      );
    }
  }

  if (isSessionPending || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Set up your workspace
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create an organization and company before entering the dashboard.
          </p>
        </div>

        {step === "create-organization" ? (
          <Card>
            <CardHeader>
              <CardTitle>Create organization</CardTitle>
              <CardDescription>
                Organizations are your tenant workspaces in Better Auth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateWorkspaceForm />
            </CardContent>
          </Card>
        ) : null}

        {step === "select-organization" ? (
          <Card>
            <CardHeader>
              <CardTitle>Select organization</CardTitle>
              <CardDescription>
                Choose which organization should be active for this session.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Select
                value={organizationSelection}
                onValueChange={(value) => {
                  if (value) {
                    setPickedOrganizationId(value);
                  }
                }}
                disabled={isLoadingWorkspaces || workspaces.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select organization">
                    {selectedOrganization?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => void handleSetActiveOrganization()}
                disabled={!organizationSelection || isWorkspaceMutating}
              >
                {isWorkspaceMutating ? "Saving..." : "Continue"}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === "create-company" ? (
          <Card>
            <CardHeader>
              <CardTitle>Create company</CardTitle>
              <CardDescription>
                Companies belong to your active organization and scope ERP data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateCompanyForm />
            </CardContent>
          </Card>
        ) : null}

        {step === "select-company" ? (
          <Card>
            <CardHeader>
              <CardTitle>Select company</CardTitle>
              <CardDescription>
                Pick the company you want to work with in this session.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Select
                value={companySelection}
                onValueChange={(value) => {
                  if (value) {
                    setPickedCompanyId(value);
                  }
                }}
                disabled={isLoadingCompanies || companies.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select company">
                    {selectedCompany?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => void handleSelectCompany()}
                disabled={!companySelection || isCompanyMutating}
              >
                {isCompanyMutating ? "Saving..." : "Continue to dashboard"}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
