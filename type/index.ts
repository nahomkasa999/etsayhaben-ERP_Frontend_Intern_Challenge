export interface Employee {
  id: string
  name: string
  department: string
  position: string
  salary: number
  status: 'active' | 'leave'
  updatedAt: string
  email?: string
  role?: string
  joinedAt?: string
}