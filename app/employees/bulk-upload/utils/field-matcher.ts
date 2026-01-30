/**
 * Employee field definitions for mapping
 */
export interface EmployeeField {
    key: string
    label: string
    required: boolean
    type: 'text' | 'email' | 'date' | 'select' | 'number'
    aliases: string[] // Common variations for auto-detection
    group: 'work' | 'personal' | 'contract'
    unique?: boolean // For Employee ID, Work Email, Contract Number
    tooltip?: string
}

export const EMPLOYEE_FIELDS: EmployeeField[] = [
    // ===== WORK INFORMATION =====
    {
        key: 'employeeId',
        label: 'Employee ID',
        required: true,
        unique: true,
        type: 'text',
        group: 'work',
        aliases: ['employee id', 'employee_id', 'emp id', 'emp_id', 'staff id', 'id', 'employee code'],
    },
    {
        key: 'companyEmail',
        label: 'Work Email',
        required: true,
        unique: true,
        type: 'email',
        group: 'work',
        aliases: ['email', 'work email', 'company email', 'work_email', 'company_email', 'corporate email'],
    },
    {
        key: 'positionTitle',
        label: 'Position',
        required: true,
        type: 'text',
        group: 'work',
        aliases: ['position', 'position title', 'job title', 'title', 'role', 'position_title', 'job_title'],
    },
    {
        key: 'companyJoinDate',
        label: 'Start Date',
        required: true,
        type: 'date',
        group: 'work',
        tooltip: 'The day employee joins the company',
        aliases: ['start date', 'join date', 'hire date', 'start_date', 'join_date', 'hire_date', 'company join date'],
    },
    {
        key: 'officialStartDate',
        label: 'Employment Start Date',
        required: true,
        type: 'date',
        group: 'work',
        tooltip: 'The day employee starts as full-time position',
        aliases: ['employment start date', 'official start date', 'employment_start_date', 'official_start_date', 'fulltime start'],
    },
    {
        key: 'client',
        label: 'Client',
        required: false,
        type: 'text',
        group: 'work',
        aliases: ['client', 'client name', 'customer'],
    },

    // ===== PERSONAL INFORMATION =====
    {
        key: 'fullName',
        label: 'Full Name',
        required: true,
        type: 'text',
        group: 'personal',
        aliases: ['full name', 'name', 'employee name', 'full_name', 'fullname'],
    },

    {
        key: 'personalEmail',
        label: 'Personal Email',
        required: false,
        type: 'email',
        group: 'personal',
        aliases: ['personal email', 'personal_email', 'private email'],
    },
    {
        key: 'cellphone',
        label: 'Cellphone',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['phone', 'cellphone', 'mobile', 'phone number', 'mobile number', 'cell', 'contact'],
    },
    {
        key: 'dateOfBirth',
        label: 'Date of Birth',
        required: false,
        type: 'date',
        group: 'personal',
        aliases: ['dob', 'birth date', 'date of birth', 'birthday', 'date_of_birth', 'birthdate'],
    },
    {
        key: 'gender',
        label: 'Gender',
        required: false,
        type: 'select',
        group: 'personal',
        aliases: ['gender', 'sex'],
    },
    {
        key: 'nationality',
        label: 'Nationality',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['nationality', 'country', 'citizenship'],
    },
    {
        key: 'maritalStatus',
        label: 'Marital Status',
        required: false,
        type: 'select',
        group: 'personal',
        aliases: ['marital status', 'marital_status', 'marriage status'],
    },
    {
        key: 'birthRegisterAddress',
        label: 'Birth Register Address',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['birth register address', 'birth address', 'birthplace address', 'birth_register_address', 'registered address'],
    },
    {
        key: 'permanentAddress',
        label: 'Permanent Address',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['permanent address', 'permanent_address', 'home address', 'residential address'],
    },
    {
        key: 'currentAddress',
        label: 'Current Address',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['current address', 'current_address', 'address', 'living address', 'contact address'],
    },

    // National ID
    {
        key: 'nationalIdNumber',
        label: 'National ID Number',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['national id', 'id number', 'national_id', 'id_number', 'citizen id', 'identity number'],
    },
    {
        key: 'nationalIdIssueDate',
        label: 'National ID Issue Date',
        required: false,
        type: 'date',
        group: 'personal',
        aliases: ['id issue date', 'national_id_issue_date', 'issue date', 'id issued date'],
    },
    {
        key: 'nationalIdIssuePlace',
        label: 'National ID Issue Place',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['id issue place', 'national_id_issue_place', 'issue place', 'issued by'],
    },

    // Tax Information
    {
        key: 'taxInfo.personalTaxCode',
        label: 'Personal Tax Code',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['tax code', 'personal tax code', 'tax_code', 'tax id', 'tax number'],
    },
    {
        key: 'taxInfo.taxDependents',
        label: 'Tax Dependents',
        required: false,
        type: 'number',
        group: 'personal',
        aliases: ['tax dependents', 'dependents', 'number of dependents', 'tax_dependents'],
    },
    {
        key: 'taxInfo.socialInsuranceBookNumber',
        label: 'Social Insurance Book Number',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['social insurance', 'insurance number', 'social_insurance', 'si number', 'social insurance book'],
    },
    {
        key: 'taxInfo.initialRegistrationHospitalCode',
        label: 'Initial Registration Hospital Code',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['hospital code', 'registration hospital', 'hospital', 'medical registration'],
    },

    // Bank Information
    {
        key: 'bankInfo.bankName',
        label: 'Bank Name',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['bank', 'bank name', 'bank_name'],
    },
    {
        key: 'bankInfo.branch',
        label: 'Bank Branch',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['branch', 'bank branch', 'bank_branch'],
    },
    {
        key: 'bankInfo.accountNumber',
        label: 'Bank Account Number',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['account number', 'bank account', 'account_number', 'bank_account'],
    },

    // Emergency Contact
    {
        key: 'emergencyContact.contactPersonName',
        label: 'Emergency Contact Name',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['emergency contact', 'emergency name', 'contact person', 'emergency_contact'],
    },
    {
        key: 'emergencyContact.relationship',
        label: 'Emergency Contact Relationship',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['relationship', 'emergency relationship', 'contact relationship'],
    },
    {
        key: 'emergencyContact.phone',
        label: 'Emergency Contact Phone',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['emergency phone', 'contact phone', 'emergency number'],
    },

    // Education
    {
        key: 'education.degree',
        label: 'Education Degree',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['degree', 'education degree', 'qualification', 'education level'],
    },
    {
        key: 'education.fieldOfStudy',
        label: 'Education Field of Study',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['field of study', 'major', 'study field', 'field_of_study', 'specialization'],
    },
    {
        key: 'education.institution',
        label: 'Education Institution',
        required: false,
        type: 'text',
        group: 'personal',
        aliases: ['institution', 'university', 'school', 'college', 'education institution'],
    },

    // ===== CONTRACT INFORMATION =====
    {
        key: 'contractNumber',
        label: 'Contract Number',
        required: true,
        unique: true,
        type: 'text',
        group: 'contract',
        aliases: ['contract number', 'contract_number', 'contract no', 'contract id', 'contract code'],
    },
    {
        key: 'contractType',
        label: 'Contract Type',
        required: true,
        type: 'select',
        group: 'contract',
        aliases: ['contract type', 'contract_type', 'employment type', 'type'],
    },
    {
        key: 'contractStartDate',
        label: 'Contract Start Date',
        required: true,
        type: 'date',
        group: 'contract',
        aliases: ['contract start', 'contract start date', 'contract_start_date', 'contract begin'],
    },
    {
        key: 'contractEndDate',
        label: 'Contract End Date',
        required: true,
        type: 'date',
        group: 'contract',
        aliases: ['contract end', 'contract end date', 'contract_end_date', 'contract expiry'],
    },
]

