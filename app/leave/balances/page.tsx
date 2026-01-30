"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Download, Eye, Table as TableIcon } from "lucide-react"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const mockLeaveData: Record<string, { previousYearUnused: number; monthlyUsage2026: Record<number, number> }> = {
  "P-001": { previousYearUnused: 3, monthlyUsage2026: { 0: 2 } }, // 2 days in Jan
  "P-002": { previousYearUnused: 5, monthlyUsage2026: { 0: 4 } }, // 4 days in Jan
  "P-003": { previousYearUnused: 2, monthlyUsage2026: { 0: 1 } }, // 1 day in Jan
  "P-004": { previousYearUnused: 7, monthlyUsage2026: { 0: 3 } }, // 3 days in Jan
  "P-005": { previousYearUnused: 0, monthlyUsage2026: { 0: 5 } }, // 5 days in Jan
  "P-006": { previousYearUnused: 4, monthlyUsage2026: {} }, // 0 days used
  "P-007": { previousYearUnused: 6, monthlyUsage2026: { 0: 2 } }, // 2 days in Jan
  "P-008": { previousYearUnused: 1, monthlyUsage2026: { 0: 6 } }, // 6 days in Jan
}

const mockLeaveHistory2026 = [
  {
    id: "lh-2026-001-1",
    employeeId: "P-001",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-15",
    endDate: "2026-01-16",
    totalDays: 2,
    reason: "Personal matters",
    status: "approved",
    approvedBy: "Board of Directors",
    approvedAt: "2026-01-10T10:00:00Z",
  },
  {
    id: "lh-2026-002-1",
    employeeId: "P-002",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-06",
    endDate: "2026-01-09",
    totalDays: 4,
    reason: "Extended New Year break",
    status: "approved",
    approvedBy: "Nguyen Van An",
    approvedAt: "2025-12-28T08:00:00Z",
  },
  {
    id: "lh-2026-003-1",
    employeeId: "P-003",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-20",
    endDate: "2026-01-20",
    totalDays: 1,
    reason: "Medical appointment",
    status: "approved",
    approvedBy: "Nguyen Van An",
    approvedAt: "2026-01-15T09:00:00Z",
  },
]

