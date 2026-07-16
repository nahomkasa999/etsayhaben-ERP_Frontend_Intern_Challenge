"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { formatFieldErrors } from "@/shared/lib/form-errors";

import type { FiscalYear, FiscalYearFormValues } from "../types";
import type { FiscalYearFormApi } from "../hooks/useFiscalYearForm";

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";
  const parts: string[] = [digits.slice(0, 2)];
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4));
  return parts.join("-");
}

type Props = {
  form: FiscalYearFormApi;
  disabled?: boolean;
  /** When editing, switching calendar type reloads Eth/Gre dates from this record. */
  dateSource?: FiscalYear;
};

export function FiscalYearFormFields({ form, disabled, dateSource }: Props) {
  return (
    <>
      <form.Field
        name="fiscalYearName"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Fiscal Year Name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="FY2013"
                disabled={disabled}
                aria-invalid={isInvalid}
              />
              {isInvalid && (
                <p className="text-sm text-destructive">
                  {formatFieldErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          );
        }}
      />

      <form.Field
        name="calendarType"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Calendar Type</Label>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={(value) => {
                  if (!value) return;
                  field.handleChange(
                    value as FiscalYearFormValues["calendarType"],
                  );
                  if (!dateSource) return;
                  if (value === "ETHIOPIAN") {
                    form.setFieldValue("startDate", dateSource.startDateEth);
                    form.setFieldValue("endDate", dateSource.endDateEth);
                  } else {
                    form.setFieldValue("startDate", dateSource.startDateGre);
                    form.setFieldValue("endDate", dateSource.endDateGre);
                  }
                }}
                disabled={disabled}
                items={[
                  { label: "Ethiopian", value: "ETHIOPIAN" },
                  { label: "Gregorian", value: "GREGORIAN" },
                ]}
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full"
                  aria-invalid={isInvalid}
                >
                  <SelectValue placeholder="Select calendar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ETHIOPIAN">Ethiopian</SelectItem>
                    <SelectItem value="GREGORIAN">Gregorian</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {isInvalid && (
                <p className="text-sm text-destructive">
                  {formatFieldErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          );
        }}
      />

      <form.Field
        name="startDate"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Start Date</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(formatDateInput(e.target.value))
                }
                placeholder="01-11-2012"
                disabled={disabled}
                aria-invalid={isInvalid}
              />
              {isInvalid && (
                <p className="text-sm text-destructive">
                  {formatFieldErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          );
        }}
      />

      <form.Field
        name="endDate"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>End Date</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(formatDateInput(e.target.value))
                }
                placeholder="30-10-2013"
                disabled={disabled}
                aria-invalid={isInvalid}
              />
              {isInvalid && (
                <p className="text-sm text-destructive">
                  {formatFieldErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          );
        }}
      />
    </>
  );
}
