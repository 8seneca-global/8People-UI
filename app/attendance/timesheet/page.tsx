"use client"

import { useState, useMemo } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Users, TrendingUp, Clock, AlertTriangle, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, getDaysInMonth, isWeekend, isSameDay, startOfDay } from "date-fns"

export default function TimesheetPage() {
    const { employees, attendanceRecords, leaveRequests, publicHolidays, organizationalUnits } = useStore()
    const [currentDate, setCurrentDate] = useState(new Date("2026-01-01")) // Default to Jan 2026 for demo
    const [selectedOrgUnit, setSelectedOrgUnit] = useState<string>("all")

    // Navigation handlers
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }

    // Generate days for the current month
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const days = getDaysInMonth(currentDate)
        return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))
    }, [currentDate])

    const today = startOfDay(new Date())
    // For demo purposes, let's pretend "today" is Jan 16, 2026 so we can see absent/present logic work for the first half of Jan 2026
    const demoToday = new Date("2026-01-16")

    // Departments for filter
    const departmentUnits = useMemo(() =>
        organizationalUnits.filter((u) => u.unitType === "department"),
        [organizationalUnits])

    // Process data for the table and stats
    const { timesheetData, globalStats } = useMemo(() => {
        // 1. Filter Employees
        let filteredEmployees = employees.filter(e => e.status !== "future")
        if (selectedOrgUnit !== "all") {
            filteredEmployees = filteredEmployees.filter(e => e.organizationalUnitId === selectedOrgUnit)
        }

        let totalPresentDays = 0
        let totalLateDays = 0
        let totalAbsentDays = 0
        let totalHours = 0
        let totalOvertime = 0

        const rowData = filteredEmployees.map(employee => {
            let workingDaysCount = 0
            let annualLeaveDays = 0
            let publicHolidayDays = 0
            let paidLeaveDays = 0

            // Employee specific working days (0=Sun, 6=Sat)
            const empWorkingDays = employee.workingDays || [1, 2, 3, 4, 5] // Default Mon-Fri

            // Stats for this employee
            let empPresent = 0
            let empLate = 0
            let empAbsent = 0

            const dailyStatuses = daysInMonth.map(day => {
                const dateStr = format(day, "yyyy-MM-dd")
                const dayOfWeek = day.getDay()
                const isOffDay = !empWorkingDays.includes(dayOfWeek) // True if weekend/off-day for this employee

                // 1. Check Public Holiday
                const holiday = publicHolidays.find(h => h.date === dateStr && h.status === 'active')
                if (holiday) {
                    publicHolidayDays += 1
                    paidLeaveDays += 1 // Holidays are usually paid
                    return { type: "PH", label: "PH", color: "text-purple-600 font-bold bg-purple-50", title: holiday.name }
                }

                // 2. Check Leave Requests
                const leave = leaveRequests.find(req =>
                    req.employeeId === employee.id &&
                    req.status === "approved" &&
                    dateStr >= req.startDate &&
                    dateStr <= req.endDate
                )

                if (leave) {
                    if (leave.leaveTypeName === "Annual Leave") {
                        annualLeaveDays += 1
                        paidLeaveDays += 1
                        return { type: "AL", label: "AL", color: "text-red-500 font-bold bg-red-50", title: "Annual Leave" }
                    }
                    paidLeaveDays += 1
                    return { type: "L", label: "L", color: "text-orange-500 font-bold bg-orange-50", title: leave.leaveTypeName }
                }

                // 3. Check Attendance
                const attendance = attendanceRecords.find(rec =>
                    rec.employeeId === employee.id &&
                    rec.date === dateStr
                )

                if (attendance) {
                    const hours = attendance.totalHours || 0
                    const status = attendance.status

                    totalHours += hours
                    totalOvertime += (attendance.overtime || 0)

                    if (status === 'late') {
                        empLate += 1
                        workingDaysCount += 1 // Count as worked
                        return { type: "LATE", label: "L", color: "text-yellow-600 font-bold bg-yellow-50", title: `Late (${attendance.lateMinutes}m)` }
                    } else if (status === 'early_leave') {
                        workingDaysCount += (hours >= 4 ? 0.5 : 0) // Simplified logic
                        empPresent += 1 // Count as present/partial
                        return { type: "EARLY", label: "E", color: "text-orange-600 font-bold", title: "Early Leave" }
                    }

                    if (hours >= 8) {
                        workingDaysCount += 1
                        empPresent += 1
                        return { type: "FULL", label: "x", color: "text-green-600 font-bold", title: `Present (${hours}h)` }
                    } else if (hours > 0) {
                        workingDaysCount += 0.5
                        empPresent += 1
                        return { type: "HALF", label: "x/2", color: "text-green-600 font-bold", title: `Half Day (${hours}h)` }
                    }

                    // Present but 0 hours?
                    return { type: "PRESENT_NO_HOURS", label: "?", color: "text-gray-400", title: "No hours logged" }
                }

                // 4. Check Absent (Past dates only, and IS a working day)
                const isPast = day < demoToday
                if (isPast && !isOffDay) {
                    empAbsent += 1
                    return { type: "ABSENT", label: "A", color: "text-red-600 font-bold bg-red-100", title: "Absent" }
                }

                // 5. Off Day / Weekend
                if (isOffDay) {
                    return { type: "WKND", label: "", color: "bg-secondary/30" }
                }

                return { type: "EMPTY", label: "", color: "" }
            })

            totalPresentDays += empPresent
            totalLateDays += empLate
            totalAbsentDays += empAbsent

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

        // Global Stats Calculation
        const totalEmployees = filteredEmployees.length
        // Approx expected working days so far = (Present + Late + Absent + Leaves)
        // Simplified attendance rate: (Present + Late) / (Present + Late + Absent)
        const totalRecords = totalPresentDays + totalLateDays + totalAbsentDays
        const attendanceRate = totalRecords > 0
            ? Math.round(((totalPresentDays + totalLateDays) / totalRecords) * 100)
            : 0

        return {
            timesheetData: rowData,
            globalStats: {
                totalEmployees,
                attendanceRate,
                totalPresent: totalPresentDays,
                totalLate: totalLateDays,
                totalAbsent: totalAbsentDays,
                totalHours: Math.round(totalHours),
                totalOvertime: Math.round(totalOvertime)
            }
        }

    }, [employees, daysInMonth, attendanceRecords, leaveRequests, publicHolidays, selectedOrgUnit, organizationalUnits])

    return (
        <AdminLayout title="Monthly Timesheet" subtitle="Attendance management and reporting">
            <div className="space-y-6">
                {/* Stats Cards (Migrated from Reports) */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 p-4">
                            <CardDescription className="flex items-center gap-2 text-xs">
                                <Users className="h-4 w-4" />
                                Employees
                            </CardDescription>
                            <CardTitle className="text-xl">{globalStats.totalEmployees}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 p-4">
                            <CardDescription className="flex items-center gap-2 text-xs">
                                <TrendingUp className="h-4 w-4" />
                                Attendance Rate
                            </CardDescription>
                            <CardTitle className={`text-xl ${globalStats.attendanceRate >= 95 ? 'text-green-500' : 'text-yellow-500'}`}>
                                {globalStats.attendanceRate}%
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 p-4">
                            <CardDescription className="text-xs">Present Days</CardDescription>
                            <CardTitle className="text-xl">{globalStats.totalPresent}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 p-4">
                            <CardDescription className="flex items-center gap-2 text-xs">
                                <Clock className="h-4 w-4" />
                                Late Days
                            </CardDescription>
                            <CardTitle className="text-xl text-yellow-600">{globalStats.totalLate}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 p-4">
                            <CardDescription className="flex items-center gap-2 text-xs">
                                <AlertTriangle className="h-4 w-4" />
                                Absent Days
                            </CardDescription>
                            <CardTitle className="text-xl text-red-600">{globalStats.totalAbsent}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2 p-4">
                            <CardDescription className="flex items-center gap-2 text-xs">
                                <Briefcase className="h-4 w-4" />
                                Total Hours
                            </CardDescription>
                            <CardTitle className="text-xl">{globalStats.totalHours}h</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 px-2 font-semibold text-lg min-w-[180px] justify-center">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            {format(currentDate, "MMMM yyyy")}
                        </div>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={selectedOrgUnit} onValueChange={setSelectedOrgUnit}>
                            <SelectTrigger className="w-[180px] bg-background">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departmentUnits.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Timesheet Table */}
                <Card className="border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto relative min-h-[400px]">
                        <Table className="border-collapse w-full min-w-[1500px]">
                            <TableHeader>
                                <TableRow className="bg-muted/50 h-12">
                                    {/* Sticky Name Column Header */}
                                    <TableHead className="sticky left-0 z-30 bg-muted/95 w-[220px] min-w-[220px] border-r border-border font-bold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        Employee Name
                                    </TableHead>

                                    {/* Date Columns */}
                                    {daysInMonth.map(day => {
                                        const isSat = day.getDay() === 6
                                        const isSun = day.getDay() === 0
                                        return (
                                            <TableHead key={day.toString()} className={cn(
                                                "text-center p-0.5 w-[36px] min-w-[36px] border-r border-border/50 text-xs font-medium",
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

                                    {/* Sticky Summary Columns Headers */}
                                    <TableHead className="sticky right-[240px] z-30 bg-muted/95 w-[60px] border-l border-border text-center text-xs font-bold shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">Wrk</TableHead>
                                    <TableHead className="sticky right-[180px] z-30 bg-muted/95 w-[60px] border-r border-border text-center text-xs font-bold">AL</TableHead>
                                    <TableHead className="sticky right-[120px] z-30 bg-muted/95 w-[60px] border-r border-border text-center text-xs font-bold">PH</TableHead>
                                    <TableHead className="sticky right-[60px] z-30 bg-muted/95 w-[60px] border-r border-border text-center text-xs font-bold">Paid</TableHead>
                                    <TableHead className="sticky right-0 z-30 bg-muted/95 w-[60px] border-l border-border text-center text-xs font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {timesheetData.map((row, idx) => (
                                    <TableRow key={row.employee.id} className={cn("hover:bg-muted/30 h-10 transition-colors", idx % 2 === 0 ? "bg-background" : "bg-muted/5")}>
                                        {/* Sticky Name Column */}
                                        <TableCell className="sticky left-0 z-20 bg-card border-r border-border font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <div className="flex flex-col">
                                                <span>{row.employee.fullName}</span>
                                                <span className="text-[10px] text-muted-foreground">{row.employee.jobTitle || 'N/A'}</span>
                                            </div>
                                        </TableCell>

                                        {/* Daily Status Cells */}
                                        {row.dailyStatuses.map((status, dIdx) => (
                                            <TableCell key={dIdx} className={cn(
                                                "text-center p-0 border-r border-border/50 text-[10px] h-[40px] w-[36px]",
                                                status.color
                                            )} title={status.title}>
                                                <div className="flex items-center justify-center w-full h-full">
                                                    {status.label}
                                                </div>
                                            </TableCell>
                                        ))}

                                        {/* Sticky Summary Columns */}
                                        <TableCell className="sticky right-[240px] z-20 bg-card border-l border-border text-center font-bold text-xs shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">{row.summary.workingDays}</TableCell>
                                        <TableCell className="sticky right-[180px] z-20 bg-card border-r border-border text-center text-xs text-red-500 font-semibold">{row.summary.annualLeaveDays}</TableCell>
                                        <TableCell className="sticky right-[120px] z-20 bg-card border-r border-border text-center text-xs text-purple-500 font-semibold">{row.summary.publicHolidayDays}</TableCell>
                                        <TableCell className="sticky right-[60px] z-20 bg-card border-r border-border text-center text-xs text-blue-600 dark:text-blue-400 font-semibold">{row.summary.paidLeaveDays}</TableCell>
                                        <TableCell className="sticky right-0 z-20 bg-card border-l border-border text-center text-xs font-bold">{row.summary.totalPaidDays}</TableCell>
                                    </TableRow>
                                ))}
                                {timesheetData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={daysInMonth.length + 6} className="text-center py-12 text-muted-foreground">
                                            No employees found for the selected criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    )
}