export default function LeaveBalancesPage() {
  const {
    employees,
    currentRole,
    jobClassifications,
  } = useStore()

  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [selectedEmployeeHistory, setSelectedEmployeeHistory] = useState<{
    employeeId: string
    employeeName: string
    monthlyUsage: Record<number, number>
    history: typeof mockLeaveHistory2026
  } | null>(null)

  const canViewAllBalances = currentRole === "admin" || currentRole === "hr"
  const currentEmployeeId = "P-011"
  const currentYear = 2026
  const previousYear = 2025

  const getMonthlyLeaveUsage = (employeeId: string) => {
    const mockData = mockLeaveData[employeeId]
    if (mockData?.monthlyUsage2026) {
      return mockData.monthlyUsage2026
    }
    return {}
  }

  const getTotalUsed = (employeeId: string) => {
    const monthlyUsage = getMonthlyLeaveUsage(employeeId)
    return Object.values(monthlyUsage).reduce((sum, days) => sum + days, 0)
  }

  const enrichedEmployeeData = useMemo(() => {
    return employees
      .map((employee) => {
        const jobClass = jobClassifications.find((jc) => jc.id === employee.jobClassificationId)
        const jobLevel = jobClass?.jobLevel || "Mid-level"

        const annualEntitlement = 14
        const maxCarryForward = 5

        const empNum = Number.parseInt(employee.id.replace("P-", "")) || 0
        const mockData = mockLeaveData[employee.id] || {
          previousYearUnused: empNum % 6,
          monthlyUsage2026: {},
        }

        const previousYearUnused = mockData.previousYearUnused
        const carryForwardToUseByJune = Math.min(previousYearUnused, maxCarryForward)
        const totalUsedIn2026 = getTotalUsed(employee.id)
        const balance2026 = annualEntitlement - totalUsedIn2026
        const detailTotal = carryForwardToUseByJune + balance2026
        const carryForwardToNextYear = Math.min(Math.max(0, balance2026), maxCarryForward)

        return {
          employeeId: employee.id,
          fullName: employee.fullName,
          jobLevel,
          previousYearUnused,
          carryForwardToUseByJune,
          annualEntitlement,
          totalUsedIn2026,
          balance2026,
          detailTotal,
          carryForwardToNextYear,
        }
      })
      .filter((emp) => {
        if (!canViewAllBalances) {
          return emp.employeeId === currentEmployeeId
        }
        return true
      })
  }, [employees, jobClassifications, canViewAllBalances])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleViewHistory = (employeeId: string, employeeName: string) => {
    const history = mockLeaveHistory2026.filter(
      (h) => h.employeeId === employeeId && h.leaveTypeId === "lt-1",
    )
    const monthlyUsage = getMonthlyLeaveUsage(employeeId)
    setSelectedEmployeeHistory({
      employeeId,
      employeeName,
      monthlyUsage,
      history,
    })
    setHistoryDialogOpen(true)
  }

  if (!canViewAllBalances) {
    const myData = enrichedEmployeeData.find((e) => e.employeeId === currentEmployeeId)
    const currentEmployee = employees.find((e) => e.id === currentEmployeeId)
    const currentJobClass = currentEmployee
      ? jobClassifications.find((jc) => jc.id === currentEmployee.jobClassificationId)
      : null

    const monthlyUsage = getMonthlyLeaveUsage(currentEmployeeId)

    return (
      <AdminLayout title="My Leave Balance" subtitle="View your annual leave balance">
        <div className="space-y-6">
          {myData && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Annual Leave Summary - {currentYear}</CardTitle>
                <CardDescription>
                  {currentJobClass?.jobLevel} - {myData.annualEntitlement} days/year entitlement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Carry Forward ({previousYear})</p>
                    <p className="text-2xl font-bold">{myData.carryForwardToUseByJune}</p>
                    <p className="text-xs text-amber-600">Expires June 30, {currentYear}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Annual Entitlement</p>
                    <p className="text-2xl font-bold">{myData.annualEntitlement}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Total Used</p>
                    <p className="text-2xl font-bold text-destructive">{myData.totalUsedIn2026}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Current Balance</p>
                    <p className="text-2xl font-bold text-primary">{myData.balance2026}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Monthly Leave Usage</h4>
                  <div className="grid grid-cols-12 gap-2">
                    {MONTHS.map((month, idx) => (
                      <div key={month} className="text-center p-2 rounded bg-muted/30">
                        <p className="text-xs text-muted-foreground">{month}</p>
                        <p className={cn("text-sm font-medium", (monthlyUsage[idx] || 0) > 0 && "text-destructive")}>
                          {monthlyUsage[idx] || "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
                  <p className="text-sm">
                    <strong>Carry Forward to {currentYear + 1}:</strong> {myData.carryForwardToNextYear} days (max 5 days allowed)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Leave Balances" subtitle="Overview of all employee leave balances">
      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5" />
                  Employee Leave Balances - {currentYear}
                </CardTitle>
                <CardDescription>
                  Carry forward from {previousYear} expires on June 30, {currentYear} (max 5 days).
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="font-medium">Employee</TableHead>
                  <TableHead className="text-center font-medium">{previousYear} Unused</TableHead>
                  <TableHead className="text-center font-medium">{previousYear} CF (to June 30)</TableHead>
                  <TableHead className="text-center font-medium">{currentYear} Entitlement</TableHead>
                  <TableHead className="text-center font-medium">Used 2026</TableHead>
                  <TableHead className="text-center font-medium">Balance 2026</TableHead>
                  <TableHead className="text-center font-medium">Detail Total</TableHead>
                  <TableHead className="text-center font-medium">CF to {currentYear + 1}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedEmployeeData.map((emp) => (
                  <TableRow key={emp.employeeId} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium">{emp.fullName}</p>
                        <p className="text-xs text-muted-foreground">{emp.jobLevel}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{emp.previousYearUnused || "-"}</TableCell>
                    <TableCell className="text-center">{emp.carryForwardToUseByJune || "-"}</TableCell>
                    <TableCell className="text-center">{emp.annualEntitlement}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span>{emp.totalUsedIn2026 || "-"}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleViewHistory(emp.employeeId, emp.fullName)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{emp.balance2026}</TableCell>
                    <TableCell className="text-center">{emp.detailTotal}</TableCell>
                    <TableCell className="text-center">{emp.carryForwardToNextYear}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Leave History - {selectedEmployeeHistory?.employeeName}</DialogTitle>
              <DialogDescription>Detailed usage breakdown for {currentYear}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-6 grid grid-cols-12 gap-2">
                {MONTHS.map((month, idx) => (
                  <div key={month} className="text-center p-2 rounded bg-muted/30">
                    <p className="text-xs text-muted-foreground">{month}</p>
                    <p className={cn("text-sm font-medium", (selectedEmployeeHistory?.monthlyUsage[idx] || 0) > 0 && "text-destructive")}>
                      {selectedEmployeeHistory?.monthlyUsage[idx] || "-"}
                    </p>
                  </div>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployeeHistory?.history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No leave history found for this year.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedEmployeeHistory?.history.map((record) => (
                      <TableRow key={record.id} className="border-border">
                        <TableCell>{record.leaveTypeName}</TableCell>
                        <TableCell className="text-xs">
                          {formatDate(record.startDate)} - {formatDate(record.endDate)}
                        </TableCell>
                        <TableCell className="text-center font-medium">{record.totalDays}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
