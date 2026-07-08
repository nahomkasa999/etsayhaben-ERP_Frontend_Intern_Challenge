// ── API INTEGRATION ──────────────────────────────────────────────
// This file pretends to be a backend. Every function returns a Promise
// and has an artificial delay, so the rest of the app behaves EXACTLY
// like it would with a real server (loading states, async/await, etc).
// Swap localStorage for axios.get/post later and nothing else changes.

import { InventoryItem, InventoryFormValues } from '../types'

const STORAGE_KEY = 'inventory_items'

// Fake network latency so loading spinners are actually visible
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Data used to "seed the database" the first time the app runs
const SEED_DATA: InventoryItem[] = [
  { id: '1', name: 'A4 Paper Ream', sku: 'STA-001', category: 'Stationery', quantity: 120, unit: 'box', price: 5.5, reorderLevel: 20, status: 'active', updatedAt: new Date().toISOString() },
  { id: '2', name: 'Laptop Charger 65W', sku: 'ELC-014', category: 'Electronics', quantity: 8, unit: 'pcs', price: 22.0, reorderLevel: 10, status: 'active', updatedAt: new Date().toISOString() },
  { id: '3', name: 'Office Chair', sku: 'FUR-002', category: 'Furniture', quantity: 15, unit: 'pcs', price: 89.99, reorderLevel: 5, status: 'active', updatedAt: new Date().toISOString() },
]

// "Read from the database"
function readDb(): InventoryItem[] {
  if (typeof window === 'undefined') return [] // guard for server-side rendering
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA))
    return SEED_DATA
  }
  return JSON.parse(raw)
}

// "Write to the database"
function writeDb(items: InventoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// ── Public "API" — same names/shapes you'd use with a real REST API ──

export async function fetchItems(): Promise<InventoryItem[]> {
  await delay(400)              // GET /items
  return readDb()
}

export async function fetchItemById(id: string): Promise<InventoryItem | undefined> {
  await delay(300)              // GET /items/:id
  return readDb().find((item) => item.id === id)
}


export async function createItem(payload: InventoryFormValues): Promise<InventoryItem> {
  await delay(400)              // POST /items
  const items = readDb()
  const newItem: InventoryItem = {
    ...payload,
    id: crypto.randomUUID(),
    status: 'active',
    updatedAt: new Date().toISOString(),
  }
  writeDb([...items, newItem])
  return newItem
}

export async function updateItem(id: string, payload: Partial<InventoryFormValues>): Promise<InventoryItem> {
  await delay(400)              // PATCH /items/:id
  const items = readDb()
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) throw new Error('Item not found')
  const updated = { ...items[index], ...payload, updatedAt: new Date().toISOString() }
  items[index] = updated
  writeDb(items)
  return updated
}

export async function deleteItem(id: string): Promise<void> {
  await delay(300)              // DELETE /items/:id
  writeDb(readDb().filter((item) => item.id !== id))
}