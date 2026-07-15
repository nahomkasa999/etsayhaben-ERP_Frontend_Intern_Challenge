"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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

import type { FiscalYearFormValues } from "../types";
import { validateFiscalYearForm } from "../services/fiscalYearService";
import { useFiscalYear } from "../hooks/useFiscalyear";

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateFiscalYearDialog({ open, onOpenChange }: Props) {
  const { createFiscalYear } = useFiscalYear();
  const [values, setValues] = useState<FiscalYearFormValues>(DEFAULT_VALUE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(DEFAULT_VALUE);
      setErrors({});
      setServerError("");
      setIsSubmitting(false);
    }
  }, [open]);

  function handleChange(
    field: keyof FiscalYearFormValues,
    value: string,
  ) {
    const formatted =
      field === "startDate" || field === "endDate"
        ? formatDateInput(value)
        : value;
    setValues((prev) => ({ ...prev, [field]: formatted }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateFiscalYearForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setIsSubmitting(true);

    try {
      await createFiscalYear(values);
      onOpenChange(false);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Create Fiscal Year</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a fiscal year.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            {serverError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="create-fiscal-year-name">Fiscal Year Name</Label>
              <Input
                id="create-fiscal-year-name"
                value={values.fiscalYearName}
                onChange={(e) =>
                  handleChange("fiscalYearName", e.target.value)
                }
                placeholder="FY2013"
                disabled={isSubmitting}
                aria-invalid={!!errors.fiscalYearName}
              />
              {errors.fiscalYearName && (
                <p className="text-sm text-destructive">
                  {errors.fiscalYearName}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-calendar-type">Calendar Type</Label>
              <Select
                value={values.calendarType}
                onValueChange={(value) => {
                  if (value) handleChange("calendarType", value);
                }}
                disabled={isSubmitting}
                items={[
                  { label: "Ethiopian", value: "ETHIOPIAN" },
                  { label: "Gregorian", value: "GREGORIAN" },
                ]}
              >
                <SelectTrigger id="create-calendar-type" className="w-full">
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
              <Label htmlFor="create-start-date">Start Date</Label>
              <Input
                id="create-start-date"
                value={values.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                placeholder="01-11-2012"
                disabled={isSubmitting}
                aria-invalid={!!errors.startDate}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-end-date">End Date</Label>
              <Input
                id="create-end-date"
                value={values.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                placeholder="30-10-2013"
                disabled={isSubmitting}
                aria-invalid={!!errors.endDate}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 grid w-full grid-cols-2 gap-4 border-0 bg-transparent p-0 pt-4 sm:justify-stretch">
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
