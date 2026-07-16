"use client";

import { useEffect, useState } from "react";
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

import { useFiscalYear } from "../hooks/useFiscalyear";
import {
  fiscalYearDefaultValues,
  useFiscalYearForm,
} from "../hooks/useFiscalYearForm";
import { FiscalYearFormFields } from "./FiscalYearFormFields";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateFiscalYearDialog({ open, onOpenChange }: Props) {
  const { createFiscalYear } = useFiscalYear();
  const [serverError, setServerError] = useState("");

  const form = useFiscalYearForm({
    defaultValues: fiscalYearDefaultValues,
    onSubmit: async (value) => {
      setServerError("");
      try {
        await createFiscalYear(value);
        onOpenChange(false);
      } catch (error) {
        setServerError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setServerError("");
    }
  }, [open, form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!form.state.isSubmitting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={!form.state.isSubmitting}
      >
        <DialogHeader>
          <DialogTitle>Create Fiscal Year</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a fiscal year.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid gap-4 py-2">
            {serverError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </p>
            )}
            <FiscalYearFormFields form={form} />
          </div>

          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
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
            )}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
