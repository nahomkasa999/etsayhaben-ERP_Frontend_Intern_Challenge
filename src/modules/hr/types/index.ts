// Shared shape used by every file in this module — the single source of truth.

export interface Employee {
  id: string
  name: string
  email: string
  department: 'Store' | 'Engineering' | 'Finance' | 'Marketing'
  status: 'active' | 'on_leave'
  updatedAt: string
}

// Used by the form — id and updatedAt are generated automatically.
export type EmployeeFormValues = Omit<
  Employee,
  'id' | 'updatedAt'
>
