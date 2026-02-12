"use client";

import {
  Bell,
  Search,
  Calendar,
  UserPlus,
  CheckCircle,
  XCircle,
  Video,
  Megaphone,
  Settings,
  Moon,
  Sun,
  Menu,
  X,
  AlertCircle,
  Gift,
} from "lucide-react";
import { Input } from "@/modules/core/components/ui/input";
import { Button } from "@/modules/core/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/modules/core/components/ui/popover";
import { ScrollArea } from "@/modules/core/components/ui/scroll-area";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Notification } from "@/lib/mock-data";

const notificationIcons: Record<Notification["type"], typeof Calendar> = {
  leave_request: Calendar,
  leave_approved: CheckCircle,
  leave_rejected: XCircle,
  interview: Video,
  onboarding: UserPlus,
  announcement: Megaphone,
  system: Settings,
  contract_warning: AlertCircle,
  birthday: Gift,
};

interface TopBarProps {
  title: string
  subtitle?: string
  sidebarOpen?: boolean
  onSidebarToggle?: () => void
}

export function TopBar({ title, subtitle, sidebarOpen, onSidebarToggle }: TopBarProps) {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useStore();
  const { theme, toggleTheme } = useTheme();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "leave_approved":
        return "text-success";
      case "leave_rejected":
        return "text-destructive";
      case "leave_request":
        return "text-warning";
      case "interview":
        return "text-primary";
      case "onboarding":
        return "text-info";
      case "contract_warning":
        return "text-warning";
      case "birthday":
        return "text-pink-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden"
          title="Toggle sidebar"
        >
          {isMobileSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-48 md:w-64 bg-secondary pl-9 text-sm"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              suppressHydrationWarning
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[380px] p-0 bg-card border-border"
            align="end"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-auto py-1"
                  onClick={markAllNotificationsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>

            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Bell className="h-10 w-10 mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.slice(0, 20).map((notification) => {
                    const Icon = notificationIcons[notification.type];
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors cursor-pointer",
                          !notification.isRead && "bg-primary/5",
                        )}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary",
                            getNotificationColor(notification.type),
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p
                            className={cn(
                              "text-sm leading-tight",
                              !notification.isRead && "font-medium",
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {notifications.length > 0 && (
              <div className="border-t border-border p-2">
                <Button variant="ghost" className="w-full text-sm" asChild>
                  <Link href="/notifications">View all notifications</Link>
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
