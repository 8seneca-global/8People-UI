"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle, Info, ArrowLeft } from 'lucide-react'
import { EMPLOYEE_FIELDS, validateMappings } from '../utils/field-matcher'
import type { CSVData } from '../utils/csv-parser'

interface MappingStepProps {
    csvData: CSVData
    initialMappings: Map<string, string>
    onMappingsChange: (mappings: Map<string, string>) => void
    onContinue: () => void
    onBack: () => void
}

export function MappingStep({
    csvData,
    initialMappings,
    onMappingsChange,
    onContinue,
    onBack,
}: MappingStepProps) {
    const router = useRouter()
    const [mappings, setMappings] = useState<Map<string, string>>(initialMappings)

    const handleMappingChange = (fieldKey: string, csvColumn: string) => {
        const newMappings = new Map(mappings)
        if (csvColumn === '__skip__') {
            newMappings.delete(fieldKey)
        } else {
            newMappings.set(fieldKey, csvColumn)
        }
        setMappings(newMappings)
        onMappingsChange(newMappings)
    }

    const validation = validateMappings(mappings)

    const getPreviewData = (csvColumn: string | undefined): string[] => {
        if (!csvColumn) return []
        return csvData.rows.slice(0, 3).map((row) => row[csvColumn] || '—')
    }

    // Get field-specific errors
    const getFieldError = (fieldKey: string): string | null => {
        const field = EMPLOYEE_FIELDS.find((f) => f.key === fieldKey)
        if (!field) return null

        // Check if required field is missing
        if (field.required && !mappings.has(fieldKey)) {
            return 'This field is required'
        }

        // Check if this field's column is duplicated with another required field
        if (field.required) {
            const selectedColumn = mappings.get(fieldKey)
            if (selectedColumn) {
                const duplicate = validation.duplicateColumns.find((dup) => dup.column === selectedColumn)
                if (duplicate) {
                    return `This column is also mapped to: ${duplicate.fields.filter((f) => f !== field.label).join(', ')}`
                }
            }
        }

        return null
    }

    // Group fields
    const workFields = EMPLOYEE_FIELDS.filter((f) => f.group === 'work')
    const personalFields = EMPLOYEE_FIELDS.filter((f) => f.group === 'personal')
    const contractFields = EMPLOYEE_FIELDS.filter((f) => f.group === 'contract')

    const renderFieldRow = (field: typeof EMPLOYEE_FIELDS[0]) => {
        const selectedColumn = mappings.get(field.key)
        const previewData = getPreviewData(selectedColumn)
        const fieldError = getFieldError(field.key)

        return (
            <div
                key={field.key}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
                {/* Employee Field */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-bold">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {field.tooltip && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs max-w-xs">{field.tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>

                {/* CSV Column Selector */}
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">CSV Column</Label>
                    <Select
                        value={selectedColumn || '__skip__'}
                        onValueChange={(value) => handleMappingChange(field.key, value)}
                    >
                        <SelectTrigger className={fieldError ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__skip__">
                                <span className="text-muted-foreground">Skip this field</span>
                            </SelectItem>
                            {csvData.headers.map((header, idx) => (
                                <SelectItem key={`${header}-${idx}`} value={header}>
                                    {header}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {fieldError && (
                        <p className="text-xs text-destructive flex items-start gap-1">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {fieldError}
                        </p>
                    )}
                </div>

                {/* Preview */}
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Preview (First 3 rows)</Label>
                    <div className="space-y-1">
                        {previewData.length > 0 ? (
                            previewData.map((value, idx) => (
                                <p key={idx} className="text-sm truncate" title={value}>
                                    {value}
                                </p>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">—</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Map CSV Columns</h2>
                <p className="text-muted-foreground">
                    Match your CSV columns to employee fields. Required fields are marked with *.
                </p>
            </div>

            {/* Field Mappings - Grouped */}
            <Card>
                <CardHeader>
                    <CardTitle>Field Mappings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Work Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">Work Information</h3>
                        <div className="space-y-3">{workFields.map(renderFieldRow)}</div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">Personal Information</h3>
                        <div className="space-y-3">{personalFields.map(renderFieldRow)}</div>
                    </div>

                    {/* Contract Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">Contract Information</h3>
                        <div className="space-y-3">{contractFields.map(renderFieldRow)}</div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to previous step
                </Button>
                <Button onClick={onContinue} disabled={!validation.valid}>
                    Continue to Review
                </Button>
            </div>
        </div>
    )
}
