// Role-based Access Control System
// Structure: User -> Roles -> Modules -> Features -> Actions

export type Role = "admin" | "hr" | "employee"

export type ActionType = "view" | "create" | "edit" | "delete"

export interface ModuleAction {
  id: ActionType
  name: string
}

export const moduleActions: ModuleAction[] = [
  { id: "view", name: "View" },
  { id: "create", name: "Create" },
  { id: "edit", name: "Edit" },
  { id: "delete", name: "Delete" },
]

export interface ModuleConfig {
  id: string
  name: string
  icon: string
  href?: string
  order: number
  parentId?: string
  isActive: boolean
}

// Default modules configuration - O-S-C-P Model
export const defaultModules: ModuleConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "LayoutDashboard",
    href: "/",
    order: 0,
    isActive: true,
  },
  {
    id: "organization",
    name: "Organization",
    icon: "Building2",
    order: 1,
    isActive: true,
  },
  {
    id: "org-chart",
    name: "Org Chart",
    icon: "Network",
    href: "/organization",
    order: 0,
    parentId: "organization",
    isActive: true,
  },
  {
    id: "org-view",
    name: "Org Structure",
    icon: "Building2",
    href: "/organization/org-view",
    order: 1,
    parentId: "organization",
    isActive: true,
  },
  {
    id: "jobs",
    name: "Job Classifications",
    icon: "FileText",
    href: "/organization/jobs",
    order: 3,
    parentId: "organization",
    isActive: true,
  },
  {
    id: "positions",
    name: "Positions",
    icon: "Briefcase",
    href: "/organization/positions",
    order: 4,
    parentId: "organization",
    isActive: true,
  },
  {
    id: "employees",
    name: "Employees",
    icon: "Users",
    href: "/employees",
    order: 2,
    isActive: true,
  },
  {
    id: "my-profile",
    name: "My Profile",
    icon: "User",
    href: "/my-profile",
    order: 3,
    isActive: true,
  },
  {
    id: "leave",
    name: "Leave",
    icon: "CalendarDays",
    order: 5,
    isActive: true,
  },
  {
    id: "leave-requests",
    name: "Leave Requests",
    icon: "CalendarDays",
    href: "/leave/requests",
    order: 0,
    parentId: "leave",
    isActive: true,
  },
  {
    id: "leave-my-requests",
    name: "My Requests",
    icon: "CalendarCheck",
    href: "/leave/my-requests",
    order: 1,
    parentId: "leave",
    isActive: true,
  },
  {
    id: "leave-calendar",
    name: "Leave Calendar",
    icon: "Calendar",
    href: "/leave/calendar",
    order: 2,
    parentId: "leave",
    isActive: true,
  },
  {
    id: "leave-balances",
    name: "Leave Balances",
    icon: "PieChart",
    href: "/leave/balances",
    order: 3,
    parentId: "leave",
    isActive: true,
  },
  {
    id: "attendance",
    name: "Attendance",
    icon: "Clock",
    order: 6,
    isActive: true,
  },
  {
    id: "attendance-clock",
    name: "Clock In/Out",
    icon: "Clock",
    href: "/attendance/clock",
    order: 0,
    parentId: "attendance",
    isActive: true,
  },
  {
    id: "attendance-records",
    name: "Attendance Records",
    icon: "ClipboardList",
    href: "/attendance/records",
    order: 1,
    parentId: "attendance",
    isActive: true,
  },
  {
    id: "attendance-reports",
    name: "Reports",
    icon: "FileBarChart",
    href: "/attendance/reports",
    order: 2,
    parentId: "attendance",
    isActive: false,
  },
  {
    id: "attendance-timesheet",
    name: "Monthly Timesheet",
    icon: "Calendar",
    href: "/attendance/timesheet",
    order: 3,
    parentId: "attendance",
    isActive: true,
  },
  {
    id: "recruitment",
    name: "Recruitment",
    icon: "UserSearch",
    order: 7,
    isActive: true,
  },
  {
    id: "recruitment-jobs",
    name: "Job Openings",
    icon: "FileText",
    href: "/recruitment/jobs",
    order: 0,
    parentId: "recruitment",
    isActive: true,
  },
  {
    id: "recruitment-candidates",
    name: "Applying Candidates",
    icon: "UserSearch",
    href: "/recruitment/candidates",
    order: 1,
    parentId: "recruitment",
    isActive: true,
  },
  {
    id: "recruitment-pool",
    name: "Candidates Pool",
    icon: "Users",
    href: "/recruitment/pool",
    order: 2,
    parentId: "recruitment",
    isActive: true,
  },
  {
    id: "recruitment-interviews",
    name: "Interviews",
    icon: "Video",
    href: "/recruitment/interviews",
    order: 3,
    parentId: "recruitment",
    isActive: true,
  },
  {
    id: "onboarding",
    name: "Onboarding",
    icon: "UserPlus",
    href: "/onboarding",
    order: 8,
    isActive: true,
  },
  {
    id: "company-forum",
    name: "Company Forum",
    icon: "MessageSquare",
    href: "/forum",
    order: 8.5,
    isActive: true,
  },
  {
    id: "documents",
    name: "Documents",
    icon: "FileText",
    href: "/documents",
    order: 8.7,
    isActive: true,
  },
  {
    id: "settings",
    name: "Settings",
    icon: "Settings",
    href: "/settings",
    order: 9,
    isActive: true,
  },
]

