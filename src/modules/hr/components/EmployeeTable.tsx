'use client'

import { SearchBar } from './SearchBar'
import { DepartmentFilter } from './DepartmentFilter'
import {useEmployees} from '../hooks/useEmployees'
import { EmployeeRow } from './EmployeeRow'
import { BulkActionBar } from './BulkActionBar'

export function EmployeeTable() {
    const { employees, isLoading, isError, removeEmployee, search, setSearch, selectedDepartment } = useEmployees()
    if (isLoading) return <p>Loading employees...</p>
    if (isError) return <p>Something went wrong. <button onClick={() => location.reload()}>Retry</button></p>

    return (
        <div>
            <div className="flex gap-4 mb-4">
                {/* LOCAL STATE lives in the hook, passed down as props */}
                <SearchBar value={search} onChange={setSearch} />
                {/* GLOBAL STATE — no props needed */}
                <DepartmentFilter />
            </div>
            <table className="w-full text-left text-sm">
                <thead>
                <tr className="border-b font-semibold">
                    <th className="p-2">select</th>
                    <th className="p-2">name</th>
                    <th className="p-2 ">department</th>
                    <th className="p-2">email</th>
                    <th className="p-2">phone</th>
                    <th className="p-2">onLeave</th>
                    <th className="p-2">Actions</th>
                </tr>
                </thead>
                <tbody>
                     {employees.map((employee) => (
                        <EmployeeRow key={employee.id} employee={employee} onDelete={removeEmployee} />
                    ))}
                </tbody>
            </table>
              {employees.length === 0 && <p className="mt-4 text-gray-500">No employees found.</p>}
            <BulkActionBar />
        </div>
    )
}