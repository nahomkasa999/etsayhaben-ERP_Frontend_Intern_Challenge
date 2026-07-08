interface Employee {
  id: string
  name: string
  email: string
  position: string
  department: string
}

interface HRStoreState {
  employees: Employee[]
  selectedEmployee: Employee | null
  loading: boolean
  error: string | null
}