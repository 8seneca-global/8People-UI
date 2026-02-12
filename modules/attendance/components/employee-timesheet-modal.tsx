"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import type { Employee, AttendanceRecord } from "@/lib/mock-data"
import { format, isSameDay, addMonths, subMonths } from "date-fns"
import { User, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmployeeTimesheetModalProps {
    employee: Employee | null
    isOpen: boolean
    onClose: () => void
    currentMonth: Date
}

interface DailyRecord {
    date: Date
    checkIn?: string
    checkOut?: string
    totalHours: number
    status: "present" | "late" | "early_leave" | "absent" | "weekend" | "missing" | "annual_leave" | "unpaid_leave" | "work_from_home" | "sick_leave" | "marriage_leave" | "social_insurance_paid"
    attendanceId?: string
    leaveType?: string
}

export function EmployeeTimesheetModal({
    employee,
    isOpen,
    onClose,
    currentMonth,
}: EmployeeTimesheetModalProps) {
    const router = useRouter()
    // Get leave requests from store
    const { attendanceRecords, leaveRequests } = useStore() // Added leaveRequests
    const [viewDate, setViewDate] = useState(currentMonth)

    useEffect(() => {
        if (isOpen) {
            setViewDate(currentMonth)
        }
    }, [isOpen, currentMonth])

    if (!employee) return null

    // Generate daily records for the month
    const getDaysInMonth = (date: Date): Date[] => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
    }

    const daysInMonth = getDaysInMonth(viewDate)

    // Build daily records
    const dailyRecords: DailyRecord[] = daysInMonth.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd") // Helper for comparison
        const dayOfWeek = day.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

        // Check for approved leave request first (Priority)
        const leave = leaveRequests.find(req =>
            req.employeeId === employee.id &&
            req.status === "approved" &&
            dateStr >= req.startDate &&
            dateStr <= req.endDate
        )

        if (leave) {
            return {
                date: day,
                totalHours: 0,
                status: leave.leaveTypeName.toLowerCase().replace(/\s+/g, '_') as any, // Map type to status key
                leaveType: leave.leaveTypeName, // Store nice name
                attendanceId: leave.id, // Hack to store leave ID for linking
            }
        }

        // Find attendance record for this day
        const attendance = attendanceRecords.find(
            (record) =>
                record.employeeId === employee.id &&
                isSameDay(new Date(record.date), day)
        )

        if (isWeekend) {
            return {
                date: day,
                totalHours: 0,
                status: "weekend" as const,
            }
        }

        if (attendance) {
            // ... (keep attendance logic) ...
            // Use provided totalHours directly
            let totalHours = attendance.totalHours || 0
            let status = attendance.status

            // ENFORCE: Missing logic
            if (!attendance.clockIn || !attendance.clockOut) {
                status = "missing"
                totalHours = 0
            }

            return {
                date: day,
                checkIn: attendance.clockIn,
                checkOut: attendance.clockOut,
                totalHours,
                status: status as any,
                attendanceId: attendance.id,
            }
        }

        // Future date or no record -> Missing
        if (day > new Date()) {
            return {
                date: day,
                totalHours: 0,
                status: "absent" as const,
            }
        }

        return {
            date: day,
            totalHours: 0,
            status: "missing" as const,
        }
    })

    // Calculate summary statistics
    const summary = {
        workingDays: dailyRecords.filter(r => ["present", "late", "early_leave", "work_from_home"].includes(r.status)).length,
        requestLeave: dailyRecords.filter(r => ["annual_leave", "sick_leave", "unpaid_leave", "marriage_leave", "social_insurance_paid"].includes(r.status)).length,
        missingDays: dailyRecords.filter(r => r.status === "missing").length,
        lateDays: dailyRecords.filter(r => r.status === "late").length,
        earlyLeaveDays: dailyRecords.filter(r => r.status === "early_leave").length,
        // totalHours: dailyRecords.reduce((sum, r) => sum + r.totalHours, 0), // Not requested in display
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            present: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            late: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            early_leave: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
            missing: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", // Missing is red
            absent: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", // Future absent
            // New Leave Statuses - All Purple
            annual_leave: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            unpaid_leave: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            sick_leave: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            marriage_leave: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
            work_from_home: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", // WFH distinct
            social_insurance_paid: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        }
        return styles[status] || styles.absent
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    {/* ... (keep header) ... */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback>{getInitials(employee.fullName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <DialogTitle className="text-xl">
                                {employee.fullName}
                            </DialogTitle>
                            <span className="text-sm text-muted-foreground">{employee.positionTitle}</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                router.push(`/employees/${employee.id}`)
                                onClose()
                            }}
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Go to Profile
                        </Button>
                    </div>
                </DialogHeader>

                {/* Date Navigation Filter */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setViewDate(subMonths(viewDate, 1))}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="w-32 text-center font-medium text-sm">
                            {format(viewDate, "MMMM yyyy")}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setViewDate(addMonths(viewDate, 1))}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Date</TableHead>
                                <TableHead className="w-[100px]">Clock In</TableHead>
                                <TableHead className="w-[100px]">Clock Out</TableHead>
                                <TableHead className="w-[100px]">Total Hours</TableHead>
                                <TableHead className="w-[150px]">Status</TableHead>
                                <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dailyRecords.map((record) => {
                                const dateKey = format(record.date, "yyyy-MM-dd")


                                return (
                                    <TableRow key={dateKey} className={cn(
                                        record.status === "weekend" && "bg-muted/30"
                                    )}>
                                        <TableCell className="font-medium">
                                            {format(record.date, "dd/MM/yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            {record.checkIn || "—"}
                                        </TableCell>
                                        <TableCell>
                                            {record.checkOut || "—"}
                                        </TableCell>
                                        <TableCell>
                                            {record.totalHours > 0 ? record.totalHours.toFixed(1) : "—"}
                                        </TableCell>
                                        <TableCell>
                                            {record.status === "weekend" ? (
                                                <span className="text-muted-foreground text-sm">Weekend</span>
                                            ) : (
                                                <Badge className={getStatusBadge(record.status)}>
                                                    {record.status === "early_leave" ? "Early Leave" :
                                                        record.status === "missing" ? "Missing" :
                                                            record.leaveType || record.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {["annual_leave", "sick_leave", "unpaid_leave", "marriage_leave", "work_from_home", "social_insurance_paid"].includes(record.status) && record.attendanceId && (
                                                <a
                                                    href={`/leave-management/requests/${record.attendanceId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                                                    title="View Leave Request"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Summary - Simple & Clean */}
                <div className="border-t p-4 bg-muted/5 flex items-center justify-between text-sm">
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase font-medium">Working Days</span>
                            <span className="font-semibold text-green-600">{summary.workingDays}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase font-medium">Request Leave</span>
                            <span className="font-semibold text-purple-600">{summary.requestLeave}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase font-medium">Missing</span>
                            <span className="font-semibold text-red-600">{summary.missingDays}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase font-medium">Late</span>
                            <span className="font-semibold text-orange-600">{summary.lateDays}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs uppercase font-medium">Early Leave</span>
                            <span className="font-semibold text-orange-600">{summary.earlyLeaveDays}</span>
                        </div>
                    </div>
                    {/* Paid days logic removed/simplified */}
                </div>
            </DialogContent>
        </Dialog>
    )
}
