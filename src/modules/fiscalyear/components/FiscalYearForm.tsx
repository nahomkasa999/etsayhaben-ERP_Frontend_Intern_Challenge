"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CreateFiscalYearFormValue,
  CreateFiscalYearRequestBase,
} from "../types";
import { useTenantStore } from "../store/FiscalYearStore";
import { validateFiscalYearForm } from "../services/fiscalYearService";
import { CreateFiscalYear } from "../api/fiscalyearApi";
import { useQueryClient } from "@tanstack/react-query";
const DEFAULT_VALUE: CreateFiscalYearFormValue = {
  fiscal_year_name: "",
  calendar_type: "ETHIOPIAN",
  start_date: "",
  end_date: "",
};

export function FiscalYearForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] =
    useState<CreateFiscalYearFormValue>(DEFAULT_VALUE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState("");
  const isEthiopianCalender = values.calendar_type === "ETHIOPIAN";
  const { tenantId, companyId } = useTenantStore();

  function handleChange(
    field: keyof CreateFiscalYearFormValue,
    value: string | number,
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateFiscalYearForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    console.log("v:", validationErrors);

    const requestBody: CreateFiscalYearRequestBase = {
      tenant_id: tenantId,
      company_id: companyId,
      ...values,
    };
    setErrors({});
    setServerErrors("");
    try {
      const retursn = await CreateFiscalYear(requestBody);
      console.log(retursn);
      queryClient.invalidateQueries({ queryKey: ["fiscalYearLists"] });
      router.push(`/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`);
    } catch (error) {
      setServerErrors(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit}
    >
      {serverErrors && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-600">
          {serverErrors}
        </p>
      )}
      <div>
        <label className="mb-1 block">Fiscal Year Name</label>
        <input
          type="text"
          name="fiscal_year_name"
          value={values.fiscal_year_name}
          onChange={(e) => handleChange("fiscal_year_name", e.target.value)}
          className="w-full rounded border px-3 py-2"
          placeholder="FY2013"
        />
        {errors.fiscal_year_name && (
          <p className="mt-1 text-sm text-red-500">{errors.fiscal_year_name}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block">Calendar Type</label>
        <select
          name="calendar_type"
          value={values.calendar_type}
          onChange={(e) => handleChange("calendar_type", e.target.value)}
          className="w-full rounded border px-3 py-2"
        >
          <option value="ETHIOPIAN">ETHIOPIAN</option>
          <option value="GREGORIAN">GREGORIAN</option>
        </select>
        {errors.calendar_type && (
          <p className="mt-1 text-sm text-red-500">{errors.calendar_type}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block">Start Date</label>
        <input
          type="text"
          name="start_date"
          value={values.start_date}
          onChange={(e) => handleChange("start_date", e.target.value)}
          placeholder={isEthiopianCalender ? "01-11-2012" : "2024-09-11"}
          className="w-full rounded border px-3 py-2"
        />
        {errors.start_date && (
          <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block">End Date</label>
        <input
          type="text"
          name="end_date"
          value={values.end_date}
          onChange={(e) => handleChange("end_date", e.target.value)}
          placeholder={isEthiopianCalender ? "30-10-2013" : "2025-09-10"}
          className="w-full rounded border px-3 py-2"
        />
        {errors.end_date && (
          <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
        )}
      </div>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Create
      </button>
    </form>
  );
}