// Role permission structure
export interface RoleModulePermissions {
  [moduleId: string]: ActionType[]
}

export const defaultRoleModulePermissions: Record<Role, RoleModulePermissions> = {
  admin: {
    organization: ["view", "create", "edit", "delete"],
    "org-view": ["view"],
    jobs: ["view", "create", "edit", "delete"],
    positions: ["view", "create", "edit", "delete"],
    employees: ["view", "create", "edit", "delete"],
    onboarding: ["view", "create", "edit", "delete"],
    "company-forum": ["view", "create", "edit", "delete"],
    documents: ["view", "create", "edit", "delete"],
    settings: ["view", "edit"],
    leave: ["view", "create", "edit", "delete"],
    "leave-requests": ["view", "create", "edit", "delete"],
    "leave-calendar": ["view"],
    "leave-balances": ["view", "edit"],
    attendance: ["view", "create", "edit", "delete"],
    "attendance-records": ["view", "edit", "delete"],
    "attendance-reports": ["view"],
    "attendance-timesheet": ["view", "edit"],
    recruitment: ["view", "create", "edit", "delete"],
    "recruitment-jobs": ["view", "create", "edit", "delete"],
    "recruitment-candidates": ["view", "create", "edit", "delete"],
    "recruitment-pool": ["view", "create", "edit", "delete"],
    "recruitment-interviews": ["view", "create", "edit", "delete"],
  },
  hr: {
    dashboard: ["view"],
    organization: ["view", "create", "edit"],
    "org-chart": ["view"],
    "org-view": ["view"],
    jobs: ["view", "create", "edit"],
    positions: ["view", "create", "edit"],
    employees: ["view", "create", "edit"],
    "my-profile": ["view", "edit"],
    onboarding: ["view", "create", "edit"],
    "company-forum": ["view", "create", "edit"],
    documents: ["view", "create", "edit", "delete"],
    leave: ["view", "create", "edit"],
    "leave-requests": ["view", "create", "edit"],
    "leave-my-requests": ["view", "create", "edit"],
    "leave-calendar": ["view"],
    "leave-balances": ["view", "edit"],
    attendance: ["view", "create", "edit"],
    "attendance-records": ["view", "edit"],
    "attendance-reports": ["view"],
    "attendance-timesheet": ["view", "edit"],
    recruitment: ["view", "create", "edit"],
    "recruitment-jobs": ["view", "create", "edit", "delete"],
    "recruitment-candidates": ["view", "create", "edit"],
    "recruitment-pool": ["view", "create", "edit"],
    "recruitment-interviews": ["view", "create", "edit"],
  },
  employee: {
    dashboard: ["view"],
    organization: ["view"],
    "org-chart": ["view"],
    "org-view": ["view"],
    jobs: ["view"],
    positions: ["view"],
    "my-profile": ["view", "edit"],
    "company-forum": ["view", "create"],
    documents: ["view"],
    leave: ["view"],
    "leave-my-requests": ["view", "create", "edit"],
    attendance: ["view"],
    "attendance-records": ["view"],
  },
}

export const roleInfo: Record<Role, { name: string; description: string; color: string }> = {
  admin: {
    name: "Administrator",
    description: "Full access to all modules, settings, and permissions",
    color: "bg-rose-500/20 text-rose-400",
  },
  hr: {
    name: "HR Manager",
    description: "Manage employees, onboarding, and organization structure",
    color: "bg-sky-500/20 text-sky-400",
  },
  employee: {
    name: "Employee",
    description: "View organization structure and manage personal profile",
    color: "bg-emerald-500/20 text-emerald-400",
  },
}

