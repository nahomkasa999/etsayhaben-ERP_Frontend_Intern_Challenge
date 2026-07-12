"use client";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActiveFiscalYearResponse,
  FiscalYearListResponse,
  UpdateFiscalYearParams,
} from "../types";
import {
  fetchFiscalYearLists,
  GetActiveFiscalYear,
  GetFiscalYearByDate,
  UpdateFiscalYear,
} from "../api/fiscalyearApi";

export function useFiscalYear(tenantId: string, companyId: string) {
  const {
    data: fiscalYearListsAllResponse,
    isLoading: fiscalYearListsIsLoading,
    isError: fiscalYearListsIsError,
  } = useQuery({
    queryKey: ["fiscalYearLists"],
    queryFn: async (): Promise<FiscalYearListResponse> => {
      return await fetchFiscalYearLists({
        tenant_id: tenantId,
        company_id: companyId,
      });
    },
  });

  const {
    data: activeFiscalYears,
    isLoading: activeFiscalYearsIsLoading,
    isError: activeFiscalYearsIsError,
  } = useQuery({
    queryKey: ["activeFiscalYears"],
    queryFn: async (): Promise<ActiveFiscalYearResponse[]> => {
      return await GetActiveFiscalYear({
        tenant_id: tenantId,
        company_id: companyId,
      });
    },
  });

  const {
    data: fiscalYearByDateResponse,
    isLoading: fiscalYearByDateIsLoading,
    isError: fiscalYearByDateIsError,
  } = useQuery({
    queryKey: ["fiscalYearByDate"],
    queryFn: async (): Promise<
      ActiveFiscalYearResponse[] | Record<string, string> //This function is the only returning a record upon no result. should make it consistent.
    > => {
      return await GetFiscalYearByDate({
        tenant_id: tenantId,
        company_id: companyId,
        date: "2025-11-01",
        calendar_type: "ETHIOPIAN",
      });
    },
  });

  const queryClient = useQueryClient();

  const {
    mutate: updateFiscalYear,
    data: updatedFiscalYear,
    isPending: updatedFiscalYearIsLoading,
    isError: updatedFiscalYearIsError,
  } = useMutation({
    mutationFn: (params: UpdateFiscalYearParams) => UpdateFiscalYear(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
      queryClient.invalidateQueries({ queryKey: ["activeFiscalYears"] });
    },
  });

  return {
    fiscalYearListsAllResponse,
    fiscalYearListsIsLoading,
    fiscalYearListsIsError,
    activeFiscalYears,
    activeFiscalYearsIsLoading,
    activeFiscalYearsIsError,
    fiscalYearByDateResponse,
    fiscalYearByDateIsLoading,
    fiscalYearByDateIsError,
    updateFiscalYear,
    updatedFiscalYear,
    updatedFiscalYearIsLoading,
    updatedFiscalYearIsError,
  };
}
