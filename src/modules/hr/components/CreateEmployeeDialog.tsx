"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

import { createEmployee } from "../hooks/useEmployees";
import {
  employeeDefaultValues,
  useEmployeeForm,
} from "../hooks/useEmployeeForm";
import { EmployeeFormFields } from "./EmployeeFormFields";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEmployeeDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const form = useEmployeeForm({
    defaultValues: employeeDefaultValues,
    onSubmit: async (value) => {
      setServerError("");
      try {
        await createEmployee(value);
        await queryClient.invalidateQueries({ queryKey: ["employees"] });
        onOpenChange(false);
      } catch {
        setServerError("Failed to save employee.");
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
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new employee.
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
            <EmployeeFormFields form={form} />
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
                    "Add Employee"
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
