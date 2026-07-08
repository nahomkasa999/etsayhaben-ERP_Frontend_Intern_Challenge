'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Employee } from '../type'
import { createEmployee, updateEmployee } from '../api/employeeApi'
import { validateEmployee } from '../services/employeeService'

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  initialData?: Employee
}

const EMPTY_VALUES: Employee = {
  id: '',
  name: '',
  email: '',
  department: '',
  position: '',
  salary: 0,
  status: 'active',
  updatedAt: new Date().toISOString(),
}

export function EmployeeForm({
  mode,
  initialData,
}: EmployeeFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [values, setValues] = useState<Employee>(
    initialData ?? EMPTY_VALUES
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  function handleChange(
    field: keyof Employee,
    value: string | number
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validationErrors = validateEmployee(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      if (mode === 'create') {
        await createEmployee(values)
      } else if (initialData) {
        await updateEmployee(initialData.id, values)
      }

      queryClient.invalidateQueries({
        queryKey: ['employees'],
      })

      router.push('/hr')
    } catch {
      setServerError(
        'Failed to save employee. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 max-w-md"
    >
      <div>
        <label className="block text-sm font-medium">
          Name
        </label>
        <input
          value={values.name}
          onChange={(e) =>
            handleChange('name', e.target.value)
          }
          className="border rounded px-3 py-2 w-full"
        />
        {errors.name && (
          <p className="text-red-600 text-sm">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Email
        </label>
        <input
          value={values.email}
          onChange={(e) =>
            handleChange('email', e.target.value)
          }
          className="border rounded px-3 py-2 w-full"
        />
        {errors.email && (
          <p className="text-red-600 text-sm">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Department
        </label>
        <input
          value={values.department}
          onChange={(e) =>
            handleChange('department', e.target.value)
          }
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Position
        </label>
        <input
          value={values.position}
          onChange={(e) =>
            handleChange('position', e.target.value)
          }
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Salary
        </label>
        <input
          type="number"
          value={values.salary}
          onChange={(e) =>
            handleChange(
              'salary',
              Number(e.target.value)
            )
          }
          className="border rounded px-3 py-2 w-full"
        />
        {errors.salary && (
          <p className="text-red-600 text-sm">
            {errors.salary}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Status
        </label>
        <select
          value={values.status}
          onChange={(e) =>
            handleChange('status', e.target.value)
          }
          className="border rounded px-3 py-2 w-full"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {serverError && (
        <p className="text-red-600">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        {submitting
          ? 'Saving...'
          : mode === 'create'
          ? 'Add Employee'
          : 'Save Changes'}
      </button>
    </form>
  )
}
