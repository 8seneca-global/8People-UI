"use client"

import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, Download } from 'lucide-react'
import { downloadCSVTemplate } from '../utils/csv-parser'

interface UploadStepProps {
    onFileSelect: (file: File) => void
    isProcessing: boolean
}

export function UploadStep({ onFileSelect, isProcessing }: UploadStepProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) {
                const fileName = file.name.toLowerCase()
                if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                    onFileSelect(file)
                }
            }
        },
        [onFileSelect]
    )

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) {
                onFileSelect(file)
            }
        },
        [onFileSelect]
    )

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Upload Employee Data</h2>
                <p className="text-muted-foreground">
                    Upload a CSV or Excel file containing employee information. Maximum 100 employees per upload.
                </p>
            </div>

            {/* Download Template */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-primary/10 p-3">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="font-semibold">Need a template?</h3>
                            <p className="text-sm text-muted-foreground">
                                Download our CSV template with all the required and optional fields pre-configured.
                            </p>
                            <Button variant="outline" size="sm" onClick={downloadCSVTemplate} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download Template
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* File Upload Dropzone */}
            <Card>
                <CardContent className="p-0">
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="relative border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    >
                        <input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileInput}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isProcessing}
                        />
                        <div className="flex flex-col items-center gap-4">
                            <div className="rounded-full bg-primary/10 p-4">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-medium">
                                    {isProcessing ? 'Processing file...' : 'Drop your CSV or Excel file here'}
                                </p>
                                <p className="text-sm text-muted-foreground">or click to browse</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Supported formats: CSV, Excel (.xlsx, .xls) • Maximum size: 5MB • Maximum rows: 100
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">File Requirements</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>First row must contain column headers</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Required fields: Employee ID, Full Name, Work Email, Position, Start Date, Employment Start Date, Contract Number, Contract Type, Contract Start & End Date</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Date format: Any common format (e.g., DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Email addresses must be unique</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div >
    )
}
