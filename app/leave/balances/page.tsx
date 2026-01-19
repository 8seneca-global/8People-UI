"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { publicHolidays, type PublicHoliday, type LeavePolicyRule } from "@/lib/mock-data"
import { Check, Shield, CalendarDays, Plus, Edit2, Trash2, AlertTriangle, Download, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const AVAILABLE_JOB_LEVELS = ["Executive", "Manager", "Lead", "Senior", "Mid-level", "Professional", "Junior", "Intern"]

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
  // P-001 - 2 days in Jan 2026
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
  // P-002 - 4 days in Jan 2026
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
  // P-003 - 1 day in Jan 2026
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
  // P-004 - 3 days in Jan 2026
  {
    id: "lh-2026-004-1",
    employeeId: "P-004",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-12",
    endDate: "2026-01-14",
    totalDays: 3,
    reason: "Family event",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2026-01-08T10:00:00Z",
  },
  // P-005 - 5 days in Jan 2026
  {
    id: "lh-2026-005-1",
    employeeId: "P-005",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-19",
    endDate: "2026-01-23",
    totalDays: 5,
    reason: "Vacation trip",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2026-01-12T08:00:00Z",
  },
  // P-007 - 2 days in Jan 2026
  {
    id: "lh-2026-007-1",
    employeeId: "P-007",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-26",
    endDate: "2026-01-27",
    totalDays: 2,
    reason: "Personal matters",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2026-01-20T09:00:00Z",
  },
  // P-008 - 6 days in Jan 2026
  {
    id: "lh-2026-008-1",
    employeeId: "P-008",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-05",
    endDate: "2026-01-09",
    totalDays: 5,
    reason: "Extended holiday",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2025-12-30T10:00:00Z",
  },
  {
    id: "lh-2026-008-2",
    employeeId: "P-008",
    leaveTypeId: "lt-1",
    leaveTypeName: "Annual Leave",
    startDate: "2026-01-30",
    endDate: "2026-01-30",
    totalDays: 1,
    reason: "Personal day",
    status: "approved",
    approvedBy: "Le Van Cuong",
    approvedAt: "2026-01-27T08:00:00Z",
  },
  // Holiday leave examples - NOT counted as annual leave
  {
    id: "lh-2026-001-h1",
    employeeId: "P-001",
    leaveTypeId: "lt-holiday",
    leaveTypeName: "Holiday Leave",
    startDate: "2026-01-01",
    endDate: "2026-01-01",
    totalDays: 1,
    reason: "New Year's Day",
    status: "approved",
    approvedBy: "System",
    approvedAt: "2025-12-01T00:00:00Z",
  },
]

