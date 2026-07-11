"use client";
import { useQuery } from "@tanstack/react-query";
import { FiscalYearListResponse } from "../types";
import { fetchFiscalYearLists } from "../api/fiscalyearApi";

export function useFiscalYear(tenantId: string, companyId: string) {
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
