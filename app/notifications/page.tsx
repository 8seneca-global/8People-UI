"use client"

import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, UserPlus, CheckCircle, XCircle, Video, Megaphone, Settings, Bell, AlertTriangle, Cake } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Notification } from "@/lib/mock-data"

const notificationIcons: Record<Notification["type"], typeof Calendar> = {
  leave_request: Calendar,
  leave_approved: CheckCircle,
  leave_rejected: XCircle,
  interview: Video,
  onboarding: UserPlus,
  announcement: Megaphone,
  system: Settings,
  contract_warning: AlertTriangle,
  birthday: Cake,
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore()

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "leave_approved":
        return "text-success bg-success/10"
      case "leave_rejected":
        return "text-destructive bg-destructive/10"
      case "leave_request":
        return "text-warning bg-warning/10"
      case "interview":
        return "text-primary bg-primary/10"
      case "onboarding":
        return "text-info bg-info/10"
      case "contract_warning":
        return "text-amber-500 bg-amber-500/10"
      case "birthday":
        return "text-pink-500 bg-pink-500/10"
      default:
        return "text-muted-foreground bg-secondary"
    }
  }

  const getTypeBadge = (type: Notification["type"]) => {
    const labels: Record<Notification["type"], string> = {
      leave_request: "Leave",
      leave_approved: "Leave",
      leave_rejected: "Leave",
      interview: "Interview",
      onboarding: "Onboarding",
      announcement: "Announcement",
      system: "System",
      contract_warning: "Contract",
      birthday: "Birthday",
    }
    return labels[type]
  }

  return (
    <AdminLayout title="Notifications" subtitle="Stay updated with your activity">
      <div className="space-y-6">
        {/* Header Actions */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-1">
                  <Bell className="h-3 w-3" />
                  {unreadCount} unread
                </Badge>
                <span className="text-sm text-muted-foreground">{notifications.length} total notifications</span>
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllNotificationsRead}>
                  Mark all as read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
            <CardDescription>Your recent activity and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-lg font-medium">No notifications yet</p>
                <p className="text-sm">You'll see updates here when there's activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type]
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30",
                        !notification.isRead && "bg-primary/5 border-primary/20",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                          getNotificationColor(notification.type),
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn("font-medium", !notification.isRead && "text-foreground")}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {getTypeBadge(notification.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(notification.createdAt)}</span>
                          {notification.actionUrl && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                              <Link href={notification.actionUrl}>View Details</Link>
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-muted-foreground"
                              onClick={() => markNotificationRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                      {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
