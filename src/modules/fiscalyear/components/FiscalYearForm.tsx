"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { FiscalYear, FiscalYearFormValues } from "../types";
import { useFiscalYear } from "../hooks/useFiscalyear";
import { useFiscalYearForm } from "../hooks/useFiscalYearForm";
import { FiscalYearFormFields } from "./FiscalYearFormFields";

type Props = {
  initialValues?: FiscalYear;
  mode: "create" | "edit";
};

function toFormValues(fy?: FiscalYear): FiscalYearFormValues {
  if (!fy) {
    return {
      fiscalYearName: "",
      calendarType: "ETHIOPIAN",
      startDate: "",
      endDate: "",
    };
  }
  return {
    fiscalYearName: fy.fiscalYearName,
    calendarType: fy.calendarType,
    startDate: fy.startDateEth,
    endDate: fy.endDateEth,
  };
}

export function FiscalYearForm({ initialValues, mode }: Props) {
  const router = useRouter();
  const { createFiscalYear, updateFiscalYear } = useFiscalYear();
  const [serverErrors, setServerErrors] = useState("");
  const isReadOnly = mode === "edit" && initialValues?.status === "CLOSED";
  const canSubmit = !isReadOnly;

  const form = useFiscalYearForm({
    defaultValues: toFormValues(initialValues),
    onSubmit: async (value) => {
      setServerErrors("");
      try {
        if (mode === "create") {
          await createFiscalYear(value);
        } else if (initialValues) {
          await updateFiscalYear(initialValues.id, value);
        }
        router.push(`/fiscalyear`);
      } catch (error) {
        setServerErrors(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    },
  });

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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <CardContent className="grid gap-4">
          {serverErrors && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverErrors}
            </p>
          )}
          <FiscalYearFormFields
            form={form}
            disabled={isReadOnly}
            dateSource={initialValues}
          />
        </CardContent>

        {canSubmit && (
          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <CardFooter className="grid w-full grid-cols-2 gap-4 border-0 bg-transparent">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/fiscalyear`)}
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
          />
        )}
      </form>
    </Card>
  );
}
