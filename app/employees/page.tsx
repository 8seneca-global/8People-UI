"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddEmployeeModal } from "@/components/employees/add-employee-modal"
import { EmployeeDetailModal } from "@/components/employees/employee-detail-modal"
import { useStore } from "@/lib/store"
import { hasPermission } from "@/lib/rbac"
import { Plus, Search, User, Calendar } from "lucide-react"
import type { Employee } from "@/lib/mock-data"

function calculateSeniority(date: string | undefined): string {
  if (!date) return "—"

  const startDate = new Date(date)
  const today = new Date()

  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "Not started"

  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  const days = diffDays % 30

  if (years > 0) {
    return months > 0 ? `${years}y ${months}m` : `${years}y`
  } else if (months > 0) {
    return days > 0 ? `${months}m ${days}d` : `${months}m`
  } else {
    return `${days}d`
  }
}

type StatusFilter = "all" | "active" | "resigned" | "future" | "pending"

export default function EmployeesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const { employees, currentRole } = useStore()

  // Open modal if id query param exists
  useEffect(() => {
    const employeeId = searchParams.get("id")
    if (employeeId) {
      const employee = employees.find(e => e.id === employeeId)
      if (employee) {
        setSelectedEmployee(employee)
        setDetailModalOpen(true)
      }
    }
  }, [searchParams, employees])

  const canCreate = hasPermission(currentRole, "employees.create")
  const canEdit = hasPermission(currentRole, "employees.edit")

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      // Status filter
      if (statusFilter !== "all" && e.status !== statusFilter) {
        return false
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        return (
          e.fullName.toLowerCase().includes(searchLower) ||
          e.companyEmail.toLowerCase().includes(searchLower) ||
          e.organizationalUnitName.toLowerCase().includes(searchLower) ||
          e.positionTitle.toLowerCase().includes(searchLower) ||
          e.code.toLowerCase().includes(searchLower)
        )
      }

      return true
    })
  }, [employees, statusFilter, search])

  const statusCounts = useMemo(() => {
    return {
      all: employees.length,
      active: employees.filter((e) => e.status === "active").length,
      resigned: employees.filter((e) => e.status === "resigned").length,
      future: employees.filter((e) => e.status === "future").length,
      pending: employees.filter((e) => e.status === "pending").length,
    }
  }, [employees])

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDetailModalOpen(true)
  }

  const getStatusBadge = (status: Employee["status"]) => {
    const styles = {
      active: "bg-success/20 text-success hover:bg-success/30",
      pending: "bg-warning/20 text-warning hover:bg-warning/30",
      future: "bg-info/20 text-info hover:bg-info/30",
      resigned: "bg-destructive/20 text-destructive hover:bg-destructive/30",
    }
    return styles[status] || styles.pending
  }



  return (
    <AdminLayout title="Employees" subtitle="Manage your workforce (P)">
      <div className="space-y-4">
        {/* Actions bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-input pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[180px] bg-input">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
                <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
                <SelectItem value="future">Future ({statusCounts.future})</SelectItem>
                <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                <SelectItem value="resigned">Resigned ({statusCounts.resigned})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {canCreate && (
            <Button onClick={() => setAddEmployeeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>

        {/* Table - Updated columns with seniority */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Org Unit</TableHead>
                <TableHead className="text-muted-foreground">Position</TableHead>
                <TableHead className="text-muted-foreground">Seniority</TableHead>
                <TableHead className="text-muted-foreground">Manager</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <TableCell className="font-medium text-card-foreground">{employee.fullName}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">{employee.companyEmail}</TableCell>
                  <TableCell className="text-card-foreground">{employee.organizationalUnitName}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-card-foreground">{employee.positionTitle}</p>
                      <p className="text-xs text-muted-foreground">{employee.jobClassificationTitle}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-card-foreground">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {calculateSeniority(
                            employee.officialStartDate || employee.companyJoinDate || employee.startDate,
                          )}
                        </span>
                      </div>
                      {employee.companyJoinDate &&
                        employee.officialStartDate &&
                        employee.companyJoinDate !== employee.officialStartDate && (
                          <p className="text-xs text-muted-foreground">
                            (at company: {calculateSeniority(employee.companyJoinDate)})
                          </p>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {employee.lineManagerName ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {employee.lineManagerName}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusBadge(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {canCreate && <AddEmployeeModal open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen} />}
      <EmployeeDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        employee={selectedEmployee}
        readOnly={!canEdit}
      />
    </AdminLayout>
  )
}
