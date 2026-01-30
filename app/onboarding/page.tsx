"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useStore } from "@/lib/store"
import {
  CheckCircle2,
  Circle,
  FileText,
  User,
  Building2,
  Calendar,
  Clock,
  BookOpen,
  Users,
  MessageSquare,
  AlertCircle,
} from "lucide-react"

export default function OnboardingDashboardPage() {
  const router = useRouter()
  const { simulationMode } = useStore()

  // Redirect if not in simulation mode
  useEffect(() => {
    if (simulationMode !== 'onboarding') {
      router.push("/")
    }
  }, [simulationMode, router])

  // Mock onboarding checklist
  const checklistItems = [
    { id: 1, title: "Complete Profile Information", completed: false, icon: User },
    { id: 2, title: "Review Company Policies", completed: false, icon: FileText },
    { id: 3, title: "Set Up Workspace Access", completed: false, icon: Building2 },
    { id: 4, title: "Schedule 1-on-1 with Manager", completed: false, icon: Calendar },
    { id: 5, title: "Complete Required Training", completed: false, icon: BookOpen },
    { id: 6, title: "Meet Your Team", completed: false, icon: Users },
  ]

  const completedCount = checklistItems.filter(item => item.completed).length
  const progressPercentage = (completedCount / checklistItems.length) * 100

  return (
    <AdminLayout title="Onboarding Dashboard" subtitle="Welcome to 8People!" icon={Building2}>
      <div className="space-y-6">
        {/* Simulation Mode Alert */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Simulation Mode Active</h3>
              <p className="text-sm text-blue-700 mt-1">
                You are viewing the application as a new employee during onboarding. This is a simulation to help you understand the onboarding experience.
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
              Simulation
            </Badge>
          </div>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to 8People! 🎉</CardTitle>
            <CardDescription>
              We're excited to have you on board. Let's get you started with your onboarding journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Onboarding Progress</span>
                  <span className="text-sm text-muted-foreground">{completedCount} of {checklistItems.length} completed</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onboarding Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Your Onboarding Checklist</CardTitle>
            <CardDescription>Complete these tasks to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                      {item.title}
                    </span>
                    {!item.completed && (
                      <Button size="sm" variant="outline">
                        Start
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base">My Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View and update your personal information</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-base">Documents</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Access important company documents</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-base">Get Help</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Contact HR or your manager for support</p>
            </CardContent>
          </Card>
        </div>

        {/* Important Information */}
        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">First Day Schedule</p>
                  <p className="text-sm text-muted-foreground">Your manager will share your first-day agenda shortly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Team Introduction</p>
                  <p className="text-sm text-muted-foreground">Meet your team members during the welcome session.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Training Resources</p>
                  <p className="text-sm text-muted-foreground">Access training materials in the Documents section.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
