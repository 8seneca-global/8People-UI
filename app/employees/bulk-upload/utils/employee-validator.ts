import type { Employee } from '@/lib/mock-data'

export interface ValidationError {
    field: string
    message: string
}

export interface ValidationResult {
    valid: boolean
    errors: ValidationError[]
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate date format (accepts any common date format)
 */
function isValidDate(dateString: string): boolean {
    if (!dateString) return true // Optional field

    // Try to parse the date using JavaScript's Date constructor
    const date = new Date(dateString)

    // Check if the date is valid
    return !isNaN(date.getTime())
}

/**
 * Parse date from any format to ISO format (YYYY-MM-DD)
 */
export function parseDate(dateString: string): string | undefined {
    if (!dateString) return undefined

    // Try to parse with JavaScript Date constructor (handles many formats)
    const date = new Date(dateString)

    // Check if valid
    if (isNaN(date.getTime())) {
        // Try DD/MM/YYYY format specifically
        const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
        const match = dateString.match(ddmmyyyyRegex)

        if (match) {
            const day = parseInt(match[1], 10)
            const month = parseInt(match[2], 10)
            const year = parseInt(match[3], 10)

            const parsedDate = new Date(year, month - 1, day)
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toISOString().split('T')[0]
            }
        }

        return undefined
    }

    return date.toISOString().split('T')[0]
}

/**
 * Validate a single employee record
 */
