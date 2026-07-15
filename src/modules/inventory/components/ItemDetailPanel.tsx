import type { InventoryItem } from "../types"

interface ItemDetailPanelProps {
  item: InventoryItem
}

export function ItemDetailPanel({ item }: ItemDetailPanelProps) {
  const details = [
    { label: "SKU", value: item.sku },
    {
      label: "Reorder level",
      value: `${item.reorderLevel} ${item.unit}`,
    },
    { label: "Status", value: item.status },
    {
      label: "Last updated",
      value: new Date(item.updatedAt).toLocaleString(),
    },
  ]

  return (
    <dl className="grid gap-1 text-sm text-foreground">
      {details.map(({ label, value }) => (
        <div key={label} className="flex min-w-0 gap-1.5">
          <dt className="shrink-0 font-medium">{label}:</dt>
          <dd className="min-w-0 break-words text-muted-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  )
}