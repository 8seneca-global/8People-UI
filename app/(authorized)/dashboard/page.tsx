"use client";

import { useState } from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { StatCard } from "@/modules/dashboard/components/stat-card";
import { QuickActions } from "@/modules/dashboard/components/quick-actions";
import { OrgTreePreview } from "@/modules/dashboard/components/org-tree-preview";
import { AddEmployeeModal } from "@/modules/employees/components/add-employee-modal";
import { useStore } from "@/lib/store";
import {
  Users,
  UserPlus,
  Briefcase,
  Calendar,
  Bell,
  CalendarDays,
  UserSearch,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Badge } from "@/modules/core/components/ui/badge";
import { Button } from "@/modules/core/components/ui/button";
import { Progress } from "@/modules/core/components/ui/progress";
import Link from "next/link";

function AdminDashboard() {
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const {
    employees,
    organizationalUnits,
    positions,
    leaveRequests,
    attendanceRecords,
    jobRequisitions,
    candidates,
    notifications,
  } = useStore();

  const pendingCount = employees.filter((e) => e.status === "pending").length;
  const activeCount = employees.filter((e) => e.status === "active").length;
  const pendingLeaves = leaveRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const openJobs = jobRequisitions.filter((j) => j.status === "open").length;
  const newCandidates = candidates.filter((c) => c.stage === "new").length;
  const vacantPositions = positions.filter(
    (p) => p.hiringStatus === "vacant" || p.hiringStatus === "hiring",
  ).length;

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendanceRecords.filter((r) => r.date === today);
  const presentToday = todayAttendance.filter(
    (r) => r.status === "present" || r.status === "late",
  ).length;

  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={employees.length}
            description={`${activeCount} active, ${pendingCount} pending`}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Present Today"
            value={presentToday}
            description={`of ${activeCount} employees`}
            icon={Clock}
          />
          <StatCard
            title="Pending Leaves"
            value={pendingLeaves}
            description="Awaiting approval"
            icon={CalendarDays}
            trend={
              pendingLeaves > 0
                ? { value: pendingLeaves, isPositive: false }
                : undefined
            }
          />
          <StatCard
            title="Vacant Positions"
            value={vacantPositions}
            description={`${newCandidates} new candidates`}
            icon={Briefcase}
          />
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <OrgTreePreview />

            {/* Pending Leave Requests */}
            {pendingLeaves > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-warning" />
                        Pending Leave Requests
                      </CardTitle>
                      <CardDescription>
                        {pendingLeaves} requests need your attention
                      </CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/leave/requests">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaveRequests
                      .filter((r) => r.status === "pending")
                      .slice(0, 3)
                      .map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {request.employeeName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.leaveTypeName} - {request.totalDays} days
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">
                              {new Date(request.startDate).toLocaleDateString()}
                            </p>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recruitment Pipeline */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recruitment Pipeline</CardTitle>
                    <CardDescription>Active hiring progress</CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/recruitment/candidates">View Pipeline</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    {
                      label: "New",
                      count: candidates.filter((c) => c.stage === "new").length,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Screening",
                      count: candidates.filter((c) => c.stage === "screening")
                        .length,
                      color: "bg-purple-500",
                    },
                    {
                      label: "Interview",
                      count: candidates.filter(
                        (c) => c.stage === "interviewing",
                      ).length,
                      color: "bg-yellow-500",
                    },
                    {
                      label: "Offering",
                      count: candidates.filter((c) => c.stage === "offering")
                        .length,
                      color: "bg-cyan-500",
                    },
                    {
                      label: "Hired",
                      count: candidates.filter((c) => c.stage === "hired")
                        .length,
                      color: "bg-green-500",
                    },
                  ].map((stage) => (
                    <div key={stage.label} className="text-center">
                      <div
                        className={`${stage.color} text-primary-foreground rounded-md py-2 text-xl font-bold`}
                      >
                        {stage.count}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stage.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <QuickActions onAddEmployee={() => setAddEmployeeOpen(true)} />

            {/* Today's Attendance Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Present</span>
                  <span className="font-medium text-success">
                    {presentToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Late</span>
                  <span className="font-medium text-warning">
                    {todayAttendance.filter((r) => r.status === "late").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">On Leave</span>
                  <span className="font-medium">
                    {
                      todayAttendance.filter((r) => r.status === "on_leave")
                        .length
                    }
                  </span>
                </div>
                <Progress
                  value={(presentToday / activeCount) * 100}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round((presentToday / activeCount) * 100) || 0}%
                  attendance rate
                </p>
              </CardContent>
            </Card>

            {/* Notifications Preview */}
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </CardTitle>
                    <Badge>
                      {notifications.filter((n) => !n.isRead).length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {notifications
                      .filter((n) => !n.isRead)
                      .slice(0, 3)
                      .map((notif) => (
                        <div
                          key={notif.id}
                          className="text-sm rounded-md bg-secondary/50 p-2"
                        >
                          <p className="font-medium">{notif.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {notif.message}
                          </p>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="link"
                    className="w-full mt-2 text-primary"
                    asChild
                  >
                    <Link href="/notifications">View all notifications</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AddEmployeeModal
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
      />
    </>
  );
}

function HRDashboard() {
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const {
    employees,
    organizationalUnits,
    positions,
    leaveRequests,
    leaveBalances,
    attendanceRecords,
    candidates,
    jobRequisitions,
  } = useStore();

  const pendingCount = employees.filter((e) => e.status === "pending").length;
  const activeCount = employees.filter((e) => e.status === "active").length;
  const thisMonthOnboarding = employees.filter((e) => {
    if (!e.startDate) return false;
    const start = new Date(e.startDate);
    const now = new Date();
    return (
      start.getMonth() === now.getMonth() &&
      start.getFullYear() === now.getFullYear()
    );
  }).length;

  const pendingLeaves = leaveRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const newCandidates = candidates.filter(
    (c) => c.stage === "new" || c.stage === "screening",
  ).length;

  const getInitials = (name: string | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <>
      <div className="space-y-6">
        {/* HR Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Employees"
            value={activeCount}
            description="Currently employed"
            icon={Users}
          />
          <StatCard
            title="Pending Onboarding"
            value={pendingCount}
            description="Awaiting completion"
            icon={UserPlus}
            trend={{ value: 3, isPositive: false }}
          />
          <StatCard
            title="Leave Requests"
            value={pendingLeaves}
            description="Needs approval"
            icon={CalendarDays}
          />
          <StatCard
            title="New Candidates"
            value={newCandidates}
            description="In pipeline"
            icon={UserSearch}
          />
        </div>

        {/* HR Specific Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Onboarding Progress */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Onboarding Progress
                </CardTitle>
                <CardDescription>
                  Track new employees completing onboarding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {employees
                  .filter((e) => e.status === "pending")
                  .slice(0, 4)
                  .map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-4 rounded-lg border border-border p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                        <span className="text-sm font-medium text-primary">
                          {getInitials(emp.fullName)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">
                          {emp.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {emp.positionTitle || "No title"} -{" "}
                          {emp.organizationalUnitName || "No unit"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className="bg-warning/20 text-warning border-warning/30"
                        >
                          In Progress
                        </Badge>
                      </div>
                    </div>
                  ))}
                {employees.filter((e) => e.status === "pending").length ===
                  0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No pending onboarding
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pending Leave Requests */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pending Leave Requests</CardTitle>
                    <CardDescription>
                      Requests awaiting your approval
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href="/leave/requests">Manage</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaveRequests
                    .filter((r) => r.status === "pending")
                    .slice(0, 4)
                    .map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-md border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20">
                            <CalendarDays className="h-4 w-4 text-warning" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {request.employeeName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.leaveTypeName} - {request.totalDays} days
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    ))}
                  {leaveRequests.filter((r) => r.status === "pending")
                    .length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No pending requests
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <QuickActions onAddEmployee={() => setAddEmployeeOpen(true)} />

            {/* Open Positions Summary - Updated for O-S-C-P */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Open Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobRequisitions
                  .filter((j) => j.status === "open")
                  .slice(0, 3)
                  .map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.organizationalUnitName}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {job.openings - job.hired} open
                      </Badge>
                    </div>
                  ))}
                <Button
                  variant="link"
                  className="w-full text-primary p-0"
                  asChild
                >
                  <Link href="/recruitment/jobs">View all positions</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddEmployeeModal
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
      />
    </>
  );
}

function EmployeeDashboard() {
  const {
    leaveBalances,
    leaveRequests,
    attendanceRecords,
    leaveTypes,
    notifications,
    employees,
  } = useStore();

  // For demo, using the first active employee
  const currentEmployee =
    employees.find((e) => e.status === "active") || employees[0];
  const currentEmployeeId = currentEmployee?.id || "P-001";

  const myBalances = leaveBalances.filter(
    (b) => b.employeeId === currentEmployeeId,
  );
  const myRequests = leaveRequests.filter(
    (r) => r.employeeId === currentEmployeeId,
  );
  const pendingRequests = myRequests.filter(
    (r) => r.status === "pending",
  ).length;

  const today = new Date().toISOString().split("T")[0];
  const todayRecord = attendanceRecords.find(
    (r) => r.employeeId === currentEmployeeId && r.date === today,
  );

  const annualLeave = myBalances.find((b) => b.leaveTypeId === "lt-1");

  const upcomingEvents = [
    { title: "Team Meeting", date: "Today, 2:00 PM", type: "meeting" },
    { title: "Performance Review", date: "Jan 15, 2026", type: "review" },
    { title: "Company All-Hands", date: "Jan 20, 2026", type: "event" },
  ];

  const recentAnnouncements = [
    { title: "Holiday Schedule 2026", date: "Jan 5, 2026" },
    { title: "New Health Benefits", date: "Jan 3, 2026" },
    { title: "Office Closure Notice", date: "Dec 28, 2025" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                Welcome back, {currentEmployee?.firstName || "User"}!
              </h2>
              <p className="text-muted-foreground mt-1">
                {currentEmployee?.positionTitle} -{" "}
                {currentEmployee?.organizationalUnitName}
              </p>
            </div>
            <Button asChild>
              <Link href="/my-profile">View My Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Days at Company"
          value={
            currentEmployee?.startDate
              ? Math.floor(
                  (new Date().getTime() -
                    new Date(currentEmployee.startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                )
              : 0
          }
          description={
            currentEmployee?.startDate
              ? `Since ${new Date(currentEmployee.startDate).toLocaleDateString()}`
              : ""
          }
          icon={Calendar}
        />
        <StatCard
          title="Leave Remaining"
          value={annualLeave?.available || 0}
          description={`of ${annualLeave?.totalEntitlement || 0} days`}
          icon={CalendarDays}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          description="Leave requests"
          icon={Clock}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Balance Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">
                    Leave Balance
                  </CardTitle>
                  <CardDescription>
                    Your remaining leave days for 2026
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/leave/my-requests">Request Leave</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {myBalances.slice(0, 3).map((balance) => {
                  const leaveType = leaveTypes.find(
                    (t) => t.id === balance.leaveTypeId,
                  );
                  return (
                    <div
                      key={balance.leaveTypeId}
                      className="text-center p-3 rounded-lg bg-secondary/50"
                    >
                      <p className="text-2xl font-bold">{balance.available}</p>
                      <p className="text-xs text-muted-foreground">
                        {leaveType?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {balance.used} used of {balance.totalEntitlement}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* My Pending Requests */}
          {pendingRequests > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {myRequests
                    .filter((r) => r.status === "pending")
                    .map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-md border border-border p-3"
                      >
                        <div>
                          <p className="font-medium">{request.leaveTypeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">Awaiting Approval</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">
                Upcoming Events
              </CardTitle>
              <CardDescription>Your schedule and deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.date}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentAnnouncements.map((announcement, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <p className="text-sm font-medium text-card-foreground">
                    {announcement.title}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {announcement.date}
                  </span>
                </div>
              ))}
              <Button
                variant="link"
                className="w-full text-primary p-0 h-auto mt-2"
              >
                View all announcements
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentRole } = useStore();

  const getDashboardTitle = () => {
    switch (currentRole) {
      case "admin":
        return {
          title: "Admin Dashboard",
          subtitle: "System overview and management",
        };
      case "hr":
        return {
          title: "HR Dashboard",
          subtitle: "Employee and onboarding management",
        };
      case "employee":
        return { title: "My Dashboard", subtitle: "Your personal workspace" };
      default:
        return { title: "Dashboard", subtitle: "Welcome back" };
    }
  };

  const { title, subtitle } = getDashboardTitle();

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <main className="p-4 md:p-6">
        {currentRole === "admin" && <AdminDashboard />}
        {currentRole === "hr" && <HRDashboard />}
        {currentRole === "employee" && <EmployeeDashboard />}
      </main>
    </>
  );
}
