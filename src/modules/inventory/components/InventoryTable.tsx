"use client"

import { useMemo } from "react"

import { DataTable } from "@/shared/components/ui/data-table"

import { useInventory } from "../hooks/useInventory"
import { BulkActionBar } from "./BulkActionBar"
import { CategoryFilter } from "./CategoryFilter"
import { getInventoryColumns } from "./columns"
import { ItemDetailPanel } from "./ItemDetailPanel"
import { SearchBar } from "./SearchBar"

export function InventoryTable() {
  const { items, isLoading, isError, search, setSearch, removeItem } =
    useInventory()

  const columns = useMemo(
    () => getInventoryColumns((item) => removeItem(item.id)),
    [removeItem]
  )

  if (isLoading) return <p>Loading inventory...</p>
  if (isError)
    return (
      <p>
        Something went wrong.{" "}
        <button onClick={() => location.reload()}>Retry</button>
      </p>
    )

  return (
    <div>
      <DataTable
        columns={columns}
        data={items}
        getRowId={(row) => row.id}
        getRowClassName={(row) =>
          row.original.quantity < row.original.reorderLevel
            ? "bg-destructive/5"
            : undefined
        }
        renderSubComponent={({ row }) => (
          <ItemDetailPanel item={row.original} />
        )}
        toolbar={
          <>
            <SearchBar value={search} onChange={setSearch} />
            <CategoryFilter />
          </>
        }
      />
      <BulkActionBar />
    </div>
  )
}
