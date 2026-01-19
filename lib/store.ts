"use client"

import { create } from "zustand"
import {
  organizationalUnits as initialOrgUnits,
  jobClassifications as initialJobClassifications,
  positions as initialPositions,
  employees as initialEmployees,
  leaveTypes as initialLeaveTypes,
  leaveRequests as initialLeaveRequests,
  leaveBalances as initialLeaveBalances,
  attendanceRecords as initialAttendanceRecords,
  shifts as initialShifts,
  jobRequisitions as initialJobRequisitions,
  candidates as initialCandidates,
  notifications as initialNotifications,
  auditLogs as initialAuditLogs,
  leavePolicyRules as initialLeavePolicyRules,
  publicHolidays as initialPublicHolidays,
  type OrganizationalUnit,
  type JobClassification,
  type Position,
  type Employee,
  type LeaveType,
  type LeaveRequest,
  type LeaveBalance,
  type AttendanceRecord,
  type Shift,
  type JobRequisition,
  type Candidate,
  type Notification,
  type AuditLogEntry,
  type LeavePolicyRule,
  type PublicHoliday,
} from "./mock-data"
import type { Role, FeaturePermission, ModuleConfig, RoleModulePermissions, ActionType } from "./rbac"
import { defaultModules, defaultRoleModulePermissions, roleInfo } from "./rbac"

interface CustomRole {
  id: string
  name: string
  description: string
  isBuiltIn: boolean
  permissions: FeaturePermission[]
  modulePermissions: RoleModulePermissions
  assignedEmployeeIds: string[]
}

interface StoreState {
  // O-S-C-P Model
  organizationalUnits: OrganizationalUnit[]
  jobClassifications: JobClassification[]
  positions: Position[]
  employees: Employee[]
  auditLogs: AuditLogEntry[]

  leaveTypes: LeaveType[]
  leaveRequests: LeaveRequest[]
  leaveBalances: LeaveBalance[]
  leavePolicyRules: LeavePolicyRule[]
  publicHolidays: PublicHoliday[]

  attendanceRecords: AttendanceRecord[]
  shifts: Shift[]

  jobRequisitions: JobRequisition[]
  candidates: Candidate[]

  notifications: Notification[]

  currentRole: Role
  setCurrentRole: (role: Role) => void

  modules: ModuleConfig[]
  addModule: (module: Omit<ModuleConfig, "id">) => void
  updateModule: (id: string, module: Partial<ModuleConfig>) => void
  deleteModule: (id: string) => void
  reorderModules: (modules: ModuleConfig[]) => void

  customRoles: CustomRole[]
  addCustomRole: (role: Omit<CustomRole, "id" | "isBuiltIn">) => void
  updateCustomRole: (id: string, role: Partial<CustomRole>) => void
  deleteCustomRole: (id: string) => void
  updateRolePermissions: (roleId: string, permissions: FeaturePermission[]) => void
  updateRoleModulePermissions: (roleId: string, moduleId: string, actions: ActionType[]) => void

  // Organizational Unit actions
  addOrganizationalUnit: (unit: Omit<OrganizationalUnit, "id">) => void
  updateOrganizationalUnit: (id: string, unit: Partial<OrganizationalUnit>) => void
  deleteOrganizationalUnit: (id: string) => void

  // Job Classification actions
  addJobClassification: (job: Omit<JobClassification, "id">) => void
  updateJobClassification: (id: string, job: Partial<JobClassification>) => void
  deleteJobClassification: (id: string) => void

  // Position actions
  addPosition: (position: Omit<Position, "id">) => void
  updatePosition: (id: string, position: Partial<Position>) => void
  deletePosition: (id: string) => void

  // Employee actions
  addEmployee: (employee: Omit<Employee, "id">) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  updateEmployeeSelfService: (id: string, field: string, value: string, changedByName: string) => void

  addLeaveRequest: (request: Omit<LeaveRequest, "id" | "createdAt" | "updatedAt">) => void
  updateLeaveRequest: (id: string, request: Partial<LeaveRequest>) => void
  approveLeaveRequest: (id: string, approverId: string, comment?: string) => void
  rejectLeaveRequest: (id: string, approverId: string, comment: string) => void
  cancelLeaveRequest: (id: string) => void
  updateLeaveBalance: (employeeId: string, leaveTypeId: string, balance: Partial<LeaveBalance>) => void

  addPublicHoliday: (holiday: Omit<PublicHoliday, "id">) => void
  updatePublicHoliday: (id: string, holiday: Partial<PublicHoliday>) => void
  deletePublicHoliday: (id: string) => void