export function validateEmployeeData(
    data: Record<string, string>,
    mapping: Map<string, string>,
    existingEmployees: Employee[],
    allRowsData: Record<string, string>[]
): ValidationResult {
    const errors: ValidationError[] = []

    // Get mapped value helper
    const getValue = (fieldKey: string): string => {
        const csvColumn = mapping.get(fieldKey)
        return csvColumn ? (data[csvColumn] || '').trim() : ''
    }

    // Check for duplicates within CSV
    const checkDuplicateInCSV = (fieldKey: string, value: string, fieldLabel: string) => {
        if (!value) return
        const csvColumn = mapping.get(fieldKey)
        if (!csvColumn) return

        const duplicates = allRowsData.filter((row) => {
            const rowValue = (row[csvColumn] || '').trim()
            return rowValue && rowValue.toLowerCase() === value.toLowerCase() && row !== data
        })

        if (duplicates.length > 0) {
            errors.push({ field: fieldKey, message: `${fieldLabel} is duplicated in CSV` })
        }
    }

    // Required: Employee ID (unique)
    const employeeId = getValue('employeeId')
    if (!employeeId) {
        errors.push({ field: 'employeeId', message: 'Employee ID is required' })
    } else {
        checkDuplicateInCSV('employeeId', employeeId, 'Employee ID')
        if (existingEmployees.some((e) => e.employeeId === employeeId)) {
            errors.push({ field: 'employeeId', message: 'Employee ID already exists' })
        }
    }

    // Required: Work Email (unique)
    const companyEmail = getValue('companyEmail')
    if (!companyEmail) {
        errors.push({ field: 'companyEmail', message: 'Work Email is required' })
    } else if (!isValidEmail(companyEmail)) {
        errors.push({ field: 'companyEmail', message: 'Invalid email format' })
    } else {
        checkDuplicateInCSV('companyEmail', companyEmail, 'Work Email')
        if (existingEmployees.some((e) => e.companyEmail.toLowerCase() === companyEmail.toLowerCase())) {
            errors.push({ field: 'companyEmail', message: 'Work Email already exists' })
        }
    }

    // Required: Position
    const positionTitle = getValue('positionTitle')
    if (!positionTitle) {
        errors.push({ field: 'positionTitle', message: 'Position is required' })
    }

    // Required: Start Date
    const companyJoinDate = getValue('companyJoinDate')
    if (!companyJoinDate) {
        errors.push({ field: 'companyJoinDate', message: 'Start Date is required' })
    } else if (!isValidDate(companyJoinDate)) {
        errors.push({ field: 'companyJoinDate', message: 'Invalid date format (use DD/MM/YYYY)' })
    }

    // Required: Employment Start Date
    const officialStartDate = getValue('officialStartDate')
    if (!officialStartDate) {
        errors.push({ field: 'officialStartDate', message: 'Employment Start Date is required' })
    } else if (!isValidDate(officialStartDate)) {
        errors.push({ field: 'officialStartDate', message: 'Invalid date format (use DD/MM/YYYY)' })
    }

    // Required: Full Name
    const fullName = getValue('fullName')
    if (!fullName) {
        errors.push({ field: 'fullName', message: 'Full Name is required' })
    }

    // Required: Contract Number (unique)
    const contractNumber = getValue('contractNumber')
    if (!contractNumber) {
        errors.push({ field: 'contractNumber', message: 'Contract Number is required' })
    } else {
        checkDuplicateInCSV('contractNumber', contractNumber, 'Contract Number')
        // Check against existing contracts
        const existingContract = existingEmployees.some((e) =>
            e.contracts?.some((c) => c.contractNumber === contractNumber)
        )
        if (existingContract) {
            errors.push({ field: 'contractNumber', message: 'Contract Number already exists' })
        }
    }

    // Required: Contract Type
    const contractType = getValue('contractType')
    if (!contractType) {
        errors.push({ field: 'contractType', message: 'Contract Type is required' })
    } else {
        const validTypes = ['full-time', 'part-time', 'contract', 'internship']
        if (!validTypes.includes(contractType.toLowerCase())) {
            errors.push({
                field: 'contractType',
                message: 'Contract Type must be: full-time, part-time, contract, or internship',
            })
        }
    }

    // Required: Contract Start Date
    const contractStartDate = getValue('contractStartDate')
    if (!contractStartDate) {
        errors.push({ field: 'contractStartDate', message: 'Contract Start Date is required' })
    } else if (!isValidDate(contractStartDate)) {
        errors.push({ field: 'contractStartDate', message: 'Invalid date format (use DD/MM/YYYY)' })
    }

    // Required: Contract End Date
    const contractEndDate = getValue('contractEndDate')
    if (!contractEndDate) {
        errors.push({ field: 'contractEndDate', message: 'Contract End Date is required' })
    } else if (!isValidDate(contractEndDate)) {
        errors.push({ field: 'contractEndDate', message: 'Invalid date format (use DD/MM/YYYY)' })
    }

    // Optional: Personal Email
    const personalEmail = getValue('personalEmail')
    if (personalEmail && !isValidEmail(personalEmail)) {
        errors.push({ field: 'personalEmail', message: 'Invalid email format' })
    }

    // Optional: Date fields
    const dateOfBirth = getValue('dateOfBirth')
    if (dateOfBirth && !isValidDate(dateOfBirth)) {
        errors.push({ field: 'dateOfBirth', message: 'Invalid date format (use DD/MM/YYYY)' })
    }

    const nationalIdIssueDate = getValue('nationalIdIssueDate')
    if (nationalIdIssueDate && !isValidDate(nationalIdIssueDate)) {
        errors.push({ field: 'nationalIdIssueDate', message: 'Invalid date format (use DD/MM/YYYY)' })
    }

    // Optional: Gender validation
    const gender = getValue('gender')
    if (gender) {
        const normalizedGender = gender.toLowerCase()
        if (!['male', 'female', 'other', 'm', 'f'].includes(normalizedGender)) {
            errors.push({ field: 'gender', message: 'Invalid gender value (use: male, female, or other)' })
        }
    }

    // Optional: Tax Dependents (number)
    const taxDependents = getValue('taxInfo.taxDependents')
    if (taxDependents && isNaN(parseInt(taxDependents, 10))) {
        errors.push({ field: 'taxInfo.taxDependents', message: 'Tax Dependents must be a number' })
    }

    return {
        valid: errors.length === 0,
        errors,
    }
}

/**
 * Transform CSV row to Employee object
 */
