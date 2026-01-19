"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { RoleSwitcher } from "./role-switcher"
import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  ChevronDown,
  Network,
  Briefcase,
  User,
  Settings,
  CalendarDays,
  CalendarCheck,
  Calendar,
  PieChart,
  Clock,
  ClipboardList,
  FileBarChart,
  UserSearch,
  FileText,
  Video,
  Database,
} from "lucide-react"
import { useState, useEffect } from "react"

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  Network,
  Briefcase,
  User,
  Settings,
  CalendarDays,
  CalendarCheck,
  Calendar,
  PieChart,
  Clock,
  ClipboardList,
  FileBarChart,
  UserSearch,
  FileText,
  Video,
  Database,
}

export function Sidebar() {
  const pathname = usePathname()
  const { currentRole, modules, customRoles } = useStore()
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  const currentRoleData = customRoles.find((r) => r.id === currentRole)
  const roleModulePermissions = currentRoleData?.modulePermissions || {}

  const parentModules = modules
    .filter((m) => !m.parentId && m.isActive && roleModulePermissions[m.id]?.length > 0)
    .sort((a, b) => a.order - b.order)

  const getChildModules = (parentId: string) =>
    modules
      .filter((m) => m.parentId === parentId && m.isActive && roleModulePermissions[m.id]?.length > 0)
      .sort((a, b) => a.order - b.order)

  // Auto-expand modules based on current path
  useEffect(() => {
    const pathParts = pathname.split("/").filter(Boolean)
    if (pathParts.length > 0) {
      const firstPart = pathParts[0]
      // Map route paths to module IDs
      const routeToModule: Record<string, string> = {
        organization: "organization",
        leave: "leave",
        attendance: "attendance",
        recruitment: "recruitment",
      }
      const moduleId = routeToModule[firstPart]
      if (moduleId && !expandedModules.includes(moduleId)) {
        setExpandedModules((prev) => [...prev, moduleId])
      }
    }
  }, [pathname])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const renderModule = (module: (typeof modules)[0]) => {
    const Icon = iconMap[module.icon] || LayoutDashboard
    const childModules = getChildModules(module.id)
    const hasChildren = childModules.length > 0
    const isExpanded = expandedModules.includes(module.id)
    const isActive = module.href ? pathname === module.href : childModules.some((c) => pathname === c.href)

    if (hasChildren) {
      return (
        <div key={module.id}>
          <button
            onClick={() => toggleModule(module.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              {module.name}
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {childModules.map((child) => {
                const ChildIcon = iconMap[child.icon] || Building2
                return (
                  <Link
                    key={child.id}
                    href={child.href || "#"}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === child.href
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <ChildIcon className="h-4 w-4" />
                    {child.name}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={module.id}
        href={module.href || "#"}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          pathname === module.href
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
        {module.name}
      </Link>
    )
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">8</span>
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">8People</span>
      </div>

      <div className="border-b border-sidebar-border p-3">
        <RoleSwitcher />
      </div>

      {/* Navigation - dynamically rendered based on role permissions and module order */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">{parentModules.map(renderModule)}</nav>

      {/* User Info */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {currentRole === "admin" ? "AD" : currentRole === "hr" ? "HR" : "EM"}
            </span>
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-sidebar-foreground">{currentRoleData?.name || "User"}</p>
            <p className="text-xs text-sidebar-foreground/60">{currentRole}@8people.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