  addLeavePolicyRule: (rule: Omit<LeavePolicyRule, "id">) => void
  updateLeavePolicyRule: (id: string, rule: Partial<LeavePolicyRule>) => void
  deleteLeavePolicyRule: (id: string) => void

  addLeaveType: (leaveType: Omit<LeaveType, "id">) => void
  updateLeaveType: (id: string, leaveType: Partial<LeaveType>) => void
  deleteLeaveType: (id: string) => void

  addAttendanceRecord: (record: Omit<AttendanceRecord, "id">) => void
  updateAttendanceRecord: (id: string, record: Partial<AttendanceRecord>) => void

  addJobRequisition: (job: Omit<JobRequisition, "id" | "createdAt">) => void
  updateJobRequisition: (id: string, job: Partial<JobRequisition>) => void
  deleteJobRequisition: (id: string) => void
  addCandidate: (candidate: Omit<Candidate, "id" | "appliedAt" | "updatedAt">) => void
  updateCandidate: (id: string, candidate: Partial<Candidate>) => void
  moveCandidateStage: (id: string, stage: Candidate["stage"]) => void

  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void

  addAuditLog: (entry: Omit<AuditLogEntry, "id" | "changedAt">) => void

  createEmployeeFromCandidate: (candidateId: string) => string | null

  banners: Banner[]
  addBanner: (banner: Omit<Banner, "id">) => void
  updateBanner: (id: string, banner: Partial<Banner>) => void
  deleteBanner: (id: string) => void
  reorderBanners: (banners: Banner[]) => void
  setBanners: (banners: Banner[]) => void
}

export interface Banner {
  id: string
  url: string
  name: string
  isActive: boolean
  order: number
}

const initialCustomRoles: CustomRole[] = [
  {
    id: "admin",
    name: roleInfo.admin.name,
    description: roleInfo.admin.description,
    isBuiltIn: true,
    permissions: [],
    modulePermissions: defaultRoleModulePermissions.admin,
    assignedEmployeeIds: [],
  },
  {
    id: "hr",
    name: roleInfo.hr.name,
    description: roleInfo.hr.description,
    isBuiltIn: true,
    permissions: [],
    modulePermissions: defaultRoleModulePermissions.hr,
    assignedEmployeeIds: [],
  },
  {
    id: "employee",
    name: roleInfo.employee.name,
    description: roleInfo.employee.description,
    isBuiltIn: true,
    permissions: [],
    modulePermissions: defaultRoleModulePermissions.employee,
    assignedEmployeeIds: [],
  },
]

