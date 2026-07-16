import { useForm } from "@tanstack/react-form";

import {
  CreateEmployeeSchema,
  type EmployeeFormValues,
} from "../types";

export const employeeDefaultValues: EmployeeFormValues = {
  name: "",
  email: "",
  department: "Store",
  status: "active",
};

export function useEmployeeForm(options: {
  defaultValues?: EmployeeFormValues;
  onSubmit: (value: EmployeeFormValues) => Promise<void>;
}) {
  return useForm({
    defaultValues: options.defaultValues ?? employeeDefaultValues,
    validators: {
      onSubmit: CreateEmployeeSchema,
    },
    onSubmit: async ({ value }) => {
      await options.onSubmit(value);
    },
  });
}

export type EmployeeFormApi = ReturnType<typeof useEmployeeForm>;
