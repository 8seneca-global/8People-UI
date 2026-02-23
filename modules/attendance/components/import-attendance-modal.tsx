"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, AlertCircle, CheckCircle, XCircle, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, parse, isValid } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ImportAttendanceModalProps {
    isOpen: boolean
    onClose: () => void
}

interface ParsedRecord {
    row: number
    employeeId: string
    employeeName: string
    date: string
    clockIn: string
    clockOut: string
    status: "valid" | "error"
    errorMessages: string[]
}

type SystemField = "employeeId" | "date" | "clockIn" | "clockOut"

const REQUIRED_FIELDS: { id: SystemField; label: string; description: string }[] = [
    { id: "employeeId", label: "Employee ID", description: "Unique employee identifier (e.g., E-001)" },
    { id: "date", label: "Date", description: "Date of attendance (DD/MM/YYYY)" },
    { id: "clockIn", label: "Clock In", description: "Start time (HH:mm)" },
    { id: "clockOut", label: "Clock Out", description: "End time (HH:mm)" },
]

interface MappingState {
    employeeId: string
    date: string
    clockIn: string
    clockOut: string
}

export function ImportAttendanceModal({ isOpen, onClose }: ImportAttendanceModalProps) {
    const { employees, addAttendanceRecord, attendanceRecords, leaveRequests } = useStore()
    const [step, setStep] = useState<"upload" | "mapping" | "preview" | "importing" | "result">("upload")
    const [file, setFile] = useState<File | null>(null)
    const [fileHeaders, setFileHeaders] = useState<string[]>([])
    const [filePreview, setFilePreview] = useState<any[]>([])
    const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)

    const [mapping, setMapping] = useState<MappingState>({
        employeeId: "",
        date: "",
        clockIn: "",
        clockOut: "",
    })
    const [parsedData, setParsedData] = useState<ParsedRecord[]>([])
    const [progress, setProgress] = useState(0)
    const [importStats, setImportStats] = useState({ success: 0, failed: 0 })

    const resetModal = () => {
        setStep("upload")
        setFile(null)
        setParsedData([])
        setProgress(0)
        setImportStats({ success: 0, failed: 0 })
        setFileHeaders([])
        setFilePreview([])
        setWorkbook(null)
        setMapping({ employeeId: "", date: "", clockIn: "", clockOut: "" })
    }

    const handleClose = () => {
        onClose()
        setTimeout(resetModal, 300)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const downloadTemplate = () => {
        const headers = ["Employee ID", "Date (DD/MM/YYYY)", "Clock In (HH:mm)", "Clock Out (HH:mm)"]
        const data = [
            ["E-001", "16/01/2026", "08:00", "17:00"],
            ["E-002", "16/01/2026", "08:30", "17:30"]
        ]

        const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Attendance Template")

        XLSX.writeFile(wb, "attendance_template.xlsx")
    }

    const autoMap = (headers: string[]) => {
        const newMapping: MappingState = {
            employeeId: "",
            date: "",
            clockIn: "",
            clockOut: ""
        }

        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "")

        headers.forEach(header => {
            const h = normalize(header)

            if (h.includes("id") || h.includes("employeeid") || h.includes("empid")) newMapping.employeeId = header
            if (h.includes("date") || h === "day") newMapping.date = header
            if (h.includes("in") || h.includes("start") || h.includes("entry")) newMapping.clockIn = header
            if (h.includes("out") || h.includes("end") || h.includes("exit")) newMapping.clockOut = header
        })

        setMapping(newMapping)
    }

    const parseFileHeaders = async () => {
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            setWorkbook(workbook)

            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]

            // Get headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            if (jsonData.length > 0) {
                const headers = jsonData[0] as string[]
                setFileHeaders(headers)

                // Preview data (next 5 rows)
                const preview = jsonData.slice(1, 6).map((row: any) => {
                    const obj: any = {}
                    headers.forEach((h, i) => {
                        obj[h] = row[i]
                    })
                    return obj
                })
                setFilePreview(preview)
                autoMap(headers)
                setStep("mapping")
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const proceedToValidation = () => {
        if (!workbook) return

        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        validateData(jsonData)
        setStep("preview")
    }

    const parseExcelDate = (val: any): string => {
        if (!val) return ""
        if (typeof val === 'number') {
            const dateObj = XLSX.SSF.parse_date_code(val)
            if (dateObj) {
                return `${String(dateObj.d).padStart(2, '0')}/${String(dateObj.m).padStart(2, '0')}/${dateObj.y}`
            }
        }
        return val.toString().trim()
    }

    const parseExcelTime = (val: any): string => {
        if (val === undefined || val === null || val === '') return ""

        let numVal = val
        if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') {
            numVal = Number(val)
        }

        if (typeof numVal === 'number') {
            const dateObj = XLSX.SSF.parse_date_code(numVal)
            if (dateObj) {
                return `${String(dateObj.H).padStart(2, '0')}:${String(dateObj.M).padStart(2, '0')}`
            }
        }

        const strVal = val.toString().trim()

        // Handle HH:mm:ss -> HH:mm
        if (/^\d{1,2}:\d{2}:\d{2}$/.test(strVal)) {
            return strVal.substring(0, 5)
        }

        // Handle H:mm -> HH:mm
        if (/^\d{1,2}:\d{2}$/.test(strVal)) {
            const [h, m] = strVal.split(':')
            return `${h.padStart(2, '0')}:${m}`
        }

        return strVal
    }

    const validateData = (data: any[]) => {
        const validated: ParsedRecord[] = []

        // Pass 1: Identify Duplicates within the file
        const keyCounts = new Map<string, number>()

        // Helper to generate unique key for finding duplicates in file
        const getRowKey = (empId: string, dateStr: string): string => {
            return `${empId}-${dateStr}`
        }

        data.forEach((row, index) => {
            const empId = row[mapping.employeeId]?.toString().trim()
            const dateStr = parseExcelDate(row[mapping.date])

            if (empId && dateStr) {
                const employee = employees.find(e => e.employeeId === empId)
                if (employee) {
                    // Parse date to check validity
                    const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date())
                    if (isValid(parsedDate)) {
                        const normalizedDate = format(parsedDate, "yyyy-MM-dd")
                        const key = getRowKey(employee.id, normalizedDate)
                        keyCounts.set(key, (keyCounts.get(key) || 0) + 1)
                    }
                }
            }
        })

        // Pass 2: Validation
        data.forEach((row, index) => {
            const rowNum = index + 2
            const errorMessages: string[] = []

            // 1. Retrieve & Normalize Values
            const empId = row[mapping.employeeId]?.toString().trim()
            const dateStr = parseExcelDate(row[mapping.date])
            const clockIn = parseExcelTime(row[mapping.clockIn])
            const clockOut = parseExcelTime(row[mapping.clockOut])

            // 2. Mandatory Fields Check
            if (!empId) errorMessages.push("Missing Employee ID value")
            if (!dateStr) errorMessages.push("Missing Date value")

            let employee = null
            let normalizedDate = ""

            // 3. Employee Existence (Lookup by ID)
            if (empId) {
                employee = employees.find(e => e.employeeId === empId)
                if (!employee) {
                    errorMessages.push(`Invalid Employee ID: "${empId}" not found in system`)
                }
            }

            // 4. Date Format & Validity
            if (dateStr) {
                const parsedDate = parse(dateStr, "dd/MM/yyyy", new Date())
                if (!isValid(parsedDate)) {
                    errorMessages.push(`Invalid Date format: "${dateStr}". Expected DD/MM/YYYY`)
                } else {
                    normalizedDate = format(parsedDate, "yyyy-MM-dd")
                }
            }

            // 5. Duplicates & Logic Checks (Only if we have valid Employee & Date)
            if (employee && normalizedDate) {
                const uniqueKey = getRowKey(employee.id, normalizedDate)

                // 5a. Duplicate in File
                if ((keyCounts.get(uniqueKey) || 0) > 1) {
                    errorMessages.push("Duplicate record for this employee and date in file")
                }

                // 5b. Duplicate in System
                const isExisting = attendanceRecords.some(r => r.employeeId === employee?.id && r.date === normalizedDate)
                if (isExisting) {
                    errorMessages.push("Attendance record already exists in system")
                }

                // 5c. Leave Conflict
                // Check if employee has an APPROVED leave request that covers this date
                const onLeave = leaveRequests.find(req =>
                    req.employeeId === employee?.id &&
                    req.status === 'approved' &&
                    normalizedDate >= req.startDate &&
                    normalizedDate <= req.endDate
                )

                if (onLeave) {
                    errorMessages.push(`Conflict: Employee is on Approved Leave (${onLeave.leaveTypeName})`)
                }
            }

            // 6. Time Format (HH:mm)
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            if (clockIn && clockIn !== "—" && !timeRegex.test(clockIn)) {
                errorMessages.push(`Invalid Clock In format: "${clockIn}". Expected HH:mm`)
            }
            if (clockOut && clockOut !== "—" && !timeRegex.test(clockOut)) {
                errorMessages.push(`Invalid Clock Out format: "${clockOut}". Expected HH:mm`)
            }

            // 7. Logic: Clock Out before Clock In?
            if (clockIn && clockOut && timeRegex.test(clockIn) && timeRegex.test(clockOut)) {
                const [h1, m1] = clockIn.split(':').map(Number)
                const [h2, m2] = clockOut.split(':').map(Number)
                if (h1 > h2 || (h1 === h2 && m1 >= m2)) {
                    errorMessages.push("Clock Out cannot be earlier than Clock In")
                }
            }

            validated.push({
                row: rowNum,
                employeeId: employee?.id || "—",
                employeeName: employee?.fullName || "—",
                date: normalizedDate || dateStr || "—",
                clockIn: clockIn || "—",
                clockOut: clockOut || "—",
                status: errorMessages.length === 0 ? "valid" : "error",
                errorMessages: errorMessages,
            })
        })

        setParsedData(validated)
    }

    const handleImport = async () => {
        setStep("importing")
        const validRecords = parsedData.filter(r => r.status === "valid")

        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
            setProgress(i)
            await new Promise(resolve => setTimeout(resolve, 50))
        }

        let successCount = 0

        validRecords.forEach(record => {
            // Determine status
            let status: "present" | "late" | "early_leave" | "missing" = "present"

            const parseTime = (timeStr: string) => {
                if (!timeStr || timeStr === "—") return { h: 0, m: 0 }
                const parts = timeStr.split(':')
                return { h: parseInt(parts[0]) || 0, m: parseInt(parts[1]) || 0 }
            }

            const inTimeStr = record.clockIn === "—" ? "" : record.clockIn
            const outTimeStr = record.clockOut === "—" ? "" : record.clockOut

            // Check missing
            if (!inTimeStr || !outTimeStr) {
                status = "missing"
            }

            const inTime = parseTime(record.clockIn)
            const outTime = parseTime(record.clockOut)
            const inHour = inTime.h
            const inMin = inTime.m

            // Calculate duration (Minutes)
            const startMins = inTime.h * 60 + inTime.m
            const endMins = outTime.h * 60 + outTime.m
            let durationMins = endMins - startMins
            if (durationMins < 0) durationMins = 0

            // Subtract Lunch (60 mins)
            durationMins = Math.max(0, durationMins - 60)
            const totalHours = Math.max(0, durationMins / 60)

            if (status !== "missing") {
                if (inHour > 9 || (inHour === 9 && inMin > 0)) {
                    status = "late"
                } else if (totalHours < 8 && totalHours > 0) {
                    status = "early_leave"
                }
            }

            const lateMinutes = (status === 'late' || (status === 'missing' && inHour > 9))
                ? Math.max(0, (inHour * 60 + inMin) - (9 * 60))
                : 0

            addAttendanceRecord({
                employeeId: record.employeeId,
                employeeName: record.employeeName,
                date: record.date,
                clockIn: inTimeStr,
                clockOut: outTimeStr,
                status: status,
                totalHours: Number(totalHours.toFixed(2)),
                source: "import",
                lateMinutes: lateMinutes,
                earlyMinutes: 0 // Simplified
            })
            successCount++
        })

        setImportStats({
            success: successCount,
            failed: parsedData.length - successCount
        })
        setStep("result")
    }

    const validCount = parsedData.filter(r => r.status === "valid").length
    const errorCount = parsedData.filter(r => r.status === "error").length

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import Attendance Records</DialogTitle>
                    <DialogDescription>
                        {step === "mapping"
                            ? "Map your column headers to the required system fields."
                            : step === "preview"
                                ? "Review the data validation results before importing."
                                : step === "result"
                                    ? "Import process completed."
                                    : "Upload an Excel (.xlsx) or CSV file to bulk import attendance records."
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === "upload" && (
                    <div className="flex flex-col items-center justify-center gap-6 py-8">
                        <div
                            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 w-full flex flex-col items-center justify-center hover:bg-muted/5 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                accept=".csv, .xlsx, .xls"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <p className="font-medium text-lg">
                                {file ? file.name : "Click to select file"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Supported formats: .XLSX, .CSV
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground flex items-center gap-2"
                            onClick={downloadTemplate}
                        >
                            <FileSpreadsheet className="h-4 w-4" />
                            Download Excel Template
                        </Button>
                    </div>
                )}

                {step === "mapping" && (
                    <div className="space-y-4">
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[30%]">System Field</TableHead>
                                        <TableHead className="w-[30%]">File Column</TableHead>
                                        <TableHead className="w-[40%]">Preview (Row 1)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {REQUIRED_FIELDS.map((field) => {
                                        const selectedHeader = mapping[field.id]
                                        return (
                                            <TableRow key={field.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium flex items-center gap-1">
                                                            {field.label}
                                                            <span className="text-red-500">*</span>
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{field.description}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={selectedHeader}
                                                        onValueChange={(val) => setMapping(prev => ({ ...prev, [field.id]: val }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select column..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fileHeaders.map(header => {
                                                                const isSelected = Object.entries(mapping).some(([key, val]) => key !== field.id && val === header)
                                                                return (
                                                                    <SelectItem key={header} value={header} disabled={isSelected}>
                                                                        {header}
                                                                    </SelectItem>
                                                                )
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    {selectedHeader ? (
                                                        <div className="text-sm text-muted-foreground">
                                                            {filePreview.length > 0 ? (
                                                                (() => {
                                                                    const val = filePreview[0][selectedHeader]
                                                                    if (field.id === 'date') return parseExcelDate(val)
                                                                    if (field.id === 'clockIn' || field.id === 'clockOut') return parseExcelTime(val)
                                                                    return val || <span className="italic opacity-50">Empty</span>
                                                                })()
                                                            ) : "No data"}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Select a column</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}

                {step === "preview" && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">{validCount} Valid</span>
                                </div>
                                {errorCount > 0 && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                        <XCircle className="h-4 w-4" />
                                        <span className="font-medium">{errorCount} Errors</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-muted-foreground text-xs">
                                {errorCount > 0
                                    ? <span className="text-red-500 font-medium">Please fix all errors to proceed.</span>
                                    : "All records are valid. Ready to import."}
                            </div>
                        </div>

                        <ScrollArea className="h-[500px] border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 sticky top-0 z-10">
                                        <TableHead className="w-[50px]">Row</TableHead>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>In/Out</TableHead>
                                        <TableHead className="text-right">Validation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.map((record, i) => (
                                        <TableRow key={i} className={record.status === 'error' ? 'bg-red-50/40' : ''}>
                                            <TableCell className="text-muted-foreground font-mono text-xs">{record.row}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{record.employeeName || 'Unknown'}</span>
                                                    <span className="text-xs text-muted-foreground">{record.employeeId !== "—" ? `ID: ${record.employeeId}` : ''}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{record.date || <span className="text-red-400 italic">Invalid</span>}</TableCell>
                                            <TableCell className="text-xs font-mono">
                                                {record.clockIn} - {record.clockOut}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {record.status === 'valid' ? (
                                                    <span className="text-green-600 font-medium text-xs flex items-center justify-end gap-1">
                                                        <CheckCircle className="h-3 w-3" /> Ready
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1">
                                                        {record.errorMessages.map((msg, idx) => (
                                                            <span key={idx} className="text-red-500 font-medium text-[10px] flex items-center justify-end gap-1">
                                                                <AlertCircle className="h-3 w-3" /> {msg}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                )}

                {step === "importing" && (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                        <Progress value={progress} className="w-[60%]" />
                        <p className="text-muted-foreground animate-pulse">Importing records...</p>
                    </div>
                )}

                {step === "result" && (
                    <div className="py-6 flex flex-col items-center justify-center gap-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className={cn("p-4 rounded-full mb-2", importStats.failed === 0 ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600")}>
                                {importStats.failed === 0 ? <CheckCircle className="h-10 w-10" /> : <AlertCircle className="h-10 w-10" />}
                            </div>
                            <h3 className="text-xl font-semibold">Import Complete</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                            <div className="bg-green-50 border border-green-100 p-4 rounded-lg flex flex-col items-center">
                                <span className="text-2xl font-bold text-green-700">{importStats.success}</span>
                                <span className="text-sm text-green-600">Successful</span>
                            </div>
                            <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex flex-col items-center">
                                <span className="text-2xl font-bold text-red-700">{importStats.failed}</span>
                                <span className="text-sm text-red-600">Failed/Skipped</span>
                            </div>
                        </div>

                        {importStats.failed > 0 && (
                            <div className="w-full max-w-md text-center text-sm text-muted-foreground bg-muted/30 p-4 rounded-md">
                                Records with errors were skipped. You can correct the errors in your file and upload them again.
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="sm:justify-between">
                    {step === "upload" ? (
                        <>
                            <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                            <Button onClick={parseFileHeaders} disabled={!file}>Continue</Button>
                        </>
                    ) : step === "mapping" ? (
                        <>
                            <Button variant="ghost" onClick={() => setStep("upload")}>Back</Button>
                            <Button
                                onClick={proceedToValidation}
                                disabled={!Object.values(mapping).every(v => v !== "")}
                            >
                                Continue
                            </Button>
                        </>
                    ) : step === "preview" ? (
                        <>
                            <Button variant="ghost" onClick={() => setStep("mapping")}>Back</Button>
                            <Button onClick={handleImport} disabled={validCount === 0 || errorCount > 0}>
                                Import {validCount} Records
                            </Button>
                        </>
                    ) : step === "result" ? (
                        <Button onClick={handleClose} className="w-full">Done</Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
