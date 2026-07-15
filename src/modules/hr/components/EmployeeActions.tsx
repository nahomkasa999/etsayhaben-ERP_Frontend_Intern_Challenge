"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"

import { deleteEmployee } from "../api/employeeApi"
import type { Employee } from "../types"

interface EmployeeActionsProps {
  employee: Employee
}

export function EmployeeActions({ employee }: EmployeeActionsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  async function handleDelete() {
    setError("")
    setIsDeleting(true)

    try {
      await deleteEmployee(employee.id)
      queryClient.removeQueries({ queryKey: ["employees", employee.id] })
      await queryClient.invalidateQueries({ queryKey: ["employees"] })
      router.push("/hr")
    } catch {
      setError("Failed to delete employee. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        Delete Employee
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!isDeleting) {
            setIsOpen(open)
            if (!open) setError("")
          }
        }}
      >
        <DialogContent showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {employee.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter className="mx-0 mb-0 grid w-full grid-cols-2 gap-4 border-0 bg-transparent p-0 sm:justify-stretch">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isDeleting}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
