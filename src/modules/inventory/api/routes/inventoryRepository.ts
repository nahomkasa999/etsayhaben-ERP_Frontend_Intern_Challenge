import type { InventoryItem as PrismaInventoryItem } from "@/generated/prisma/client";
import prisma from "@/lib/db";
import type {
  CreateInventoryItemInput,
  InventoryItem,
  UpdateInventoryItemInput,
} from "../../types";

export class InventoryRepositoryError extends Error {
  status: number;

  constructor(detail: string, status = 400) {
    super(detail);
    this.name = "InventoryRepositoryError";
    this.status = status;
  }
}

function toInventoryItem(record: PrismaInventoryItem): InventoryItem {
  return {
    id: record.id,
    name: record.name,
    sku: record.sku,
    category: record.category,
    quantity: record.quantity,
    unit: record.unit,
    price: Number(record.price),
    reorderLevel: record.reorderLevel,
    status: record.status,
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listInventoryItems(
  companyId: string,
): Promise<InventoryItem[]> {
  const items = await prisma.inventoryItem.findMany({
    where: { companyId },
    orderBy: { updatedAt: "desc" },
  });

  return items.map(toInventoryItem);
}

export async function getInventoryItemById(
  id: string,
  companyId: string,
): Promise<InventoryItem> {
  const item = await prisma.inventoryItem.findFirst({
    where: { id, companyId },
  });

  if (!item) {
    throw new InventoryRepositoryError("Item not found", 404);
  }

  return toInventoryItem(item);
}

export async function createInventoryItem(
  companyId: string,
  input: CreateInventoryItemInput,
): Promise<InventoryItem> {
  const existing = await prisma.inventoryItem.findFirst({
    where: { companyId, sku: input.sku },
  });

  if (existing) {
    throw new InventoryRepositoryError("SKU is already taken", 409);
  }

  const created = await prisma.inventoryItem.create({
    data: {
      companyId,
      ...input,
      status: "active",
    },
  });

  return toInventoryItem(created);
}

export async function updateInventoryItem(
  id: string,
  companyId: string,
  input: UpdateInventoryItemInput,
): Promise<InventoryItem> {
  const existing = await prisma.inventoryItem.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new InventoryRepositoryError("Item not found", 404);
  }

  if (input.sku && input.sku !== existing.sku) {
    const skuTaken = await prisma.inventoryItem.findFirst({
      where: {
        companyId,
        sku: input.sku,
        NOT: { id },
      },
    });

    if (skuTaken) {
      throw new InventoryRepositoryError("SKU is already taken", 409);
    }
  }

  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: input,
  });

  return toInventoryItem(updated);
}

export async function deleteInventoryItem(
  id: string,
  companyId: string,
): Promise<void> {
  const existing = await prisma.inventoryItem.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new InventoryRepositoryError("Item not found", 404);
  }

  await prisma.inventoryItem.delete({ where: { id } });
}
