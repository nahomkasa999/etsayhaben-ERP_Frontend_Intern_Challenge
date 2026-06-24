'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { fetchEmployeeById } from '@/modules/hr/api/hrApi'
import { EmployeeForm } from '@/modules/hr/components/EmployeeForm'

export default function EditEmployeePage() {
    const params = useParams<{ id: string }>()

    const { data: employee, isLoading } = useQuery({
        queryKey: ['employee', params.id],
        queryFn: () => fetchEmployeeById(params.id),
    })

    if (isLoading) return <p>Loading...</p>
    if (!employee) return <p>Employee not found.</p>
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit Employee</h1>
            <EmployeeForm mode="edit" initialData={employee} />
        </div>
    )
}