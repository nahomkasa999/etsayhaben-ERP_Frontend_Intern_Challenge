import { EmployeeForm } from '@/modules/hr/components/EmployeeForm'

export default function AddEmployeePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Add Employee
      </h1>

      <EmployeeForm mode="create" />
    </div>
  )
}