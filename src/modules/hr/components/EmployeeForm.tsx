'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import {
  Employee,
  EmployeeFormValues,
} from '../types'

import {
  createEmployee,
  updateEmployee,
} from '../api/employeeApi'

import {
  validateEmployee,
} from '../services/hrService'

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  initialData?: Employee
}

const EMPTY_VALUES: EmployeeFormValues = {
  name: '',
  email: '',
  department: 'Store',
  status: 'active',
}

export function EmployeeForm({
  mode,
  initialData,
}: EmployeeFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [values, setValues] =
    useState<EmployeeFormValues>(
      initialData ?? EMPTY_VALUES
    )

  const [errors, setErrors] =
    useState<Record<string, string>>({})

  const [submitting, setSubmitting] =
    useState(false)

  const [serverError, setServerError] =
    useState('')

  function handleChange(
    field: keyof EmployeeFormValues,
    value: string
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(
    e: FormEvent
  ) {
    e.preventDefault()

    const validationErrors =
      validateEmployee(values)

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    setServerError('')

    try {
      if (mode === 'create') {
        await createEmployee(values)
      } else if (initialData) {
        await updateEmployee(
          initialData.id,
          values
        )
      }

      queryClient.invalidateQueries({
        queryKey: ['employees'],
      })

      router.push('/hr')
    } catch {
      setServerError(
        'Failed to save employee.'
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
            handleChange(
              'name',
              e.target.value
            )
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
            handleChange(
              'email',
              e.target.value
            )
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

        <select
          value={values.department}
          onChange={(e) =>
            handleChange(
              'department',
              e.target.value
            )
          }
          className="border rounded px-3 py-2 w-full"
        >
          <option>Store</option>
          <option>Engineering</option>
          <option>Finance</option>
          <option>Marketing</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Status
        </label>

        <select
          value={values.status}
          onChange={(e) =>
            handleChange(
              'status',
              e.target.value
            )
          }
          className="border rounded px-3 py-2 w-full"
        >
          <option value="active">
            Active
          </option>

          <option value="on_leave">
            On Leave
          </option>
        </select>
      </div>

      {serverError && (
        <p className="text-red-600">
          {serverError}
        </p>
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