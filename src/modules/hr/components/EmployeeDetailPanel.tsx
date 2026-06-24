import { Employee } from '../types'

interface EmployeeDetailPanelProps {
    employee: Employee
}
export function EmployeeDetailPanel({ employee }: EmployeeDetailPanelProps) {
    return (
        <div className="p-4 text-sm ">
            <p><strong>Name:</strong> {employee.name}</p>
            <p><strong>Department:</strong> {employee.department}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Phone:</strong> {employee.phone}</p>
            <p><strong>On Leave:</strong> {employee.onLeave ? 'Yes' : 'No'}</p>
            <p><strong>Last updated:</strong> {new Date(employee.updatedAt).toLocaleString()}</p>
        </div>
    )
}