export default function LeaveBalancesPage() {
  const {
    leaveBalances,
    leaveTypes,
    employees,
    currentRole,
    jobClassifications,
    leavePolicyRules,
    addLeavePolicyRule,
    updateLeavePolicyRule,
    deleteLeavePolicyRule,
  } = useStore()

  const [activeTab, setActiveTab] = useState("balances")

  const [holidays, setHolidays] = useState<PublicHoliday[]>(publicHolidays)
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<PublicHoliday | null>(null)
  const [newHoliday, setNewHoliday] = useState({
    name: "",
    date: "",
    description: "",
    isRecurring: false,
  })

  const [policyDialogOpen, setPolicyDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicyRule | null>(null)
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    jobLevels: [] as string[],
    annualLeaveDays: 14,
    maxCarryForwardDays: 5,
    carryForwardExpiryMonth: 6,
    carryForwardExpiryDay: 30,
    effectiveFrom: new Date().toISOString().split("T")[0],
    status: "active" as "active" | "inactive",
  })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [policyToDelete, setPolicyToDelete] = useState<string | null>(null)

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

  const getPolicyForJobLevel = (jobLevel: string) => {
    return leavePolicyRules.find((policy) => policy.status === "active" && policy.jobLevels.includes(jobLevel))
  }

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
        const policy = getPolicyForJobLevel(jobLevel)

        const annualEntitlement = policy?.annualLeaveDays || 14
        const maxCarryForward = policy?.maxCarryForwardDays || 5

        // Get mock data or generate based on employee ID
        const empNum = Number.parseInt(employee.id.replace("P-", "")) || 0
        const mockData = mockLeaveData[employee.id] || {
          previousYearUnused: empNum % 6,
          monthlyUsage2026: {},
        }

        // 2025 Unused Leave (previous year unused)
        const previousYearUnused = mockData.previousYearUnused

        // 2025 Leave Balance to use by June 30 (max 5 days carry forward)
        const carryForwardToUseByJune = Math.min(previousYearUnused, maxCarryForward)

        // Total used in 2026 (only annual leave, not holiday leave)
        const totalUsedIn2026 = getTotalUsed(employee.id)

        // 2026 Balance = 2026 Annual Leave Entitlement - Total Used
        const balance2026 = annualEntitlement - totalUsedIn2026

        // Detail (2025 and 2026) = 2025 leave balance to use by June 30 + 2026 Balance
        const detailTotal = carryForwardToUseByJune + balance2026

        // Carry forward to 2027 (max 5 days from remaining balance)
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
          policyName: policy?.name,
        }
      })
      .filter((emp) => {
        if (!canViewAllBalances) {
          return emp.employeeId === currentEmployeeId
        }
        return true
      })
  }, [employees, jobClassifications, leavePolicyRules, canViewAllBalances])

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
      (h) => h.employeeId === employeeId && h.leaveTypeId === "lt-1", // Only Annual Leave
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

  // Holiday handlers
  const handleAddHoliday = () => {
    const newId = `ph-${Date.now()}`
    const holiday: PublicHoliday = {
      id: newId,
      name: newHoliday.name,
      date: newHoliday.date,
      year: new Date(newHoliday.date).getFullYear(),
      isRecurring: newHoliday.isRecurring,
      description: newHoliday.description,
      status: "active",
    }
    setHolidays([...holidays, holiday])
    setHolidayDialogOpen(false)
    setNewHoliday({ name: "", date: "", description: "", isRecurring: false })
  }

  const handleDeleteHoliday = (id: string) => {
    setHolidays(holidays.filter((h) => h.id !== id))
  }

  const handleEditHoliday = (holiday: PublicHoliday) => {
    setEditingHoliday(holiday)
    setNewHoliday({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || "",
      isRecurring: holiday.isRecurring,
    })
    setHolidayDialogOpen(true)
  }

  const handleSaveHoliday = () => {
    if (editingHoliday) {
      setHolidays(
        holidays.map((h) =>
          h.id === editingHoliday.id
            ? {
                ...h,
                name: newHoliday.name,
                date: newHoliday.date,
                description: newHoliday.description,
                isRecurring: newHoliday.isRecurring,
                year: new Date(newHoliday.date).getFullYear(),
              }
            : h,
        ),
      )
    } else {
      handleAddHoliday()
      return
    }
    setHolidayDialogOpen(false)
    setEditingHoliday(null)
    setNewHoliday({ name: "", date: "", description: "", isRecurring: false })
  }

  // Policy handlers
  const handleOpenAddPolicy = () => {
    setEditingPolicy(null)
    setNewPolicy({
      name: "",
      description: "",
      jobLevels: [],
      annualLeaveDays: 14,
      maxCarryForwardDays: 5,
      carryForwardExpiryMonth: 6,
      carryForwardExpiryDay: 30,
      effectiveFrom: new Date().toISOString().split("T")[0],
      status: "active",
    })
    setPolicyDialogOpen(true)
  }

  const handleEditPolicy = (policy: LeavePolicyRule) => {
    setEditingPolicy(policy)
    setNewPolicy({
      name: policy.name,
      description: policy.description,
      jobLevels: [...policy.jobLevels],
      annualLeaveDays: policy.annualLeaveDays,
      maxCarryForwardDays: policy.maxCarryForwardDays,
      carryForwardExpiryMonth: policy.carryForwardExpiryMonth || 6,
      carryForwardExpiryDay: policy.carryForwardExpiryDay || 30,
      effectiveFrom: policy.effectiveFrom,
      status: policy.status,
    })
    setPolicyDialogOpen(true)
  }

  const handleSavePolicy = () => {
    if (editingPolicy) {
      updateLeavePolicyRule(editingPolicy.id, {
        name: newPolicy.name,
        description: newPolicy.description,
        jobLevels: newPolicy.jobLevels,
        annualLeaveDays: newPolicy.annualLeaveDays,
        maxCarryForwardDays: newPolicy.maxCarryForwardDays,
        carryForwardExpiryMonth: newPolicy.carryForwardExpiryMonth,
        carryForwardExpiryDay: newPolicy.carryForwardExpiryDay,
        effectiveFrom: newPolicy.effectiveFrom,
        status: newPolicy.status,
      })
    } else {
      addLeavePolicyRule({
        name: newPolicy.name,
        description: newPolicy.description,
        jobLevels: newPolicy.jobLevels,
        annualLeaveDays: newPolicy.annualLeaveDays,
        maxCarryForwardDays: newPolicy.maxCarryForwardDays,
        carryForwardExpiryMonth: newPolicy.carryForwardExpiryMonth,
        carryForwardExpiryDay: newPolicy.carryForwardExpiryDay,
        effectiveFrom: newPolicy.effectiveFrom,
        status: newPolicy.status,
      })
    }
    setPolicyDialogOpen(false)
    setEditingPolicy(null)
  }

  const handleDeletePolicy = (id: string) => {
    setPolicyToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDeletePolicy = () => {
    if (policyToDelete) {
      deleteLeavePolicyRule(policyToDelete)
      setPolicyToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  const toggleJobLevel = (level: string) => {
    if (newPolicy.jobLevels.includes(level)) {
      setNewPolicy({ ...newPolicy, jobLevels: newPolicy.jobLevels.filter((l) => l !== level) })
    } else {
      setNewPolicy({ ...newPolicy, jobLevels: [...newPolicy.jobLevels, level] })
    }
  }

  const getAssignedJobLevels = () => {
    return leavePolicyRules.filter((p) => p.id !== editingPolicy?.id).flatMap((p) => p.jobLevels)
  }

  // Employee view (non-admin)
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

                {/* Monthly breakdown */}
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

                <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Carry Forward to {currentYear + 1}:</strong> {myData.carryForwardToNextYear} days (max 5
                    days allowed)
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
    <AdminLayout title="Leave Balances" subtitle="Overview of all employee leave balances and policies">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="balances">Employee Balances</TabsTrigger>
            <TabsTrigger value="policies">Leave Policies</TabsTrigger>
            <TabsTrigger value="holidays">Public Holidays</TabsTrigger>
          </TabsList>

          <TabsContent value="balances" className="space-y-6 mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Leave Balances - {currentYear}</CardTitle>
                    <CardDescription>
                      Carry forward from {previousYear} expires on June 30, {currentYear} (max 5 days). Holiday leaves
                      are not counted as annual leave.
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
                      <TableHead className="font-medium">
                        <div>
                          <span>Employee</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div>
                          <span>{previousYear} Unused</span>
                          <p className="text-xs text-muted-foreground font-normal">Leave</p>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div>
                          <span>{previousYear} Leave Balance</span>
                          <p className="text-xs text-muted-foreground font-normal">to use by June 30</p>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div>
                          <span>{currentYear} Annual Leave</span>
                          <p className="text-xs text-muted-foreground font-normal">Entitlement</p>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div>
                          <span>Total Used</span>
                          <p className="text-xs text-muted-foreground font-normal">in {currentYear}</p>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div>
                          <span>{currentYear} Balance</span>
                          <p className="text-xs text-muted-foreground font-normal">Entitlement - Used</p>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div>
                          <span>Detail</span>
                          <p className="text-xs text-muted-foreground font-normal">
                            {previousYear} + {currentYear}
                          </p>
                        </div>
                      </TableHead>
                      <TableHead className="text-center font-medium">
                        <div>
                          <span>Carry Forward</span>
                          <p className="text-xs text-muted-foreground font-normal">to {currentYear + 1} (max 5)</p>
                        </div>
                      </TableHead>
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
                        <TableCell className="text-center">
                          <span className="text-sm">{emp.previousYearUnused > 0 ? emp.previousYearUnused : "-"}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">
                            {emp.carryForwardToUseByJune > 0 ? emp.carryForwardToUseByJune : "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">{emp.annualEntitlement}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-sm">{emp.totalUsedIn2026 > 0 ? emp.totalUsedIn2026 : "-"}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleViewHistory(emp.employeeId, emp.fullName)}
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">{emp.balance2026}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">{emp.detailTotal}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm">{emp.carryForwardToNextYear}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6 mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Leave Policies
                    </CardTitle>
                    <CardDescription>
                      Configure annual leave entitlement based on job level. Carry forward expires on June 30 each year
                      (max 5 days).
                    </CardDescription>
                  </div>
                  <Button onClick={handleOpenAddPolicy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {leavePolicyRules.map((policy) => (
                    <Card key={policy.id} className="bg-muted/30 border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{policy.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={policy.status === "active" ? "default" : "secondary"}>
                              {policy.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditPolicy(policy)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeletePolicy(policy.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="text-xs">{policy.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {policy.jobLevels.map((level) => (
                            <Badge key={level} variant="outline" className="text-xs">
                              {level}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                          <div>
                            <p className="text-xs text-muted-foreground">Annual Leave</p>
                            <p className="text-lg font-bold text-primary">{policy.annualLeaveDays} days</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Max Carry Forward</p>
                            <p className="text-lg font-bold">{policy.maxCarryForwardDays} days</p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Carry forward expires: {policy.carryForwardExpiryMonth || 6}/
                          {policy.carryForwardExpiryDay || 30}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays" className="space-y-6 mt-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Public Holidays {currentYear}
                    </CardTitle>
                    <CardDescription>
                      Configure public holidays for the year. Holiday leaves are not counted as annual leave.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setEditingHoliday(null)
                      setNewHoliday({ name: "", date: "", description: "", isRecurring: false })
                      setHolidayDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Holiday
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Holiday Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Recurring</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((holiday) => (
                        <TableRow key={holiday.id} className="border-border">
                          <TableCell className="font-medium">{holiday.name}</TableCell>
                          <TableCell>
                            {new Date(holiday.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{holiday.description || "-"}</TableCell>
                          <TableCell className="text-center">
                            {holiday.isRecurring ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Yes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                No
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={holiday.status === "active" ? "default" : "secondary"}>
                              {holiday.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditHoliday(holiday)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteHoliday(holiday.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {holidays.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No public holidays configured for this year
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave History - {selectedEmployeeHistory?.employeeName}</DialogTitle>
            <DialogDescription>
              Annual leave usage details for {currentYear} (Holiday leaves not included)
            </DialogDescription>
          </DialogHeader>
          {selectedEmployeeHistory && (
            <div className="space-y-4">
              {/* Monthly breakdown */}
              <div>
                <h4 className="text-sm font-medium mb-3">Monthly Usage ({currentYear})</h4>
                <div className="grid grid-cols-12 gap-2">
                  {MONTHS.map((month, idx) => {
                    const usage = selectedEmployeeHistory.monthlyUsage[idx] || 0
                    return (
                      <div key={month} className="text-center p-2 rounded bg-muted/30">
                        <p className="text-xs text-muted-foreground">{month}</p>
                        <p className={cn("text-sm font-medium", usage > 0 && "text-destructive")}>{usage || "-"}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Leave records */}
              <div>
                <h4 className="text-sm font-medium mb-3">Leave Records (Annual Leave Only)</h4>
                {selectedEmployeeHistory.history.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEmployeeHistory.history
                        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.startDate)}</TableCell>
                            <TableCell>{formatDate(record.endDate)}</TableCell>
                            <TableCell>{record.totalDays}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  record.status === "approved"
                                    ? "default"
                                    : record.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {record.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{record.reason}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No leave records found for {currentYear}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Holiday Dialog */}
      <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHoliday ? "Edit Holiday" : "Add New Holiday"}</DialogTitle>
            <DialogDescription>
              {editingHoliday ? "Update the holiday details" : "Add a new public holiday to the calendar"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holiday-name">Holiday Name</Label>
              <Input
                id="holiday-name"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="e.g. National Day"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-date">Date</Label>
              <Input
                id="holiday-date"
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-description">Description (Optional)</Label>
              <Input
                id="holiday-description"
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                placeholder="Brief description of the holiday"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="holiday-recurring"
                checked={newHoliday.isRecurring}
                onChange={(e) => setNewHoliday({ ...newHoliday, isRecurring: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="holiday-recurring" className="text-sm font-normal">
                Recurring every year
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setHolidayDialogOpen(false)
                setEditingHoliday(null)
                setNewHoliday({ name: "", date: "", description: "", isRecurring: false })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveHoliday} disabled={!newHoliday.name || !newHoliday.date}>
              {editingHoliday ? "Save Changes" : "Add Holiday"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Policy Dialog */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? "Edit Leave Policy" : "Add New Leave Policy"}</DialogTitle>
            <DialogDescription>
              {editingPolicy
                ? "Update the leave policy configuration"
                : "Create a new leave policy for specific job levels"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="policy-name">Policy Name</Label>
              <Input
                id="policy-name"
                value={newPolicy.name}
                onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                placeholder="e.g. Executive Leave Policy"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="policy-description">Description</Label>
              <Input
                id="policy-description"
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
                placeholder="Brief description of this policy"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Levels</Label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_JOB_LEVELS.map((level) => {
                  const isAssigned = getAssignedJobLevels().includes(level)
                  const isSelected = newPolicy.jobLevels.includes(level)
                  return (
                    <Badge
                      key={level}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        isAssigned && !isSelected && "opacity-50 cursor-not-allowed",
                        isSelected && "bg-primary text-primary-foreground",
                      )}
                      onClick={() => !isAssigned && toggleJobLevel(level)}
                    >
                      {isSelected && <Check className="h-3 w-3 mr-1" />}
                      {level}
                      {isAssigned && !isSelected && " (assigned)"}
                    </Badge>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annual-leave-days">Annual Leave Days</Label>
                <Input
                  id="annual-leave-days"
                  type="number"
                  min="0"
                  value={newPolicy.annualLeaveDays}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, annualLeaveDays: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-carry-forward">Max Carry Forward Days</Label>
                <Input
                  id="max-carry-forward"
                  type="number"
                  min="0"
                  max="5"
                  value={newPolicy.maxCarryForwardDays}
                  onChange={(e) =>
                    setNewPolicy({
                      ...newPolicy,
                      maxCarryForwardDays: Math.min(5, Number.parseInt(e.target.value) || 0),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective-from">Effective From</Label>
              <Input
                id="effective-from"
                type="date"
                value={newPolicy.effectiveFrom}
                onChange={(e) => setNewPolicy({ ...newPolicy, effectiveFrom: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="policy-status"
                checked={newPolicy.status === "active"}
                onChange={(e) => setNewPolicy({ ...newPolicy, status: e.target.checked ? "active" : "inactive" })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="policy-status" className="text-sm font-normal">
                Policy is active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPolicyDialogOpen(false)
                setEditingPolicy(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePolicy} disabled={!newPolicy.name || newPolicy.jobLevels.length === 0}>
              {editingPolicy ? "Save Changes" : "Add Policy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Policy Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Leave Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this leave policy? This action cannot be undone. Employees assigned to
              this policy will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePolicy} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
