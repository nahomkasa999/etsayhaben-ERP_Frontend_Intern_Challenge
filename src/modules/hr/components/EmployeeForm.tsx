"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

import { createEmployee, updateEmployee } from "../hooks/useEmployees";
import { useEmployeeForm } from "../hooks/useEmployeeForm";
import type { Employee, EmployeeFormValues } from "../types";
import { EmployeeFormFields } from "./EmployeeFormFields";

interface EmployeeFormProps {
  mode: "create" | "edit";
  initialData?: Employee;
}

function toFormValues(employee?: Employee): EmployeeFormValues {
  if (!employee) {
    return {
      name: "",
      email: "",
      department: "Store",
      status: "active",
    };
  }
  return {
    name: employee.name,
    email: employee.email,
    department: employee.department,
    status: employee.status,
  };
}

export function EmployeeForm({ mode, initialData }: EmployeeFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const form = useEmployeeForm({
    defaultValues: toFormValues(initialData),
    onSubmit: async (value) => {
      setServerError("");
      try {
        if (mode === "create") {
          await createEmployee(value);
        } else if (initialData) {
          await updateEmployee(initialData.id, value);
        }
        await queryClient.invalidateQueries({ queryKey: ["employees"] });
        router.push("/hr");
      } catch {
        setServerError("Failed to save employee. Please try again.");
      }
    },
  });

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "New Employee" : "Employee Details"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Fill in the details below to add an employee."
            : "Update the employee details below."}
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <CardContent className="grid gap-4">
          {serverError && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {serverError}
            </p>
          )}
          <EmployeeFormFields form={form} />
        </CardContent>

        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <CardFooter className="grid w-full grid-cols-2 gap-4 border-0 bg-transparent">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/hr")}
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
                  "Add Employee"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          )}
        />
      </form>
    </Card>
  );
}
