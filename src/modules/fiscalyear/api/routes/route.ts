import { createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppVariables } from "@/app/api/types/context";
import { resolveActiveCompany } from "@/app/api/lib/resolveActiveCompany";
import {
  ActivateFiscalYearResponseSchema,
  CloseFiscalYearResponseSchema,
  CloseFiscalYearSchema,
  CreateFiscalYearSchema,
  DeleteFiscalYearResponseSchema,
  FiscalYearByDateQuerySchema,
  FiscalYearListItemSchema,
  FiscalYearListResponseSchema,
  FiscalYearSchema,
  ReopenFiscalYearResponseSchema,
  ReopenFiscalYearSchema,
  UpdateFiscalYearResponseSchema,
  UpdateFiscalYearSchema,
} from "@/modules/fiscalyear/types";
import {
  activateFiscalYear,
  closeFiscalYear,
  createFiscalYear,
  deleteFiscalYear,
  FiscalYearRepositoryError,
  getActiveFiscalYear,
  getFiscalYearByDate,
  getFiscalYearById,
  listFiscalYears,
  reopenFiscalYear,
  updateFiscalYear,
} from "./fiscalYearRepository";

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("FiscalYearErrorResponse");

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

type FiscalYearEnv = { Variables: AppVariables };

function repositoryErrorResponse(
  c: Context<FiscalYearEnv>,
  error: FiscalYearRepositoryError,
  status: ContentfulStatusCode,
) {
  return c.json({ error: error.message }, status);
}

export const listFiscalYearsRoute = createRoute({
  method: "get",
  path: "/fiscal-years",
  tags: ["Fiscal Years"],
  summary: "List fiscal years for the active company",
  responses: {
    200: {
      description: "Fiscal years list",
      content: {
        "application/json": {
          schema: FiscalYearListResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const listFiscalYearsHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const fiscalYears = await listFiscalYears(context.tenantId, context.companyId);
  return c.json({ fiscalYears }, 200);
};

export const getFiscalYearRoute = createRoute({
  method: "get",
  path: "/fiscal-years/{id}",
  tags: ["Fiscal Years"],
  summary: "Get a fiscal year by id",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Fiscal year details",
      content: {
        "application/json": {
          schema: FiscalYearSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const getFiscalYearHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    const data = await getFiscalYearById(id, context.tenantId, context.companyId);
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};

export const getActiveFiscalYearRoute = createRoute({
  method: "get",
  path: "/fiscal-years/active",
  tags: ["Fiscal Years"],
  summary: "Get the active fiscal year",
  responses: {
    200: {
      description: "Active fiscal year",
      content: {
        "application/json": {
          schema: FiscalYearSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const getActiveFiscalYearHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  try {
    const data = await getActiveFiscalYear(context.tenantId, context.companyId);
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};

export const getFiscalYearByDateRoute = createRoute({
  method: "get",
  path: "/fiscal-years/by-date",
  tags: ["Fiscal Years"],
  summary: "Get a fiscal year by date",
  request: {
    query: FiscalYearByDateQuerySchema,
  },
  responses: {
    200: {
      description: "Fiscal year for date",
      content: {
        "application/json": {
          schema: FiscalYearListItemSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const getFiscalYearByDateHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { date, calendarType } = FiscalYearByDateQuerySchema.parse(
    c.req.query(),
  );

  try {
    const data = await getFiscalYearByDate(
      context.tenantId,
      context.companyId,
      date,
      calendarType,
    );
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};

export const createFiscalYearRoute = createRoute({
  method: "post",
  path: "/fiscal-years",
  tags: ["Fiscal Years"],
  summary: "Create a fiscal year",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateFiscalYearSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Fiscal year created",
      content: {
        "application/json": {
          schema: FiscalYearSchema,
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

export const createFiscalYearHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const body = CreateFiscalYearSchema.parse(await c.req.json());

  try {
    const data = await createFiscalYear(
      context.tenantId,
      context.companyId,
      context.userId,
      body,
    );
    return c.json(data, 201);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 400,
      );
    }
    throw error;
  }
};

export const updateFiscalYearRoute = createRoute({
  method: "patch",
  path: "/fiscal-years/{id}",
  tags: ["Fiscal Years"],
  summary: "Update a fiscal year",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateFiscalYearSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Fiscal year updated",
      content: {
        "application/json": {
          schema: UpdateFiscalYearResponseSchema,
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

export const updateFiscalYearHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());
  const body = UpdateFiscalYearSchema.parse(await c.req.json());

  try {
    const data = await updateFiscalYear(
      id,
      context.tenantId,
      context.companyId,
      context.userId,
      body,
    );
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 404,
      );
    }
    throw error;
  }
};

export const activateFiscalYearRoute = createRoute({
  method: "post",
  path: "/fiscal-years/{id}/activate",
  tags: ["Fiscal Years"],
  summary: "Activate a fiscal year",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Fiscal year activated",
      content: {
        "application/json": {
          schema: ActivateFiscalYearResponseSchema,
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

export const activateFiscalYearHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    const data = await activateFiscalYear(
      id,
      context.tenantId,
      context.companyId,
      context.userId,
    );
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 404,
      );
    }
    throw error;
  }
};

export const closeFiscalYearRoute = createRoute({
  method: "post",
  path: "/fiscal-years/{id}/close",
  tags: ["Fiscal Years"],
  summary: "Close a fiscal year",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: CloseFiscalYearSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Fiscal year closed",
      content: {
        "application/json": {
          schema: CloseFiscalYearResponseSchema,
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

export const closeFiscalYearHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());
  const body = CloseFiscalYearSchema.parse(await c.req.json());

  try {
    const data = await closeFiscalYear(
      id,
      context.tenantId,
      context.companyId,
      context.userId,
      body.justification,
    );
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 404,
      );
    }
    throw error;
  }
};

export const reopenFiscalYearRoute = createRoute({
  method: "post",
  path: "/fiscal-years/{id}/reopen",
  tags: ["Fiscal Years"],
  summary: "Reopen a fiscal year",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: ReopenFiscalYearSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Fiscal year reopened",
      content: {
        "application/json": {
          schema: ReopenFiscalYearResponseSchema,
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

export const reopenFiscalYearHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());
  const body = ReopenFiscalYearSchema.parse(await c.req.json());

  try {
    const data = await reopenFiscalYear(
      id,
      context.tenantId,
      context.companyId,
      context.userId,
      body.justification,
    );
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 404,
      );
    }
    throw error;
  }
};

export const deleteFiscalYearRoute = createRoute({
  method: "delete",
  path: "/fiscal-years/{id}",
  tags: ["Fiscal Years"],
  summary: "Delete a fiscal year",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Fiscal year deleted",
      content: {
        "application/json": {
          schema: DeleteFiscalYearResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const deleteFiscalYearHandler = async (c: Context<FiscalYearEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    await deleteFiscalYear(id, context.tenantId, context.companyId);
    return c.json({ success: true as const }, 200);
  } catch (error) {
    if (error instanceof FiscalYearRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};
