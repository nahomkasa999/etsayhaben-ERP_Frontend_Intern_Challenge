"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useAuthStore,
  useTenantStore,
} from "@/modules/fiscalyear/store/FiscalYearStore";
import {
  fetchFiscalYearLists,
  CreateFiscalYear,
  UpdateFiscalYear,
  DeleteFiscalYear,
  ActivateFiscalYear,
  CloseFiscalYear,
  ReopenFiscalYear,
} from "../api/fiscalyearApi";
import type { CreateFiscalYearFormValue } from "../types";

export function useFiscalYear() {
  const queryClient = useQueryClient();
  const { tenantId, companyId } = useTenantStore();
  const { userId } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["fiscalYearLists"],
    queryFn: () =>
      fetchFiscalYearLists({ tenant_id: tenantId, company_id: companyId }),
  });

  async function createFiscalYear(values: CreateFiscalYearFormValue) {
    await CreateFiscalYear({
      ...values,
      tenant_id: tenantId,
      company_id: companyId,
      created_by: userId,
    });
    queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
  }

  async function updateFiscalYear(
    id: string,
    values: CreateFiscalYearFormValue,
  ) {
    await UpdateFiscalYear({
      id,
      updated_by: userId,
      params: {
        tenant_id: tenantId,
        company_id: companyId,
        fiscal_year_name: values.fiscal_year_name,
        start_date: values.start_date,
        end_date: values.end_date,
        updated_by: userId,
      },
    });
    queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
    queryClient.invalidateQueries({ queryKey: ["fiscalYear", id] });
  }

  async function deleteFiscalYear(id: string) {
    await DeleteFiscalYear({
      id,
      deleted_by: userId,
      params: {
        tenant_id: tenantId,
        company_id: companyId,
        deleted_by: userId,
      },
    });
    queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
  }

  async function activateFiscalYear(id: string) {
    await ActivateFiscalYear({
      id,
      activated_by: userId,
      params: {
        tenant_id: tenantId,
        company_id: companyId,
        activated_by: userId,
      },
    });
    queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
    queryClient.invalidateQueries({ queryKey: ["fiscalYear"] });
  }

  async function closeFiscalYear(id: string, justification?: string) {
    await CloseFiscalYear({
      id,
      closed_by: userId,
      params: {
        tenant_id: tenantId,
        company_id: companyId,
        closed_by: userId,
        justification: justification || "Closing fiscal year",
      },
    });
    queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
  }

  async function reopenFiscalYear(id: string, justification: string) {
    await ReopenFiscalYear({
      id,
      reopened_by: userId,
      params: {
        tenant_id: tenantId,
        company_id: companyId,
        reopened_by: userId,
        justification,
      },
    });
    queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
  }

  return {
    fiscalYearListsAllResponse: data,
    fiscalYearListsIsLoading: isLoading,
    fiscalYearListsIsError: isError,
    createFiscalYear,
    updateFiscalYear,
    deleteFiscalYear,
    activateFiscalYear,
    closeFiscalYear,
    reopenFiscalYear,
  };
}
