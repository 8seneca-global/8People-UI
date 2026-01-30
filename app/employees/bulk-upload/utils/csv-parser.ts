import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface CSVData {
    headers: string[]
    rows: Record<string, string>[]
}

export interface ParseResult {
    success: boolean
    data?: CSVData
    error?: string
}

/**
 * Parse CSV or Excel file and extract headers and rows
 */
export async function parseCSV(file: File): Promise<ParseResult> {
    const fileName = file.name.toLowerCase()
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
    const isCSV = fileName.endsWith('.csv')

    // Validate file type
    if (!isCSV && !isExcel) {
        return {
            success: false,
            error: 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).',
        }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return {
            success: false,
            error: 'File too large. Maximum size is 5MB.',
        }
    }

    // Handle Excel files
    if (isExcel) {
        return parseExcelFile(file)
    }

    // Handle CSV files
    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    resolve({
                        success: false,
                        error: `CSV parsing error: ${results.errors[0].message}`,
                    })
                    return
                }

                const headers = results.meta.fields || []
                const rows = results.data as Record<string, string>[]

                // Validate row count (max 100 employees)
                if (rows.length > 100) {
                    resolve({
                        success: false,
                        error: 'Too many rows. Maximum 100 employees per upload.',
                    })
                    return
                }

                if (rows.length === 0) {
                    resolve({
                        success: false,
                        error: 'File is empty.',
                    })
                    return
                }

                resolve({
                    success: true,
                    data: {
                        headers,
                        rows,
                    },
                })
            },
            error: (error) => {
                resolve({
                    success: false,
                    error: `Failed to parse CSV: ${error.message}`,
                })
            },
        })
    })
}

/**
 * Parse Excel file (.xlsx, .xls)
 */
async function parseExcelFile(file: File): Promise<ParseResult> {
    return new Promise((resolve) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = e.target?.result
                if (!data) {
                    resolve({
                        success: false,
                        error: 'Failed to read Excel file.',
                    })
                    return
                }

                // Parse Excel file
                const workbook = XLSX.read(data, { type: 'binary' })

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0]
                if (!firstSheetName) {
                    resolve({
                        success: false,
                        error: 'Excel file has no sheets.',
                    })
                    return
                }

                const worksheet = workbook.Sheets[firstSheetName]

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

                if (jsonData.length === 0) {
                    resolve({
                        success: false,
                        error: 'Excel file is empty.',
                    })
                    return
                }

                // First row is headers
                const headers = jsonData[0].map(h => String(h || '').trim())

                // Remaining rows are data
                const dataRows = jsonData.slice(1)

                // Convert to record format
                const rows = dataRows.map(row => {
                    const record: Record<string, string> = {}
                    headers.forEach((header, index) => {
                        record[header] = String(row[index] || '').trim()
                    })
                    return record
                }).filter(row => {
                    // Filter out completely empty rows
                    return Object.values(row).some(val => val !== '')
                })

                // Validate row count
                if (rows.length > 100) {
                    resolve({
                        success: false,
                        error: 'Too many rows. Maximum 100 employees per upload.',
                    })
                    return
                }

                if (rows.length === 0) {
                    resolve({
                        success: false,
                        error: 'Excel file has no data rows.',
                    })
                    return
                }

                resolve({
                    success: true,
                    data: {
                        headers,
                        rows,
                    },
                })
            } catch (error) {
                resolve({
                    success: false,
                    error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                })
            }
        }

        reader.onerror = () => {
            resolve({
                success: false,
                error: 'Failed to read Excel file.',
            })
        }

        reader.readAsBinaryString(file)
    })
}

/**
 * Generate CSV template with all employee fields
 * Note: Dates should be in DD/MM/YYYY format
 */
export function generateCSVTemplate(): string {
    const headers = [
        // Required fields
        'Full Name',
        'Work Email',
        'Employee ID',
        'Position',
        'Start Date',
        'Employment Start Date',
        'Contract Number',
        'Contract Type',
        'Contract Start Date',
        'Contract End Date',
        // Optional - Personal
        'First Name',
        'Last Name',
        'Personal Email',
        'Cellphone',
        'Date of Birth',
        'Gender',
        'Nationality',
        'Marital Status',
        'Birth Register Address',
        'Permanent Address',
        'Current Address',
        // Optional - National ID
        'National ID Number',
        'National ID Issue Date',
        'National ID Issue Place',
        // Optional - Work
        'Client',
        // Optional - Tax
        'Personal Tax Code',
        'Tax Dependents',
        'Social Insurance Book Number',
        'Initial Registration Hospital Code',
        // Optional - Bank
        'Bank Name',
        'Bank Branch',
        'Bank Account Number',
        // Optional - Emergency Contact
        'Emergency Contact Name',
        'Emergency Contact Relationship',
        'Emergency Contact Phone',
        // Optional - Education
        'Education Degree',
        'Education Field of Study',
        'Education Institution',
    ]

    return headers.join(',') + '\n'
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate() {
    const csv = generateCSVTemplate()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'employee_import_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
