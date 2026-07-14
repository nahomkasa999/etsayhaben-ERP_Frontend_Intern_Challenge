'use client'

// ── ROUTING + API INTEGRATION ────────────────────────────────────
// [id] in the folder name = dynamic route. Fetches one item by id,
// then passes it to ItemForm as initialData (props).

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { fetchItemById } from '@/modules/inventory/api/inventoryApi'
import { ItemForm } from '@/modules/inventory/components/ItemForm'

export default function EditInventoryPage() {
    const params = useParams<{ id: string }>()

    const { data: item, isLoading } = useQuery({
        queryKey: ['inventory', params.id],
        queryFn: () => fetchItemById(params.id),
    })

    if (isLoading) return <p>Loading...</p>
    if (!item) return <p>Item not found.</p>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit Inventory Item</h1>
            <ItemForm mode="edit" initialData={item} />
        </div>
    )
}