export const useStore = create<StoreState>((set, get) => ({
  organizationalUnits: initialOrgUnits,
  jobClassifications: initialJobClassifications,
  positions: initialPositions,
  employees: initialEmployees,
  auditLogs: initialAuditLogs,

  leaveTypes: initialLeaveTypes,
  leaveRequests: initialLeaveRequests,
  leaveBalances: initialLeaveBalances,
  leavePolicyRules: initialLeavePolicyRules,
  publicHolidays: initialPublicHolidays,

  attendanceRecords: initialAttendanceRecords,
  shifts: initialShifts,
  jobRequisitions: initialJobRequisitions,
  candidates: initialCandidates,
  notifications: initialNotifications,

  currentRole: "admin" as Role,
  setCurrentRole: (role: Role) => set({ currentRole: role }),

  modules: defaultModules,
  addModule: (module) =>
    set((state) => ({
      modules: [...state.modules, { ...module, id: `mod-${Date.now()}` }],
    })),
  updateModule: (id, module) =>
    set((state) => ({
      modules: state.modules.map((m) => (m.id === id ? { ...m, ...module } : m)),
    })),
  deleteModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== id),
    })),
  reorderModules: (modules) =>
    set(() => ({
      modules,
    })),

  customRoles: initialCustomRoles,
  addCustomRole: (role) =>
    set((state) => ({
      customRoles: [
        ...state.customRoles,
        { ...role, id: `cr-${Date.now()}`, isBuiltIn: false, assignedEmployeeIds: [] },
      ],
    })),
  updateCustomRole: (id, role) =>
    set((state) => ({
      customRoles: state.customRoles.map((r) => (r.id === id ? { ...r, ...role } : r)),
    })),
  deleteCustomRole: (id) =>
    set((state) => ({
      customRoles: state.customRoles.filter((r) => r.id !== id),
    })),
  updateRolePermissions: (roleId, permissions) =>
    set((state) => ({
      customRoles: state.customRoles.map((r) => (r.id === roleId ? { ...r, permissions } : r)),
    })),
  updateRoleModulePermissions: (roleId, moduleId, actions) =>
    set((state) => ({
      customRoles: state.customRoles.map((r) => {
        if (r.id !== roleId) return r

        const updatedModulePermissions = { ...r.modulePermissions }
        if (actions.length > 0) {
          updatedModulePermissions[moduleId] = actions
        } else {
          delete updatedModulePermissions[moduleId]
        }

        return { ...r, modulePermissions: updatedModulePermissions }
      }),
    })),

  // Organizational Unit actions
  addOrganizationalUnit: (unit) =>
    set((state) => ({
      organizationalUnits: [...state.organizationalUnits, { ...unit, id: `O-${Date.now()}` }],
    })),
  updateOrganizationalUnit: (id, unit) =>
    set((state) => ({
      organizationalUnits: state.organizationalUnits.map((u) => (u.id === id ? { ...u, ...unit } : u)),
    })),
  deleteOrganizationalUnit: (id) =>
    set((state) => ({
      organizationalUnits: state.organizationalUnits.filter((u) => u.id !== id),
    })),

  // Job Classification actions
  addJobClassification: (job) =>
    set((state) => ({
      jobClassifications: [...state.jobClassifications, { ...job, id: `C-${Date.now()}` }],
    })),
  updateJobClassification: (id, job) =>
    set((state) => ({
      jobClassifications: state.jobClassifications.map((j) => (j.id === id ? { ...j, ...job } : j)),
    })),
  deleteJobClassification: (id) =>
    set((state) => ({
      jobClassifications: state.jobClassifications.filter((j) => j.id !== id),
    })),

  // Position actions
  addPosition: (position) =>
    set((state) => ({
      positions: [...state.positions, { ...position, id: `S-${Date.now()}` }],
    })),
  updatePosition: (id, position) =>
    set((state) => ({
      positions: state.positions.map((p) => (p.id === id ? { ...p, ...position } : p)),
    })),
  deletePosition: (id) =>
    set((state) => ({
      positions: state.positions.filter((p) => p.id !== id),
    })),

  // Employee actions
  addEmployee: (employee) =>
    set((state) => ({
      employees: [...state.employees, { ...employee, id: `P-${Date.now()}`, auditLog: [] }],
    })),
  updateEmployee: (id, employee) =>
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, ...employee } : e)),
    })),
  deleteEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    })),
  updateEmployeeSelfService: (id, field, value, changedByName) =>
    set((state) => {
      const employee = state.employees.find((e) => e.id === id)
      if (!employee) return state

      const oldValue = String((employee as Record<string, unknown>)[field] || "")
      const auditEntry: AuditLogEntry = {
        id: `audit-${Date.now()}`,
        employeeId: id,
        employeeName: employee.fullName,
        fieldChanged: field,
        oldValue,
        newValue: value,
        changedBy: id,
        changedByName,
        changedAt: new Date().toISOString(),
        changeType: "self",
      }

      return {
        employees: state.employees.map((e) =>
          e.id === id ? { ...e, [field]: value, auditLog: [...(e.auditLog || []), auditEntry] } : e,
        ),
        auditLogs: [...state.auditLogs, auditEntry],
      }
    }),

  addLeaveRequest: (request) =>
    set((state) => ({
      leaveRequests: [
        ...state.leaveRequests,
        {
          ...request,
          id: `lr-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
  updateLeaveRequest: (id, request) =>
    set((state) => ({
      leaveRequests: state.leaveRequests.map((r) =>
        r.id === id ? { ...r, ...request, updatedAt: new Date().toISOString() } : r,
      ),
    })),
  approveLeaveRequest: (id, approverId, comment) =>
    set((state) => {
      const request = state.leaveRequests.find((r) => r.id === id)
      if (!request) return state

      const updatedApprovers = request.approvers.map((a) =>
        a.employeeId === approverId
          ? { ...a, status: "approved" as const, comment, respondedAt: new Date().toISOString() }
          : a,
      )

      const allApproved = updatedApprovers.every((a) => a.status === "approved")

      let updatedBalances = state.leaveBalances
      if (allApproved) {
        updatedBalances = state.leaveBalances.map((b) =>
          b.employeeId === request.employeeId && b.leaveTypeId === request.leaveTypeId
            ? { ...b, pending: b.pending - request.totalDays, used: b.used + request.totalDays }
            : b,
        )
      }

      return {
        leaveRequests: state.leaveRequests.map((r) =>
          r.id === id
            ? {
              ...r,
              approvers: updatedApprovers,
              status: allApproved ? "approved" : r.status,
              updatedAt: new Date().toISOString(),
            }
            : r,
        ),
        leaveBalances: updatedBalances,
      }
    }),
  rejectLeaveRequest: (id, approverId, comment) =>
    set((state) => {
      const request = state.leaveRequests.find((r) => r.id === id)
      if (!request) return state

      const updatedBalances = state.leaveBalances.map((b) =>
        b.employeeId === request.employeeId && b.leaveTypeId === request.leaveTypeId
          ? { ...b, pending: b.pending - request.totalDays, available: b.available + request.totalDays }
          : b,
      )

      return {
        leaveRequests: state.leaveRequests.map((r) =>
          r.id === id
            ? {
              ...r,
              approvers: r.approvers.map((a) =>
                a.employeeId === approverId
                  ? { ...a, status: "rejected" as const, comment, respondedAt: new Date().toISOString() }
                  : a,
              ),
              status: "rejected",
              updatedAt: new Date().toISOString(),
            }
            : r,
        ),
        leaveBalances: updatedBalances,
      }
    }),
  cancelLeaveRequest: (id) =>
    set((state) => {
      const request = state.leaveRequests.find((r) => r.id === id)
      if (!request) return state

      const updatedBalances = state.leaveBalances.map((b) =>
        b.employeeId === request.employeeId && b.leaveTypeId === request.leaveTypeId
          ? { ...b, pending: b.pending - request.totalDays, available: b.available + request.totalDays }
          : b,
      )

      return {
        leaveRequests: state.leaveRequests.map((r) =>
          r.id === id ? { ...r, status: "cancelled", updatedAt: new Date().toISOString() } : r,
        ),
        leaveBalances: updatedBalances,
      }
    }),
  updateLeaveBalance: (employeeId, leaveTypeId, balance) =>
    set((state) => ({
      leaveBalances: state.leaveBalances.map((b) =>
        b.employeeId === employeeId && b.leaveTypeId === leaveTypeId ? { ...b, ...balance } : b,
      ),
    })),

  addPublicHoliday: (holiday) =>
    set((state) => ({
      publicHolidays: [...state.publicHolidays, { ...holiday, id: `ph-${Date.now()}` }],
    })),
  updatePublicHoliday: (id, holiday) =>
    set((state) => ({
      publicHolidays: state.publicHolidays.map((h) => (h.id === id ? { ...h, ...holiday } : h)),
    })),
  deletePublicHoliday: (id) =>
    set((state) => ({
      publicHolidays: state.publicHolidays.filter((h) => h.id !== id),
    })),

  // Leave Policy Rule actions
  addLeavePolicyRule: (rule) =>
    set((state) => ({
      leavePolicyRules: [...state.leavePolicyRules, { ...rule, id: `lp-${Date.now()}` }],
    })),
  updateLeavePolicyRule: (id, rule) =>
    set((state) => ({
      leavePolicyRules: state.leavePolicyRules.map((r) => (r.id === id ? { ...r, ...rule } : r)),
    })),
  deleteLeavePolicyRule: (id) =>
    set((state) => ({
      leavePolicyRules: state.leavePolicyRules.filter((r) => r.id !== id),
    })),

  // Leave Type actions
  addLeaveType: (leaveType) =>
    set((state) => ({
      leaveTypes: [...state.leaveTypes, { ...leaveType, id: `lt-${Date.now()}` }],
    })),
  updateLeaveType: (id, leaveType) =>
    set((state) => ({
      leaveTypes: state.leaveTypes.map((t) => (t.id === id ? { ...t, ...leaveType } : t)),
    })),
  deleteLeaveType: (id) =>
    set((state) => ({
      leaveTypes: state.leaveTypes.filter((t) => t.id !== id),
    })),

  // Attendance Record actions
  addAttendanceRecord: (record) =>
    set((state) => ({
      attendanceRecords: [...state.attendanceRecords, { ...record, id: `att-${Date.now()}` }],
    })),
  updateAttendanceRecord: (id, record) =>
    set((state) => ({
      attendanceRecords: state.attendanceRecords.map((r) => (r.id === id ? { ...r, ...record } : r)),
    })),

  // Job Requisition actions
  addJobRequisition: (job) =>
    set((state) => ({
      jobRequisitions: [
        ...state.jobRequisitions,
        { ...job, id: `jr-${Date.now()}`, createdAt: new Date().toISOString() },
      ],
    })),
  updateJobRequisition: (id, job) =>
    set((state) => ({
      jobRequisitions: state.jobRequisitions.map((j) => (j.id === id ? { ...j, ...job } : j)),
    })),
  deleteJobRequisition: (id) =>
    set((state) => ({
      jobRequisitions: state.jobRequisitions.filter((j) => j.id !== id),
    })),
  addCandidate: (candidate) =>
    set((state) => ({
      candidates: [
        ...state.candidates,
        {
          ...candidate,
          id: `cand-${Date.now()}`,
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
  updateCandidate: (id, candidate) =>
    set((state) => ({
      candidates: state.candidates.map((c) =>
        c.id === id ? { ...c, ...candidate, updatedAt: new Date().toISOString() } : c,
      ),
    })),
  moveCandidateStage: (id, stage) =>
    set((state) => ({
      candidates: state.candidates.map((c) => (c.id === id ? { ...c, stage, updatedAt: new Date().toISOString() } : c)),
    })),

  // Notification actions
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        { ...notification, id: `notif-${Date.now()}`, createdAt: new Date().toISOString() },
        ...state.notifications,
      ],
    })),

  // Audit Log actions
  addAuditLog: (entry) =>
    set((state) => ({
      auditLogs: [...state.auditLogs, { ...entry, id: `audit-${Date.now()}`, changedAt: new Date().toISOString() }],
    })),

  // Candidate to Employee actions
  createEmployeeFromCandidate: (candidateId: string) => {
    const { candidates, employees, positions, organizationalUnits, jobRequisitions, addEmployee, updateCandidate } =
      get()

    const candidate = candidates.find((c) => c.id === candidateId)
    if (!candidate || candidate.stage !== "hired" || !candidate.offerAccepted) {
      return null
    }

    const jobReq = jobRequisitions.find((j) => j.id === candidate.jobRequisitionId)
    if (!jobReq) return null

    const orgUnit = organizationalUnits.find((u) => u.id === jobReq.organizationalUnitId)
    const position = positions.find((p) => p.id === jobReq.positionId)

    // Generate new employee ID
    const maxId = Math.max(...employees.map((e) => Number.parseInt(e.id.replace("P-", "")) || 0), 0)
    const newEmployeeId = `P-${String(maxId + 1).padStart(3, "0")}`

    // Parse name
    const nameParts = candidate.fullName.split(" ")
    const firstName = nameParts[nameParts.length - 1]
    const lastName = nameParts.slice(0, -1).join(" ")

    const companyEmail = `${lastName.toLowerCase().replace(/\s+/g, "")}.${firstName.toLowerCase()}@8seneca.com`

    const newEmployee = {
      id: newEmployeeId,
      code: newEmployeeId,
      fullName: candidate.fullName,
      firstName,
      lastName,
      personalEmail: candidate.email,
      companyEmail,
      positionId: position?.id || "",
      positionCode: position?.code || "",
      positionTitle: position?.title || jobReq.title,
      jobClassificationId: jobReq.jobClassificationId || "",
      jobClassificationTitle: jobReq.jobClassificationTitle || "",
      organizationalUnitId: jobReq.organizationalUnitId,
      organizationalUnitName: orgUnit?.name || jobReq.organizationalUnitName,
      costCenter: orgUnit?.costCenter,
      status: "pending" as const,
      onboardingStatus: {
        emailSent: false,
        accountActivated: false,
        profileCompleted: false,
      },
      startDate: new Date().toISOString().split("T")[0],
      fte: 1.0,
      cellphone: candidate.phone,
    }

    set((state) => ({
      employees: [...state.employees, newEmployee],
      // Update job requisition hired count
      jobRequisitions: state.jobRequisitions.map((j) =>
        j.id === candidate.jobRequisitionId ? { ...j, hired: j.hired + 1 } : j,
      ),
    }))

    return newEmployeeId
  },

  // Banner actions
  banners: [
    {
      id: "1",
      url: "/placeholder.svg?height=300&width=1920",
      name: "Welcome Banner 2024",
      isActive: true,
      order: 0,
    },
    {
      id: "2",
      url: "/placeholder.svg?height=300&width=1920",
      name: "Company Retreat Announcement",
      isActive: false,
      order: 1,
    },
  ],
  addBanner: (banner) =>
    set((state) => ({
      banners: [...state.banners, { ...banner, id: `bn-${Date.now()}` }],
    })),
  updateBanner: (id, banner) =>
    set((state) => ({
      banners: state.banners.map((b) => (b.id === id ? { ...b, ...banner } : b)),
    })),
  deleteBanner: (id) =>
    set((state) => ({
      banners: state.banners.filter((b) => b.id !== id),
    })),
  reorderBanners: (banners) =>
    set(() => ({
      banners,
    })),
  setBanners: (banners) =>
    set(() => ({
      banners,
    })),
}))
