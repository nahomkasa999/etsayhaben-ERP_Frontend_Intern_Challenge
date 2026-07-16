import { useForm } from "@tanstack/react-form";

import {
  CreateInventoryItemSchema,
  type InventoryFormValues,
} from "../types";

export const inventoryDefaultValues: InventoryFormValues = {
  name: "",
  sku: "",
  category: "Other",
  quantity: 0,
  unit: "pcs",
  price: 0,
  reorderLevel: 0,
};

export function useInventoryForm(options: {
  defaultValues?: InventoryFormValues;
  onSubmit: (value: InventoryFormValues) => Promise<void>;
}) {
  return useForm({
    defaultValues: options.defaultValues ?? inventoryDefaultValues,
    validators: {
      onSubmit: CreateInventoryItemSchema,
    },
    onSubmit: async ({ value }) => {
      await options.onSubmit(value);
    },
  });
}

export type InventoryFormApi = ReturnType<typeof useInventoryForm>;
