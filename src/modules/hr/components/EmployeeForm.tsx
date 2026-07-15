"use client"

import { useState, type FormEvent } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import { createEmployee, updateEmployee } from "../api/employeeApi"
import { validateEmployee } from "../services/hrService"
import type { Employee, EmployeeFormValues } from "../types"

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  initialData?: Employee
}

const EMPTY_VALUES: EmployeeFormValues = {
  name: "",
  email: "",
  department: "Store",
  status: "active",
}

export function EmployeeForm({
  mode,
  initialData,
}: EmployeeFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<EmployeeFormValues>(
    initialData ?? EMPTY_VALUES,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState("")

  function handleChange(
    field: keyof EmployeeFormValues,
    value: string,
  ) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validationErrors = validateEmployee(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setServerError("")
    setIsSubmitting(true)

    try {
      if (mode === "create") {
        await createEmployee(values)
      } else if (initialData) {
        await updateEmployee(initialData.id, values)
      }

      await queryClient.invalidateQueries({ queryKey: ["employees"] })
      router.push("/hr")
    } catch {
      setServerError("Failed to save employee. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "New Employee" : "Employee Details"}
        </CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Fill in the details below to add an employee."
            : "Update the employee details below."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {serverError && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {serverError}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="employee-name">Name</Label>
            <Input
              id="employee-name"
              name="name"
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "employee-name-error" : undefined}
            />
            {errors.name && (
              <p id="employee-name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="employee-email">Email</Label>
            <Input
              id="employee-email"
              name="email"
              type="email"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="email@company.com"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "employee-email-error" : undefined}
            />
            {errors.email && (
              <p id="employee-email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="employee-department">Department</Label>
            <Select
              value={values.department}
              onValueChange={(value) => {
                if (value) handleChange("department", value)
              }}
              disabled={isSubmitting}
              items={[
                { label: "Store", value: "Store" },
                { label: "Engineering", value: "Engineering" },
                { label: "Finance", value: "Finance" },
                { label: "Marketing", value: "Marketing" },
              ]}
            >
              <SelectTrigger id="employee-department" className="w-full">
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
          </div>

          <div className="grid gap-2">
            <Label htmlFor="employee-status">Status</Label>
            <Select
              value={values.status}
              onValueChange={(value) => {
                if (value) handleChange("status", value)
              }}
              disabled={isSubmitting}
              items={[
                { label: "Active", value: "active" },
                { label: "On Leave", value: "on_leave" },
              ]}
            >
              <SelectTrigger id="employee-status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        <CardFooter className="grid w-full grid-cols-2 gap-4 border-0 bg-transparent">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.push("/hr")}
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
              "Add Employee"
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}