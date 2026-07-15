"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

import { useInventoryFilterStore } from "../store/inventoryFilterStore"

const CATEGORIES = ["Stationery", "Electronics", "Furniture", "Other"]

const ALL_VALUE = "__all__"

export function CategoryFilter() {
  const selectedCategory = useInventoryFilterStore((s) => s.selectedCategory)
  const setCategory = useInventoryFilterStore((s) => s.setCategory)

  const items = [
    { label: "All categories", value: ALL_VALUE },
    ...CATEGORIES.map((category) => ({
      label: category,
      value: category,
    })),
  ]

  return (
    <Select
      value={selectedCategory ?? ALL_VALUE}
      onValueChange={(value) =>
        setCategory(!value || value === ALL_VALUE ? null : value)
      }
      items={items}
    >
      <SelectTrigger size="sm" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value={ALL_VALUE}>All categories</SelectItem>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
