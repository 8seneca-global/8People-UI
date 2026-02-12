"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { useStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Button } from "@/modules/core/components/ui/button";
import { Badge } from "@/modules/core/components/ui/badge";
import { Input } from "@/modules/core/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/core/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/core/components/ui/dialog"
import { Textarea } from "@/modules/core/components/ui/textarea"
import { Label } from "@/modules/core/components/ui/label"
import { Search, Check, X, Eye, Filter } from "lucide-react"
import { toast } from "sonner"
import { useApproveLeaveRequest, useLeaveRequests, useLeaveTypes, useRejectLeaveRequest } from "@/modules/leaves/api/mutations"
import { LeaveRequest } from "@/modules/leaves/api/types"


export default function LeaveRequestsPage() {
  const { currentRole } = useStore();
  const { data: leaveRequests = [] } = useLeaveRequests();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const { mutateAsync: approveLeaveRequest } = useApproveLeaveRequest();
  const { mutateAsync: rejectLeaveRequest } = useRejectLeaveRequest();

  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [actionType, setActionType] = useState<"view" | "approve" | "reject" | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    if (leaveRequests) {
      setIsLoading(false);
    }
  }, [leaveRequests]);

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesSearch = request.employee.fullName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || request.status === statusFilter;
    const matchesLeaveType =
      leaveTypeFilter === "all" || request.leaveTypeId === leaveTypeFilter;

    if (currentRole === "admin" || currentRole === "hr") {
      return matchesSearch && matchesStatus && matchesLeaveType;
    }

    return matchesSearch && matchesStatus && matchesLeaveType;
  });

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const variants: Record<
      LeaveRequest["status"],
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      draft: { variant: "outline", label: "Draft" },
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      cancelled: { variant: "outline", label: "Cancelled" },
    };
    const { variant, label } = variants[status] || {
      variant: "outline",
      label: status,
    };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getLeaveTypeColor = (leaveTypeId: string) => {
    const leaveType = leaveTypes.find((lt) => lt.id === leaveTypeId);
    return leaveType?.color || "#9CA3AF";
  };

  const handleApprove = async () => {
    try {
      approveLeaveRequest(selectedRequest!.id);
      toast.success("Leave request approved successfully");
      setSelectedRequest(null);
    } catch (error) {
      toast.error("Failed to approve leave request");
    }
  };

  const handleReject = async () => {
    try {
      rejectLeaveRequest(selectedRequest!.id);
      toast.success("Leave request rejected!");
      setSelectedRequest(null);
    } catch (error) {
      toast.error("Failed to reject leave request");
    }
  };

  const pendingCount = leaveRequests.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <>
      <PageHeader
        title="Leave Requests"
        subtitle="Review and manage employee leave requests"
      />
      <main className="p-4 md:p-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Pending Approval</CardDescription>
                <CardTitle className="text-2xl text-accent">
                  {pendingCount}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Approved Today</CardDescription>
                <CardTitle className="text-2xl text-primary">
                  {leaveRequests.filter((r) => r.status === "approved").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Rejected</CardDescription>
                <CardTitle className="text-2xl text-destructive">
                  {leaveRequests.filter((r) => r.status === "rejected").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Total Requests</CardDescription>
                <CardTitle className="text-2xl">
                  {leaveRequests.length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by employee name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-input border-border"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-input border-border">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                    <SelectTrigger className="w-[180px] bg-input border-border">
                      <SelectValue placeholder="Filter by leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Leave Types</SelectItem>
                      {leaveTypes.map((lt) => (
                        <SelectItem key={lt.id} value={lt.id}>
                          {lt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requests Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>All Requests</CardTitle>
              <CardDescription>
                {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Approver</TableHead>
                    <TableHead>CC</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : filteredRequests.map((request) => (
                    <TableRow key={request.id} className="border-border">
                      <TableCell className="font-medium">{request.employee.fullName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: getLeaveTypeColor(request.leaveTypeId) }}
                          />
                          {request.leaveType.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.startDate).toLocaleDateString()} -{" "}
                        {new Date(request.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{request.totalDays}</TableCell>
                      <TableCell>{request.totalDays}</TableCell>
                      <TableCell>{request.totalDays}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRequest(request)
                              setActionType("view")
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        {request.status === "pending" && (
                          <div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:text-primary"
                              onClick={() => {
                                setSelectedRequest(request)
                                setActionType("approve")
                              }}
                            />
                            {request.leaveType.name}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && filteredRequests.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No leave requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* View/Approve/Reject Dialog */}
        <Dialog
          open={!!selectedRequest}
          onOpenChange={() => {
            setSelectedRequest(null);
            setActionType(null);
            setRejectReason("");
          }}
        >
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                {actionType === "view" && "Leave Request Details"}
                {actionType === "approve" && "Approve Leave Request"}
                {actionType === "reject" && "Reject Leave Request"}
              </DialogTitle>
              <DialogDescription>
                {selectedRequest?.employee.fullName} -{" "}
                {selectedRequest?.leaveType.name}
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Start Date</Label>
                    <p className="font-medium">
                      {new Date(selectedRequest.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">End Date</Label>
                    <p className="font-medium">
                      {new Date(selectedRequest.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Days</Label>
                    <p className="font-medium">
                      {selectedRequest.totalDays} days
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <p>{getStatusBadge(selectedRequest.status)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <p className="font-medium">{selectedRequest.reason}</p>
                </div>

                {/* <div>
                <Label className="text-muted-foreground">Approvers</Label>
                <div className="space-y-2 mt-1">
                  {selectedRequest.approvers && selectedRequest.approvers.length > 0 ? selectedRequest.approvers.map((approver, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md border border-border p-2">
                      <span>{approver.employeeName}</span>
                      <Badge
                        variant={
                          approver.status === "approved"
                            ? "default"
                            : approver.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {approver.status}
                      </Badge>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">No approvers recorded.</p>
                  )}
                </div>
              </div> */}

                {actionType === "reject" && (
                  <div>
                    <Label htmlFor="reject-reason">Rejection Reason *</Label>
                    <Textarea
                      id="reject-reason"
                      placeholder="Please provide a reason for rejection..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-1 bg-input border-border"
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              {actionType === "view" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </Button>
              )}
              {actionType === "approve" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApprove}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Approve Request
                  </Button>
                </>
              )}
              {actionType === "reject" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectReason}
                  >
                    Reject Request
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main >
    </>
  );
}
