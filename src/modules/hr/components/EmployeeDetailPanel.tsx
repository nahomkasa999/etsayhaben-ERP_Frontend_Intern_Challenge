import type { Employee } from "../types"

interface EmployeeDetailPanelProps {
  employee: Employee
}

export function EmployeeDetailPanel({
  employee,
}: EmployeeDetailPanelProps) {
  const details = [
    { label: "Email", value: employee.email },
    { label: "Department", value: employee.department },
    { label: "Status", value: employee.status },
    {
      label: "Last Updated",
      value: new Date(employee.updatedAt).toLocaleString(),
    },
  ]

  return (
    <dl className="grid gap-1 text-sm text-foreground">
      {details.map(({ label, value }) => (
        <div key={label} className="flex min-w-0 gap-1.5">
          <dt className="shrink-0 font-medium">{label}:</dt>
          <dd className="min-w-0 break-words text-muted-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  )
}