// Legacy support
export type FeaturePermission =
  | "employees.view"
  | "employees.create"
  | "employees.edit"
  | "employees.delete"
  | "organization.view"
  | "organization.create"
  | "organization.edit"
  | "organization.delete"
  | "onboarding.view"
  | "onboarding.manage"
  | "settings.view"
  | "settings.edit"

export const rolePermissions: Record<Role, FeaturePermission[]> = {
  admin: [
    "employees.view",
    "employees.create",
    "employees.edit",
    "employees.delete",
    "organization.view",
    "organization.create",
    "organization.edit",
    "organization.delete",
    "onboarding.view",
    "onboarding.manage",
    "settings.view",
    "settings.edit",
  ],
  hr: [
    "employees.view",
    "employees.create",
    "employees.edit",
    "organization.view",
    "organization.create",
    "organization.edit",
    "onboarding.view",
    "onboarding.manage",
  ],
  employee: ["organization.view"],
}

export interface Feature {
  id: string
  name: string
  href: string
}

export interface Module {
  id: string
  name: string
  icon: string
  href?: string
  features?: Feature[]
  allowedRoles: Role[]
}

export const modules: Module[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "LayoutDashboard",
    href: "/",
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "organization",
    name: "Organization",
    icon: "Building2",
    features: [
      { id: "org-chart", name: "Org Chart", href: "/organization" },
      { id: "org-view", name: "Org Structure", href: "/organization/org-view" },
      { id: "jobs", name: "Job Classifications", href: "/organization/jobs" },
      { id: "positions", name: "Positions", href: "/organization/positions" },
    ],
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "employees",
    name: "Employees",
    icon: "Users",
    href: "/employees",
    allowedRoles: ["admin", "hr"],
  },
  {
    id: "my-profile",
    name: "My Profile",
    icon: "User",
    href: "/my-profile",
    allowedRoles: ["employee", "hr"],
  },
  {
    id: "leave",
    name: "Leave",
    icon: "CalendarDays",
    features: [
      { id: "leave-requests", name: "Leave Requests", href: "/leave/requests" },
      { id: "leave-my-requests", name: "My Requests", href: "/leave/my-requests" },
      { id: "leave-calendar", name: "Leave Calendar", href: "/leave/calendar" },
      { id: "leave-balances", name: "Leave Balances", href: "/leave/balances" },
    ],
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "attendance",
    name: "Attendance",
    icon: "Clock",
    features: [
      { id: "attendance-clock", name: "Clock In/Out", href: "/attendance/clock" },
      { id: "attendance-records", name: "Attendance History", href: "/attendance/records" },
      { id: "attendance-reports", name: "Reports", href: "/attendance/reports" },
    ],
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "recruitment",
    name: "Recruitment",
    icon: "UserSearch",
    features: [
      { id: "recruitment-jobs", name: "Job Openings", href: "/recruitment/jobs" },
      { id: "recruitment-candidates", name: "Applying Candidates", href: "/recruitment/candidates" },
      { id: "recruitment-pool", name: "Candidates Pool", href: "/recruitment/pool" },
      { id: "recruitment-interviews", name: "Interviews", href: "/recruitment/interviews" },
    ],
    allowedRoles: ["admin", "hr"],
  },
  {
    id: "onboarding",
    name: "Onboarding",
    icon: "UserPlus",
    href: "/onboarding",
    allowedRoles: ["admin", "hr"],
  },
  {
    id: "company-forum",
    name: "Company Forum",
    icon: "MessageSquare",
    href: "/forum",
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "documents",
    name: "Documents",
    icon: "FileText",
    href: "/documents",
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "settings",
    name: "Settings",
    icon: "Settings",
    href: "/settings",
    allowedRoles: ["admin"],
  },
]

export function getAccessibleModules(role: Role): Module[] {
  return modules.filter((module) => module.allowedRoles.includes(role))
}

export function hasAccessToPath(role: Role, path: string): boolean {
  const accessibleModules = getAccessibleModules(role)

  for (const module of accessibleModules) {
    if (module.href === path) return true
    if (module.features?.some((f) => f.href === path)) return true
  }

  return false
}

export function hasPermission(role: Role, permission: FeaturePermission): boolean {
  return rolePermissions[role].includes(permission)
}
