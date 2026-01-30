"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useStore } from "@/lib/store"
import { hasPermission } from "@/lib/rbac"
import { Plus, Search, Trash2, MoreHorizontal, Upload } from "lucide-react"
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
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const { employees, currentRole, deleteEmployee } = useStore()

  // Navigate to detail page if id query param exists
  useEffect(() => {
    const employeeId = searchParams.get("id")
    if (employeeId) {
      router.push(`/employees/${employeeId}`)
    }
  }, [searchParams, router])

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
    router.push(`/employees/${employee.id}`)
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

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds(filteredEmployees.map((e) => e.id))
    } else {
      setSelectedEmployeeIds([])
    }
  }

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployeeIds([...selectedEmployeeIds, employeeId])
    } else {
      setSelectedEmployeeIds(selectedEmployeeIds.filter((id) => id !== employeeId))
    }
  }

  const handleBulkDelete = () => {
    if (selectedEmployeeIds.length === 0) return

    const confirmMessage = `Are you sure you want to delete ${selectedEmployeeIds.length} employee(s)? This action cannot be undone.`
    if (window.confirm(confirmMessage)) {
      selectedEmployeeIds.forEach((id) => {
        deleteEmployee(id)
      })
      setSelectedEmployeeIds([])
    }
  }

  const isAllSelected = filteredEmployees.length > 0 && selectedEmployeeIds.length === filteredEmployees.length
  const isSomeSelected = selectedEmployeeIds.length > 0 && selectedEmployeeIds.length < filteredEmployees.length

  const formatDate = (date: string | undefined): string => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
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
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push("/employees/bulk-upload")}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
              <Button onClick={() => router.push("/employees/add")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          )}
        </div>

        {/* Bulk action toolbar */}
        {selectedEmployeeIds.length > 0 && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">
              {selectedEmployeeIds.length} employee(s) selected
            </div>
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                More
              </Button>
            </div>
          </div>
        )}

        {/* Table - Updated columns */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="text-muted-foreground">Employee ID</TableHead>
                <TableHead className="text-muted-foreground">Full Name</TableHead>
                <TableHead className="text-muted-foreground">Work Email</TableHead>
                <TableHead className="text-muted-foreground">Position</TableHead>
                <TableHead className="text-muted-foreground">Department</TableHead>
                <TableHead className="text-muted-foreground">Client</TableHead>
                <TableHead className="text-muted-foreground">Contract</TableHead>
                <TableHead className="text-muted-foreground">Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="border-border hover:bg-secondary/50 transition-colors"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedEmployeeIds.includes(employee.id)}
                      onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                      aria-label={`Select ${employee.fullName}`}
                    />
                  </TableCell>
                  <TableCell
                    className="font-medium text-card-foreground cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {employee.code}
                  </TableCell>
                  <TableCell
                    className="font-medium text-card-foreground cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {employee.fullName}
                  </TableCell>
                  <TableCell
                    className="text-card-foreground cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {employee.companyEmail}
                  </TableCell>
                  <TableCell
                    className="text-card-foreground cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {employee.positionTitle}
                  </TableCell>
                  <TableCell
                    className="text-card-foreground cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {employee.organizationalUnitName}
                  </TableCell>
                  <TableCell
                    className="text-card-foreground cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {employee.client || "—"}
                  </TableCell>
                  <TableCell
                    className="text-card-foreground cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {employee.contractType ? (
                      <Badge variant="secondary" className="capitalize">
                        {employee.contractType}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell
                    className="text-card-foreground cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >
                    {formatDate(employee.officialStartDate || employee.companyJoinDate || employee.startDate)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>


    </AdminLayout>
  )
}
