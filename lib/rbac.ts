// Role-based Access Control System
// Structure: User -> Roles -> Modules -> Features -> Actions

export type Role = "admin" | "hr" | "employee";

export type ActionType = "view" | "create" | "edit" | "delete";

export interface ModuleAction {
  id: ActionType;
  name: string;
}

export const moduleActions: ModuleAction[] = [
  { id: "view", name: "View" },
  { id: "create", name: "Create" },
  { id: "edit", name: "Edit" },
  { id: "delete", name: "Delete" },
];

export interface ModuleConfig {
  id: string;
  name: string;
  label: string;
  icon: string;
  href?: string;
  urlPath?: string;
  bePath?: string;
  order: number;
  parentId?: string;
  isActive: boolean;
}

// Default modules configuration - matching the sidebar design
export const defaultModules: ModuleConfig[] = [
  // Dashboard
  {
    id: "dashboard",
    name: "dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    href: "/dashboard",
    urlPath: "/dashboard",
    order: 0,
    isActive: true,
  },

  // Organization
  {
    id: "organization",
    name: "organization",
    label: "Organization",
    icon: "Building2",
    order: 1,
    isActive: true,
  },
  {
    id: "org-chart",
    name: "org-chart",
    label: "Org Chart",
    icon: "Network",
    href: "/organization",
    urlPath: "/organization",
    order: 0,
    parentId: "organization",
    isActive: true,
  },
  {
    id: "org-units",
    name: "org-units",
    label: "Org Units",
    icon: "Building2",
    href: "/organization/org-units",
    urlPath: "/organization/org-units",
    order: 1,
    parentId: "organization",
    isActive: true,
  },

  // Employees
  {
    id: "employees",
    name: "employees",
    label: "Employees",
    icon: "Users",
    order: 2,
    isActive: true,
  },
  {
    id: "employees-transactions",
    name: "employees-transactions",
    label: "Transactions",
    icon: "FileText",
    href: "/employees/transactions",
    urlPath: "/employees/transactions",
    order: 0,
    parentId: "employees",
    isActive: true,
  },
  {
    id: "employees-profile",
    name: "employees-profile",
    label: "Employee profile",
    icon: "User",
    href: "/employees",
    urlPath: "/employees",
    order: 1,
    parentId: "employees",
    isActive: true,
  },

  // Recruitment
  {
    id: "recruitment",
    name: "recruitment",
    label: "Recruitment",
    icon: "UserSearch",
    order: 3,
    isActive: true,
  },
  {
    id: "recruitment-candidates",
    name: "recruitment-candidates",
    label: "Applying Candidates",
    icon: "UserSearch",
    href: "/recruitment/candidates",
    urlPath: "/recruitment/candidates",
    order: 0,
    parentId: "recruitment",
    isActive: true,
  },
  {
    id: "recruitment-pool",
    name: "recruitment-pool",
    label: "Candidates Pool",
    icon: "Users",
    href: "/recruitment/pool",
    urlPath: "/recruitment/pool",
    order: 1,
    parentId: "recruitment",
    isActive: true,
  },
  {
    id: "recruitment-interviews",
    name: "recruitment-interviews",
    label: "Interviews",
    icon: "Video",
    href: "/recruitment/interviews",
    urlPath: "/recruitment/interviews",
    order: 2,
    parentId: "recruitment",
    isActive: true,
  },
  {
    id: "recruitment-jobs",
    name: "recruitment-jobs",
    label: "Recruitment Jobs",
    icon: "Briefcase",
    href: "/recruitment/jobs",
    urlPath: "/recruitment/jobs",
    order: 3,
    parentId: "recruitment",
    isActive: true,
  },

  // Leave
  {
    id: "leave",
    name: "leave",
    label: "Leave",
    icon: "CalendarDays",
    order: 4,
    isActive: true,
  },
  {
    id: "leave-requests",
    name: "leave-requests",
    label: "Leave Requests",
    icon: "FileText",
    href: "/leave/requests",
    urlPath: "/leave/requests",
    order: 0,
    parentId: "leave",
    isActive: true,
  },
  {
    id: "leave-my-requests",
    name: "leave-my-requests",
    label: "My Requests",
    icon: "CalendarCheck",
    href: "/leave/my-requests",
    urlPath: "/leave/my-requests",
    order: 1,
    parentId: "leave",
    isActive: true,
  },
  {
    id: "leave-calendar",
    name: "leave-calendar",
    label: "Leave Calendar",
    icon: "Calendar",
    href: "/leave/calendar",
    urlPath: "/leave/calendar",
    order: 2,
    parentId: "leave",
    isActive: true,
  },
  {
    id: "leave-balances",
    name: "leave-balances",
    label: "Leave Balances",
    icon: "PieChart",
    href: "/leave/balances",
    urlPath: "/leave/balances",
    order: 3,
    parentId: "leave",
    isActive: true,
  },

  // Settings
  {
    id: "settings",
    name: "settings",
    label: "Settings",
    icon: "Settings",
    href: "/settings",
    urlPath: "/settings",
    order: 5,
    isActive: true,
  },

  // Attendance
  {
    id: "attendance",
    label: "Attendance",
    name: "Attendance Tracking",
    icon: "Clock",
    href: "/attendance",
    urlPath: "/attendance",
    order: 6,
    isActive: true,
  },
  // Sub-modules removed per user request (Single page mode)

  {
    id: "onboarding",
    name: "onboarding",
    label: "Onboarding",
    icon: "UserPlus",
    href: "/onboarding",
    urlPath: "/onboarding",
    order: 7,
    isActive: true,
  },
];

