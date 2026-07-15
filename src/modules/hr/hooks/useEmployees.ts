"use client";

import { createFetch, createSchema } from "@better-fetch/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CreateEmployeeSchema,
  DeleteEmployeeResponseSchema,
  EmployeeApiError,
  EmployeeListResponseSchema,
  EmployeeSchema,
  UpdateEmployeeSchema,
  type CreateEmployeeInput,
  type Employee,
  type UpdateEmployeeInput,
} from "../types";
import { useDepartmentFilterStore } from "../store/departmentFilterStore";
import { useEmployeeStatsStore } from "@/shared/store/employeeStatsStore";
import { countEmployeesOnLeave } from "../services/hrService";

const employeeFetch = createFetch({
  baseURL: "/api/v1",
  credentials: "include",
  schema: createSchema(
    {
      "/employees": {
        output: EmployeeListResponseSchema,
      },
      "/employees/:id": {
        output: EmployeeSchema,
      },
      "@post/employees": {
        input: CreateEmployeeSchema,
        output: EmployeeSchema,
      },
      "@patch/employees/:id": {
        input: UpdateEmployeeSchema,
        output: EmployeeSchema,
      },
      "@delete/employees/:id": {
        output: DeleteEmployeeResponseSchema,
      },
    },
    { strict: true },
  ),
});

function createApiError(fetchError: unknown, fallback: string) {
  let message = fallback;
  let status = 400;

  if (fetchError && typeof fetchError === "object") {
    if (
      "message" in fetchError &&
      typeof fetchError.message === "string" &&
      fetchError.message.length > 0
    ) {
      message = fetchError.message;
    }

    if ("status" in fetchError && typeof fetchError.status === "number") {
      status = fetchError.status;
    }
  }

  return new EmployeeApiError(message, status);
}

export async function fetchEmployees() {
  const { data, error: fetchError } = await employeeFetch("/employees");

  if (fetchError) {
    throw createApiError(fetchError, "Failed to fetch employees");
  }

  return data.employees;
}

export async function fetchEmployeeById(id: string) {
  const { data, error: fetchError } = await employeeFetch("/employees/:id", {
    params: { id },
  });

  if (fetchError) {
    throw createApiError(fetchError, "Failed to fetch employee");
  }

  return data;
}

async function createEmployeeRequest(input: CreateEmployeeInput) {
  const { data, error: fetchError } = await employeeFetch("@post/employees", {
    body: input,
  });

  if (fetchError) {
    throw createApiError(fetchError, "Failed to create employee");
  }

  return data;
}

async function updateEmployeeRequest(id: string, input: UpdateEmployeeInput) {
  const { data, error: fetchError } = await employeeFetch(
    "@patch/employees/:id",
    {
      params: { id },
      body: input,
    },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to update employee");
  }

  return data;
}

export async function deleteEmployeeRequest(id: string) {
  const { data, error: fetchError } = await employeeFetch(
    "@delete/employees/:id",
    { params: { id } },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to delete employee");
  }

  return data;
}

export function useEmployees() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const selectedDepartment = useDepartmentFilterStore(
    (s) => s.selectedDepartment,
  );
  const setEmployeesOnLeave = useEmployeeStatsStore(
    (s) => s.setEmployeesOnLeave,
  );

  const employeesQuery = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const result = await fetchEmployees();
      setEmployeesOnLeave(countEmployeesOnLeave(result));
      return result;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployeeRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: createEmployeeRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateEmployeeInput;
    }) => updateEmployeeRequest(id, input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      await queryClient.invalidateQueries({
        queryKey: ["employee", variables.id],
      });
    },
  });

  const employees = employeesQuery.data ?? [];
  const filtered = employees
    .filter((employee) =>
      employee.name.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      (employee) =>
        !selectedDepartment || employee.department === selectedDepartment,
    );

  async function removeEmployee(id: string) {
    return deleteMutation.mutateAsync(id);
  }

  async function createEmployee(input: CreateEmployeeInput) {
    return createMutation.mutateAsync(input);
  }

  async function updateEmployee(id: string, input: UpdateEmployeeInput) {
    return updateMutation.mutateAsync({ id, input });
  }

  return {
    employees: filtered,
    isLoading: employeesQuery.isLoading,
    isError: employeesQuery.isError,
    search,
    setSearch,
    removeEmployee,
    createEmployee,
    updateEmployee,
  };
}

export const createEmployee = createEmployeeRequest;
export const updateEmployee = updateEmployeeRequest;
export const deleteEmployee = deleteEmployeeRequest;

export function useEmployeeById(id: string) {
  return useQuery<Employee>({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id),
    enabled: Boolean(id),
  });
}
