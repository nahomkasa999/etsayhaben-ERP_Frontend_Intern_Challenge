"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import { useDepartmentFilterStore } from "../store/departmentFilterStore"

const DEPARTMENTS = ["Store", "Engineering", "Finance", "Marketing"]

const ALL_VALUE = "__all__"

export function DepartmentFilter() {
  const selectedDepartment = useDepartmentFilterStore(
    (s) => s.selectedDepartment
  )
  const setDepartment = useDepartmentFilterStore((s) => s.setDepartment)

  const items = [
    { label: "All Departments", value: ALL_VALUE },
    ...DEPARTMENTS.map((department) => ({
      label: department,
      value: department,
    })),
  ]

  return (
    <Select
      value={selectedDepartment ?? ALL_VALUE}
      onValueChange={(value) =>
        setDepartment(!value || value === ALL_VALUE ? null : value)
      }
      items={items}
    >
      <SelectTrigger size="sm" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ALL_VALUE}>All Departments</SelectItem>
          {DEPARTMENTS.map((department) => (
            <SelectItem key={department} value={department}>
              {department}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
