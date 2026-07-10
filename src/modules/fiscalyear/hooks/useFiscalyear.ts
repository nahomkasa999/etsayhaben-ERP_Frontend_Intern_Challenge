"use client";
import { useQuery } from "@tanstack/react-query";
import { FiscalYearListResponse } from "../types";
import { fetchFiscalYearLists } from "../api/fiscalyearApi";
import { useTenantStore } from "../store/FiscalYearStore";

export function useFiscalYear() {
  const { tenantId, companyId } = useTenantStore();

  const {
    data: fiscalYearListsAllResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["fiscalYearLists"],
    queryFn: async (): Promise<FiscalYearListResponse> => {
      return await fetchFiscalYearLists({
        tenant_id: tenantId,
        company_id: companyId,
      });
    },
  });

  return { fiscalYearListsAllResponse, isLoading, isError };
}
