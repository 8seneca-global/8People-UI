"use client";

import { useState } from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { useStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Button } from "@/modules/core/components/ui/button";
import { Badge } from "@/modules/core/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/modules/core/components/ui/dialog";
import { Input } from "@/modules/core/components/ui/input";
import { Label } from "@/modules/core/components/ui/label";
import { Textarea } from "@/modules/core/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/modules/core/components/ui/radio-group";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { LeaveRequest } from "@/lib/mock-data";

export default function MyLeaveRequestsPage() {
  const {
    leaveRequests,
    leaveBalances,
    leaveTypes,
    addLeaveRequest,
    cancelLeaveRequest,
    employees,
    currentRole,
  } = useStore();
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
    durationType: "full" as "full" | "half",
    timeOfDay: "morning" as "morning" | "afternoon",
  })
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "status">("newest")

  if (currentRole === "admin") {
    return (
      <>
        <PageHeader title="My Leave" subtitle="Leave request management" />
        <main className="p-4 md:p-6">
          <Card className="bg-card border-border">
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">
                  Not Available
                </h3>
                <p className="text-muted-foreground">
                  Administrators do not submit leave requests. Please use the
                  Leave Requests page to manage employee requests.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  // For demo, using employee ID 2 (Tran Thi Binh)
  const currentEmployeeId = "2";
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId);

  const myRequests = leaveRequests.filter(
    (r) => r.employeeId === currentEmployeeId,
  );
  const myBalances = leaveBalances.filter(
    (b) => b.employeeId === currentEmployeeId,
  );

  const sortedRequests = [...myRequests].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "status") {
      const statusOrder = {
        pending: 0,
        approved: 1,
        rejected: 2,
        cancelled: 3,
        draft: 4,
      };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return 0;
  });

  const getStatusIcon = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const variants: Record<
      LeaveRequest["status"],
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      draft: { variant: "outline", label: "Draft" },
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      cancelled: { variant: "outline", label: "Cancelled" },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const calculateDays = (
    start: string,
    end: string,
    durationType: "full" | "half",
  ) => {
    if (!start || !end) return 0;

    if (durationType === "half") {
      return 0.5;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = () => {
    const leaveType = leaveTypes.find((t) => t.id === formData.leaveTypeId);
    if (!leaveType || !formData.startDate || !formData.endDate) return;

    const totalDays = calculateDays(formData.startDate, formData.endDate, formData.durationType)
    const notes = formData.durationType === "half" ? `Half day (${formData.timeOfDay})` : undefined

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
      approvers: [
        { employeeId: "1", employeeName: "Nguyen Van An", status: "pending" },
      ],
      notes,
    });

    setNewRequestOpen(false);
    setFormData({
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
      durationType: "full",
      timeOfDay: "morning",
    })
  }

  const annualBalance = myBalances.find((b) => b.leaveTypeId === "lt-1");

  return (
    <>
      <PageHeader
        title="My Leave"
        subtitle={
          annualBalance
            ? `You have ${annualBalance.available} days of Annual Leave remaining.`
            : "View your leave balance and request time off"
        }
      />
      <main className="p-4 md:p-6">
        <div className="space-y-6">
          {/* New Request Button */}
          <div className="flex justify-end">
            <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Leave Request</DialogTitle>
                  <DialogDescription>
                    Submit a new leave request for approval
                  </DialogDescription>
                </DialogHeader>
                </DialogContent>
            </Dialog>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="leave-type">Leave Type</Label>
                    <Select
                      value={formData.leaveTypeId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, leaveTypeId: value })
                      }
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
                      value={formData.timeOfDay}
                      onValueChange={(value: "morning" | "afternoon") =>
                        setFormData({ ...formData, timeOfDay: value })
                      }
                      className="flex gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full" id="full-day" />
                        <Label
                          htmlFor="full-day"
                          className="font-normal cursor-pointer"
                        >
                          Full Day
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="half" id="half-day" />
                        <Label
                          htmlFor="half-day"
                          className="font-normal cursor-pointer"
                        >
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
                          <Label
                            htmlFor="morning"
                            className="font-normal cursor-pointer"
                          >
                            Morning (08:00 - 12:00)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="afternoon" id="afternoon" />
                          <Label
                            htmlFor="afternoon"
                            className="font-normal cursor-pointer"
                          >
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
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="bg-input border-border"
                        disabled={formData.durationType === "half"}
                      />
                    </div>
                  </div>

                  {formData.startDate && formData.endDate && (
                    <div className="rounded-md bg-secondary/50 p-3">
                      <p className="text-sm">
                        <span className="font-medium">
                          {calculateDays(
                            formData.startDate,
                            formData.endDate,
                            formData.durationType,
                          )}
                        </span>{" "}
                        {formData.durationType === "half"
                          ? "day"
                          : "working days"}{" "}
                        selected
                        {formData.durationType === "half" && (
                          <span className="text-muted-foreground">
                            {" "}
                            (
                            {formData.timeOfDay === "morning"
                              ? "Morning"
                              : "Afternoon"}
                            )
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
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      className="bg-input border-border"
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
                          ({formData.timeOfDay === "morning" ? "Morning" : "Afternoon"})
                        </span>
                      )}
                    </p>
                  </div>
                )}
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Requests</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="sort-by"
                    className="text-sm text-muted-foreground"
                  >
                    Sort By:
                  </Label>
                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger
                      id="sort-by"
                      className="w-[140px] h-9 bg-input border-border"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No leave requests yet</p>
                    <p className="text-sm">
                      Click "Request Leave" to submit your first request
                    </p>
                  </div>
                ) : (
                  sortedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="font-medium">{request.leaveTypeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()} (
                            {request.totalDays} days)
                            {request.totalDays === 0.5 && request.notes && (
                              <span className="ml-1 text-xs">
                                • {request.notes}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(request.status)}
                        {request.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => cancelLeaveRequest(request.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
