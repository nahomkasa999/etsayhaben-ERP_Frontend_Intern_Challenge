import { InventoryItem } from "../types";

export function countLowStock(items: InventoryItem[]): number {
  return items.filter((item) => item.quantity < item.reorderLevel).length;
}
