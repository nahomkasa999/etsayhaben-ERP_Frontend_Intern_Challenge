import { z } from "zod";

export const InventoryCategorySchema = z.enum([
  "Stationery",
  "Electronics",
  "Furniture",
  "Other",
]);

export const InventoryUnitSchema = z.enum(["pcs", "box", "kg", "liter"]);

export const InventoryItemStatusSchema = z.enum(["active", "inactive"]);

export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  sku: z.string(),
  category: InventoryCategorySchema,
  quantity: z.number().int(),
  unit: InventoryUnitSchema,
  price: z.number(),
  reorderLevel: z.number().int(),
  status: InventoryItemStatusSchema,
  updatedAt: z.string().datetime(),
});

export const InventoryListResponseSchema = z.object({
  items: z.array(InventoryItemSchema),
});

export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: InventoryCategorySchema,
  quantity: z.number().int().min(0),
  unit: InventoryUnitSchema,
  price: z.number().min(0),
  reorderLevel: z.number().int().min(0),
});

export const UpdateInventoryItemSchema = CreateInventoryItemSchema.partial();

export const DeleteInventoryItemResponseSchema = z.object({
  success: z.literal(true),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryListResponse = z.infer<typeof InventoryListResponseSchema>;
export type CreateInventoryItemInput = z.infer<typeof CreateInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof UpdateInventoryItemSchema>;
export type InventoryFormValues = CreateInventoryItemInput;

export class InventoryApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "InventoryApiError";
    this.status = status;
  }
}
