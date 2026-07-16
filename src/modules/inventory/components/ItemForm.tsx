"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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

import { createItem, updateItem } from "../hooks/useInventory";
import { useInventoryForm } from "../hooks/useInventoryForm";
import type { InventoryFormValues, InventoryItem } from "../types";
import { ItemFormFields } from "./ItemFormFields";

interface ItemFormProps {
  mode: "create" | "edit";
  initialData?: InventoryItem;
}

function toFormValues(item?: InventoryItem): InventoryFormValues {
  if (!item) {
    return {
      name: "",
      sku: "",
      category: "Other",
      quantity: 0,
      unit: "pcs",
      price: 0,
      reorderLevel: 0,
    };
  }
  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    reorderLevel: item.reorderLevel,
  };
}

export function ItemForm({ mode, initialData }: ItemFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState("");

  const form = useInventoryForm({
    defaultValues: toFormValues(initialData),
    onSubmit: async (value) => {
      setServerError("");
      try {
        if (mode === "create") {
          await createItem(value);
        } else if (initialData) {
          await updateItem(initialData.id, value);
        }
        await queryClient.invalidateQueries({ queryKey: ["inventory"] });
        router.push("/inventory");
      } catch {
        setServerError("Failed to save item. Please try again.");
      }
    },
  });

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "New Inventory Item" : "Inventory Item Details"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Fill in the details below to add an inventory item."
            : "Update the inventory item details below."}
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
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}
          <ItemFormFields form={form} />
        </CardContent>

        <form.Subscribe
          selector={(state) => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <CardFooter className="grid w-full grid-cols-2 gap-4 border-0 bg-transparent">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/inventory")}
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
                  "Add Item"
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
