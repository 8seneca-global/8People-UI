"use client";

import { PageHeader } from "@/modules/core/components/layout/page-header";
import { useStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Badge } from "@/modules/core/components/ui/badge";
import { Progress } from "@/modules/core/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/core/components/ui/table";
import { Button } from "@/modules/core/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/modules/core/components/ui/dialog";
import { leaveHistory } from "@/lib/mock-data";
import {
  Calendar,
  Clock,
  User,
  FileText,
  X,
  Check,
  History,
  LucideEye,
} from "lucide-react";
import { useLeaveBalance, useLeaveTypes } from "@/modules/leaves/api/mutations";

export default function LeaveBalancesPage() {
  const { employees, currentRole } = useStore()
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const prevYear = currentYear - 1
  const { data: leaveTypes = [] } = useLeaveTypes()
  const { data: leaveBalances = [] } = useLeaveBalance(currentYear);

  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const canViewAllBalances = currentRole === "admin" || currentRole === "hr"

  // For demo, using employee ID 2 (simulating logged-in employee)
  const currentEmployeeId = "662f9c21-6459-42d4-b961-7b9e1553fe49"

  const enrichedBalances = leaveBalances.map((balance) => {
    return {
      ...balance,
      employeeName: balance.employee.fullName || "Unknown",
      department: balance.employee.organizationalUnitId || "Unknown",
    }
  })

  const annualLeaveType = leaveTypes.find((t) => t.name === "Annual Leave")

  const selectedEmployeeHistory = selectedEmployeeId
    ? leaveHistory
      .filter((h) => h.employeeId === selectedEmployeeId)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      )
    : [];
  const selectedEmployee = selectedEmployeeId
    ? leaveBalances.find((b) => b.employeeId === selectedEmployeeId)
    : null;

  const handleViewHistory = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setHistoryDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <X className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!canViewAllBalances) {
    // Show individual employee view
    const myBalances = enrichedBalances.filter(
      (b) => b.employeeId === currentEmployeeId,
    );
    const currentEmployee = employees.find((e) => e.id === currentEmployeeId);
    const myHistory = leaveHistory
      .filter((h) => h.employeeId === currentEmployeeId)
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );

    return (
      <>
        <PageHeader
          title="My Leave Balance"
          subtitle="View your annual leave balance"
        />
        <main className="p-4 md:p-6">
          <div className="space-y-6">
            {/* My Balance Card */}
            {annualLeaveType && (
              <Card className="bg-card border-border max-w-md">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardDescription>{annualLeaveType.name}</CardDescription>
                    <div
                      className={cn("h-2 w-2 rounded-full")}
                      style={{ backgroundColor: annualLeaveType.color }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentEmployee?.organizationalUnitName}
                  </p>
                </CardHeader>
                <CardContent>
                  {myBalances.map((balance) => {
                    const usedPercent =
                      (balance.used / balance.totalEntitlement) * 100;
                    return (
                      <div key={balance.leaveTypeId}>
                        <div className="text-4xl font-bold text-card-foreground">
                          {balance.available}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          days available
                        </p>
                        <Progress value={usedPercent} className="h-2 mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{balance.used} used</span>
                          <span>{balance.totalEntitlement} total</span>
                        </div>
                        {balance.pending > 0 && (
                          <Badge variant="secondary" className="mt-2">
                            {balance.pending} days pending approval
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full bg-transparent"
                          onClick={() => handleViewHistory(currentEmployeeId)}
                        >
                          <History className="h-4 w-4 mr-2" />
                          View Leave History
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Leave History Section for Employee */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Leave History</CardTitle>
                <CardDescription>Your past leave requests</CardDescription>
              </CardHeader>
              <CardContent>
                {myHistory.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No leave history found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start justify-between p-3 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {entry.leaveTypeName}
                            </span>
                            {getStatusBadge(entry.status)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(entry.startDate)} -{" "}
                              {formatDate(entry.endDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {entry.totalDays} day
                              {entry.totalDays !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {entry.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Leave History
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Days Used
                    </p>
                    <p className="font-medium text-lg">
                      {myHistory
                        .filter((h) => h.status === "approved")
                        .reduce((sum, h) => sum + h.totalDays, 0)}{" "}
                      days
                    </p>
                  </div>
                </div>

                {/* History List */}
                {myHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No leave history found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor:
                                  entry.leaveTypeId === "lt-1"
                                    ? "#3B82F6"
                                    : "#9CA3AF",
                              }}
                            />
                            <span className="font-medium">
                              {entry.leaveTypeName}
                            </span>
                          </div>
                          {getStatusBadge(entry.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-medium">
                              {formatDate(entry.startDate)} -{" "}
                              {formatDate(entry.endDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Days</p>
                            <p className="font-medium">
                              {entry.totalDays} day
                              {entry.totalDays !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="text-sm mb-2">
                          <p className="text-muted-foreground">Reason</p>
                          <p>{entry.reason}</p>
                        </div>

                        {entry.status === "approved" && (
                          <div className="text-xs text-muted-foreground">
                            Approved by {entry.approvedBy} on{" "}
                            {formatDate(entry.approvedAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Leave Balances"
        subtitle="Overview of all employee leave balances"
      />
      <main className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Balance Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Employee Leave Balances - {currentYear} </CardTitle>
              <CardDescription>
                Carry forward from {prevYear} expires on June 30, {currentYear}{" "}
                (max 5 days). Holiday leaves are not counted as annual leave.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-center">Employee</TableHead>
                    <TableHead className="text-center">
                      {prevYear} Unused
                      <div className="text-gray-500">Leave</div>
                    </TableHead>
                    <TableHead className="text-center">
                      {prevYear} Leave Balance
                      <div className="text-gray-500">to use by June 30</div>
                    </TableHead>
                    <TableHead className="text-center">
                      {currentYear} Annual Leave
                      <div className="text-gray-500">Entitlement</div>
                    </TableHead>
                    <TableHead className="text-center">
                      Total Used
                      <div className="text-gray-500">{currentYear}</div>
                    </TableHead>
                    <TableHead className="text-center">
                      {currentYear} Balance
                      <div className="text-gray-500">Entitlement - Used</div>
                    </TableHead>
                    <TableHead className="text-center">
                      Detail
                      <div className="text-gray-500">
                        {prevYear} + {currentYear}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      Carry Forward
                      <div className="text-gray-500">
                        to {currentYear + 1} (max 5)
                      </div>
                    </TableHead>
                    {/* <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className={cn("h-2 w-2 rounded-full")} style={{ backgroundColor: annualLeaveType?.color }} />
                      Annual Leave
                    </div>
                  </TableHead> */}
                    {/* <TableHead className="text-center">Action</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveBalances.map((balance) => {
                    return (
                      <TableRow
                        key={balance.id}
                        className="border-border text-center"
                      >
                        <TableCell className="font-medium">
                          {balance.employee.fullName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {balance.used}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {balance.used}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {balance.used}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {balance.used}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {balance.used}
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() =>
                              handleViewHistory(balance.employee.id)
                            }
                          >
                            <LucideEye className="h-4 w-4 mr-1" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          {balance ? (
                            <div className="flex flex-col items-center p-2">
                              <span className="font-medium">
                                {balance.used}/{balance.totalEntitlement}
                              </span>
                              <Progress
                                value={
                                  (balance.used / balance.totalEntitlement) *
                                  100
                                }
                                className="h-1 w-16 mt-1"
                              />
                              {balance.pending > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs mt-1"
                                >
                                  {balance.pending} pending
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-center">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {balance.carryForward}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Leave History - {selectedEmployee?.employee.fullName}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Summary */}
              {selectedEmployeeId && (
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">
                      {selectedEmployee?.employee.organizationalUnitId}
                    </p>
                  </div>
                  <div className="border-l border-border pl-4">
                    <p className="text-sm text-muted-foreground">
                      Total Days Used
                    </p>
                    <p className="font-medium">
                      {selectedEmployeeHistory
                        .filter(
                          (h) =>
                            h.status === "approved" && h.leaveTypeId === "lt-1",
                        )
                        .reduce((sum, h) => sum + h.totalDays, 0)}{" "}
                      days
                    </p>
                  </div>
                </div>
              )}

              {/* History List */}
              {selectedEmployeeHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No leave history found for this employee.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEmployeeHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor:
                                entry.leaveTypeId === "lt-1"
                                  ? "#3B82F6"
                                  : "#9CA3AF",
                            }}
                          />
                          <span className="font-medium">
                            {entry.leaveTypeName}
                          </span>
                        </div>
                        {getStatusBadge(entry.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">
                            {formatDate(entry.startDate)} -{" "}
                            {formatDate(entry.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Days</p>
                          <p className="font-medium">
                            {entry.totalDays} day
                            {entry.totalDays !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm mb-2">
                        <p className="text-muted-foreground">Reason</p>
                        <p>{entry.reason}</p>
                      </div>

                      {entry.status === "approved" && (
                        <div className="text-xs text-muted-foreground">
                          Approved by {entry.approvedBy} on{" "}
                          {formatDate(entry.approvedAt)}
                        </div>
                      )}

                      {entry.notes && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          Note: {entry.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  )
}
