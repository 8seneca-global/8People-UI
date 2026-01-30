"use client"

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import { validateEmployeeData, transformToEmployee } from '../utils/employee-validator'
import type { CSVData } from '../utils/csv-parser'
import type { Employee } from '@/lib/mock-data'

interface ReviewStepProps {
    csvData: CSVData
    mappings: Map<string, string>
    positions: any[]
    existingEmployees: Employee[]
    onBack: () => void
    onCreate: (employees: Partial<Employee>[]) => Promise<void>
}

export function ReviewStep({
    csvData,
    mappings,
    positions,
    existingEmployees,
    onBack,
    onCreate,
}: ReviewStepProps) {
    const [excludedRows, setExcludedRows] = useState<Set<number>>(new Set())
    const [isCreating, setIsCreating] = useState(false)

    // Validate and transform all rows
    const validatedRows = useMemo(() => {
        return csvData.rows.map((row, index) => {
            const validation = validateEmployeeData(row, mappings, existingEmployees, csvData.rows)
            const employee = validation.valid ? transformToEmployee(row, mappings, positions) : null

            return {
                index,
                row,
                validation,
                employee,
            }
        })
    }, [csvData.rows, mappings, existingEmployees, positions])

    // Initialize excludedRows with all invalid rows by default
    useEffect(() => {
        const invalidRowIndices = validatedRows
            .filter((r) => !r.validation.valid)
            .map((r) => r.index)
        setExcludedRows(new Set(invalidRowIndices))
    }, [validatedRows])

    const validCount = validatedRows.filter((r) => r.validation.valid && !excludedRows.has(r.index)).length
    const errorCount = validatedRows.filter((r) => !r.validation.valid).length

    // Check if any selected (non-excluded) rows have errors
    const selectedRowsWithErrors = validatedRows.filter(
        (r) => !r.validation.valid && !excludedRows.has(r.index)
    )
    const hasSelectedErrors = selectedRowsWithErrors.length > 0

    const handleToggleRow = (index: number) => {
        const newExcluded = new Set(excludedRows)
        if (newExcluded.has(index)) {
            newExcluded.delete(index)
        } else {
            newExcluded.add(index)
        }
        setExcludedRows(newExcluded)
    }

    const handleCreate = async () => {
        const employeesToCreate = validatedRows
            .filter((r) => r.validation.valid && !excludedRows.has(r.index))
            .map((r) => r.employee!)

        setIsCreating(true)
        try {
            await onCreate(employeesToCreate)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Review & Create</h2>
                <p className="text-muted-foreground">
                    Review the employees to be created. You can exclude rows with errors or invalid data.
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{validCount}</p>
                                <p className="text-sm text-muted-foreground">Valid employees</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-destructive/10 p-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{errorCount}</p>
                                <p className="text-sm text-muted-foreground">Errors</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{excludedRows.size}</p>
                                <p className="text-sm text-muted-foreground">Excluded</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Alert for Selected Invalid Rows */}
            {hasSelectedErrors && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        You have selected {selectedRowsWithErrors.length} row(s) with errors.
                        Please uncheck these rows or fix the errors in your CSV file and re-upload to continue.
                    </AlertDescription>
                </Alert>
            )}

            {/* Employee Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">Include</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Company Email</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Errors</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {validatedRows.map((item) => {
                                    const getValue = (fieldKey: string): string => {
                                        const csvColumn = mappings.get(fieldKey)
                                        return csvColumn ? (item.row[csvColumn] || '—').trim() : '—'
                                    }

                                    return (
                                        <TableRow key={item.index} className={excludedRows.has(item.index) ? 'opacity-50' : ''}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={!excludedRows.has(item.index)}
                                                    onCheckedChange={() => handleToggleRow(item.index)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{getValue('fullName')}</TableCell>
                                            <TableCell>{getValue('companyEmail')}</TableCell>
                                            <TableCell>{getValue('positionTitle')}</TableCell>
                                            <TableCell>
                                                {item.validation.valid ? (
                                                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                                        Valid
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                                                        Error
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {item.validation.errors.length > 0 && (
                                                    <div className="text-xs text-destructive space-y-1">
                                                        {item.validation.errors.map((err, idx) => (
                                                            <div key={idx}>{err.message}</div>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={onBack} disabled={isCreating} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to previous step
                </Button>
                <Button onClick={handleCreate} disabled={validCount === 0 || isCreating || hasSelectedErrors}>
                    {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating {validCount} employee(s)...
                        </>
                    ) : (
                        `Create ${validCount} Employee(s)`
                    )}
                </Button>
            </div>
        </div>
    )
}
