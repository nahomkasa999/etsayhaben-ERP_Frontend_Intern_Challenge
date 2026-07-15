"use client";

import { useEffect, useState, FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import type { InventoryFormValues } from "../types";
import { createItem } from "../api/inventoryApi";
import { validateItem } from "../services/inventoryService";

const EMPTY_VALUES: InventoryFormValues = {
  name: "",
  sku: "",
  category: "Other",
  quantity: 0,
  unit: "pcs",
  price: 0,
  reorderLevel: 0,
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateItemDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<InventoryFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setValues(EMPTY_VALUES);
      setErrors({});
      setServerError("");
      setIsSubmitting(false);
    }
  }, [open]);

  function handleChange(
    field: keyof InventoryFormValues,
    value: string | number,
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validateItem(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setServerError("");
    setIsSubmitting(true);

    try {
      await createItem(values);
      await queryClient.invalidateQueries({ queryKey: ["inventory"] });
      onOpenChange(false);
    } catch {
      setServerError("Failed to save item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new inventory item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">
            {serverError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {serverError}
              </p>
            )}

            <div className="grid gap-2">
              <Label htmlFor="create-item-name">Name</Label>
              <Input
                id="create-item-name"
                value={values.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Item name"
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-item-sku">SKU</Label>
              <Input
                id="create-item-sku"
                value={values.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                placeholder="SKU-001"
                disabled={isSubmitting}
                aria-invalid={!!errors.sku}
              />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-item-category">Category</Label>
              <Select
                value={values.category}
                onValueChange={(value) => {
                  if (value) handleChange("category", value);
                }}
                disabled={isSubmitting}
                items={[
                  { label: "Stationery", value: "Stationery" },
                  { label: "Electronics", value: "Electronics" },
                  { label: "Furniture", value: "Furniture" },
                  { label: "Other", value: "Other" },
                ]}
              >
                <SelectTrigger id="create-item-category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Stationery">Stationery</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="create-item-quantity">Quantity</Label>
                <Input
                  id="create-item-quantity"
                  type="number"
                  value={values.quantity}
                  onChange={(e) =>
                    handleChange("quantity", Number(e.target.value))
                  }
                  disabled={isSubmitting}
                  aria-invalid={!!errors.quantity}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-item-reorder">Reorder level</Label>
                <Input
                  id="create-item-reorder"
                  type="number"
                  value={values.reorderLevel}
                  onChange={(e) =>
                    handleChange("reorderLevel", Number(e.target.value))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create-item-price">Price ($)</Label>
              <Input
                id="create-item-price"
                type="number"
                value={values.price}
                onChange={(e) => handleChange("price", Number(e.target.value))}
                disabled={isSubmitting}
                aria-invalid={!!errors.price}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 grid w-full grid-cols-2 gap-4 border-0 bg-transparent p-0 pt-4 sm:justify-stretch">
            <Button
              type="button"
              className="w-full"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Add Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
