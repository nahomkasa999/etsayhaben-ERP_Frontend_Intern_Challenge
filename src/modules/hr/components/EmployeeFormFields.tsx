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

import type { EmployeeFormValues } from "../types";
import type { EmployeeFormApi } from "../hooks/useEmployeeForm";

type Props = {
  form: EmployeeFormApi;
  disabled?: boolean;
};

export function EmployeeFormFields({ form, disabled }: Props) {
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
                placeholder="John Doe"
                autoComplete="name"
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
        name="email"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Email</Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="email@company.com"
                autoComplete="email"
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
        name="department"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Department</Label>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={(value) => {
                  if (value) {
                    field.handleChange(
                      value as EmployeeFormValues["department"],
                    );
                  }
                }}
                disabled={disabled}
                items={[
                  { label: "Store", value: "Store" },
                  { label: "Engineering", value: "Engineering" },
                  { label: "Finance", value: "Finance" },
                  { label: "Marketing", value: "Marketing" },
                ]}
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full"
                  aria-invalid={isInvalid}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Store">Store</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
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
        name="status"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Status</Label>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={(value) => {
                  if (value) {
                    field.handleChange(value as EmployeeFormValues["status"]);
                  }
                }}
                disabled={disabled}
                items={[
                  { label: "Active", value: "active" },
                  { label: "On Leave", value: "on_leave" },
                ]}
              >
                <SelectTrigger
                  id={field.name}
                  className="w-full"
                  aria-invalid={isInvalid}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
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
    </>
  );
}
