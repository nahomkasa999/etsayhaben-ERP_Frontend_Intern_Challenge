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

import type { FiscalYearFormValues, FiscalYear } from "../types";
import { validateFiscalYearForm } from "../services/fiscalYearService";
import { useFiscalYear } from "../hooks/useFiscalyear";
import { useTenantStore } from "../store/fiscalYearStore";

const DEFAULT_VALUE: FiscalYearFormValues = {
  fiscalYearName: "",
  calendarType: "ETHIOPIAN",
  startDate: "",
  endDate: "",
};

function formatDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";
  const parts: string[] = [digits.slice(0, 2)];
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4));
  return parts.join("-");
}

function toFormValue(fy?: FiscalYear): FiscalYearFormValues {
  if (!fy) return DEFAULT_VALUE;
  return {
    fiscalYearName: fy.fiscalYearName,
    calendarType: fy.calendarType,
    startDate: fy.startDateEth,
    endDate: fy.endDateEth,
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
  const [values, setValues] = useState<FiscalYearFormValues>(
    toFormValue(initialValues),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadOnly = mode === "edit" && initialValues?.status === "CLOSED";
  const canSubmit = !(mode === "edit" && initialValues?.status === "CLOSED");

  function handleChange(
    field: keyof FiscalYearFormValues,
    value: string,
  ) {
    if (field === "calendarType" && initialValues) {
      const newType = value as "ETHIOPIAN" | "GREGORIAN";
      setValues((prev) => ({
        ...prev,
        calendarType: newType,
        startDate:
          newType === "ETHIOPIAN"
            ? initialValues.startDateEth
            : initialValues.startDateGre,
        endDate:
          newType === "ETHIOPIAN"
            ? initialValues.endDateEth
            : initialValues.endDateGre,
      }));
    } else {
      const formatted =
        field === "startDate" || field === "endDate"
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
      router.push(`/fiscalyear`);
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
            <Label htmlFor="fiscalYearName">Fiscal Year Name</Label>
            <Input
              id="fiscalYearName"
              name="fiscalYearName"
              value={values.fiscalYearName}
              onChange={(e) =>
                handleChange("fiscalYearName", e.target.value)
              }
              placeholder="FY2013"
              disabled={isReadOnly}
              aria-invalid={!!errors.fiscalYearName}
            />
            {errors.fiscalYearName && (
              <p className="text-sm text-destructive">
                {errors.fiscalYearName}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="calendarType">Calendar Type</Label>
            <Select
              value={values.calendarType}
              onValueChange={(value) => {
                if (value) handleChange("calendarType", value);
              }}
              items={[
                { label: "Ethiopian", value: "ETHIOPIAN" },
                { label: "Gregorian", value: "GREGORIAN" },
              ]}
            >
              <SelectTrigger id="calendarType" className="w-full">
                <SelectValue placeholder="Select calendar" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ETHIOPIAN">Ethiopian</SelectItem>
                  <SelectItem value="GREGORIAN">Gregorian</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.calendarType && (
              <p className="text-sm text-destructive">{errors.calendarType}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              value={values.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              placeholder="01-11-2012"
              disabled={isReadOnly}
              aria-invalid={!!errors.startDate}
            />
            {errors.startDate && (
              <p className="text-sm text-destructive">{errors.startDate}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              value={values.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              placeholder="30-10-2013"
              disabled={isReadOnly}
              aria-invalid={!!errors.endDate}
            />
            {errors.endDate && (
              <p className="text-sm text-destructive">{errors.endDate}</p>
            )}
          </div>
        </CardContent>

        {canSubmit && (
          <CardFooter className="grid w-full grid-cols-2 gap-4 border-0 bg-transparent">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() =>
                router.push(`/fiscalyear`)
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
