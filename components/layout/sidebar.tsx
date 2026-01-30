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

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()
  const { currentRole, modules, customRoles, simulationMode } = useStore()
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  const effectiveRole = simulationMode === 'onboarding' ? 'employee' : currentRole
  const effectiveRoleData = customRoles.find((r) => r.id === effectiveRole)
  const basePermissions = effectiveRoleData?.modulePermissions || {}

  // Ensure onboarding module is visible in simulation mode
  const effectivePermissions = (simulationMode === 'onboarding'
    ? { ...basePermissions, onboarding: ["view"] }
    : basePermissions) as Record<string, any[]>

  const getFilteredModules = () => {
    let filtered = modules.filter((m) => !m.parentId && m.isActive && effectivePermissions[m.id]?.length > 0)

    if (currentRole === 'employee') {
      const allowedConfigs = ['dashboard', 'my-profile', 'leave', 'attendance']
      filtered = filtered.filter(m => allowedConfigs.includes(m.id))
    }

    if (simulationMode === 'onboarding') {
      // Hide original dashboard and customize onboarding module
      filtered = filtered
        .filter(m => m.id !== 'dashboard')
        .map(m => {
          if (m.id === 'onboarding') {
            return { ...m, name: 'Dashboard', icon: 'LayoutDashboard', order: -1 }
          }
          return m
        })
    }

    return filtered
  }


  const parentModules = getFilteredModules().sort((a, b) => a.order - b.order)

  const getChildModules = (parentId: string) =>
    modules
      .filter((m) => m.parentId === parentId && m.isActive && effectivePermissions[m.id]?.length > 0)
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
            title={collapsed ? module.name : undefined}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && module.name}
            </div>
            {!collapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />}
          </button>
          {isExpanded && !collapsed && (
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
                    <ChildIcon className="h-4 w-4 shrink-0" />
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
        title={collapsed ? module.name : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && module.name}
      </Link>
    )
  }

  return (
    <aside className="flex h-screen w-full flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "gap-2 px-6")}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <span className="text-sm font-bold text-primary-foreground">8</span>
        </div>
        {!collapsed && <span className="text-lg font-semibold text-sidebar-foreground">8People</span>}
      </div>

      {!collapsed && (
        <div className="border-b border-sidebar-border p-3">
          <RoleSwitcher />
        </div>
      )}

      {/* Simulation Mode Indicator */}
      {!collapsed && simulationMode === 'onboarding' && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium text-blue-600">Simulation Mode Active</span>
          </div>
        </div>
      )}

      {/* Navigation - dynamically rendered based on role permissions and module order */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">{parentModules.map(renderModule)}</nav>

      {/* User Info */}
      <div className={cn("border-t border-sidebar-border p-4", collapsed && "px-2")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent shrink-0">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              {effectiveRole === "admin" ? "AD" : effectiveRole === "hr" ? "HR" : "EM"}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-sidebar-foreground">{effectiveRoleData?.name || "User"}</p>
              <p className="text-xs text-sidebar-foreground/60">{effectiveRole}@8people.com</p>
            </div>
          )}

        </div>
      </div>
    </aside>
  )
}