/**
 * Auto-detect column mappings using fuzzy matching
 */
export function autoMapColumns(csvHeaders: string[]): Map<string, string> {
    const mappings = new Map<string, string>()

    for (const field of EMPLOYEE_FIELDS) {
        const normalizedAliases = field.aliases.map((a) => a.toLowerCase().trim())

        for (const header of csvHeaders) {
            const normalizedHeader = header.toLowerCase().trim()

            // Exact match
            if (normalizedAliases.includes(normalizedHeader)) {
                mappings.set(field.key, header)
                break
            }

            // Partial match (header contains alias or vice versa)
            const partialMatch = normalizedAliases.some(
                (alias) => normalizedHeader.includes(alias) || alias.includes(normalizedHeader)
            )

            if (partialMatch) {
                mappings.set(field.key, header)
                break
            }
        }
    }

    return mappings
}

/**
 * Get unmapped CSV columns
 */
export function getUnmappedColumns(csvHeaders: string[], mappings: Map<string, string>): string[] {
    const mappedHeaders = new Set(Array.from(mappings.values()))
    return csvHeaders.filter((header) => !mappedHeaders.has(header))
}

/**
 * Check if all required fields are mapped and detect duplicate column mappings
 */
export function validateMappings(mappings: Map<string, string>): {
    valid: boolean
    missingFields: string[]
    duplicateColumns: Array<{ column: string; fields: string[] }>
} {
    const missingFields: string[] = []
    const duplicateColumns: Array<{ column: string; fields: string[] }> = []

    // Check for missing required fields
    for (const field of EMPLOYEE_FIELDS) {
        if (field.required && !mappings.has(field.key)) {
            missingFields.push(field.label)
        }
    }

    // Check for duplicate column mappings in required fields
    const requiredFields = EMPLOYEE_FIELDS.filter((f) => f.required)
    const columnToFields = new Map<string, string[]>()

    for (const field of requiredFields) {
        const column = mappings.get(field.key)
        if (column) {
            if (!columnToFields.has(column)) {
                columnToFields.set(column, [])
            }
            columnToFields.get(column)!.push(field.label)
        }
    }

    // Find columns mapped to multiple required fields
    for (const [column, fields] of columnToFields.entries()) {
        if (fields.length > 1) {
            duplicateColumns.push({ column, fields })
        }
    }

    return {
        valid: missingFields.length === 0 && duplicateColumns.length === 0,
        missingFields,
        duplicateColumns,
    }
}
