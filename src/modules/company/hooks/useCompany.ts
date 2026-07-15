"use client";

import { createFetch, createSchema } from "@better-fetch/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CompaniesListResponseSchema,
  CompanyApiError,
  CompanySchema,
  CreateCompanySchema,
  DeleteCompanyResponseSchema,
  SelectCompanyResponseSchema,
  SelectCompanySchema,
  UpdateCompanySchema,
  type CreateCompanyInput,
  type UpdateCompanyInput,
} from "../types";

const companyFetch = createFetch({
  baseURL: "/api/v1",
  credentials: "include",
  schema: createSchema(
    {
      "/companies": {
        output: CompaniesListResponseSchema,
      },
      "@post/companies": {
        input: CreateCompanySchema,
        output: CompanySchema,
      },
      "@patch/companies/:companyId": {
        input: UpdateCompanySchema,
        output: CompanySchema,
      },
      "@delete/companies/:companyId": {
        output: DeleteCompanyResponseSchema,
      },
      "@post/companies/select": {
        input: SelectCompanySchema,
        output: SelectCompanyResponseSchema,
      },
    },
    { strict: true },
  ),
});

export function useCompany() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  function createApiError(fetchError: unknown, fallback: string) {
    let message = fallback;
    let status = 400;

    if (fetchError && typeof fetchError === "object") {
      if (
        "message" in fetchError &&
        typeof fetchError.message === "string" &&
        fetchError.message.length > 0
      ) {
        message = fetchError.message;
      }

      if ("status" in fetchError && typeof fetchError.status === "number") {
        status = fetchError.status;
      }
    }

    return new CompanyApiError(message, status);
  }

  async function fetchCompanies() {
    const { data, error: fetchError } = await companyFetch("/companies");

    if (fetchError) {
      throw createApiError(fetchError, "Failed to fetch companies");
    }

    return data;
  }

  async function createCompanyRequest(input: CreateCompanyInput) {
    const { data, error: fetchError } = await companyFetch(
      "@post/companies",
      { body: input },
    );

    if (fetchError) {
      throw createApiError(fetchError, "Failed to create company");
    }

    return data;
  }

  async function updateCompanyRequest(
    companyId: string,
    input: UpdateCompanyInput,
  ) {
    const { data, error: fetchError } = await companyFetch(
      "@patch/companies/:companyId",
      {
        params: { companyId },
        body: input,
      },
    );

    if (fetchError) {
      throw createApiError(fetchError, "Failed to update company");
    }

    return data;
  }

  async function deleteCompanyRequest(companyId: string) {
    const { data, error: fetchError } = await companyFetch(
      "@delete/companies/:companyId",
      { params: { companyId } },
    );

    if (fetchError) {
      throw createApiError(fetchError, "Failed to delete company");
    }

    return data;
  }

  async function selectCompanyRequest(companyId: string) {
    const { data, error: fetchError } = await companyFetch(
      "@post/companies/select",
      { body: { companyId } },
    );

    if (fetchError) {
      throw createApiError(fetchError, "Failed to select company");
    }

    return data;
  }

  const companiesQuery = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
  });

  const createMutation = useMutation({
    mutationFn: createCompanyRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
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
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompanyRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const selectMutation = useMutation({
    mutationFn: selectCompanyRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const activeCompanyId = companiesQuery.data?.activeCompanyId ?? null;
  const activeCompany =
    companiesQuery.data?.companies.find(
      (company) => company.id === activeCompanyId,
    ) ?? null;

  function getActionError(actionError: unknown, fallback: string) {
    return actionError instanceof Error ? actionError.message : fallback;
  }

  async function createCompany(input: CreateCompanyInput) {
    setError(null);

    try {
      return await createMutation.mutateAsync(input);
    } catch (actionError) {
      setError(getActionError(actionError, "Failed to create company"));
      throw actionError;
    }
  }

  async function updateCompany(
    companyId: string,
    input: UpdateCompanyInput,
  ) {
    setError(null);

    try {
      return await updateMutation.mutateAsync({ companyId, input });
    } catch (actionError) {
      setError(getActionError(actionError, "Failed to update company"));
      throw actionError;
    }
  }

  async function deleteCompany(companyId: string) {
    setError(null);

    try {
      return await deleteMutation.mutateAsync(companyId);
    } catch (actionError) {
      setError(getActionError(actionError, "Failed to delete company"));
      throw actionError;
    }
  }

  async function selectCompany(companyId: string) {
    setError(null);

    try {
      return await selectMutation.mutateAsync(companyId);
    } catch (actionError) {
      setError(getActionError(actionError, "Failed to select company"));
      throw actionError;
    }
  }

  return {
    companies: companiesQuery.data?.companies ?? [],
    activeCompany,
    activeCompanyId,
    isLoading: companiesQuery.isLoading,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      selectMutation.isPending,
    error,
    setError,
    createCompany,
    updateCompany,
    deleteCompany,
    selectCompany,
    refetchCompanies: companiesQuery.refetch,
  };
}
