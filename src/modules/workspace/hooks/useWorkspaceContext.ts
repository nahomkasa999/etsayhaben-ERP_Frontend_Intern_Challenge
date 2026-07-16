"use client";

import { useCompany } from "@/modules/company/hooks/useCompany";
import { useWorkspace } from "./useWorkspace";

export function useWorkspaceContext() {
  const { activeOrganizationId, isLoading: isLoadingWorkspaces } =
    useWorkspace();
  const { activeCompanyId, isLoading: isLoadingCompanies } = useCompany();

  const isLoading = isLoadingWorkspaces || isLoadingCompanies;
  const isComplete = Boolean(activeOrganizationId && activeCompanyId);

  return { isLoading, isComplete };
}
