"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { CreateFiscalYearFormValue, FiscalYear } from "../types";
import { validateFiscalYearForm } from "../services/fiscalYearService";
import { useFiscalYear } from "../hooks/useFiscalyear";

const DEFAULT_VALUE: CreateFiscalYearFormValue = {
  fiscal_year_name: "",
  calendar_type: "ETHIOPIAN",
  start_date: "",
  end_date: "",
};

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";
  const parts: string[] = [digits.slice(0, 2)];
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4));
  return parts.join("-");
}

function toFormValue(fy?: FiscalYear): CreateFiscalYearFormValue {
  if (!fy) return DEFAULT_VALUE;
  return {
    fiscal_year_name: fy.fiscal_year_name,
    calendar_type: fy.calendar_type,
    start_date: fy.start_date_eth,
    end_date: fy.end_date_eth,
  };
}

type Props = {
  initialValues?: FiscalYear;
  mode: "create" | "edit";
};

export function FiscalYearForm({ initialValues, mode }: Props) {
  const router = useRouter();
  const { createFiscalYear, updateFiscalYear } = useFiscalYear();
  const [values, setValues] = useState<CreateFiscalYearFormValue>(
    toFormValue(initialValues),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState("");
  const isEthiopianCalendar = values.calendar_type === "ETHIOPIAN";

  function handleChange(
    field: keyof CreateFiscalYearFormValue,
    value: string | number,
  ) {
    if (field === "calendar_type" && initialValues) {
      const newType = value as "ETHIOPIAN" | "GREGORIAN";
      setValues((prev) => ({
        ...prev,
        calendar_type: newType,
        start_date: newType === "ETHIOPIAN" ? initialValues.start_date_eth : initialValues.start_date_gre,
        end_date: newType === "ETHIOPIAN" ? initialValues.end_date_eth : initialValues.end_date_gre,
      }));
    } else {
      const formatted = field === "start_date" || field === "end_date"
        ? formatDateInput(value as string)
        : value;
      setValues((prev) => ({ ...prev, [field]: formatted }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateFiscalYearForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerErrors("");

    try {
      if (mode === "create") {
        console.log("creating:", values);
        await createFiscalYear(values);
      } else if (initialValues) {
        console.log("updating:", initialValues);
        await updateFiscalYear(initialValues.id, values);
      }
      router.push(`/fiscalyear`);
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
          placeholder="01-11-2012"
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
          placeholder="30-10-2013"
          className="w-full rounded border px-3 py-2"
        />
        {errors.end_date && (
          <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          {mode === "create" ? "Create" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
