import { Employee, EmployeeFormValues } from '../types'

export function FormValidator(values: EmployeeFormValues): Record<string, string> {
    const errors: Record<string, string> = {}
    
    if (!values.name.trim()) {
        errors.name = 'Name is required'
    } else if (values.name.trim().length <= 3) {
        errors.name = 'Name must be greater than 3 characters'
    }
    
    if (!values.department.trim()) {
        errors.department = 'Department is required'
    }
    
    if (!values.email.trim()) {
        errors.email = 'Email is required'
    } else if (!isValidEmail(values.email.trim())) {
        errors.email = 'Please enter a valid email address (e.g., user@example.com)'
    }
    
    if (!values.phone.trim()) {
        errors.phone = 'Phone is required'
    } else if (!isValidPhone(values.phone.trim())) {
        errors.phone = 'Please enter a valid phone number (e.g., 0929333563 or +251929333563)'
    }
    return errors
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
    const phoneRegex = /^(0\d{9}|\+251\d{9})$/
    return phoneRegex.test(phone)
}
