"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/modules/core/components/ui/card"
import { Button } from "@/modules/core/components/ui/button"
import { ChevronLeft, ChevronRight, Check, X, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/modules/core/components/ui/dialog"
import { Badge } from "@/modules/core/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/modules/core/components/ui/tooltip"
import { Input } from "@/modules/core/components/ui/input"
import { Label } from "@/modules/core/components/ui/label"
import { Textarea } from "@/modules/core/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/core/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/modules/core/components/ui/radio-group"
import { Avatar, AvatarFallback } from "@/modules/core/components/ui/avatar"
import { toast } from "sonner"
import { calculateDays } from "@hr-system/utils"
import { useApproveLeaveRequest, useCreateLeaveRequest, useLeaveRequests, useLeaveTypes, useRejectLeaveRequest } from "@/modules/leaves/api/mutations"
import { endOfDay, isSameDay, isWithinInterval, parseISO, startOfDay } from "date-fns"
import { PageHeader } from "@/modules/core/components/layout/page-header"


export default function LeaveCalendarPage() {
  const { data: leaveRequests = [] } = useLeaveRequests()
  const { data: leaveTypes = [] } = useLeaveTypes()
  const { mutateAsync: createLeaveRequest } = useCreateLeaveRequest()
  const { mutateAsync: approveLeaveRequest } = useApproveLeaveRequest()
  const { mutateAsync: rejectLeaveRequest } = useRejectLeaveRequest()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedLeave, setSelectedLeave] = useState<(typeof leaveRequests)[0] | null>(null)
  const [hoveredLeaveId, setHoveredLeaveId] = useState<string | null>(null)
  const [newRequestOpen, setNewRequestOpen] = useState(false)
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    durationType: "full" as "full" | "half",
    timeOfDay: "morning" as "morning" | "afternoon",
  })

  const approvedRequests = leaveRequests.filter((r) => r.status === "approved" || r.status === "pending")

  const assignLeaveRow = () => {
    const rows: { end: Date }[] = []
    return approvedRequests
      .slice()
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .map((request) => {
        const start = startOfDay(new Date(request.startDate))
        const end = endOfDay(new Date(request.endDate))
        let rowIndex = rows.findIndex((row) => row.end < start)

        if (rowIndex === -1) {
          rowIndex = rows.length
          rows.push({ end })
        } else {
          rows[rowIndex].end = end
        }

        return {
          ...request,
          rowIndex
        }
      })
  }

  const approveRequestsWithRow = assignLeaveRow()

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

    const day = startOfDay(date)

    return approveRequestsWithRow.filter((request) => {
      const start = startOfDay(request.startDate)
      const end = endOfDay(request.endDate)

      return isWithinInterval(day, { start, end })
    })
  }


  const isLeaveStart = (request: (typeof leaveRequests)[0], date: Date) => {
    return isSameDay(parseISO(request.startDate), date)
  }

  const isLeaveEnd = (request: (typeof leaveRequests)[0], date: Date) => {
    return isSameDay(parseISO(request.endDate), date)
  }

  const isHalfDay = (request: (typeof leaveRequests)[0]) => {
    return request.totalDays === 0.5
  }

  const isMorningHalfDay = (request: (typeof leaveRequests)[0]) => {
    return request.timeOfDay === "morning"
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
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

  const handleSubmit = async () => {
    try {
      await createLeaveRequest({
        durationType: formData.durationType,
        leaveTypeId: formData.leaveTypeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        timeOfDay: formData.timeOfDay,
        status: "pending",
        reason: formData.reason,
      })
      toast.success("Leave request created successfully")
      setNewRequestOpen(false)
      setFormData({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
        durationType: "full",
        timeOfDay: "morning",
      })

    } catch (error) {
      toast.error("Failed to create leave request")
    }
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

  async function handleApprove(id: string): Promise<void> {
    try {
      await approveLeaveRequest(id)
      toast.success("Leave request approved successfully")
      setSelectedLeave(null)
    } catch (error) {
      toast.error("Failed to approve leave request")
    }
  }

  async function handleReject(id: string): Promise<void> {
    try {
      await rejectLeaveRequest(id)
      toast.success("Leave request rejected successfully")
      setSelectedLeave(null)
    } catch (error) {
      toast.error("Failed to reject leave request")
    }
  }

  return (
    <PageHeader title="Leave Calendar" subtitle="View team leave schedule at a glance">
      <TooltipProvider>
        <div className="space-y-6">
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
                                  position: "absolute",
                                  left: 0,
                                  right: 0,
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
                                        style={{
                                          ...barStyle,
                                          top: leave.rowIndex * 22
                                        }}
                                        onClick={() => setSelectedLeave(leave)}
                                        onMouseEnter={() => setHoveredLeaveId(leave.id)}
                                        onMouseLeave={() => setHoveredLeaveId(null)}
                                      >
                                        {isStart && (
                                          <span className="truncate px-1.5">
                                            {leave.employee.fullName.split(" ").slice(-2).join(" ")}
                                          </span>
                                        )}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      <div className="space-y-1">
                                        <p className="font-medium">{leave.employee.fullName}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {leave.leaveType.name}
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
                <CardTitle>Company Upcoming Leaves</CardTitle>
                <CardDescription>Next scheduled leaves across the company</CardDescription>
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
                              {leave.employee.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{leave.employee.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {isSameDay ? (
                                <>
                                  {startDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                  {halfDay && <span className="ml-1">({isMorning ? "Morning" : "Afternoon"})</span>}
                                </>
                              ) : (
                                <>
                                  {startDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}{" "}
                                  -{" "}
                                  {endDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </>
                              )}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: `${leaveType?.color}20`,
                              color: leaveType?.color,
                              borderColor: leaveType?.color,
                            }}
                          >
                            {leave.leaveType.name}
                          </Badge>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
              <DialogDescription>Submit a new leave request for approval</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="leave-type">Leave Type</Label>
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
                    <RadioGroupItem value="full" id="full-day" />
                    <Label htmlFor="full-day" className="font-normal cursor-pointer">
                      Full Day
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="half" id="half-day" />
                    <Label htmlFor="half-day" className="font-normal cursor-pointer">
                      Half Day
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.durationType === "half" && (
                <div>
                  <Label>Half Day Period</Label>
                  <RadioGroup
                    value={formData.timeOfDay}
                    onValueChange={(value: "morning" | "afternoon") =>
                      setFormData({ ...formData, timeOfDay: value })
                    }
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="morning" id="morning" />
                      <Label htmlFor="morning" className="font-normal cursor-pointer">
                        Morning (08:00 - 12:00)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="afternoon" id="afternoon" />
                      <Label htmlFor="afternoon" className="font-normal cursor-pointer">
                        Afternoon (13:30 - 17:30)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value })
                      if (formData.durationType === "half") {
                        setFormData({ ...formData, startDate: e.target.value, endDate: e.target.value })
                      }
                    }}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-input border-border"
                    disabled={formData.durationType === "half"}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="approver">Approver</Label>
                <Select
                  value={formData.leaveTypeId}
                  onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select approver" />
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
                <Label htmlFor="cc">CC (Optional)</Label>
                <Select
                  value={formData.leaveTypeId}
                  onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Add people to CC" />
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
                        ({formData.timeOfDay === "morning" ? "Morning" : "Afternoon"})
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
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
                disabled={!formData.leaveTypeId || !formData.startDate || !formData.endDate}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription>{selectedLeave?.employee.fullName} - {selectedLeave?.leaveType.name}</DialogDescription>
            </DialogHeader>
            {selectedLeave && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground tracking-wide">Start Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">{formatDate(selectedLeave.startDate)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground tracking-wide">End Date</p>
                    <p className="text-sm font-medium mt-1">
                      {formatDate(selectedLeave.endDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground tracking-wide">Duration</p>
                    <p className="text-sm font-medium mt-1">
                      {selectedLeave.totalDays}{" "}
                      {selectedLeave.totalDays === 1 || selectedLeave.totalDays === 0.5 ? "day" : "days"}
                      {isHalfDay(selectedLeave) && (isMorningHalfDay(selectedLeave) ? " (Morning)" : " (Afternoon)")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground tracking-wide">Status</p>
                    <Badge variant={selectedLeave.status === "approved" ? "default" : "secondary"}>
                      {selectedLeave.status}
                    </Badge>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground tracking-wide">Reason</p>
                  <p className="text-sm mt-1">{selectedLeave.reason || "No reason provided"}</p>
                </div>
                {selectedLeave.approvers && selectedLeave.approvers.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground tracking-wide">Approver</p>
                    {selectedLeave.approvers.map((approver) => (
                      <div key={approver.approverId} className="mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {approver.employee.fullName}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {approver.status}
                          </Badge>
                        </div>

                        {approver.respondedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Responded: {formatDate(approver.respondedAt)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {selectedLeave.status === "pending" && (
                  <div className="pt-4 border-t flex gap-3">
                    <Button className="flex-1" variant="default" onClick={() => handleApprove(selectedLeave.id)}>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button className="flex-1" variant="destructive" onClick={() => handleReject(selectedLeave.id)}>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </PageHeader>
  )
}