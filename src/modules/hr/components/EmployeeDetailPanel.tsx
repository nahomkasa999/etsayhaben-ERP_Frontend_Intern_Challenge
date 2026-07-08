import { Employee } from '../types'

interface EmployeeDetailPanelProps {
  employee: Employee
}

export function EmployeeDetailPanel({
  employee,
}: EmployeeDetailPanelProps) {
  return (
    <div className="bg-gray-50 p-4 text-sm">
      <p>
        <strong>Email:</strong>{' '}
        {employee.email}
      </p>

      <p>
        <strong>Department:</strong>{' '}
        {employee.department}
      </p>

      <p>
        <strong>Status:</strong>{' '}
        {employee.status}
      </p>

      <p>
        <strong>Last Updated:</strong>{' '}
        {new Date(
          employee.updatedAt
        ).toLocaleString()}
      </p>
    </div>
  )
}