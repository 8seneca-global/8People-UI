"use client"

import type React from "react"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Check, X, Plus, User, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function LeaveCalendarPage() {
  const { leaveRequests, leaveTypes, updateLeaveRequest, employees, addLeaveRequest, currentRole } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1))
  const [selectedLeave, setSelectedLeave] = useState<(typeof leaveRequests)[0] | null>(null)
  const [hoveredLeaveId, setHoveredLeaveId] = useState<string | null>(null)
  const [newRequestOpen, setNewRequestOpen] = useState(false)
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    durationType: "full" as "full" | "half",
    halfDayPeriod: "morning" as "morning" | "afternoon",
    approverId: "",
    ccRecipientIds: [] as string[],
  })

  // For demo, using employee ID 2 (Tran Thi Binh) who is HR Manager
  const currentEmployeeId = "2"
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId)

  // Check if user is a team lead (has direct reports)
  const isTeamLead =
    currentRole === "admin" ||
    currentRole === "hr" ||
    (currentEmployee?.directReportIds && currentEmployee.directReportIds.length > 0) ||
    currentEmployee?.jobClassificationTitle?.toLowerCase().includes("lead") ||
    currentEmployee?.jobClassificationTitle?.toLowerCase().includes("manager")

  if (currentRole === "employee" && !isTeamLead) {
    return (
      <AdminLayout title="Leave Calendar" subtitle="View team leave schedule">
        <Card className="bg-card border-border">
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">The Leave Calendar is only available to Team Leads and Managers.</p>
              <p className="text-sm text-muted-foreground mt-2">
                As a team lead, you will be able to view your team members' leave schedules here.
              </p>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  // Team leads can only see their team members' leaves
  // HR/Admin can see all
  const getVisibleLeaveRequests = () => {
    if (currentRole === "admin" || currentRole === "hr") {
      return leaveRequests.filter((r) => r.status === "approved" || r.status === "pending")
    }
    // Team lead - show only team members' leaves
    const teamMemberIds = currentEmployee?.directReportIds || []
    return leaveRequests.filter(
      (r) =>
        (r.status === "approved" || r.status === "pending") &&
        (teamMemberIds.includes(r.employeeId) || r.employeeId === currentEmployeeId),
    )
  }

  const approvedRequests = getVisibleLeaveRequests()

  const potentialApprovers = employees.filter(
    (e) =>
      e.id !== currentEmployeeId &&
      e.status === "active" &&
      (e.jobClassificationTitle?.toLowerCase().includes("manager") ||
        e.jobClassificationTitle?.toLowerCase().includes("lead") ||
        e.jobClassificationTitle?.toLowerCase().includes("director") ||
        e.jobClassificationTitle?.toLowerCase().includes("head") ||
        e.jobClassificationTitle?.toLowerCase().includes("ceo") ||
        e.jobClassificationTitle?.toLowerCase().includes("cto") ||
        e.jobClassificationTitle?.toLowerCase().includes("cfo") ||
        e.lineManagerId === undefined),
  )

  const potentialCCRecipients = employees.filter((e) => e.id !== currentEmployeeId && e.status === "active")

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    const startDayOfWeek = firstDay.getDay()
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startDayOfWeek + i + 1)
      days.push(prevDate)
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }

    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i))
      }
    }

    return days
  }

  const days = getDaysInMonth(currentDate)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const isCurrentMonth = (date: Date | null) => {
    if (!date) return false
    return date.getMonth() === currentDate.getMonth()
  }

  const getLeavesForDay = (date: Date | null) => {
    if (!date) return []
    const dateStr = date.toISOString().split("T")[0]

    return approvedRequests.filter((request) => {
      const start = new Date(request.startDate)
      const end = new Date(request.endDate)
      const startStr = start.toISOString().split("T")[0]
      const endStr = end.toISOString().split("T")[0]
      return dateStr >= startStr && dateStr <= endStr
    })
  }

  const isLeaveStart = (request: (typeof leaveRequests)[0], date: Date) => {
    const startStr = new Date(request.startDate).toISOString().split("T")[0]
    const dateStr = date.toISOString().split("T")[0]
    return startStr === dateStr
  }

  const isLeaveEnd = (request: (typeof leaveRequests)[0], date: Date) => {
    const endStr = new Date(request.endDate).toISOString().split("T")[0]
    const dateStr = date.toISOString().split("T")[0]
    return endStr === dateStr
  }

  const isHalfDay = (request: (typeof leaveRequests)[0]) => {
    return request.totalDays === 0.5
  }

  const isMorningHalfDay = (request: (typeof leaveRequests)[0]) => {
    const notes = request.notes?.toLowerCase() || ""
    return notes.includes("morning") || notes.includes("am") || notes.includes("1st")
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const today = new Date()
  const isToday = (date: Date | null) => {
    if (!date) return false
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleApprove = (leaveId: string) => {
    updateLeaveRequest(leaveId, {
      status: "approved",
      updatedAt: new Date().toISOString(),
    })
    setSelectedLeave(null)
  }

  const handleReject = (leaveId: string) => {
    updateLeaveRequest(leaveId, {
      status: "rejected",
      updatedAt: new Date().toISOString(),
    })
    setSelectedLeave(null)
  }

  const calculateDays = (start: string, end: string, durationType: "full" | "half") => {
    if (!start || !end) return 0

    if (durationType === "half") {
      return 0.5
    }

    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const handleAddCCRecipient = (employeeId: string) => {
    if (!formData.ccRecipientIds.includes(employeeId)) {
      setFormData({ ...formData, ccRecipientIds: [...formData.ccRecipientIds, employeeId] })
    }
  }

  const handleRemoveCCRecipient = (employeeId: string) => {
    setFormData({
      ...formData,
      ccRecipientIds: formData.ccRecipientIds.filter((id) => id !== employeeId),
    })
  }

  const handleSubmit = () => {
    const leaveType = leaveTypes.find((t) => t.id === formData.leaveTypeId)
    const approver = employees.find((e) => e.id === formData.approverId)
    if (!leaveType || !formData.startDate || !formData.endDate || !approver) return

    const totalDays = calculateDays(formData.startDate, formData.endDate, formData.durationType)
    const notes = formData.durationType === "half" ? `Half day (${formData.halfDayPeriod})` : undefined

    const ccRecipients = formData.ccRecipientIds
      .map((id) => {
        const emp = employees.find((e) => e.id === id)
        return emp ? { employeeId: emp.id, employeeName: emp.fullName } : null
      })
      .filter(Boolean) as { employeeId: string; employeeName: string }[]

    addLeaveRequest({
      employeeId: currentEmployeeId,
      employeeName: currentEmployee?.fullName || "Unknown",
      leaveTypeId: formData.leaveTypeId,
      leaveTypeName: leaveType.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays,
      reason: formData.reason,
      status: "pending",
      approvers: [{ employeeId: approver.id, employeeName: approver.fullName, status: "pending" }],
      ccRecipients: ccRecipients.length > 0 ? ccRecipients : undefined,
      notes,
    })

    setNewRequestOpen(false)
    setFormData({
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
      durationType: "full",
      halfDayPeriod: "morning",
      approverId: "",
      ccRecipientIds: [],
    })
  }

  const getUpcomingLeaves = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return approvedRequests
      .filter((request) => {
        const startDate = new Date(request.startDate)
        startDate.setHours(0, 0, 0, 0)
        return startDate >= today
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 10)
  }

  const upcomingLeaves = getUpcomingLeaves()

  return (
    <AdminLayout
      title="Leave Calendar"
      subtitle={
        currentRole === "employee" && isTeamLead
          ? "View your team members' leave schedule"
          : "View team leave schedule at a glance"
      }
    >
      <TooltipProvider>
        <div className="space-y-6">
          {currentRole === "employee" && isTeamLead && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-3">
                <p className="text-sm text-primary">
                  As a Team Lead, you can view your team members' leave schedules here. You will also receive
                  notifications when team members submit leave requests.
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setNewRequestOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Leave
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                  >
                    today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-transparent"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-t border-b">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2 border-r last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="border-b">
                {weeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="grid grid-cols-7 border-b last:border-b-0">
                    {week.map((day, dayIdx) => {
                      const leaves = getLeavesForDay(day)
                      const inCurrentMonth = isCurrentMonth(day)

                      return (
                        <div
                          key={dayIdx}
                          className={cn(
                            "min-h-[100px] border-r last:border-r-0 relative",
                            !inCurrentMonth && "bg-muted/30",
                            isToday(day) && "bg-primary/5",
                          )}
                        >
                          <div className="p-1 text-right">
                            <span
                              className={cn(
                                "text-sm",
                                !inCurrentMonth && "text-muted-foreground/50",
                                inCurrentMonth && "text-muted-foreground",
                                isToday(day) && "font-bold text-primary",
                              )}
                            >
                              {day?.getDate()}
                            </span>
                          </div>

                          <div className="px-0 space-y-0.5 absolute top-6 left-0 right-0 overflow-visible">
                            {day &&
                              leaves.map((leave, leaveIdx) => {
                                const leaveType = leaveTypes.find((t) => t.id === leave.leaveTypeId)
                                const color = leaveType?.color || "#3b82f6"
                                const isStart = isLeaveStart(leave, day)
                                const isEnd = isLeaveEnd(leave, day)
                                const halfDay = isHalfDay(leave)
                                const isMorning = isMorningHalfDay(leave)
                                const isHovered = hoveredLeaveId === leave.id

                                const barStyle: React.CSSProperties = {
                                  backgroundColor: color,
                                  opacity: leave.status === "pending" ? (isHovered ? 0.8 : 0.6) : 1,
                                  filter: isHovered ? "brightness(1.15)" : "none",
                                  position: "relative",
                                  zIndex: isHovered ? 20 : 10,
                                }

                                if (halfDay) {
                                  if (isMorning) {
                                    barStyle.width = "50%"
                                    barStyle.marginLeft = "2px"
                                    barStyle.borderRadius = "3px"
                                  } else {
                                    barStyle.width = "50%"
                                    barStyle.marginLeft = "calc(50% - 2px)"
                                    barStyle.borderRadius = "3px"
                                  }
                                } else {
                                  if (isStart && isEnd) {
                                    barStyle.borderRadius = "3px"
                                    barStyle.marginLeft = "2px"
                                    barStyle.marginRight = "2px"
                                  } else if (isStart) {
                                    barStyle.borderTopLeftRadius = "3px"
                                    barStyle.borderBottomLeftRadius = "3px"
                                    barStyle.borderTopRightRadius = "0"
                                    barStyle.borderBottomRightRadius = "0"
                                    barStyle.marginLeft = "2px"
                                    barStyle.marginRight = "-1px"
                                    barStyle.paddingRight = "1px"
                                  } else if (isEnd) {
                                    barStyle.borderTopRightRadius = "3px"
                                    barStyle.borderBottomRightRadius = "3px"
                                    barStyle.borderTopLeftRadius = "0"
                                    barStyle.borderBottomLeftRadius = "0"
                                    barStyle.marginLeft = "-1px"
                                    barStyle.marginRight = "2px"
                                    barStyle.paddingLeft = "1px"
                                  } else {
                                    barStyle.borderRadius = "0"
                                    barStyle.marginLeft = "-1px"
                                    barStyle.marginRight = "-1px"
                                  }
                                }

                                return (
                                  <Tooltip key={`${leave.id}-${leaveIdx}`}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className="h-5 flex items-center overflow-hidden text-white text-xs font-medium cursor-pointer transition-all"
                                        style={barStyle}
                                        onClick={() => setSelectedLeave(leave)}
                                        onMouseEnter={() => setHoveredLeaveId(leave.id)}
                                        onMouseLeave={() => setHoveredLeaveId(null)}
                                      >
                                        {isStart && (
                                          <span className="truncate px-1.5">
                                            {leave.employeeName.split(" ").slice(-2).join(" ")}
                                          </span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <div className="space-y-1">
                                        <p className="font-medium">{leave.employeeName}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {leave.leaveTypeName}
                                          {halfDay && (isMorning ? " (Morning)" : " (Afternoon)")}
                                        </p>
                                        <p className="text-xs">
                                          {leave.totalDays}{" "}
                                          {leave.totalDays === 1 || leave.totalDays === 0.5 ? "day" : "days"}
                                        </p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Leave Types</CardTitle>
                <CardDescription>Color legend for different leave types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaveTypes.map((type) => (
                    <div key={type.id} className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded" style={{ backgroundColor: type.color }} />
                      <span className="text-sm">{type.name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 pt-2 border-t mt-3">
                    <div className="h-4 w-2 rounded bg-primary" />
                    <span className="text-sm text-muted-foreground">Half-day (½ width)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-primary/50" />
                    <span className="text-sm text-muted-foreground">Pending approval (faded)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {currentRole === "employee" && isTeamLead ? "Team Upcoming Leaves" : "Company Upcoming Leaves"}
                </CardTitle>
                <CardDescription>
                  {currentRole === "employee" && isTeamLead
                    ? "Next scheduled leaves in your team"
                    : "Next scheduled leaves across the company"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingLeaves.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming leaves scheduled</p>
                    </div>
                  ) : (
                    upcomingLeaves.map((leave) => {
                      const leaveType = leaveTypes.find((t) => t.id === leave.leaveTypeId)
                      const startDate = new Date(leave.startDate)
                      const endDate = new Date(leave.endDate)
                      const isSameDay = startDate.toDateString() === endDate.toDateString()
                      const halfDay = isHalfDay(leave)
                      const isMorning = isMorningHalfDay(leave)

                      return (
                        <div
                          key={leave.id}
                          className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">
                              {leave.employeeName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{leave.employeeName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: leaveType?.color || "#3b82f6" }}
                              />
                              <span>{leave.leaveTypeName}</span>
                              {halfDay && <span>({isMorning ? "AM" : "PM"})</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {isSameDay
                                ? startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                : `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {leave.totalDays} {leave.totalDays === 1 || leave.totalDays === 0.5 ? "day" : "days"}
                            </p>
                          </div>
                          {leave.status === "pending" && (
                            <Badge variant="secondary" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leave Detail Dialog */}
        <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>
                {selectedLeave?.employeeName} - {selectedLeave?.leaveTypeName}
              </DialogDescription>
            </DialogHeader>
            {selectedLeave && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Start Date</Label>
                    <p className="font-medium">{formatDate(selectedLeave.startDate)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">End Date</Label>
                    <p className="font-medium">{formatDate(selectedLeave.endDate)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="font-medium">
                      {selectedLeave.totalDays}{" "}
                      {selectedLeave.totalDays === 1 || selectedLeave.totalDays === 0.5 ? "day" : "days"}
                      {selectedLeave.notes && (
                        <span className="text-muted-foreground ml-1">({selectedLeave.notes})</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedLeave.status === "approved"
                            ? "default"
                            : selectedLeave.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <p className="font-medium">{selectedLeave.reason}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Approver</Label>
                  <p className="font-medium">{selectedLeave.approvers[0]?.employeeName}</p>
                </div>

                {selectedLeave.ccRecipients && selectedLeave.ccRecipients.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">CC Recipients</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLeave.ccRecipients.map((cc) => (
                        <Badge key={cc.employeeId} variant="outline">
                          {cc.employeeName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLeave.status === "pending" && (currentRole === "admin" || currentRole === "hr") && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button className="flex-1" onClick={() => handleApprove(selectedLeave.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedLeave.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* New Request Dialog - Add approver and CC fields */}
        <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
              <DialogDescription>Submit a new leave request for approval</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <Label htmlFor="leave-type-cal">Leave Type</Label>
                <Select
                  value={formData.leaveTypeId}
                  onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Duration Type</Label>
                <RadioGroup
                  value={formData.durationType}
                  onValueChange={(value: "full" | "half") => setFormData({ ...formData, durationType: value })}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" id="full-day-cal" />
                    <Label htmlFor="full-day-cal" className="font-normal cursor-pointer">
                      Full Day
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="half" id="half-day-cal" />
                    <Label htmlFor="half-day-cal" className="font-normal cursor-pointer">
                      Half Day
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.durationType === "half" && (
                <div>
                  <Label>Half Day Period</Label>
                  <RadioGroup
                    value={formData.halfDayPeriod}
                    onValueChange={(value: "morning" | "afternoon") =>
                      setFormData({ ...formData, halfDayPeriod: value })
                    }
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="morning" id="morning-cal" />
                      <Label htmlFor="morning-cal" className="font-normal cursor-pointer">
                        Morning (08:00 - 12:00)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="afternoon" id="afternoon-cal" />
                      <Label htmlFor="afternoon-cal" className="font-normal cursor-pointer">
                        Afternoon (13:30 - 17:30)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date-cal">Start Date</Label>
                  <Input
                    id="start-date-cal"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date-cal">End Date</Label>
                  <Input
                    id="end-date-cal"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-input border-border"
                    disabled={formData.durationType === "half"}
                  />
                </div>
              </div>

              {formData.startDate && formData.endDate && (
                <div className="rounded-md bg-secondary/50 p-3">
                  <p className="text-sm">
                    <span className="font-medium">
                      {calculateDays(formData.startDate, formData.endDate, formData.durationType)}
                    </span>{" "}
                    {formData.durationType === "half" ? "day" : "working days"} selected
                    {formData.durationType === "half" && (
                      <span className="text-muted-foreground">
                        {" "}
                        ({formData.halfDayPeriod === "morning" ? "Morning" : "Afternoon"})
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="approver-cal">
                  Approver <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.approverId}
                  onValueChange={(value) => setFormData({ ...formData, approverId: value })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialApprovers.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex flex-col">
                          <span>{emp.fullName}</span>
                          <span className="text-xs text-muted-foreground">{emp.jobClassificationTitle}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cc-cal">CC (Optional)</Label>
                <Select onValueChange={handleAddCCRecipient} value="">
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Add people to CC" />
                  </SelectTrigger>
                  <SelectContent>
                    {potentialCCRecipients
                      .filter((emp) => !formData.ccRecipientIds.includes(emp.id) && emp.id !== formData.approverId)
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          <div className="flex flex-col">
                            <span>{emp.fullName}</span>
                            <span className="text-xs text-muted-foreground">{emp.jobClassificationTitle}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.ccRecipientIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.ccRecipientIds.map((id) => {
                      const emp = employees.find((e) => e.id === id)
                      return (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1 pr-1">
                          {emp?.fullName}
                          <button
                            type="button"
                            onClick={() => handleRemoveCCRecipient(id)}
                            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="reason-cal">Reason</Label>
                <Textarea
                  id="reason-cal"
                  placeholder="Please provide a reason for your leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="bg-input border-border"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setNewRequestOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!formData.leaveTypeId || !formData.startDate || !formData.endDate || !formData.approverId}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </AdminLayout>
  )
}
