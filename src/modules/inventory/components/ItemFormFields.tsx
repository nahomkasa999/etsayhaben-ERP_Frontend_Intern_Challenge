"use client";

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
import { formatFieldErrors } from "@/shared/lib/form-errors";

import type { InventoryFormValues } from "../types";
import type { InventoryFormApi } from "../hooks/useInventoryForm";

type Props = {
  form: InventoryFormApi;
  disabled?: boolean;
};

export function ItemFormFields({ form, disabled }: Props) {
  return (
    <>
      <form.Field
        name="name"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Item name"
                disabled={disabled}
                aria-invalid={isInvalid}
              />
              {isInvalid && (
                <p className="text-sm text-destructive">
                  {formatFieldErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          );
        }}
      />

      <form.Field
        name="sku"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>SKU</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="SKU-001"
                disabled={disabled}
                aria-invalid={isInvalid}
              />
              {isInvalid && (
                <p className="text-sm text-destructive">
                  {formatFieldErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          );
        }}
      />

      <form.Field
        name="category"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Category</Label>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={(value) => {
                  if (value) {
                    field.handleChange(
                      value as InventoryFormValues["category"],
                    );
                  }
                }}
                disabled={disabled}
                items={[
                  { label: "Stationery", value: "Stationery" },
                  { label: "Electronics", value: "Electronics" },
                  { label: "Furniture", value: "Furniture" },
                  { label: "Other", value: "Other" },
                ]}
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full"
                  aria-invalid={isInvalid}
                >
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
              {isInvalid && (
                <p className="text-sm text-destructive">
                  {formatFieldErrors(field.state.meta.errors)}
                </p>
              )}
            </div>
          );
        }}
      />

      <div className="flex gap-3">
        <form.Field
          name="quantity"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="flex-1 grid gap-2">
                <Label htmlFor={field.name}>Quantity</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.valueAsNumber || 0)
                  }
                  disabled={disabled}
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <p className="text-sm text-destructive">
                    {formatFieldErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            );
          }}
        />

        <form.Field
          name="reorderLevel"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="flex-1 grid gap-2">
                <Label htmlFor={field.name}>Reorder level</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.valueAsNumber || 0)
                  }
                  disabled={disabled}
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <p className="text-sm text-destructive">
                    {formatFieldErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>

      <div className="flex gap-3">
        <form.Field
          name="unit"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="flex-1 grid gap-2">
                <Label htmlFor={field.name}>Unit</Label>
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    if (value) {
                      field.handleChange(value as InventoryFormValues["unit"]);
                    }
                  }}
                  disabled={disabled}
                  items={[
                    { label: "Pieces", value: "pcs" },
                    { label: "Box", value: "box" },
                    { label: "Kg", value: "kg" },
                    { label: "Liter", value: "liter" },
                  ]}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-invalid={isInvalid}
                  >
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {isInvalid && (
                  <p className="text-sm text-destructive">
                    {formatFieldErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            );
          }}
        />

        <form.Field
          name="price"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <div className="flex-1 grid gap-2">
                <Label htmlFor={field.name}>Price ($)</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  step="0.01"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.valueAsNumber || 0)
                  }
                  disabled={disabled}
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <p className="text-sm text-destructive">
                    {formatFieldErrors(field.state.meta.errors)}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>
    </>
  );
}
