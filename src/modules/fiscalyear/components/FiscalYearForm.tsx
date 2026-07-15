"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
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

import type { CreateFiscalYearFormValue, FiscalYear } from "../types";
import { validateFiscalYearForm } from "../services/fiscalYearService";
import { useFiscalYear } from "../hooks/useFiscalyear";
import { useTenantStore } from "../store/FiscalYearStore";

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
  const { tenantId, companyId } = useTenantStore();
  const [values, setValues] = useState<CreateFiscalYearFormValue>(
    toFormValue(initialValues),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadOnly = mode === "edit" && initialValues?.status === "CLOSED";
  const canSubmit = !(mode === "edit" && initialValues?.status === "CLOSED");

  function handleChange(
    field: keyof CreateFiscalYearFormValue,
    value: string,
  ) {
    if (field === "calendar_type" && initialValues) {
      const newType = value as "ETHIOPIAN" | "GREGORIAN";
      setValues((prev) => ({
        ...prev,
        calendar_type: newType,
        start_date:
          newType === "ETHIOPIAN"
            ? initialValues.start_date_eth
            : initialValues.start_date_gre,
        end_date:
          newType === "ETHIOPIAN"
            ? initialValues.end_date_eth
            : initialValues.end_date_gre,
      }));
    } else {
      const formatted =
        field === "start_date" || field === "end_date"
          ? formatDateInput(value)
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
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await createFiscalYear(values);
      } else if (initialValues) {
        await updateFiscalYear(initialValues.id, values);
      }
      router.push(`/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`);
    } catch (error) {
      setServerErrors(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "New Fiscal Year" : "Fiscal Year Details"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Fill in the details below to create a fiscal year."
            : isReadOnly
              ? "This fiscal year is closed and cannot be edited."
              : "Update the fiscal year details below."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {serverErrors && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverErrors}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="fiscal_year_name">Fiscal Year Name</Label>
            <Input
              id="fiscal_year_name"
              name="fiscal_year_name"
              value={values.fiscal_year_name}
              onChange={(e) =>
                handleChange("fiscal_year_name", e.target.value)
              }
              placeholder="FY2013"
              disabled={isReadOnly}
              aria-invalid={!!errors.fiscal_year_name}
            />
            {errors.fiscal_year_name && (
              <p className="text-sm text-destructive">
                {errors.fiscal_year_name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="calendar_type">Calendar Type</Label>
            <Select
              value={values.calendar_type}
              onValueChange={(value) => {
                if (value) handleChange("calendar_type", value);
              }}
              items={[
                { label: "Ethiopian", value: "ETHIOPIAN" },
                { label: "Gregorian", value: "GREGORIAN" },
              ]}
            >
              <SelectTrigger id="calendar_type" className="w-full">
                <SelectValue placeholder="Select calendar" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ETHIOPIAN">Ethiopian</SelectItem>
                  <SelectItem value="GREGORIAN">Gregorian</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.calendar_type && (
              <p className="text-sm text-destructive">{errors.calendar_type}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              name="start_date"
              value={values.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              placeholder="01-11-2012"
              disabled={isReadOnly}
              aria-invalid={!!errors.start_date}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive">{errors.start_date}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              name="end_date"
              value={values.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              placeholder="30-10-2013"
              disabled={isReadOnly}
              aria-invalid={!!errors.end_date}
            />
            {errors.end_date && (
              <p className="text-sm text-destructive">{errors.end_date}</p>
            )}
          </div>
        </CardContent>

        {canSubmit && (
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  `/fiscalyear?tenant_id=${tenantId}&company_id=${companyId}`,
                )
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </span>
              ) : mode === "create" ? (
                "Create"
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
