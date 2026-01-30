"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { parseCSV, type CSVData } from './utils/csv-parser'
import { autoMapColumns } from './utils/field-matcher'
import { UploadStep } from './components/upload-step'
import { MappingStep } from './components/mapping-step'
import { ReviewStep } from './components/review-step'
import type { Employee } from '@/lib/mock-data'

type WizardStep = 'upload' | 'mapping' | 'review'

export default function BulkUploadPage() {
    const router = useRouter()
    const { employees, positions, addEmployee } = useStore()

    const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
    const [csvData, setCSVData] = useState<CSVData | null>(null)
    const [mappings, setMappings] = useState<Map<string, string>>(new Map())
    const [error, setError] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileSelect = async (file: File) => {
        setError(null)
        setIsProcessing(true)

        try {
            const result = await parseCSV(file)

            if (!result.success) {
                setError(result.error || 'Failed to parse CSV file')
                return
            }

            if (result.data) {
                setCSVData(result.data)

                // Auto-detect column mappings
                const autoMappings = autoMapColumns(result.data.headers)
                setMappings(autoMappings)

                // Move to mapping step
                setCurrentStep('mapping')
            }
        } catch (err) {
            setError('An unexpected error occurred while processing the file')
            console.error(err)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleMappingsChange = (newMappings: Map<string, string>) => {
        setMappings(newMappings)
    }

    const handleContinueToReview = () => {
        setCurrentStep('review')
    }

    const handleBackToUpload = () => {
        setCurrentStep('upload')
        setCSVData(null)
        setMappings(new Map())
        setError(null)
    }

    const handleBackToMapping = () => {
        setCurrentStep('mapping')
    }

    const handleCreateEmployees = async (employeesToCreate: Partial<Employee>[]) => {
        try {
            // Generate employee codes
            const maxCode = employees.reduce((max, emp) => {
                const num = parseInt(emp.code.replace(/\D/g, ''), 10)
                return isNaN(num) ? max : Math.max(max, num)
            }, 0)

            // Create employees with generated codes
            employeesToCreate.forEach((emp, index) => {
                const newCode = `EMP-${String(maxCode + index + 1).padStart(3, '0')}`

                const newEmployee: Employee = {
                    id: `emp-${Date.now()}-${index}`,
                    code: newCode,
                    fullName: emp.fullName || '',
                    firstName: emp.firstName || '',
                    lastName: emp.lastName || '',
                    companyEmail: emp.companyEmail || '',
                    personalEmail: emp.personalEmail || '',
                    employeeId: emp.employeeId,
                    positionId: emp.positionId || '',
                    positionCode: emp.positionCode || '',
                    positionTitle: emp.positionTitle || '',
                    jobClassificationId: emp.jobClassificationId || '',
                    jobClassificationTitle: emp.jobClassificationTitle || '',
                    organizationalUnitId: emp.organizationalUnitId || '',
                    organizationalUnitName: emp.organizationalUnitName || '',
                    companyJoinDate: emp.companyJoinDate,
                    officialStartDate: emp.officialStartDate,
                    client: emp.client,
                    cellphone: emp.cellphone,
                    dateOfBirth: emp.dateOfBirth,
                    gender: emp.gender,
                    nationality: emp.nationality,
                    maritalStatus: emp.maritalStatus,
                    nationalIdNumber: emp.nationalIdNumber,
                    nationalIdIssueDate: emp.nationalIdIssueDate,
                    nationalIdIssuePlace: emp.nationalIdIssuePlace,
                    status: 'pending',
                    fte: 1,
                    onboardingStatus: {
                        emailSent: true,
                        accountActivated: false,
                        profileCompleted: false,
                    },
                }

                addEmployee(newEmployee)

                // Mock: Log credential email
                console.log(`[MOCK EMAIL] Sending credentials to ${newEmployee.companyEmail}`)
                console.log(`  - Employee: ${newEmployee.fullName}`)
                console.log(`  - Temporary Password: ${generateTempPassword()}`)
            })

            // Redirect to employees page with success message
            router.push('/employees?bulk_upload=success')
        } catch (err) {
            setError('Failed to create employees. Please try again.')
            console.error(err)
        }
    }

    const generateTempPassword = (): string => {
        return Math.random().toString(36).slice(-8).toUpperCase()
    }

    const stepNumber = currentStep === 'upload' ? 1 : currentStep === 'mapping' ? 2 : 3

    return (
        <AdminLayout
            title="Bulk Employee Upload"
            subtitle="Import multiple employees from CSV or Excel files"
        >
            <div className="container max-w-6xl mx-auto py-8 space-y-6">
                {/* Back Button */}
                <div className="flex items-center -mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/employees')}
                        className="gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m12 19-7-7 7-7" />
                            <path d="M19 12H5" />
                        </svg>
                        Back to Employees
                    </Button>
                </div>

                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Bulk Employee Upload</h1>
                    <p className="text-muted-foreground">
                        Import multiple employees at once using a CSV or Excel file
                    </p>
                </div>

                {/* Progress Indicator */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${stepNumber >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        1
                                    </div>
                                    <span className={stepNumber >= 1 ? 'font-medium' : 'text-muted-foreground'}>Upload</span>
                                </div>
                                <div className="h-px w-16 bg-border" />
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${stepNumber >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        2
                                    </div>
                                    <span className={stepNumber >= 2 ? 'font-medium' : 'text-muted-foreground'}>Map Columns</span>
                                </div>
                                <div className="h-px w-16 bg-border" />
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex items-center justify-center w-8 h-8 rounded-full ${stepNumber >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        3
                                    </div>
                                    <span className={stepNumber >= 3 ? 'font-medium' : 'text-muted-foreground'}>Review & Create</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Step Content */}
                {currentStep === 'upload' && (
                    <UploadStep onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                )}

                {currentStep === 'mapping' && csvData && (
                    <MappingStep
                        csvData={csvData}
                        initialMappings={mappings}
                        onMappingsChange={handleMappingsChange}
                        onContinue={handleContinueToReview}
                        onBack={handleBackToUpload}
                    />
                )}

                {currentStep === 'review' && csvData && (
                    <ReviewStep
                        csvData={csvData}
                        mappings={mappings}
                        positions={positions}
                        existingEmployees={employees}
                        onBack={handleBackToMapping}
                        onCreate={handleCreateEmployees}
                    />
                )}
            </div>
        </AdminLayout>
    )
}
