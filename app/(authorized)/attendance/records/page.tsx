"use client";

import type React from "react";

import { useState, useRef } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/core/components/ui/tabs";
import {
  Search,
  Filter,
  Fingerprint,
  Upload,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import type { AttendanceRecord } from "@/lib/mock-data";

export default function AttendanceRecordsPage() {
  const { attendanceRecords, employees, currentRole } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canViewAllRecords = currentRole === "admin" || currentRole === "hr";

  // For demo, using employee ID P-011 (simulating logged-in employee)
  const currentEmployeeId = "P-011";
  const currentEmployee = employees.find((e) => e.id === currentEmployeeId);

  const baseRecords = canViewAllRecords
    ? attendanceRecords
    : attendanceRecords.filter((r) => r.employeeId === currentEmployeeId);

  const filteredRecords = baseRecords.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || record.status === statusFilter;
    const matchesDate = !dateFilter || record.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    const variants: Record<
      AttendanceRecord["status"],
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      present: { variant: "default", label: "Present" },
      late: { variant: "secondary", label: "Late" },
      early_leave: { variant: "secondary", label: "Early Leave" },
      absent: { variant: "destructive", label: "Absent" },
      on_leave: { variant: "outline", label: "On Leave" },
      weekend: { variant: "outline", label: "Weekend" },
      holiday: { variant: "outline", label: "Holiday" },
      not_checked_in: { variant: "outline", label: "Not Checked In" },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(file.name);
    setUploadSuccess(null);
    setUploadError(null);

    // Simulate file processing
    setTimeout(() => {
      // Validate file type (CSV, XLSX, JSON, or TXT)
      const validTypes = [
        "text/csv",
        "application/json",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      const isValidType =
        validTypes.includes(file.type) ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".txt");

      if (!isValidType) {
        setUploadError(
          "Invalid file format. Please upload CSV, XLSX, JSON, or TXT files from your fingerprint machine.",
        );
        setUploadingFile(null);
        return;
      }

      // Simulate successful upload
      setUploadSuccess(
        `File "${file.name}" uploaded successfully. Syncing ${Math.floor(Math.random() * 500) + 50} attendance records...`,
      );
      setUploadingFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear success message after 5 seconds
      setTimeout(() => setUploadSuccess(null), 5000);
    }, 1500);
  };

  const today = new Date().toISOString().split("T")[0];
  const todayRecords = baseRecords.filter((r) => r.date === today);
  const presentCount = todayRecords.filter(
    (r) => r.status === "present",
  ).length;
  const lateCount = todayRecords.filter((r) => r.status === "late").length;
  const absentCount = canViewAllRecords
    ? employees.length - todayRecords.length
    : 0;

  return (
    <>
      <PageHeader
        title={canViewAllRecords ? "Attendance Management" : "My Attendance"}
        subtitle={
          canViewAllRecords
            ? "Monitor real-time attendance and view historical records"
            : "View your attendance history"
        }
      />
      <main className="p-4 md:p-6">
        <div className="space-y-6">
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="py-3">
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <Fingerprint className="h-4 w-4" />
                <span>
                  Attendance data is automatically synced from the fingerprint
                  check-in/check-out machine
                </span>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="history" className="w-full">
            <TabsList>
              <TabsTrigger value="history">Attendance History</TabsTrigger>
              {canViewAllRecords && (
                <TabsTrigger value="import">Import Data</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="history" className="space-y-6">
              {/* Stats Cards - Only show for HR/Admin */}
              {canViewAllRecords && (
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardDescription>Present Today</CardDescription>
                      <CardTitle className="text-2xl text-success">
                        {presentCount}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardDescription>Late Today</CardDescription>
                      <CardTitle className="text-2xl text-warning">
                        {lateCount}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardDescription>Not Checked In</CardDescription>
                      <CardTitle className="text-2xl text-destructive">
                        {absentCount}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardDescription>Total Records</CardDescription>
                      <CardTitle className="text-2xl">
                        {baseRecords.length}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              )}

              {/* Filters */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-center gap-4">
                      {canViewAllRecords && (
                        <div className="relative flex-1 max-w-sm">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search by employee name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-input border-border"
                          />
                        </div>
                      )}
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-[180px] bg-input border-border"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-[150px] bg-input border-border">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="early_leave">
                            Early Leave
                          </SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="not_checked_in">
                            Not Checked In
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Records Table */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    View detailed attendance history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {canViewAllRecords && <TableHead>Employee</TableHead>}
                          <TableHead>Date</TableHead>
                          <TableHead>Clock In</TableHead>
                          <TableHead>Clock Out</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record) => (
                            <TableRow key={record.id}>
                              {canViewAllRecords && (
                                <TableCell className="font-medium">
                                  {record.employeeName}
                                </TableCell>
                              )}
                              <TableCell>
                                {new Date(record.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{record.clockIn || "-"}</TableCell>
                              <TableCell>{record.clockOut || "-"}</TableCell>
                              <TableCell>
                                {record.totalHours
                                  ? `${record.totalHours.toFixed(2)}h`
                                  : "-"}
                                {record.overtime && (
                                  <span className="text-xs text-success ml-1">
                                    (+{record.overtime}h OT)
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(record.status)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={canViewAllRecords ? 6 : 5}
                              className="text-center py-8"
                            >
                              <p className="text-muted-foreground">
                                No records found
                              </p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {canViewAllRecords && (
              <TabsContent value="import" className="space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Import Fingerprint Data
                    </CardTitle>
                    <CardDescription>
                      Upload attendance file from your fingerprint machine
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {uploadError && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-destructive">
                            {uploadError}
                          </p>
                        </div>
                        <button
                          onClick={() => setUploadError(null)}
                          className="text-destructive/70 hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {uploadSuccess && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/30">
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        <p className="text-sm text-success">{uploadSuccess}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.json,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="fingerprint-file-upload"
                        disabled={uploadingFile !== null}
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile !== null}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingFile
                          ? `Uploading ${uploadingFile}...`
                          : "Upload Attendance File"}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        CSV, XLSX, JSON, or TXT format
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 p-3 bg-secondary/30 rounded-lg">
                      <p className="font-medium text-foreground/80">
                        Supported formats:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>
                          CSV: employee_id, date, check_in_time, check_out_time
                        </li>
                        <li>XLSX: Same column structure as CSV</li>
                        <li>JSON: Array of objects with attendance records</li>
                        <li>TXT: Tab or comma-separated values</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </>
  );
}
