"use client";

import { useEffect, useState, FormEvent } from "react";
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

import type { EmployeeFormValues } from "../types";
import { createEmployee } from "../api/employeeApi";
import { validateEmployee } from "../services/hrService";

const EMPTY_VALUES: EmployeeFormValues = {
  name: "",
  email: "",
  department: "Store",
  status: "active",
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEmployeeDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(EMPTY_VALUES);
      setErrors({});
      setServerError("");
      setIsSubmitting(false);
    }
  }, [open]);

  function handleChange(field: keyof EmployeeFormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateEmployee(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setIsSubmitting(true);

    try {
      await createEmployee(values);
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
    } catch {
      setServerError("Failed to save employee.");
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
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new employee.
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
              <Label htmlFor="create-employee-name">Name</Label>
              <Input
                id="create-employee-name"
                value={values.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-employee-email">Email</Label>
              <Input
                id="create-employee-email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@address.com"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-employee-department">Department</Label>
              <Select
                value={values.department}
                onValueChange={(value) => {
                  if (value) handleChange("department", value);
                }}
                disabled={isSubmitting}
                items={[
                  { label: "Store", value: "Store" },
                  { label: "Engineering", value: "Engineering" },
                  { label: "Finance", value: "Finance" },
                  { label: "Marketing", value: "Marketing" },
                ]}
              >
                <SelectTrigger id="create-employee-department" className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Store">Store</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-employee-status">Status</Label>
              <Select
                value={values.status}
                onValueChange={(value) => {
                  if (value) handleChange("status", value);
                }}
                disabled={isSubmitting}
                items={[
                  { label: "Active", value: "active" },
                  { label: "On Leave", value: "on_leave" },
                ]}
              >
                <SelectTrigger id="create-employee-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                "Add Employee"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
