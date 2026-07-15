"use client";

import { createFetch, createSchema } from "@better-fetch/fetch";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  CreateInventoryItemSchema,
  DeleteInventoryItemResponseSchema,
  InventoryApiError,
  InventoryItemSchema,
  InventoryListResponseSchema,
  UpdateInventoryItemSchema,
  type CreateInventoryItemInput,
  type InventoryItem,
  type UpdateInventoryItemInput,
} from "../types";
import { useInventoryFilterStore } from "../store/inventoryFilterStore";
import { useInventoryStatsStore } from "@/shared/store/inventoryStatsStore";
import { countLowStock } from "../services/inventoryService";

const inventoryFetch = createFetch({
  baseURL: "/api/v1",
  credentials: "include",
  schema: createSchema(
    {
      "/inventory-items": {
        output: InventoryListResponseSchema,
      },
      "/inventory-items/:id": {
        output: InventoryItemSchema,
      },
      "@post/inventory-items": {
        input: CreateInventoryItemSchema,
        output: InventoryItemSchema,
      },
      "@patch/inventory-items/:id": {
        input: UpdateInventoryItemSchema,
        output: InventoryItemSchema,
      },
      "@delete/inventory-items/:id": {
        output: DeleteInventoryItemResponseSchema,
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

  return new InventoryApiError(message, status);
}

export async function fetchInventoryItems() {
  const { data, error: fetchError } = await inventoryFetch("/inventory-items");

  if (fetchError) {
    throw createApiError(fetchError, "Failed to fetch inventory items");
  }

  return data.items;
}

export async function fetchInventoryItemById(id: string) {
  const { data, error: fetchError } = await inventoryFetch(
    "/inventory-items/:id",
    { params: { id } },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to fetch inventory item");
  }

  return data;
}

async function createInventoryItemRequest(input: CreateInventoryItemInput) {
  const { data, error: fetchError } = await inventoryFetch(
    "@post/inventory-items",
    { body: input },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to create inventory item");
  }

  return data;
}

async function updateInventoryItemRequest(
  id: string,
  input: UpdateInventoryItemInput,
) {
  const { data, error: fetchError } = await inventoryFetch(
    "@patch/inventory-items/:id",
    {
      params: { id },
      body: input,
    },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to update inventory item");
  }

  return data;
}

async function deleteInventoryItemRequest(id: string) {
  const { data, error: fetchError } = await inventoryFetch(
    "@delete/inventory-items/:id",
    { params: { id } },
  );

  if (fetchError) {
    throw createApiError(fetchError, "Failed to delete inventory item");
  }

  return data;
}

export function useInventory() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const selectedCategory = useInventoryFilterStore((s) => s.selectedCategory);
  const setLowStockCount = useInventoryStatsStore((s) => s.setLowStockCount);

  const inventoryQuery = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const result = await fetchInventoryItems();
      setLowStockCount(countLowStock(result));
      return result;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItemRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const createMutation = useMutation({
    mutationFn: createInventoryItemRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateInventoryItemInput;
    }) => updateInventoryItemRequest(id, input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      await queryClient.invalidateQueries({
        queryKey: ["inventory", variables.id],
      });
    },
  });

  const items = inventoryQuery.data ?? [];
  const filtered = items
    .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => !selectedCategory || item.category === selectedCategory);

  async function removeItem(id: string) {
    return deleteMutation.mutateAsync(id);
  }

  async function createItem(input: CreateInventoryItemInput) {
    return createMutation.mutateAsync(input);
  }

  async function updateItem(id: string, input: UpdateInventoryItemInput) {
    return updateMutation.mutateAsync({ id, input });
  }

  return {
    items: filtered,
    isLoading: inventoryQuery.isLoading,
    isError: inventoryQuery.isError,
    search,
    setSearch,
    removeItem,
    createItem,
    updateItem,
  };
}

export const createItem = createInventoryItemRequest;
export const updateItem = updateInventoryItemRequest;
export const deleteItem = deleteInventoryItemRequest;

export function useInventoryItemById(id: string) {
  return useQuery<InventoryItem>({
    queryKey: ["inventory", id],
    queryFn: () => fetchInventoryItemById(id),
    enabled: Boolean(id),
  });
}
