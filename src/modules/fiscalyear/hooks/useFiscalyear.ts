"use client";

import { createFetch, createSchema } from "@better-fetch/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActivateFiscalYearResponseSchema,
  CloseFiscalYearResponseSchema,
  CloseFiscalYearSchema,
  CreateFiscalYearSchema,
  DeleteFiscalYearResponseSchema,
  FiscalYearApiError,
  FiscalYearListResponseSchema,
  FiscalYearSchema,
  ReopenFiscalYearResponseSchema,
  ReopenFiscalYearSchema,
  UpdateFiscalYearResponseSchema,
  UpdateFiscalYearSchema,
  type CreateFiscalYearFormValue,
  type CreateFiscalYearInput,
  type FiscalYear,
  type UpdateFiscalYearInput,
} from "../types";
import { useTenantStore } from "../store/FiscalYearStore";

const fiscalYearFetch = createFetch({
  baseURL: "/api/v1",
  credentials: "include",
  schema: createSchema(
    {
      "/fiscal-years": {
        output: FiscalYearListResponseSchema,
      },
      "/fiscal-years/:id": {
        output: FiscalYearSchema,
      },
      "@post/fiscal-years": {
        input: CreateFiscalYearSchema,
        output: FiscalYearSchema,
      },
      "@patch/fiscal-years/:id": {
        input: UpdateFiscalYearSchema,
        output: UpdateFiscalYearResponseSchema,
      },
      "@delete/fiscal-years/:id": {
        output: DeleteFiscalYearResponseSchema,
      },
      "@post/fiscal-years/:id/activate": {
        output: ActivateFiscalYearResponseSchema,
      },
      "@post/fiscal-years/:id/close": {
        input: CloseFiscalYearSchema,
        output: CloseFiscalYearResponseSchema,
      },
      "@post/fiscal-years/:id/reopen": {
        input: ReopenFiscalYearSchema,
        output: ReopenFiscalYearResponseSchema,
      },
    },
    { strict: true },
  ),
});

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

  return new FiscalYearApiError(message, status);
}

export async function fetchFiscalYearLists() {
  const { data, error: fetchError } = await fiscalYearFetch("/fiscal-years");

  if (fetchError) {
    throw createApiError(fetchError, "Failed to fetch fiscal years");
  }

  return data;
}

export async function fetchFiscalYearById(id: string) {
  const { data, error: fetchError } = await fiscalYearFetch("/fiscal-years/:id", {
    params: { id },
  });

  if (fetchError) {
    throw createApiError(fetchError, "Failed to fetch fiscal year");
  }

  return data;
}

async function createFiscalYearRequest(input: CreateFiscalYearInput) {
  const { data, error: fetchError } = await fiscalYearFetch("@post/fiscal-years", {
    body: input,
  });

  if (fetchError) {
    throw createApiError(fetchError, "Failed to create fiscal year");
  }

  return data;
}

async function updateFiscalYearRequest(id: string, input: UpdateFiscalYearInput) {
  const { data, error: fetchError } = await fiscalYearFetch(
    "@patch/fiscal-years/:id",
    {
      params: { id },
      body: input,
    },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to update fiscal year");
  }

  return data;
}

async function deleteFiscalYearRequest(id: string) {
  const { data, error: fetchError } = await fiscalYearFetch(
    "@delete/fiscal-years/:id",
    { params: { id } },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to delete fiscal year");
  }

  return data;
}

async function activateFiscalYearRequest(id: string) {
  const { data, error: fetchError } = await fiscalYearFetch(
    "@post/fiscal-years/:id/activate",
    { params: { id } },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to activate fiscal year");
  }

  return data;
}

async function closeFiscalYearRequest(id: string, justification: string) {
  const { data, error: fetchError } = await fiscalYearFetch(
    "@post/fiscal-years/:id/close",
    {
      params: { id },
      body: { justification },
    },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to close fiscal year");
  }

  return data;
}

async function reopenFiscalYearRequest(id: string, justification: string) {
  const { data, error: fetchError } = await fiscalYearFetch(
    "@post/fiscal-years/:id/reopen",
    {
      params: { id },
      body: { justification },
    },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to reopen fiscal year");
  }

  return data;
}

export function useFiscalYear() {
  const queryClient = useQueryClient();
  const { tenantId, companyId } = useTenantStore();

  const fiscalYearListsQuery = useQuery({
    queryKey: ["fiscalYearLists", tenantId, companyId],
    queryFn: fetchFiscalYearLists,
    enabled: Boolean(tenantId && companyId),
  });

  const createMutation = useMutation({
    mutationFn: createFiscalYearRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateFiscalYearInput;
    }) => updateFiscalYearRequest(id, input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
      await queryClient.invalidateQueries({
        queryKey: ["fiscalYear", variables.id],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFiscalYearRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateFiscalYearRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
      await queryClient.invalidateQueries({ queryKey: ["fiscalYear"] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: ({
      id,
      justification,
    }: {
      id: string;
      justification: string;
    }) => closeFiscalYearRequest(id, justification),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: ({
      id,
      justification,
    }: {
      id: string;
      justification: string;
    }) => reopenFiscalYearRequest(id, justification),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
    },
  });

  async function createFiscalYear(values: CreateFiscalYearFormValue) {
    return createMutation.mutateAsync(values);
  }

  async function updateFiscalYear(id: string, values: CreateFiscalYearFormValue) {
    return updateMutation.mutateAsync({
      id,
      input: {
        fiscal_year_name: values.fiscal_year_name,
        start_date: values.start_date,
        end_date: values.end_date,
      },
    });
  }

  async function deleteFiscalYear(id: string) {
    return deleteMutation.mutateAsync(id);
  }

  async function activateFiscalYear(id: string) {
    return activateMutation.mutateAsync(id);
  }

  async function closeFiscalYear(id: string, justification?: string) {
    return closeMutation.mutateAsync({
      id,
      justification: justification || "Closing fiscal year",
    });
  }

  async function reopenFiscalYear(id: string, justification: string) {
    return reopenMutation.mutateAsync({ id, justification });
  }

  return {
    fiscalYearListsAllResponse: fiscalYearListsQuery.data,
    fiscalYearListsIsLoading: fiscalYearListsQuery.isLoading,
    fiscalYearListsIsError: fiscalYearListsQuery.isError,
    createFiscalYear,
    updateFiscalYear,
    deleteFiscalYear,
    activateFiscalYear,
    closeFiscalYear,
    reopenFiscalYear,
  };
}

export function useFiscalYearById(id: string) {
  const { tenantId, companyId } = useTenantStore();

  return useQuery<FiscalYear>({
    queryKey: ["fiscalYear", id],
    queryFn: () => fetchFiscalYearById(id),
    enabled: Boolean(id && tenantId && companyId),
  });
}
