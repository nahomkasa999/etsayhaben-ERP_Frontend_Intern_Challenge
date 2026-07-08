// ── API INTEGRATION ──────────────────────────────────────────────
// Pretends to be a backend using localStorage.

import { Employee, EmployeeFormValues } from '../types'

const STORAGE_KEY = 'employees'

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

const SEED_DATA: Employee[] = [
  {
    id: '1',
    name: 'Adem Omer',
    email: 'adem@company.com',
    department: 'Engineering',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Henok Mekonene',
    email: 'henok@company.com',
    department: 'Store',
    status: 'on_leave',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Rahel Abate',
    email: 'rahel@company.com',
    department: 'Finance',
    status: 'active',
    updatedAt: new Date().toISOString(),
  },
]

function readDb(): Employee[] {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(SEED_DATA)
    )
    return SEED_DATA
  }

  return JSON.parse(raw)
}

function writeDb(employees: Employee[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(employees)
  )
}

export async function fetchEmployees(): Promise<Employee[]> {
  await delay(400)
  return readDb()
}

export async function fetchEmployeeById(
  id: string
): Promise<Employee | undefined> {
  await delay(300)

  return readDb().find(
    (employee) => employee.id === id
  )
}

export async function createEmployee(
  payload: EmployeeFormValues
): Promise<Employee> {
  await delay(400)

  const employees = readDb()

  const newEmployee: Employee = {
    ...payload,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  }

  writeDb([...employees, newEmployee])

  return newEmployee
}

export async function updateEmployee(
  id: string,
  payload: Partial<EmployeeFormValues>
): Promise<Employee> {
  await delay(400)

  const employees = readDb()

  const index = employees.findIndex(
    (employee) => employee.id === id
  )

  if (index === -1)
    throw new Error('Employee not found')

  const updated = {
    ...employees[index],
    ...payload,
    updatedAt: new Date().toISOString(),
  }

  employees[index] = updated

  writeDb(employees)

  return updated
}

export async function deleteEmployee(
  id: string
): Promise<void> {
  await delay(300)

  writeDb(
    readDb().filter(
      (employee) => employee.id !== id
    )
  )
}