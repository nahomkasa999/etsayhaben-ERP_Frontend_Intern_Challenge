import { createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppVariables } from "@/app/api/types/context";
import { resolveActiveCompany } from "@/app/api/lib/resolveActiveCompany";
import {
  CreateEmployeeSchema,
  DeleteEmployeeResponseSchema,
  EmployeeListResponseSchema,
  EmployeeSchema,
  UpdateEmployeeSchema,
} from "@/modules/hr/types";
import {
  createEmployee,
  deleteEmployee,
  EmployeeRepositoryError,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from "./employeeRepository";

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("EmployeeErrorResponse");

const authErrorResponses = {
  400: {
    description: "No active organization or company",
    content: { "application/json": { schema: ErrorSchema } },
  },
  401: {
    description: "Unauthorized",
    content: { "application/json": { schema: ErrorSchema } },
  },
  403: {
    description: "Forbidden",
    content: { "application/json": { schema: ErrorSchema } },
  },
  404: {
    description: "Not found",
    content: { "application/json": { schema: ErrorSchema } },
  },
} as const;

type EmployeeEnv = { Variables: AppVariables };

function repositoryErrorResponse(
  c: Context<EmployeeEnv>,
  error: EmployeeRepositoryError,
  status: ContentfulStatusCode,
) {
  return c.json({ error: error.message }, status);
}

export const listEmployeesRoute = createRoute({
  method: "get",
  path: "/employees",
  tags: ["Employees"],
  summary: "List employees for the active company",
  responses: {
    200: {
      description: "Employees",
      content: {
        "application/json": {
          schema: EmployeeListResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const listEmployeesHandler = async (c: Context<EmployeeEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const employees = await listEmployees(context.companyId);
  return c.json({ employees }, 200);
};

export const getEmployeeRoute = createRoute({
  method: "get",
  path: "/employees/{id}",
  tags: ["Employees"],
  summary: "Get an employee by id",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Employee",
      content: {
        "application/json": {
          schema: EmployeeSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const getEmployeeHandler = async (c: Context<EmployeeEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    const employee = await getEmployeeById(id, context.companyId);
    return c.json(employee, 200);
  } catch (error) {
    if (error instanceof EmployeeRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};

export const createEmployeeRoute = createRoute({
  method: "post",
  path: "/employees",
  tags: ["Employees"],
  summary: "Create an employee",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateEmployeeSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Employee created",
      content: {
        "application/json": {
          schema: EmployeeSchema,
        },
      },
    },
    409: {
      description: "Conflict",
      content: { "application/json": { schema: ErrorSchema } },
    },
    ...authErrorResponses,
  },
});

export const createEmployeeHandler = async (c: Context<EmployeeEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const body = CreateEmployeeSchema.parse(await c.req.json());

  try {
    const employee = await createEmployee(context.companyId, body);
    return c.json(employee, 201);
  } catch (error) {
    if (error instanceof EmployeeRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 400,
      );
    }
    throw error;
  }
};

export const updateEmployeeRoute = createRoute({
  method: "patch",
  path: "/employees/{id}",
  tags: ["Employees"],
  summary: "Update an employee",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateEmployeeSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Employee updated",
      content: {
        "application/json": {
          schema: EmployeeSchema,
        },
      },
    },
    409: {
      description: "Conflict",
      content: { "application/json": { schema: ErrorSchema } },
    },
    ...authErrorResponses,
  },
});

export const updateEmployeeHandler = async (c: Context<EmployeeEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());
  const body = UpdateEmployeeSchema.parse(await c.req.json());

  try {
    const employee = await updateEmployee(id, context.companyId, body);
    return c.json(employee, 200);
  } catch (error) {
    if (error instanceof EmployeeRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 404,
      );
    }
    throw error;
  }
};

export const deleteEmployeeRoute = createRoute({
  method: "delete",
  path: "/employees/{id}",
  tags: ["Employees"],
  summary: "Delete an employee",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Employee deleted",
      content: {
        "application/json": {
          schema: DeleteEmployeeResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const deleteEmployeeHandler = async (c: Context<EmployeeEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    await deleteEmployee(id, context.companyId);
    return c.json({ success: true as const }, 200);
  } catch (error) {
    if (error instanceof EmployeeRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};
