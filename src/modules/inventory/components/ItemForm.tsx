'use client'

// ── PROPS DRIVE BEHAVIOR ─────────────────────────────────────────
// ONE component, used for both /inventory/add and /inventory/[id].
// `mode` and `initialData` (both props) decide what it does on submit.
// All form field values are LOCAL state — they belong only to this form.

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { InventoryFormValues, InventoryItem } from '../types'
import { createItem, updateItem } from '../hooks/useInventory'
import { validateItem } from '../services/inventoryService'

interface ItemFormProps {
  mode: 'create' | 'edit'
  initialData?: InventoryItem
}

const EMPTY_VALUES: InventoryFormValues = {
  name: '', sku: '', category: 'Other', quantity: 0, unit: 'pcs', price: 0, reorderLevel: 0,
}

export function ItemForm({ mode, initialData }: ItemFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  // LOCAL STATE — form fields belong only to this component
  const [values, setValues] = useState<InventoryFormValues>(initialData ?? EMPTY_VALUES)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  function handleChange(field: keyof InventoryFormValues, value: string | number) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validationErrors = validateItem(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      if (mode === 'create') {
        await createItem(values)
      } else if (initialData) {
        await updateItem(initialData.id, values)
      }
      // API INTEGRATION: tell React Query the list is stale so it refetches
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      router.push('/inventory')
    } catch {
      setServerError('Failed to save item. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          value={values.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">SKU</label>
        <input
          value={values.sku}
          onChange={(e) => handleChange('sku', e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
        {errors.sku && <p className="text-red-600 text-sm">{errors.sku}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Category</label>
        <select
          value={values.category}
          onChange={(e) => handleChange('category', e.target.value as InventoryFormValues['category'])}
          className="border rounded px-3 py-2 w-full"
        >
          <option>Stationery</option>
          <option>Electronics</option>
          <option>Furniture</option>
          <option>Other</option>
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            value={values.quantity}
            onChange={(e) => handleChange('quantity', Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
          {errors.quantity && <p className="text-red-600 text-sm">{errors.quantity}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Reorder level</label>
          <input
            type="number"
            value={values.reorderLevel}
            onChange={(e) => handleChange('reorderLevel', Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Price ($)</label>
        <input
          type="number"
          value={values.price}
          onChange={(e) => handleChange('price', Number(e.target.value))}
          className="border rounded px-3 py-2 w-full"
        />
        {errors.price && <p className="text-red-600 text-sm">{errors.price}</p>}
      </div>

      {serverError && <p className="text-red-600">{serverError}</p>}

      <button type="submit" disabled={submitting} className="bg-blue-600 text-white rounded px-4 py-2">
        {submitting ? 'Saving...' : mode === 'create' ? 'Add Item' : 'Save Changes'}
      </button>
    </form>
  )
}