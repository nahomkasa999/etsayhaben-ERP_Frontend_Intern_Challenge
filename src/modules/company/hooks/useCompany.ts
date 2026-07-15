"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  createCompany as createCompanyRequest,
  deleteCompany as deleteCompanyRequest,
  fetchCompanies,
  updateCompany as updateCompanyRequest,
} from "../api/companyApi";
import { useWorkspaceStore } from "@/modules/workspace/store/workspaceStore";
import type { CreateCompanyInput, UpdateCompanyInput } from "../types";

export function useCompany() {
  const queryClient = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const activeCompanyId = useWorkspaceStore((state) => state.activeCompanyId);
  const setActiveCompanyId = useWorkspaceStore(
    (state) => state.setActiveCompanyId,
  );
  const [error, setError] = useState<string | null>(null);

  const companiesQuery = useQuery({
    queryKey: ["companies", activeOrganization?.id],
    queryFn: fetchCompanies,
    enabled: Boolean(activeOrganization?.id),
  });

  const activeCompany =
    companiesQuery.data?.find((company) => company.id === activeCompanyId) ??
    companiesQuery.data?.[0] ??
    null;

  const createMutation = useMutation({
    mutationFn: (input: CreateCompanyInput) => createCompanyRequest(input),
    onSuccess: async (company) => {
      setActiveCompanyId(company.id);
      await queryClient.invalidateQueries({
        queryKey: ["companies", activeOrganization?.id],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      companyId,
      input,
    }: {
      companyId: string;
      input: UpdateCompanyInput;
    }) => updateCompanyRequest(companyId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companies", activeOrganization?.id],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (companyId: string) => deleteCompanyRequest(companyId),
    onSuccess: async (_, companyId) => {
      if (activeCompanyId === companyId) {
        setActiveCompanyId(null);
      }
      await queryClient.invalidateQueries({
        queryKey: ["companies", activeOrganization?.id],
      });
    },
  });

  async function createCompany(input: CreateCompanyInput) {
    setError(null);

    try {
      return await createMutation.mutateAsync(input);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create company";
      setError(message);
      throw err;
    }
  }

  async function updateCompany(companyId: string, input: UpdateCompanyInput) {
    setError(null);

    try {
      return await updateMutation.mutateAsync({ companyId, input });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update company";
      setError(message);
      throw err;
    }
  }

  async function deleteCompany(companyId: string) {
    setError(null);

    try {
      await deleteMutation.mutateAsync(companyId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete company";
      setError(message);
      throw err;
    }
  }

  return {
    companies: companiesQuery.data ?? [],
    activeCompany,
    activeCompanyId: activeCompany?.id ?? null,
    isLoading: companiesQuery.isLoading,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    error,
    setError,
    setActiveCompanyId,
    createCompany,
    updateCompany,
    deleteCompany,
    refetchCompanies: companiesQuery.refetch,
  };
}
