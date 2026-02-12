"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, LogIn, LogOut, Users, AlertCircle, TrendingUp } from "lucide-react"
import type { AttendanceRecord, Employee } from "@/lib/mock-data"

interface RealtimeDashboardProps {
  employees: Employee[]
  attendanceRecords: AttendanceRecord[]
}

interface EmployeeStatus {
  employee: Employee
  todayRecord?: AttendanceRecord
  status: "not_checked_in" | "checked_in" | "checked_out"
  lastAction?: "check_in" | "check_out"
  lastActionTime?: string
}

export function RealtimeDashboard({ employees, attendanceRecords }: RealtimeDashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const today = currentTime.toISOString().split("T")[0]
    const statuses = employees.map((employee) => {
      const todayRecord = attendanceRecords.find((r) => r.employeeId === employee.id && r.date === today)

      let status: "not_checked_in" | "checked_in" | "checked_out" = "not_checked_in"
      let lastAction: "check_in" | "check_out" | undefined
      let lastActionTime: string | undefined

      if (todayRecord?.clockOut) {
        status = "checked_out"
        lastAction = "check_out"
        lastActionTime = todayRecord.clockOut
      } else if (todayRecord?.clockIn) {
        status = "checked_in"
        lastAction = "check_in"
        lastActionTime = todayRecord.clockIn
      }

      return {
        employee,
        todayRecord,
        status,
        lastAction,
        lastActionTime,
      }
    })

    setEmployeeStatuses(statuses)
  }, [employees, attendanceRecords, currentTime])

  const checkedInCount = employeeStatuses.filter((s) => s.status === "checked_in").length
  const checkedOutCount = employeeStatuses.filter((s) => s.status === "checked_out").length
  const notCheckedInCount = employeeStatuses.filter((s) => s.status === "not_checked_in").length
  const lateCount = employeeStatuses.filter((s) => {
    const lateMinutes = s.todayRecord?.lateMinutes || 0
    return lateMinutes > 0
  }).length

  const getStatusColor = (status: "not_checked_in" | "checked_in" | "checked_out") => {
    switch (status) {
      case "checked_in":
        return "bg-secondary border-border"
      case "checked_out":
        return "bg-muted border-border"
      case "not_checked_in":
        return "bg-secondary/50 border-border"
    }
  }

  const getStatusBadge = (status: "not_checked_in" | "checked_in" | "checked_out") => {
    switch (status) {
      case "checked_in":
        return (
          <Badge className="gap-1 bg-primary hover:bg-primary text-primary-foreground">
            <LogIn className="h-3 w-3" />
            Checked In
          </Badge>
        )
      case "checked_out":
        return (
          <Badge className="gap-1 bg-muted hover:bg-muted text-muted-foreground">
            <LogOut className="h-3 w-3" />
            Checked Out
          </Badge>
        )
      case "not_checked_in":
        return (
          <Badge className="gap-1 bg-destructive hover:bg-destructive text-destructive-foreground">
            <AlertCircle className="h-3 w-3" />
            Not Checked In
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-Time Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Current Time Card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              Current Time
            </CardDescription>
            <CardTitle className="text-2xl font-mono font-bold">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary font-medium flex items-center gap-1">
              <LogIn className="h-4 w-4" />
              Present
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{checkedInCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-muted-foreground font-medium flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              Left
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-muted-foreground">{checkedOutCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardDescription className="text-accent font-medium flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Absent
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-accent">{notCheckedInCount}</CardTitle>
          </CardHeader>
        </Card>

        {lateCount > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-destructive font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Late
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-destructive">{lateCount}</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Late Employees Alert */}
      {lateCount > 0 && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">
                  {lateCount} {lateCount === 1 ? "employee" : "employees"} checked in late
                </p>
                <p className="text-sm text-muted-foreground">Review attendance records for details</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Status List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time monitoring • Last updated:{" "}
            <span className="font-mono">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {employeeStatuses
              .sort((a, b) => {
                const statusOrder = { checked_in: 0, checked_out: 1, not_checked_in: 2 }
                const statusDiff = statusOrder[a.status] - statusOrder[b.status]
                if (statusDiff !== 0) return statusDiff
                return a.employee.fullName.localeCompare(b.employee.fullName)
              })
              .map((item) => (
                <div
                  key={item.employee.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${getStatusColor(item.status)}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{item.employee.fullName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.employee.positionTitle}</p>
                    {item.todayRecord?.lateMinutes ? (
                      <p className="text-xs text-destructive mt-1 font-medium">
                        ⚠ Late by {item.todayRecord.lateMinutes}m
                      </p>
                    ) : null}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className="mb-2">{getStatusBadge(item.status)}</div>
                    {item.lastActionTime && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.lastAction === "check_in" ? "In" : "Out"}: {item.lastActionTime}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
