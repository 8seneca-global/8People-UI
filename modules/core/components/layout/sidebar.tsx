"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { RoleSwitcher } from "./role-switcher";
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
} from "lucide-react";
import { useState, useEffect } from "react";

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
};

import { useMyRoles } from "@/modules/settings/api";
import { useModules } from "@/modules/settings/api";
import { NavigationModule } from "@/modules/settings/api/types";

export function Sidebar() {
  const pathname = usePathname();
  const {
    currentRole,
    activeRoleId,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useStore();
  const { data: roles = [] } = useMyRoles();
  const { data: allModules = [] } = useModules();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const currentRoleData =
    roles.find((r) => r.id === activeRoleId) ||
    roles.find((r) => r.name.toLowerCase() === currentRole.toLowerCase()) ||
    roles[0];
  const permissions = currentRoleData?.permissions || [];

  // A module is visible if it has ANY permission true
  const visibleModuleIds = new Set(
    permissions
      .filter((p) => p.canView || p.canCreate || p.canEdit || p.canDelete)
      .map((p) => p.moduleId),
  );

  const parentModules = allModules
    .filter((m) => {
      const isVisible = visibleModuleIds.has(m.id);
      if (m.parentId || !m.isActive || !isVisible) return false;

      // If it's top level, it must either have a urlPath OR have navigable children
      const hasNavigableChildren = allModules.some(
        (child) =>
          child.parentId === m.id &&
          child.isActive &&
          visibleModuleIds.has(child.id) &&
          child.urlPath &&
          child.urlPath !== "#",
      );
      return (m.urlPath && m.urlPath !== "#") || hasNavigableChildren;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const getChildModules = (parentId: string) =>
    allModules
      .filter(
        (m) =>
          m.parentId === parentId &&
          m.isActive &&
          visibleModuleIds.has(m.id) &&
          m.urlPath &&
          m.urlPath !== "#",
      )
      .sort((a, b) => a.sortOrder - b.sortOrder);

  // Auto-expand modules based on current path
  useEffect(() => {
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length > 0) {
      const firstPart = pathParts[0];
      // Try to find a module that matches this path
      const matchingModule = allModules.find(
        (m) => m.urlPath?.includes(firstPart) && !m.parentId,
      );
      if (matchingModule && !expandedModules.includes(matchingModule.id)) {
        setExpandedModules((prev) => [...prev, matchingModule.id]);
      }
    }
  }, [pathname, allModules]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    );
  };

  const renderModule = (module: NavigationModule) => {
    const Icon = iconMap[module.icon || ""] || LayoutDashboard;
    const childModules = getChildModules(module.id);
    const hasChildren = childModules.length > 0;
    const isExpanded = expandedModules.includes(module.id);
    const isActive = module.urlPath
      ? pathname === module.urlPath
      : childModules.some((c) => pathname === c.urlPath);

    const showChildren = hasChildren;

    const triggerContent = (
      <>
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          {module.label || module.name}
        </div>
        {showChildren && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        )}
      </>
    );

    const triggerClassName = cn(
      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    );

    const renderTrigger = () => {
      if (module.urlPath && module.urlPath !== "#") {
        return (
          <Link
            href={module.urlPath}
            onClick={() => {
              if (showChildren && !isExpanded) toggleModule(module.id);
              setMobileSidebarOpen(false);
            }}
            className={triggerClassName}
          >
            {triggerContent}
          </Link>
        );
      }
      return (
        <button
          onClick={() => (showChildren ? toggleModule(module.id) : null)}
          className={triggerClassName}
        >
          {triggerContent}
        </button>
      );
    };

    return (
      <div key={module.id}>
        {renderTrigger()}
        {showChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1">
            {childModules.map((child) => {
              const ChildIcon = iconMap[child.icon || ""] || Building2;
              return (
                <Link
                  key={child.id}
                  href={child.urlPath || "#"}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === child.urlPath
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <ChildIcon className="h-4 w-4" />
                  {child.label || child.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Persistent on desktop, floating on mobile */}
      <aside
        className={cn(
          "group fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out md:relative md:translate-x-0",
          isMobileSidebarOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full md:w-20 md:hover:w-64",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">8</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            8People
          </span>
        </div>

        <div className="border-b border-sidebar-border p-3 overflow-hidden min-h-px">
          <div className="hidden md:group-hover:block transition-all w-full animate-in fade-in zoom-in-95 duration-200">
            <RoleSwitcher />
          </div>
        </div>

        {/* Navigation - dynamically rendered based on role permissions and module order */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 overflow-x-hidden">
          {parentModules.map((module) => {
            const Icon = iconMap[module.icon || ""] || LayoutDashboard;
            const childModules = getChildModules(module.id);
            const hasChildren = childModules.length > 0;
            const isExpanded = expandedModules.includes(module.id);
            const isActive = module.urlPath
              ? pathname === module.urlPath
              : childModules.some((c) => pathname === c.urlPath);

            const showChildren = hasChildren;

            const triggerContent = (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {module.label || module.name}
                  </span>
                </div>
                {showChildren && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-all duration-300 opacity-0 group-hover:opacity-100",
                      isExpanded && "rotate-180",
                    )}
                  />
                )}
              </>
            );

            const triggerClassName = cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            );

            const renderTrigger = () => {
              if (module.urlPath && module.urlPath !== "#") {
                return (
                  <Link
                    href={module.urlPath}
                    onClick={() => {
                      if (showChildren && !isExpanded) toggleModule(module.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={triggerClassName}
                  >
                    {triggerContent}
                  </Link>
                );
              }
              return (
                <button
                  onClick={() =>
                    showChildren ? toggleModule(module.id) : null
                  }
                  className={triggerClassName}
                >
                  {triggerContent}
                </button>
              );
            };

            return (
              <div key={module.id} className="relative">
                {renderTrigger()}
                {showChildren && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 md:hidden md:group-hover:block">
                    {childModules.map((child) => {
                      const ChildIcon = iconMap[child.icon || ""] || Building2;
                      return (
                        <Link
                          key={child.id}
                          href={child.urlPath || "#"}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                            pathname === child.urlPath
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          )}
                        >
                          <ChildIcon className="h-4 w-4 shrink-0" />
                          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {child.label || child.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-sidebar-border p-4 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent ring-2 ring-primary/10">
              <span className="text-sm font-medium text-sidebar-accent-foreground">
                {currentRole === "admin"
                  ? "AD"
                  : currentRoleData?.name.substring(0, 2).toUpperCase() || "US"}
              </span>
            </div>
            <div className="flex-1 truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentRoleData?.name || "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {currentRoleData?.name.toLowerCase().replace(/\s/g, "")}
                @8people.com
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
