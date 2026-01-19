"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { Check, X, Send, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

export default function OnboardingPage() {
  const { employees, updateEmployee } = useStore()

  const handleResendInvite = (employeeId: string) => {
    updateEmployee(employeeId, {
      onboardingStatus: {
        emailSent: true,
        accountActivated: false,
        profileCompleted: false,
      },
    })
  }

  const handleSendInvite = (employeeId: string) => {
    updateEmployee(employeeId, {
      onboardingStatus: {
        emailSent: true,
        accountActivated: false,
        profileCompleted: false,
      },
    })
  }

  const StatusIcon = ({ completed }: { completed: boolean }) => (
    <div
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full",
        completed ? "bg-success/20" : "bg-secondary",
      )}
    >
      {completed ? <Check className="h-3.5 w-3.5 text-success" /> : <X className="h-3.5 w-3.5 text-muted-foreground" />}
    </div>
  )

  const pendingEmployees = employees.filter((e) => e.status === "pending")
  const activeEmployees = employees.filter((e) => e.status === "active")

  return (
    <AdminLayout title="Onboarding" subtitle="Track employee onboarding progress">
      <div className="space-y-6">
        {pendingEmployees.length > 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="h-5 w-5 text-primary" />
              <h3 className="font-medium">New Hires Pending Onboarding</h3>
              <Badge variant="secondary">{pendingEmployees.length}</Badge>
            </div>
            <div className="space-y-2">
              {pendingEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card p-3"
                >
                  <div>
                    <p className="font-medium">{employee.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {employee.positionTitle} - {employee.organizationalUnitName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{employee.companyEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!employee.onboardingStatus.emailSent ? (
                      <Button size="sm" onClick={() => handleSendInvite(employee.id)} className="gap-2">
                        <Send className="h-4 w-4" />
                        Send Invite
                      </Button>
                    ) : (
                      <Badge className="bg-blue-500/20 text-blue-500">Invite Sent</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Employee</TableHead>
                <TableHead className="text-muted-foreground">Department</TableHead>
                <TableHead className="text-muted-foreground text-center">Email Sent</TableHead>
                <TableHead className="text-muted-foreground text-center">Account Activated</TableHead>
                <TableHead className="text-muted-foreground text-center">Profile Completed</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="border-border">
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-card-foreground">{employee.fullName}</p>
                        {employee.status === "pending" && (
                          <Badge variant="outline" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">{employee.companyEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-card-foreground">{employee.organizationalUnitName}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <StatusIcon completed={employee.onboardingStatus.emailSent} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <StatusIcon completed={employee.onboardingStatus.accountActivated} />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <StatusIcon completed={employee.onboardingStatus.profileCompleted} />
                    </div>
                  </TableCell>
                  <TableCell>
                    {!employee.onboardingStatus.profileCompleted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResendInvite(employee.id)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {employee.onboardingStatus.emailSent ? "Resend Invite" : "Send Invite"}
                      </Button>
                    )}
                    {employee.onboardingStatus.profileCompleted && (
                      <Badge className="bg-success/20 text-success hover:bg-success/30">Completed</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  )
}
