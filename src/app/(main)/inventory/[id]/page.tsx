'use client'

import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useInventoryItemById } from '@/modules/inventory/hooks/useInventory'
import { ItemForm } from '@/modules/inventory/components/ItemForm'

export default function EditInventoryPage() {
    const params = useParams<{ id: string }>()

    const { data: item, isLoading } = useInventoryItemById(params.id)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!item) return <p>Item not found.</p>

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit Inventory Item</h1>
            <ItemForm mode="edit" initialData={item} />
        </div>
    )
}