export function transformToEmployee(
    data: Record<string, string>,
    mapping: Map<string, string>,
    positions: any[]
): Partial<Employee> {
    const getValue = (fieldKey: string): string => {
        const csvColumn = mapping.get(fieldKey)
        return csvColumn ? (data[csvColumn] || '').trim() : ''
    }

    const fullName = getValue('fullName')
    const firstName = getValue('firstName') || fullName.split(' ')[0] || ''
    const lastName = getValue('lastName') || fullName.split(' ').slice(1).join(' ') || ''

    // Find position by title
    const positionTitle = getValue('positionTitle')
    const position = positions.find((p) => p.title.toLowerCase() === positionTitle.toLowerCase())

    // Normalize gender
    const genderValue = getValue('gender').toLowerCase()
    let gender: 'male' | 'female' | 'other' | undefined
    if (['male', 'm'].includes(genderValue)) gender = 'male'
    else if (['female', 'f'].includes(genderValue)) gender = 'female'
    else if (genderValue === 'other') gender = 'other'

    // Normalize contract type
    const contractTypeValue = getValue('contractType').toLowerCase()
    let contractType: 'full-time' | 'part-time' | 'contract' | 'internship' | undefined
    if (contractTypeValue === 'full-time') contractType = 'full-time'
    else if (contractTypeValue === 'part-time') contractType = 'part-time'
    else if (contractTypeValue === 'contract') contractType = 'contract'
    else if (contractTypeValue === 'internship') contractType = 'internship'

    return {
        fullName,
        firstName,
        lastName,
        companyEmail: getValue('companyEmail'),
        personalEmail: getValue('personalEmail') || '',
        employeeId: getValue('employeeId'),
        positionId: position?.id || '',
        positionCode: position?.code || '',
        positionTitle: positionTitle,
        jobClassificationId: position?.jobClassificationId || '',
        jobClassificationTitle: position?.jobClassificationTitle || '',
        organizationalUnitId: position?.organizationalUnitId || '',
        organizationalUnitName: position?.organizationalUnitName || '',
        companyJoinDate: parseDate(getValue('companyJoinDate')),
        officialStartDate: parseDate(getValue('officialStartDate')),
        client: getValue('client') || undefined,
        cellphone: getValue('cellphone') || undefined,
        dateOfBirth: parseDate(getValue('dateOfBirth')),
        gender,
        nationality: getValue('nationality') || undefined,
        maritalStatus: getValue('maritalStatus') || undefined,
        birthRegisterAddress: getValue('birthRegisterAddress') || undefined,
        permanentAddress: getValue('permanentAddress') || undefined,
        currentAddress: getValue('currentAddress') || undefined,
        nationalIdNumber: getValue('nationalIdNumber') || undefined,
        nationalIdIssueDate: parseDate(getValue('nationalIdIssueDate')),
        nationalIdIssuePlace: getValue('nationalIdIssuePlace') || undefined,
        status: 'pending',
        fte: 1,
        code: '', // Will be generated
        contracts: [
            {
                id: `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                contractNumber: getValue('contractNumber'),
                contractType,
                startDate: parseDate(getValue('contractStartDate')) || '',
                endDate: parseDate(getValue('contractEndDate')) || '',
            }
        ],
        onboardingStatus: {
            emailSent: false,
            accountActivated: false,
            profileCompleted: false,
        },
        taxInfo: {
            personalTaxCode: getValue('taxInfo.personalTaxCode') || '',
            taxDependents: parseInt(getValue('taxInfo.taxDependents'), 10) || 0,
            socialInsuranceBookNumber: getValue('taxInfo.socialInsuranceBookNumber') || '',
            initialRegistrationHospitalCode: getValue('taxInfo.initialRegistrationHospitalCode') || '',
        },
        bankInfo: {
            bankName: getValue('bankInfo.bankName') || '',
            branch: getValue('bankInfo.branch') || '',
            accountNumber: getValue('bankInfo.accountNumber') || '',
            accountHolderName: '', // Not in CSV
        },
        emergencyContact: {
            contactPersonName: getValue('emergencyContact.contactPersonName') || '',
            relationship: getValue('emergencyContact.relationship') || '',
            phone: getValue('emergencyContact.phone') || '',
            email: '', // Not in CSV
        },
        education: getValue('education.degree')
            ? [
                {
                    degree: getValue('education.degree'),
                    fieldOfStudy: getValue('education.fieldOfStudy'),
                    institution: getValue('education.institution'),
                    graduationYear: '', // Not in CSV
                },
            ]
            : undefined,
    }
}
