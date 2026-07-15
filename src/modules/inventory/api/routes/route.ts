import { createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AppVariables } from "@/app/api/types/context";
import {
  resolveActiveCompany,
} from "@/app/api/lib/resolveActiveCompany";
import {
  CreateInventoryItemSchema,
  DeleteInventoryItemResponseSchema,
  InventoryItemSchema,
  InventoryListResponseSchema,
  UpdateInventoryItemSchema,
} from "@/modules/inventory/types";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryItemById,
  InventoryRepositoryError,
  listInventoryItems,
  updateInventoryItem,
} from "@/modules/inventory/services/inventoryRepository";

const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi("InventoryErrorResponse");

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

type InventoryEnv = { Variables: AppVariables };

function repositoryErrorResponse(
  c: Context<InventoryEnv>,
  error: InventoryRepositoryError,
  status: ContentfulStatusCode,
) {
  return c.json({ error: error.message }, status);
}

export const listInventoryItemsRoute = createRoute({
  method: "get",
  path: "/inventory-items",
  tags: ["Inventory"],
  summary: "List inventory items for the active company",
  responses: {
    200: {
      description: "Inventory items",
      content: {
        "application/json": {
          schema: InventoryListResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const listInventoryItemsHandler = async (c: Context<InventoryEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const items = await listInventoryItems(context.companyId);
  return c.json({ items }, 200);
};

export const getInventoryItemRoute = createRoute({
  method: "get",
  path: "/inventory-items/{id}",
  tags: ["Inventory"],
  summary: "Get an inventory item by id",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Inventory item",
      content: {
        "application/json": {
          schema: InventoryItemSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const getInventoryItemHandler = async (c: Context<InventoryEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    const item = await getInventoryItemById(id, context.companyId);
    return c.json(item, 200);
  } catch (error) {
    if (error instanceof InventoryRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};

export const createInventoryItemRoute = createRoute({
  method: "post",
  path: "/inventory-items",
  tags: ["Inventory"],
  summary: "Create an inventory item",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateInventoryItemSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Inventory item created",
      content: {
        "application/json": {
          schema: InventoryItemSchema,
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

export const createInventoryItemHandler = async (c: Context<InventoryEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const body = CreateInventoryItemSchema.parse(await c.req.json());

  try {
    const item = await createInventoryItem(context.companyId, body);
    return c.json(item, 201);
  } catch (error) {
    if (error instanceof InventoryRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 400,
      );
    }
    throw error;
  }
};

export const updateInventoryItemRoute = createRoute({
  method: "patch",
  path: "/inventory-items/{id}",
  tags: ["Inventory"],
  summary: "Update an inventory item",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateInventoryItemSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Inventory item updated",
      content: {
        "application/json": {
          schema: InventoryItemSchema,
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

export const updateInventoryItemHandler = async (c: Context<InventoryEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());
  const body = UpdateInventoryItemSchema.parse(await c.req.json());

  try {
    const item = await updateInventoryItem(id, context.companyId, body);
    return c.json(item, 200);
  } catch (error) {
    if (error instanceof InventoryRepositoryError) {
      return repositoryErrorResponse(
        c,
        error,
        error.status === 409 ? 409 : 404,
      );
    }
    throw error;
  }
};

export const deleteInventoryItemRoute = createRoute({
  method: "delete",
  path: "/inventory-items/{id}",
  tags: ["Inventory"],
  summary: "Delete an inventory item",
  request: {
    params: z.object({
      id: z.string().uuid(),
    }),
  },
  responses: {
    200: {
      description: "Inventory item deleted",
      content: {
        "application/json": {
          schema: DeleteInventoryItemResponseSchema,
        },
      },
    },
    ...authErrorResponses,
  },
});

export const deleteInventoryItemHandler = async (c: Context<InventoryEnv>) => {
  const context = await resolveActiveCompany(c);
  if (!context.ok) return context.response;

  const { id } = z.object({ id: z.string().uuid() }).parse(c.req.param());

  try {
    await deleteInventoryItem(id, context.companyId);
    return c.json({ success: true as const }, 200);
  } catch (error) {
    if (error instanceof InventoryRepositoryError) {
      return repositoryErrorResponse(c, error, 404);
    }
    throw error;
  }
};
