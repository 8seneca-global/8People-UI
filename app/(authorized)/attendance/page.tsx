"use client"

import { useState, useMemo } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { EmployeeTimesheetModal } from "@/modules/attendance/components/employee-timesheet-modal"
import { ImportAttendanceModal } from "@/modules/attendance/components/import-attendance-modal"
import { AttendanceFilter, FilterState } from "@/modules/attendance/components/attendance-filter"
import { DateRangePicker } from "@/modules/attendance/components/date-range-picker"
import { useStore } from "@/lib/store"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, differenceInDays } from "date-fns"
import type { Employee } from "@/lib/mock-data"
import { SendReportModal } from "@/modules/attendance/components/send-report-modal"
import { DateRange } from "react-day-picker"

export default function AttendancePage() {
    const { employees, attendanceRecords, leaveRequests, organizationalUnits } = useStore()
    const publicHolidays: any[] = [] // Mock empty holidays as it's not in store

    // Default to current week
    const today = new Date()
    // For demo purposes, we might want to stick to the "demoToday" logic if consistent with other parts,
    // but the prompt asked for "Week", "Month" presets which usually imply *actual* calendar time.
    // However, the original code had `useState(new Date("2026-01-01"))` so let's try to honor the 2026 demo context if possible
    // or just default to a 2026 date range.
    const demoDate = new Date("2026-01-16")
    const defaultStart = startOfWeek(demoDate, { weekStartsOn: 1 })
    const defaultEnd = endOfWeek(demoDate, { weekStartsOn: 1 })

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: defaultStart,
        to: defaultEnd
    })

    const [filterState, setFilterState] = useState<FilterState>({
        type: "groups",
        selectedIds: [] // Empty means "All"
    })

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSendReportOpen, setIsSendReportOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)

    // Generate days for the selected range
    const daysInRange = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return []
        // Safety constraint if range is huge? 
        return eachDayOfInterval({ start: dateRange.from, end: dateRange.to })
    }, [dateRange])

    const demoToday = new Date("2026-01-16")

    // Process data for the table
    const timesheetData = useMemo(() => {
        // 1. Filter Employees
        let filteredEmployees = employees.filter(e => e.status !== "future")

        // Filter Logic
        if (filterState.selectedIds.length > 0) {
            if (filterState.type === "users") {
                filteredEmployees = filteredEmployees.filter(e => filterState.selectedIds.includes(e.id))
            } else {
                // Filter by organizational unit (Groups)
                // If a group is selected, we include employees who belong to that unit directly.
                // NOTE: If deep nested filtering is needed (all employees under Division X), this needs recursion.
                // For now, simple direct ID match as per common mock data structure usage.
                filteredEmployees = filteredEmployees.filter(e => filterState.selectedIds.includes(e.organizationalUnitId))
            }
        }

        return filteredEmployees.map(employee => {
            let workingDaysCount = 0
            let annualLeaveDays = 0
            let publicHolidayDays = 0
            let paidLeaveDays = 0

            // Employee specific working days (0=Sun, 6=Sat)
            const empWorkingDays = employee.workingDays || [1, 2, 3, 4, 5] // Default Mon-Fri

            const dailyStatuses = daysInRange.map(day => {
                const dateStr = format(day, "yyyy-MM-dd")
                const dayOfWeek = day.getDay()
                const isOffDay = Array.isArray(empWorkingDays)
                    ? !empWorkingDays.includes(dayOfWeek)
                    : empWorkingDays !== dayOfWeek;

                // 1. Check Leave Requests first (Priority)
                const leave = leaveRequests.find(req =>
                    req.employeeId === employee.id &&
                    req.status === "approved" &&
                    dateStr >= req.startDate &&
                    dateStr <= req.endDate
                )

                if (leave) {
                    paidLeaveDays += 1
                    // LV (Purple): Leave
                    return { type: "LEAVE", label: "LV", color: "text-purple-600 font-bold bg-purple-50", title: leave.leaveTypeName }
                }

                // 2. Check Attendance
                const attendance = attendanceRecords.find(rec =>
                    rec.employeeId === employee.id &&
                    rec.date === dateStr
                )

                if (attendance) {
                    const hours = attendance.totalHours || 0
                    const status = attendance.status

                    if (status === 'late') {
                        workingDaysCount += 1
                        // L (Orange): Late
                        return { type: "LATE", label: "L", color: "text-orange-600 font-bold bg-orange-50", title: `Late (${attendance.lateMinutes}m)` }
                    } else if (status === 'early_leave') {
                        workingDaysCount += 1
                        // E (Orange): Early Leave
                        return { type: "EARLY", label: "E", color: "text-orange-600 font-bold bg-orange-50", title: `Early Leave (${hours.toFixed(1)}h)` }
                    } else if (status === 'missing') {
                        workingDaysCount += 1
                        // M (Orange): Missing
                        return { type: "MISSING", label: "M", color: "text-orange-600 font-bold bg-orange-50", title: "Missing Clock In/Out" }
                    } else if (status === 'present') {
                        workingDaysCount += 1
                        // x (Green): Present
                        return { type: "FULL", label: "x", color: "text-green-600 font-bold", title: `Present (${hours}h)` }
                    }

                    // Fallback for unknown status but record exists -> Missing?
                    return { type: "MISSING", label: "M", color: "text-orange-600 font-bold bg-orange-50", title: "Unknown Status" }
                }

                // 3. Check for Missing (No Record) on working days (Past)
                const isPast = day < demoToday
                if (isPast && !isOffDay) {
                    // M (Orange): Missing (replaces Absent)
                    return { type: "MISSING", label: "M", color: "text-orange-600 font-bold bg-orange-50", title: "Missing (No Record)" }
                }

                // 4. Off Day / Weekend
                if (isOffDay) {
                    return { type: "WKND", label: "", color: "bg-secondary/30" }
                }

                // Future / Empty
                return { type: "EMPTY", label: "", color: "" }
            })

            return {
                employee,
                dailyStatuses,
                summary: {
                    workingDays: workingDaysCount,
                    annualLeaveDays,
                    publicHolidayDays,
                    paidLeaveDays,
                    totalPaidDays: workingDaysCount + paidLeaveDays
                }
            }
        })

    }, [employees, daysInRange, attendanceRecords, leaveRequests, publicHolidays, filterState])

    const isCompactView = daysInRange.length > 14

    return (
        <AdminLayout title="Attendance Tracking" subtitle="Attendance management and reporting">
            <div className="space-y-6">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        {/* Date Range Picker */}
                        <DateRangePicker
                            dateRange={dateRange}
                            onChange={setDateRange}
                        />
                        {/* Attendance Filter (Users/Groups) */}
                        <AttendanceFilter
                            employees={employees}
                            orgUnits={organizationalUnits}
                            value={filterState}
                            onChange={setFilterState}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <Button variant="outline" onClick={() => setIsSendReportOpen(true)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Record
                        </Button>
                    </div>
                </div>

                {/* Timesheet Table */}
                <Card className="border-border bg-card overflow-hidden">
                    <div className="overflow-auto relative max-h-[calc(100vh-220px)]">
                        <Table className={cn(
                            "border-collapse w-full",
                            isCompactView ? "w-auto min-w-full sm:min-w-0" : "w-full"
                        )}>
                            <TableHeader>
                                <TableRow className="bg-muted/50 h-12 hover:bg-muted/50">
                                    {/* Sticky Name Column Header - Top Left Corner */}
                                    <TableHead className="sticky top-0 left-0 z-50 bg-muted/95 w-[280px] min-w-[280px] border-r border-border font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        Employee Name
                                    </TableHead>

                                    {/* Date Columns - Sticky Top */}
                                    {daysInRange.map(day => {
                                        const isSat = day.getDay() === 6
                                        const isSun = day.getDay() === 0
                                        return (
                                            <TableHead key={day.toString()} className={cn(
                                                "sticky top-0 z-40 bg-muted/95 text-center p-0.5 border-r border-border/50 text-xs font-medium",
                                                isCompactView && "w-[50px] min-w-[50px]",
                                                (isSat || isSun) && "bg-secondary/10"
                                            )}>
                                                <div className={cn(
                                                    "flex flex-col items-center justify-center h-full w-full rounded-sm",
                                                    isSun && "text-red-500",
                                                    isSat && "text-orange-500"
                                                )}>
                                                    <span className="font-bold">{format(day, "d")}</span>
                                                    <span className="text-[9px] uppercase tracking-tighter opacity-80">{format(day, "EEE")}</span>
                                                </div>
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timesheetData.map((row, idx) => (
                                    <TableRow
                                        key={row.employee.id}
                                        className={cn(
                                            "hover:bg-muted/30 h-10 transition-colors",
                                            idx % 2 === 0 ? "bg-background" : "bg-muted/5"
                                        )}
                                    >
                                        {/* Sticky Name Column - Sticky Left */}
                                        <TableCell
                                            className="sticky left-0 z-30 bg-card border-r border-border font-medium text-sm p-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] group w-[280px] min-w-[280px]"
                                            title={`${row.employee.fullName}\n${row.employee.positionTitle || 'N/A'}`}
                                        >
                                            <button
                                                onClick={() => {
                                                    setSelectedEmployee(row.employee)
                                                    setIsModalOpen(true)
                                                }}
                                                className="w-full h-full text-left px-2 py-1.5 hover:bg-muted/50 transition-colors focus:outline-none focus:bg-muted/50 focus:ring-2 focus:ring-inset focus:ring-primary"
                                            >
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate group-hover:text-primary transition-colors text-sm font-medium">{row.employee.fullName}</span>
                                                    <span className="text-xs text-muted-foreground truncate">{row.employee.positionTitle || 'N/A'}</span>
                                                </div>
                                            </button>
                                        </TableCell>

                                        {/* Daily Status Cells */}
                                        {row.dailyStatuses.map((status, dIdx) => (
                                            <TableCell key={dIdx} className={cn(
                                                "text-center p-0 border-r border-border/50 text-[10px] h-[40px]",
                                                isCompactView && "w-[50px] min-w-[50px]",
                                                status.color
                                            )} title={status.title}>
                                                <div className="flex items-center justify-center w-full h-full">
                                                    {status.label}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {timesheetData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={daysInRange.length + 1} className="text-center py-12 text-muted-foreground">
                                            No employees found for the selected criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>

            <EmployeeTimesheetModal
                employee={selectedEmployee}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedEmployee(null)
                }}
                currentMonth={dateRange?.from || demoToday} // Pass start of date range logic if modal supports range, or closest approx
            />

            <SendReportModal
                isOpen={isSendReportOpen}
                onClose={() => setIsSendReportOpen(false)}
                employees={employees}
                organizationalUnits={organizationalUnits}
            />

            <ImportAttendanceModal
                isOpen={isImportOpen}
                onClose={() => setIsImportOpen(false)}
            />
        </AdminLayout>
    )
}
