// ── API INTEGRATION ──────────────────────────────────────────────
// This file pretends to be a backend. Every function returns a Promise
// and has an artificial delay, so the rest of the app behaves EXACTLY
// like it would with a real server (loading states, async/await, etc).
// Swap localStorage for axios.get/post later and nothing else changes.

import { Employee } from '../type'

type EmployeeFormValues = Omit<Employee, 'id' | 'status' | 'updatedAt'>

const STORAGE_KEY = 'hr_employees'

// Fake network latency so loading spinners are actually visible
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Data used to "seed the database" the first time the app runs
const SEED_DATA: Employee[] = [
  {
    id: '1', name: 'Amara Okafor', email: 'amara.okafor@company.com', department: 'Engineering', role: 'Frontend Developer', status: 'active', joinedAt: '2022-03-14T00:00:00.000Z', updatedAt: new Date().toISOString(),
    position: '',
    salary: 0
  },
  {
    id: '2', name: 'Liam Chen', email: 'liam.chen@company.com', department: 'Sales', role: 'Account Executive', status: 'active', joinedAt: '2021-07-01T00:00:00.000Z', updatedAt: new Date().toISOString(),
    position: '',
    salary: 0
  },
  {
    id: '3', name: 'Sofia Martinez', email: 'sofia.martinez@company.com', department: 'HR', role: 'HR Generalist', status: 'active', joinedAt: '2023-01-09T00:00:00.000Z', updatedAt: new Date().toISOString(),
    position: '',
    salary: 0
  },
  {
    id: '4', name: 'Noah Williams', email: 'noah.williams@company.com', department: 'Finance', role: 'Financial Analyst', status: 'active', joinedAt: '2020-11-23T00:00:00.000Z', updatedAt: new Date().toISOString(),
    position: '',
    salary: 0
  },
  {
    id: '5', name: 'Priya Sharma', email: 'priya.sharma@company.com', department: 'Operations', role: 'Operations Manager', status: 'active', joinedAt: '2019-05-30T00:00:00.000Z', updatedAt: new Date().toISOString(),
    position: '',
    salary: 0
  },
]

// "Read from the database"
function readDb(): Employee[] {
  if (typeof window === 'undefined') return [] // guard for server-side rendering
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA))
    return SEED_DATA
  }
  return JSON.parse(raw)
}

// "Write to the database"
function writeDb(employees: Employee[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
}

// ── Public "API" — same names/shapes you'd use with a real REST API ──

export async function fetchEmployees(): Promise<Employee[]> {
  await delay(400)              // GET /employees
  return readDb()
}

export async function fetchEmployeeById(id: string): Promise<Employee | undefined> {
  await delay(300)              // GET /employees/:id
  return readDb().find((employee) => employee.id === id)
}

export async function createEmployee(payload: EmployeeFormValues): Promise<Employee> {
  await delay(400)              // POST /employees
  const employees = readDb()
  const newEmployee: Employee = {
    ...payload,
    id: crypto.randomUUID(),
    status: 'active',
    updatedAt: new Date().toISOString(),
  }
  writeDb([...employees, newEmployee])
  return newEmployee
}

export async function updateEmployee(id: string, payload: Partial<EmployeeFormValues>): Promise<Employee> {
  await delay(400)              // PATCH /employees/:id
  const employees = readDb()
  const index = employees.findIndex((employee) => employee.id === id)
  if (index === -1) throw new Error('Employee not found')
  const updated = { ...employees[index], ...payload, updatedAt: new Date().toISOString() }
  employees[index] = updated
  writeDb(employees)
  return updated
}

export async function deleteEmployee(id: string): Promise<void> {
  await delay(300)              // DELETE /employees/:id
  writeDb(readDb().filter((employee) => employee.id !== id))
}
