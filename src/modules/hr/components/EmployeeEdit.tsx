"use client"

import { Loader2 } from "lucide-react"
import { useParams } from "next/navigation"

import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

import { useEmployeeById } from "../hooks/useEmployees"
import { EmployeeActions } from "./EmployeeActions"
import { EmployeeForm } from "./EmployeeForm"

export function EmployeeEdit() {
  const { id } = useParams<{ id: string }>()

  const { data: employee, isLoading } = useEmployeeById(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="space-y-2 py-12 text-center">
        <h2 className="text-lg font-medium">Employee not found</h2>
        <p className="text-sm text-muted-foreground">
          The employee you are looking for does not exist or was removed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Edit Employee</h1>
          <Badge variant={employee.status === "active" ? "default" : "secondary"}>
            {employee.status === "active" ? "Active" : "On Leave"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{employee.name}</p>
      </div>

      <EmployeeForm mode="edit" initialData={employee} />

      <Card className="max-w-xl border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Deleting this employee permanently removes their record. This
            action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardFooter className="border-0 bg-transparent">
          <EmployeeActions employee={employee} />
        </CardFooter>
      </Card>
    </div>
  )
}