// Role permission structure
export interface RoleModulePermissions {
  [moduleId: string]: ActionType[];
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
    // Cleaned up sub-permissions

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
  },
}

export const roleInfo: Record<
  Role,
  { name: string; description: string; color: string }
> = {
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
};

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
  | "settings.edit";

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
};

export interface Feature {
  id: string;
  name: string;
  href: string;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  href?: string;
  features?: Feature[];
  allowedRoles: Role[];
}

export const modules: Module[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: "LayoutDashboard",
    href: "/dashboard",
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "organization",
    name: "Organization",
    icon: "Building2",
    features: [
      { id: "org-chart", name: "Org Chart", href: "/organization" },
      { id: "org-units", name: "Org Units", href: "/organization/org-units" },
    ],
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "employees",
    name: "Employees",
    icon: "Users",
    features: [
      {
        id: "employees-transactions",
        name: "Transactions",
        href: "/employees/transactions",
      },
      { id: "employees-profile", name: "Employee profile", href: "/employees" },
    ],
    allowedRoles: ["admin", "hr"],
  },
  {
    id: "recruitment",
    name: "Recruitment",
    icon: "UserSearch",
    features: [
      {
        id: "recruitment-candidates",
        name: "Applying Candidates",
        href: "/recruitment/candidates",
      },
      {
        id: "recruitment-pool",
        name: "Candidates Pool",
        href: "/recruitment/pool",
      },
      {
        id: "recruitment-interviews",
        name: "Interviews",
        href: "/recruitment/interviews",
      },
      {
        id: "recruitment-jobs",
        name: "Recruitment Jobs",
        href: "/recruitment/jobs",
      },
    ],
    allowedRoles: ["admin", "hr"],
  },
  {
    id: "leave",
    name: "Leave",
    icon: "CalendarDays",
    features: [
      { id: "leave-requests", name: "Leave Requests", href: "/leave/requests" },
      {
        id: "leave-my-requests",
        name: "My Requests",
        href: "/leave/my-requests",
      },
      { id: "leave-calendar", name: "Leave Calendar", href: "/leave/calendar" },
      { id: "leave-balances", name: "Leave Balances", href: "/leave/balances" },
    ],
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "attendance",
    name: "Attendance Tracking",
    icon: "Clock",
    href: "/attendance",
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
  {
    id: "attendance",
    name: "Attendance",
    icon: "Clock",
    features: [
      { id: "attendance-clock", name: "Clock In/Out", href: "/attendance" },
      {
        id: "attendance-records",
        name: "Attendance Records",
        href: "/attendance/records",
      },
      {
        id: "attendance-reports",
        name: "Reports",
        href: "/attendance/reports",
      },
    ],
    allowedRoles: ["admin", "hr", "employee"],
  },
  {
    id: "onboarding",
    name: "Onboarding",
    icon: "UserPlus",
    href: "/onboarding",
    allowedRoles: ["admin", "hr"],
  },
];

export function getAccessibleModules(role: Role): Module[] {
  return modules.filter((module) => module.allowedRoles.includes(role));
}

export function hasAccessToPath(role: Role, path: string): boolean {
  const accessibleModules = getAccessibleModules(role);

  for (const module of accessibleModules) {
    if (module.href === path) return true;
    if (module.features?.some((f) => f.href === path)) return true;
  }

  return false;
}

export function hasPermission(
  role: Role,
  permission: FeaturePermission,
): boolean {
  if (!role || !rolePermissions[role]) {
    return false;
  }
  return rolePermissions[role].includes(permission);
}
