'use client'

import { FormEvent, useState } from 'react';
import { useRouter } from "next/navigation"
import { useQueryClient } from '@tanstack/react-query';
import { Employee, EmployeeFormValues } from '../types';
import { createEmployee, updateEmployee } from '../api/hrApi';
import { FormValidator } from '../services/hrService';

interface EmployeeFormProps {
    mode: 'create' | 'edit'
    initialData?: Employee
}

const EMPTY_VALUES: EmployeeFormValues = {
    name: '',
    department: 'Sales',
    email: '',
    phone: '',
    onLeave: false,
}

export function EmployeeForm({ mode, initialData }: EmployeeFormProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    
    const [values, setValues] = useState<EmployeeFormValues>(initialData ?? EMPTY_VALUES);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState('');


    function handleChange(field: keyof EmployeeFormValues, value: string | number | boolean) {
        setValues((prev) => ({ ...prev, [field]: value }));
    }


    const handleSubmit = async (e: FormEvent) => { 
        e.preventDefault()
       
        const validationErrors = FormValidator(values);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        setServerError('');

        try {
            if (mode === 'create') {
                await createEmployee(values);
            } else if (initialData) {
                await updateEmployee(initialData.id, values);
            }
            
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            router.push('/hr');
        }
        catch {
            setServerError('Failed to save employee. Please try again.');
        } finally {
            setSubmitting(false);
        }

    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                    type="text"
                    placeholder="Nahom"
                    className="border  rounded py-2 px-3 w-full"
                    value={values.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
                {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium">Department</label>
                <select className="border rounded px-3 py-2 w-full" value={values.department} onChange={(e) => handleChange('department', e.target.value)}>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>Engineering</option>
                    <option>HR</option>
                    <option>Finance</option>
                </select>
                {errors.department && <p className="text-red-600 text-sm">{errors.department}</p>}
            </div>
            <div>
                <label className='block text-sm font-medium'>Email</label>
                <input
                    type="text"
                    placeholder="nahom@example.com"
                    className="border rounded px-3 py-2 w-full"
                    value={values.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>
            <div>
                <label className='block text-sm font-medium'>Phone</label>
                <input
                    type="text"
                    placeholder="0929333563 or +251929333563"
                    className="border rounded px-3 py-2 w-full"
                    value={values.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                />
                {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
            </div>
            <div className='flex items-center gap-2'>
                <label className='block text-sm font-medium'>On Leave</label>
                <input
                    type="checkbox"
                    className="align-start border rounded px-3 py-2"
                    checked={values.onLeave}
                    onChange={(e) => handleChange('onLeave', e.target.checked)}
                />
                {errors.onLeave && <p className="text-red-600 text-sm">{errors.onLeave}</p>}
            </div>
            {serverError && <p className="text-red-600">{serverError}</p>}
            <button type="submit" disabled={submitting} className="bg-blue-600 text-white rounded px-4 py-2">
                {submitting ? 'Saving...' : mode === 'create' ? 'Add Employee' : 'Save Changes'}
            </button>
        </form>

    )
}