"use client";

import { useState } from "react";
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
import { Progress } from "@/modules/core/components/ui/progress";
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
  Download,
  Clock,
  TrendingUp,
  Users,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

export default function AttendanceReportsPage() {
  const { attendanceRecords, employees, organizationalUnits, currentRole } =
    useStore();
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<string>("all");

  if (currentRole !== "admin" && currentRole !== "hr") {
    return (
      <>
        <PageHeader title="Attendance Reports" subtitle="Access restricted" />
        <main className="p-4 md:p-6">
          <Card className="bg-card border-border">
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">
                  Access Restricted
                </h3>
                <p className="text-muted-foreground">
                  Attendance reports are only available for HR Department and
                  Administrators.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  // Calculate monthly stats
  const monthRecords = attendanceRecords.filter((r) =>
    r.date.startsWith(selectedMonth),
  );

  const filteredEmployees = employees.filter(
    (e) =>
      selectedOrgUnit === "all" || e.organizationalUnitId === selectedOrgUnit,
  );

  // Generate employee summary
  const employeeSummary = filteredEmployees.map((employee) => {
    const empRecords = monthRecords.filter((r) => r.employeeId === employee.id);
    const presentDays = empRecords.filter(
      (r) => r.status === "present" || r.status === "late",
    ).length;
    const lateDays = empRecords.filter((r) => r.status === "late").length;
    const absentDays = empRecords.filter((r) => r.status === "absent").length;
    const leaveDays = empRecords.filter((r) => r.status === "on_leave").length;
    const totalHours = empRecords.reduce(
      (sum, r) => sum + (r.totalHours || 0),
      0,
    );
    const overtimeHours = empRecords.reduce(
      (sum, r) => sum + (r.overtime || 0),
      0,
    );

    return {
      employee,
      presentDays,
      lateDays,
      absentDays,
      leaveDays,
      totalHours,
      overtimeHours,
      attendanceRate:
        presentDays > 0
          ? Math.round((presentDays / (presentDays + absentDays || 1)) * 100)
          : 0,
    };
  });

  // Overall stats
  const totalPresent = employeeSummary.reduce(
    (sum, e) => sum + e.presentDays,
    0,
  );
  const totalLate = employeeSummary.reduce((sum, e) => sum + e.lateDays, 0);
  const totalAbsent = employeeSummary.reduce((sum, e) => sum + e.absentDays, 0);
  const totalHours = employeeSummary.reduce((sum, e) => sum + e.totalHours, 0);
  const totalOvertime = employeeSummary.reduce(
    (sum, e) => sum + e.overtimeHours,
    0,
  );
  const avgAttendanceRate = Math.round(
    employeeSummary.reduce((sum, e) => sum + e.attendanceRate, 0) /
      (employeeSummary.length || 1),
  );

  const months = [
    { value: "2026-01", label: "January 2026" },
    { value: "2025-12", label: "December 2025" },
    { value: "2025-11", label: "November 2025" },
  ];

  const departmentUnits = organizationalUnits.filter(
    (u) => u.unitType === "department",
  );

  return (
    <>
      <PageHeader
        title="Attendance Reports"
        subtitle="Analyze attendance patterns and generate reports"
      />
      <main className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Filters */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedMonth}
                    onValueChange={setSelectedMonth}
                  >
                    <SelectTrigger className="w-[180px] bg-input border-border">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedOrgUnit}
                    onValueChange={setSelectedOrgUnit}
                  >
                    <SelectTrigger className="w-[180px] bg-input border-border">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departmentUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employees
                </CardDescription>
                <CardTitle className="text-2xl">
                  {filteredEmployees.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Attendance Rate
                </CardDescription>
                <CardTitle className="text-2xl text-success">
                  {avgAttendanceRate}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Present Days</CardDescription>
                <CardTitle className="text-2xl">{totalPresent}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Late Days
                </CardDescription>
                <CardTitle className="text-2xl text-warning">
                  {totalLate}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Total Hours</CardDescription>
                <CardTitle className="text-2xl">
                  {totalHours.toFixed(1)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Overtime
                </CardDescription>
                <CardTitle className="text-2xl text-primary">
                  {totalOvertime.toFixed(1)}h
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Employee Summary Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Employee Attendance Summary</CardTitle>
              <CardDescription>Monthly breakdown by employee</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Leave</TableHead>
                    <TableHead className="text-center">Hours</TableHead>
                    <TableHead className="text-center">OT</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeSummary.map((summary) => (
                    <TableRow
                      key={summary.employee.id}
                      className="border-border"
                    >
                      <TableCell className="font-medium">
                        {summary.employee.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {summary.employee.organizationalUnitName}
                      </TableCell>
                      <TableCell className="text-center">
                        {summary.presentDays}
                      </TableCell>
                      <TableCell className="text-center">
                        {summary.lateDays > 0 ? (
                          <span className="text-warning">
                            {summary.lateDays}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {summary.absentDays > 0 ? (
                          <span className="text-destructive">
                            {summary.absentDays}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {summary.leaveDays}
                      </TableCell>
                      <TableCell className="text-center">
                        {summary.totalHours.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        {summary.overtimeHours > 0 ? (
                          <Badge variant="secondary">
                            {summary.overtimeHours.toFixed(1)}h
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={summary.attendanceRate}
                            className="h-2 w-16"
                          />
                          <span className="text-sm">
                            {summary.attendanceRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
