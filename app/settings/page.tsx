"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { moduleActions, type ActionType } from "@/lib/rbac"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BannerSettings } from "./components/banner-settings"
import {
  Shield,
  UserCog,
  User,
  Plus,
  Settings,
  Users,
  Building2,
  Pencil,
  Trash2,
  Save,
  GripVertical,
  LayoutDashboard,
  Network,
  Briefcase,
  UserPlus,
  Eye,
  FilePlus,
  FileEdit,
  FileX,
  Crown,
  UserCheck,
  Home,
  FileText,
  Calendar,
  Clock,
  Bell,
  Mail,
  MessageSquare,
  FolderOpen,
  Database,
  BarChart3,
  PieChart,
  TrendingUp,
  Wallet,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  Map,
  Globe,
  Phone,
  Video,
  ImageIcon,
  Camera,
  Mic,
  Music,
  Play,
  Heart,
  Star,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  Paperclip,
  Download,
  Upload,
  Share,
  Send,
  Printer,
  Clipboard,
  CheckSquare,
  ListTodo,
  Target,
  Award,
  Gift,
  Zap,
  ShieldIcon,
  Lock,
  Key,
  Fingerprint,
  Scan,
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  Grid,
  List,
  Table,
  Kanban,
  GitBranch,
  Code,
  Terminal,
  Bug,
  Wrench,
  Cog,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CheckCircle,
  CalendarDays,
  Repeat,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"


const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-5 w-5" />,
  hr: <UserCog className="h-5 w-5" />,
  "hr-specialist": <UserCheck className="h-5 w-5" />,
  "team-lead": <Crown className="h-5 w-5" />,
  employee: <User className="h-5 w-5" />,
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  Network,
  Briefcase,
  User,
  Settings,
  Home,
  FileText,
  Calendar,
  Clock,
  Bell,
  Mail,
  MessageSquare,
  FolderOpen,
  Database,
  BarChart3,
  PieChart,
  TrendingUp,
  Wallet,
  CreditCard,
  ShoppingCart,
  Package,
  Truck,
  Map,
  Globe,
  Phone,
  Video,
  ImageIcon,
  Camera,
  Mic,
  Music,
  Play,
  Heart,
  Star,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  Paperclip,
  Download,
  Upload,
  Share,
  Send,
  Printer,
  Clipboard,
  CheckSquare,
  ListTodo,
  Target,
  Award,
  Gift,
  Zap,
  Shield: ShieldIcon,
  Lock,
  Key,
  Fingerprint,
  Scan,
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  Grid,
  List,
  Table,
  Kanban,
  GitBranch,
  Code,
  Terminal,
  Bug,
  Wrench,
  Cog,
  HelpCircle,
  Info,
  AlertCircle,
  AlertTriangle,
  XCircle,
  CheckCircle,
  CalendarDays,
  Repeat,
}

const iconOptions = [
  // Navigation & Layout
  { value: "LayoutDashboard", label: "Dashboard", category: "Navigation" },
  { value: "Home", label: "Home", category: "Navigation" },
  { value: "Grid", label: "Grid", category: "Navigation" },
  { value: "List", label: "List", category: "Navigation" },
  { value: "Table", label: "Table", category: "Navigation" },
  { value: "Kanban", label: "Kanban", category: "Navigation" },
  { value: "Layers", label: "Layers", category: "Navigation" },
  // People & Organization
  { value: "Users", label: "Users", category: "People" },
  { value: "User", label: "User", category: "People" },
  { value: "UserPlus", label: "User Plus", category: "People" },
  { value: "Building2", label: "Building", category: "People" },
  { value: "Network", label: "Network", category: "People" },
  { value: "Briefcase", label: "Briefcase", category: "People" },
  // Documents & Files
  { value: "FileText", label: "Document", category: "Documents" },
  { value: "FolderOpen", label: "Folder", category: "Documents" },
  { value: "Clipboard", label: "Clipboard", category: "Documents" },
  { value: "Paperclip", label: "Attachment", category: "Documents" },
  // Time & Calendar
  { value: "Calendar", label: "Calendar", category: "Time" },
  { value: "Clock", label: "Clock", category: "Time" },
  // Communication
  { value: "Bell", label: "Notifications", category: "Communication" },
  { value: "Mail", label: "Email", category: "Communication" },
  { value: "MessageSquare", label: "Messages", category: "Communication" },
  { value: "Phone", label: "Phone", category: "Communication" },
  { value: "Video", label: "Video", category: "Communication" },
  { value: "Send", label: "Send", category: "Communication" },
  // Data & Analytics
  { value: "Database", label: "Database", category: "Data" },
  { value: "BarChart3", label: "Bar Chart", category: "Data" },
  { value: "PieChart", label: "Pie Chart", category: "Data" },
  { value: "TrendingUp", label: "Trending", category: "Data" },
  { value: "Target", label: "Target", category: "Data" },
  // Finance
  { value: "Wallet", label: "Wallet", category: "Finance" },
  { value: "CreditCard", label: "Credit Card", category: "Finance" },
  { value: "ShoppingCart", label: "Cart", category: "Finance" },
  // Tasks & Actions
  { value: "CheckSquare", label: "Checkbox", category: "Tasks" },
  { value: "ListTodo", label: "Todo List", category: "Tasks" },
  { value: "Flag", label: "Flag", category: "Tasks" },
  { value: "Bookmark", label: "Bookmark", category: "Tasks" },
  { value: "Star", label: "Star", category: "Tasks" },
  // Security & Settings
  { value: "Settings", label: "Settings", category: "System" },
  { value: "Cog", label: "Cog", category: "System" },
  { value: "Shield", label: "Shield", category: "System" },
  { value: "Lock", label: "Lock", category: "System" },
  { value: "Key", label: "Key", category: "System" },
  { value: "Wrench", label: "Wrench", category: "System" },
  // Status
  { value: "CheckCircle", label: "Success", category: "Status" },
  { value: "AlertCircle", label: "Alert", category: "Status" },
  { value: "AlertTriangle", label: "Warning", category: "Status" },
  { value: "Info", label: "Info", category: "Status" },
  { value: "HelpCircle", label: "Help", category: "Status" },
  // Misc
  { value: "Globe", label: "Globe", category: "Misc" },
  { value: "Map", label: "Map", category: "Misc" },
  { value: "Package", label: "Package", category: "Misc" },
  { value: "Award", label: "Award", category: "Misc" },
  { value: "Gift", label: "Gift", category: "Misc" },
  { value: "Zap", label: "Zap", category: "Misc" },
  { value: "Heart", label: "Heart", category: "Misc" },
  { value: "Tag", label: "Tag", category: "Misc" },
  { value: "Search", label: "Search", category: "Misc" },
  { value: "Filter", label: "Filter", category: "Misc" },
  // Leave
  { value: "CalendarDays", label: "Calendar Days", category: "Leave" },
  { value: "Repeat", label: "Repeat", category: "Leave" },
]

const actionIcons: Record<ActionType, React.ReactNode> = {
  view: <Eye className="h-3.5 w-3.5" />,
  create: <FilePlus className="h-3.5 w-3.5" />,
  edit: <FileEdit className="h-3.5 w-3.5" />,
  delete: <FileX className="h-3.5 w-3.5" />,
}

const colorOptions = [
  { value: "bg-rose-500/20 text-rose-400", label: "Rose" },
  { value: "bg-sky-500/20 text-sky-400", label: "Sky" },
  { value: "bg-emerald-500/20 text-emerald-400", label: "Emerald" },
  { value: "bg-amber-500/20 text-amber-400", label: "Amber" },
  { value: "bg-violet-500/20 text-violet-400", label: "Violet" },
  { value: "bg-pink-500/20 text-pink-400", label: "Pink" },
  { value: "bg-cyan-500/20 text-cyan-400", label: "Cyan" },
  { value: "bg-orange-500/20 text-orange-400", label: "Orange" },
]



// Default module permissions for new roles
const defaultRoleModulePermissions: Record<string, ActionType[]> = {
  dashboard: ["view"],
} as const;

export default function SettingsPage() {
  const router = useRouter()
  const {
    currentRole,
    customRoles,
    modules,
    employees,
    addCustomRole,
    updateCustomRole,
    deleteCustomRole,
    updateRoleModulePermissions,
    addModule,
    updateModule,
    deleteModule,
    reorderModules,
  } = useStore()

  const [selectedRoleId, setSelectedRoleId] = useState<string>("admin")
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [hasPermissionChanges, setHasPermissionChanges] = useState(false)
  const [editedModulePermissions, setEditedModulePermissions] = useState<Record<string, ActionType[]>>({})

  // Module management
  const [createModuleOpen, setCreateModuleOpen] = useState(false)
  const [editModuleOpen, setEditModuleOpen] = useState(false)
  const [deleteModuleConfirmOpen, setDeleteModuleConfirmOpen] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [newModule, setNewModule] = useState({
    name: "",
    icon: "LayoutDashboard",
    href: "",
    parentId: "",
    order: 0,
    isActive: true,
  })

  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null)
  const [dragOverModuleId, setDragOverModuleId] = useState<string | null>(null)

  // Role management
  const [createRoleOpen, setCreateRoleOpen] = useState(false)
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [newRole, setNewRole] = useState({ name: "", description: "", color: colorOptions[0].value })

  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([])
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("")

  const selectedRole = customRoles.find((r) => r.id === selectedRoleId)
  const selectedModule = selectedModuleId ? modules.find((m) => m.id === selectedModuleId) : null

  // Get parent modules (modules without parentId)
  const parentModules = modules.filter((m) => !m.parentId).sort((a, b) => a.order - b.order)
  // Get child modules for a parent
  const getChildModules = (parentId: string) =>
    modules.filter((m) => m.parentId === parentId).sort((a, b) => a.order - b.order)

  // Sync edited permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      setEditedModulePermissions({ ...selectedRole.modulePermissions })
      setHasPermissionChanges(false)
    }
  }, [selectedRoleId, selectedRole])

  // Redirect if not admin
  useEffect(() => {
    if (currentRole !== "admin") {
      router.push("/")
    }
  }, [currentRole, router])

  if (currentRole !== "admin") {
    return null
  }

  const toggleExpandModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const isModuleEnabled = (moduleId: string) => {
    const perms = editedModulePermissions[moduleId]
    return perms && perms.length > 0
  }

  const toggleModuleEnabled = (moduleId: string) => {
    setHasPermissionChanges(true)
    if (isModuleEnabled(moduleId)) {
      const updated = { ...editedModulePermissions }
      delete updated[moduleId]

      // Also disable all child modules
      const childModules = getChildModules(moduleId)
      childModules.forEach((child) => {
        delete updated[child.id]
      })

      setEditedModulePermissions(updated)

      // Collapse the parent module when unchecked
      setExpandedModules((prev) => prev.filter((id) => id !== moduleId))
    } else {
      // Enable module with only "view" permission by default
      setEditedModulePermissions((prev) => ({
        ...prev,
        [moduleId]: ["view"],
      }))
    }
  }

  const toggleAction = (moduleId: string, action: ActionType) => {
    setHasPermissionChanges(true)
    const currentActions = editedModulePermissions[moduleId] || []
    if (currentActions.includes(action)) {
      const newActions = currentActions.filter((a) => a !== action)
      if (newActions.length === 0) {
        const updated = { ...editedModulePermissions }
        delete updated[moduleId]
        setEditedModulePermissions(updated)
      } else {
        setEditedModulePermissions((prev) => ({
          ...prev,
          [moduleId]: newActions,
        }))
      }
    } else {
      setEditedModulePermissions((prev) => ({
        ...prev,
        [moduleId]: [...currentActions, action],
      }))
    }
  }

  const savePermissionChanges = () => {
    if (selectedRoleId) {
      Object.entries(editedModulePermissions).forEach(([moduleId, actions]) => {
        updateRoleModulePermissions(selectedRoleId, moduleId, actions)
      })
      // Remove modules that were disabled
      const currentModuleIds = Object.keys(editedModulePermissions)
      Object.keys(selectedRole?.modulePermissions || {}).forEach((moduleId) => {
        if (!currentModuleIds.includes(moduleId)) {
          updateRoleModulePermissions(selectedRoleId, moduleId, [])
        }
      })
      setHasPermissionChanges(false)
    }
  }

  const handleCreateRole = () => {
    if (newRole.name.trim()) {
      addCustomRole({
        name: newRole.name,
        description: newRole.description,
        color: newRole.color,
        permissions: [],
        modulePermissions: defaultRoleModulePermissions,
        assignedEmployeeIds,
      })
      setNewRole({ name: "", description: "", color: colorOptions[0].value })
      setAssignedEmployeeIds([])
      setCreateRoleOpen(false)
    }
  }

  const handleEditRole = () => {
    if (selectedRole && newRole.name.trim()) {
      updateCustomRole(selectedRole.id, {
        name: newRole.name,
        description: newRole.description,
        color: newRole.color,
        assignedEmployeeIds,
      })
      setNewRole({ name: "", description: "", color: colorOptions[0].value })
      setAssignedEmployeeIds([])
      setEditRoleOpen(false)
    }
  }

  const handleDeleteRole = () => {
    if (selectedRole && !selectedRole.isBuiltIn) {
      deleteCustomRole(selectedRoleId)
      setSelectedRoleId("admin")
      setDeleteConfirmOpen(false)
    }
  }

  const openEditRole = () => {
    if (selectedRole) {
      setNewRole({
        name: selectedRole.name,
        description: selectedRole.description,
        color: selectedRole.color || colorOptions[0].value,
      })
      setAssignedEmployeeIds(selectedRole.assignedEmployeeIds || [])
      setEditRoleOpen(true)
    }
  }

  const filteredEmployees = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(employeeSearchQuery.toLowerCase()),
  )

  const toggleEmployeeAssignment = (employeeId: string) => {
    setAssignedEmployeeIds((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    )
  }

  // Module CRUD handlers
  const handleCreateModule = () => {
    if (newModule.name.trim()) {
      addModule({
        name: newModule.name,
        icon: newModule.icon,
        href: newModule.href || undefined,
        parentId: newModule.parentId || undefined,
        order: newModule.order,
        isActive: newModule.isActive,
      })
      setNewModule({ name: "", icon: "LayoutDashboard", href: "", parentId: "", order: 0, isActive: true })
      setCreateModuleOpen(false)
    }
  }

  const handleEditModule = () => {
    if (selectedModuleId && newModule.name.trim()) {
      updateModule(selectedModuleId, {
        name: newModule.name,
        icon: newModule.icon,
        href: newModule.href || undefined,
        parentId: newModule.parentId || undefined,
        order: newModule.order,
        isActive: newModule.isActive,
      })
      setEditModuleOpen(false)
    }
  }

  const handleDeleteModule = () => {
    if (selectedModuleId) {
      deleteModule(selectedModuleId)
      setSelectedModuleId(null)
      setDeleteModuleConfirmOpen(false)
    }
  }

  const openEditModule = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId)
    if (module) {
      setSelectedModuleId(moduleId)
      setNewModule({
        name: module.name,
        icon: module.icon,
        href: module.href || "",
        parentId: module.parentId || "",
        order: module.order,
        isActive: module.isActive,
      })
      setEditModuleOpen(true)
    }
  }

  const openDeleteModule = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    setDeleteModuleConfirmOpen(true)
  }

  const handleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDraggedModuleId(moduleId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, moduleId: string) => {
    e.preventDefault()
    if (draggedModuleId && draggedModuleId !== moduleId) {
      setDragOverModuleId(moduleId)
    }
  }

  const handleDragLeave = () => {
    setDragOverModuleId(null)
  }

  const handleDrop = (e: React.DragEvent, targetModuleId: string) => {
    e.preventDefault()
    if (!draggedModuleId || draggedModuleId === targetModuleId) {
      setDraggedModuleId(null)
      setDragOverModuleId(null)
      return
    }

    const draggedModule = modules.find((m) => m.id === draggedModuleId)
    const targetModule = modules.find((m) => m.id === targetModuleId)

    if (!draggedModule || !targetModule) {
      setDraggedModuleId(null)
      setDragOverModuleId(null)
      return
    }

    // Only allow reordering within the same parent level
    if (draggedModule.parentId !== targetModule.parentId) {
      setDraggedModuleId(null)
      setDragOverModuleId(null)
      return
    }

    const updatedModules = [...modules]
    const draggedIndex = updatedModules.findIndex((m) => m.id === draggedModuleId)
    const targetIndex = updatedModules.findIndex((m) => m.id === targetModuleId)

    // Swap orders
    const tempOrder = updatedModules[draggedIndex].order
    updatedModules[draggedIndex] = { ...updatedModules[draggedIndex], order: updatedModules[targetIndex].order }
    updatedModules[targetIndex] = { ...updatedModules[targetIndex], order: tempOrder }

    reorderModules(updatedModules)
    setDraggedModuleId(null)
    setDragOverModuleId(null)
  }

  const handleDragEnd = () => {
    setDraggedModuleId(null)
    setDragOverModuleId(null)
  }

  const renderModuleRow = (module: (typeof modules)[0], isChild = false) => {
    const Icon = iconMap[module.icon] || LayoutDashboard
    const childModules = getChildModules(module.id)
    const hasChildren = childModules.length > 0
    const isExpanded = expandedModules.includes(module.id)
    const isDragging = draggedModuleId === module.id
    const isDragOver = dragOverModuleId === module.id

    return (
      <div key={module.id}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, module.id)}
          onDragOver={(e) => handleDragOver(e, module.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, module.id)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${isChild ? "ml-8 bg-secondary/30" : "bg-card"
            } ${isDragging ? "opacity-50 border-dashed" : ""} ${isDragOver ? "border-primary bg-primary/5" : "border-border"
            }`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
          <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-primary/10`}>
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-card-foreground">{module.name}</p>
            <p className="text-xs text-muted-foreground">
              {module.href || "Parent module"}{" "}
              {module.parentId && `• Child of ${modules.find((m) => m.id === module.parentId)?.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={module.isActive ? "default" : "secondary"}>{module.isActive ? "Active" : "Inactive"}</Badge>
            <Button variant="ghost" size="icon" onClick={() => openEditModule(module.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => openDeleteModule(module.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-2">{childModules.map((child) => renderModuleRow(child, true))}</div>
        )}
      </div>
    )
  }

  const renderPermissionTree = () => {
    return (
      <div className="space-y-3">
        {parentModules.map((parentModule) => {
          const childModules = getChildModules(parentModule.id)
          const hasChildren = childModules.length > 0
          const isParentEnabled = isModuleEnabled(parentModule.id)
          const isExpanded = isParentEnabled && hasChildren && expandedModules.includes(parentModule.id)
          const Icon = iconMap[parentModule.icon] || LayoutDashboard

          return (
            <div key={parentModule.id} className="rounded-lg border border-border overflow-hidden">
              {/* Parent Module */}
              <div className="flex items-center gap-3 p-3 bg-card">
                <Checkbox
                  checked={isParentEnabled}
                  onCheckedChange={() => toggleModuleEnabled(parentModule.id)}
                  className="border-border data-[state=checked]:bg-primary"
                />
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="flex-1 font-medium text-card-foreground">{parentModule.name}</span>
                {hasChildren && (
                  <Button variant="ghost" size="icon" onClick={() => toggleExpandModule(parentModule.id)}>
                    {expandedModules.includes(parentModule.id) ? (
                      <Layers className="h-4 w-4" />
                    ) : (
                      <Grid className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Actions for parent - ONLY show if parent has NO children and is enabled */}
              {isParentEnabled && !hasChildren && (
                <div className="border-t border-border bg-secondary/30 p-3 pl-14">
                  <div className="flex flex-wrap gap-2">
                    {moduleActions.map((action) => {
                      const isChecked = (editedModulePermissions[parentModule.id] || []).includes(action.id)
                      return (
                        <div
                          key={action.id}
                          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 cursor-pointer transition-colors ${isChecked ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
                            }`}
                          onClick={() => toggleAction(parentModule.id, action.id)}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleAction(parentModule.id, action.id)}
                            className="border-border data-[state=checked]:bg-primary h-3.5 w-3.5"
                          />
                          {actionIcons[action.id]}
                          <span className="text-sm">{action.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Child modules - only show when parent is enabled and expanded */}
              {isExpanded && (
                <div className="border-t border-border">
                  {childModules.map((childModule) => {
                    const isChildEnabled = isModuleEnabled(childModule.id)
                    const ChildIcon = iconMap[childModule.icon] || LayoutDashboard

                    return (
                      <div key={childModule.id} className="border-b border-border last:border-b-0">
                        <div className="flex items-center gap-3 p-3 pl-10 bg-secondary/20">
                          <Checkbox
                            checked={isChildEnabled}
                            onCheckedChange={() => toggleModuleEnabled(childModule.id)}
                            className="border-border data-[state=checked]:bg-primary"
                          />
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                            <ChildIcon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="text-sm text-card-foreground">{childModule.name}</span>
                        </div>

                        {/* Actions for child - always shown expanded when child is enabled */}
                        {isChildEnabled && (
                          <div className="bg-secondary/10 p-3 pl-20">
                            <div className="flex flex-wrap gap-2">
                              {moduleActions.map((action) => {
                                const isChecked = (editedModulePermissions[childModule.id] || []).includes(action.id)
                                return (
                                  <div
                                    key={action.id}
                                    className={`flex items-center gap-2 rounded-md border px-3 py-1.5 cursor-pointer transition-colors ${isChecked ? "border-primary bg-primary/10" : "border-border hover:bg-secondary"
                                      }`}
                                    onClick={() => toggleAction(childModule.id, action.id)}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={() => toggleAction(childModule.id, action.id)}
                                      className="border-border data-[state=checked]:bg-primary h-3.5 w-3.5"
                                    />
                                    {actionIcons[action.id]}
                                    <span className="text-sm">{action.name}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }


  return (
    <AdminLayout title="Settings" subtitle="Configure roles, permissions, and system settings">
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="bg-secondary">
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>

          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Role List */}
            <Card className="bg-card border-border lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground text-base">User Roles</CardTitle>
                  <Button size="sm" onClick={() => setCreateRoleOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Role
                  </Button>
                </div>
                <CardDescription>Select a role to view and edit permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {customRoles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${selectedRoleId === role.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-transparent hover:bg-secondary"
                      }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-md ${role.color || "bg-secondary"}`}>
                      {roleIcons[role.id] || <User className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-card-foreground">{role.name}</p>
                        {role.isBuiltIn && (
                          <Badge variant="outline" className="text-xs border-muted-foreground/30">
                            Built-in
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{role.description}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Permission Editor */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-card-foreground text-base flex items-center gap-2">
                      {selectedRole?.name} Permissions
                      {selectedRole?.isBuiltIn && (
                        <Badge variant="outline" className="text-xs border-muted-foreground/30">
                          Built-in
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{selectedRole?.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openEditRole}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit Role
                    </Button>
                    {!selectedRole?.isBuiltIn && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent"
                        onClick={() => setDeleteConfirmOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Added assigned employees section */}
                {selectedRole && selectedRole.assignedEmployeeIds && selectedRole.assignedEmployeeIds.length > 0 && (
                  <div className="mb-4 p-3 bg-secondary/30 rounded-lg border border-border">
                    <p className="text-sm font-medium text-card-foreground mb-2">
                      Assigned Employees ({selectedRole.assignedEmployeeIds.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole.assignedEmployeeIds.map((empId) => {
                        const emp = employees.find((e) => e.id === empId)
                        return emp ? (
                          <Badge key={empId} variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {emp.firstName} {emp.lastName}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Check modules to grant access. Actions (View, Create, Edit, Delete) appear when a module is enabled.
                  </p>
                </div>
                {renderPermissionTree()}
                {hasPermissionChanges && (
                  <div className="mt-4 flex justify-end">
                    <Button onClick={savePermissionChanges}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Permission Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">Module Management</CardTitle>
                  <CardDescription>
                    Configure application modules, their hierarchy, and display order. Drag to reorder.
                  </CardDescription>
                </div>
                <Button onClick={() => setCreateModuleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">{parentModules.map((module) => renderModuleRow(module))}</div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <BannerSettings />
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">System Settings</CardTitle>
              <CardDescription>Configure global application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-card-foreground">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-card-foreground">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all admin users</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-card-foreground">Auto-generate Employee IDs</Label>
                  <p className="text-sm text-muted-foreground">Automatically generate IDs for new employees</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-card-foreground">Onboarding Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send automatic reminders for pending onboarding tasks</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Role Dialog */}
      <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Create New Role</DialogTitle>
            <DialogDescription>Define a new user role with custom permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Marketing Manager"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newRole.description}
                onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the role's responsibilities..."
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Assign Employees</Label>
              <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-secondary border-border"
                  >
                    {assignedEmployeeIds.length > 0
                      ? `${assignedEmployeeIds.length} employee${assignedEmployeeIds.length !== 1 ? "s" : ""} assigned`
                      : "Select employees..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-card border-border" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search employees..."
                      value={employeeSearchQuery}
                      onValueChange={setEmployeeSearchQuery}
                      className="border-0"
                    />
                    <CommandList>
                      <CommandEmpty>No employees found.</CommandEmpty>
                      <CommandGroup>
                        {filteredEmployees.map((emp) => (
                          <CommandItem
                            key={emp.id}
                            value={emp.id}
                            onSelect={() => toggleEmployeeAssignment(emp.id)}
                            className="cursor-pointer"
                          >
                            <Checkbox checked={assignedEmployeeIds.includes(emp.id)} className="mr-2" />
                            {emp.firstName} {emp.lastName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {assignedEmployeeIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {assignedEmployeeIds.map((empId) => {
                    const emp = employees.find((e) => e.id === empId)
                    return emp ? (
                      <Badge key={empId} variant="secondary" className="flex items-center gap-1">
                        {emp.firstName} {emp.lastName}
                        <button
                          onClick={() => toggleEmployeeAssignment(empId)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <Select value={newRole.color} onValueChange={(v) => setNewRole((p) => ({ ...p, color: v }))}>
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded ${color.value.split(" ")[0]}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole}>Create Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Edit Role</DialogTitle>
            <DialogDescription>Update role information and assigned employees</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole((p) => ({ ...p, name: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newRole.description}
                onChange={(e) => setNewRole((p) => ({ ...p, description: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Assign Employees</Label>
              <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-secondary border-border"
                  >
                    {assignedEmployeeIds.length > 0
                      ? `${assignedEmployeeIds.length} employee${assignedEmployeeIds.length !== 1 ? "s" : ""} assigned`
                      : "Select employees..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-card border-border" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search employees..."
                      value={employeeSearchQuery}
                      onValueChange={setEmployeeSearchQuery}
                      className="border-0"
                    />
                    <CommandList>
                      <CommandEmpty>No employees found.</CommandEmpty>
                      <CommandGroup>
                        {filteredEmployees.map((emp) => (
                          <CommandItem
                            key={emp.id}
                            value={emp.id}
                            onSelect={() => toggleEmployeeAssignment(emp.id)}
                            className="cursor-pointer"
                          >
                            <Checkbox checked={assignedEmployeeIds.includes(emp.id)} className="mr-2" />
                            {emp.firstName} {emp.lastName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {assignedEmployeeIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {assignedEmployeeIds.map((empId) => {
                    const emp = employees.find((e) => e.id === empId)
                    return emp ? (
                      <Badge key={empId} variant="secondary" className="flex items-center gap-1">
                        {emp.firstName} {emp.lastName}
                        <button
                          onClick={() => toggleEmployeeAssignment(empId)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <Select value={newRole.color} onValueChange={(v) => setNewRole((p) => ({ ...p, color: v }))}>
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded ${color.value.split(" ")[0]}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedRole?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Module Dialog */}
      <Dialog open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Add New Module</DialogTitle>
            <DialogDescription>Create a new module for the application</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Module Name</Label>
              <Input
                value={newModule.name}
                onChange={(e) => setNewModule((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Reports"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2 p-3 rounded-lg border border-border bg-secondary/30 max-h-48 overflow-y-auto">
                {iconOptions.map((icon) => {
                  const IconComp = iconMap[icon.value]
                  const isSelected = newModule.icon === icon.value
                  return (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setNewModule((p) => ({ ...p, icon: icon.value }))}
                      className={`flex items-center justify-center p-2 rounded-md transition-colors ${isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      title={icon.label}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {iconOptions.find((i) => i.value === newModule.icon)?.label || newModule.icon}
              </p>
            </div>
            <div className="space-y-2">
              <Label>URL Path (optional for parent modules)</Label>
              <Input
                value={newModule.href}
                onChange={(e) => setNewModule((p) => ({ ...p, href: e.target.value }))}
                placeholder="e.g. /reports"
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Module (optional)</Label>
              <Select
                value={newModule.parentId}
                onValueChange={(v) => setNewModule((p) => ({ ...p, parentId: v === "none" ? "" : v }))}
              >
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue placeholder="Select parent module" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">None (Top-level module)</SelectItem>
                  {parentModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newModule.isActive}
                onCheckedChange={(c) => setNewModule((p) => ({ ...p, isActive: c }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModuleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModule}>Add Module</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={editModuleOpen} onOpenChange={setEditModuleOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Edit Module</DialogTitle>
            <DialogDescription>Update module configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Module Name</Label>
              <Input
                value={newModule.name}
                onChange={(e) => setNewModule((p) => ({ ...p, name: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2 p-3 rounded-lg border border-border bg-secondary/30 max-h-48 overflow-y-auto">
                {iconOptions.map((icon) => {
                  const IconComp = iconMap[icon.value]
                  const isSelected = newModule.icon === icon.value
                  return (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setNewModule((p) => ({ ...p, icon: icon.value }))}
                      className={`flex items-center justify-center p-2 rounded-md transition-colors ${isSelected
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      title={icon.label}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: {iconOptions.find((i) => i.value === newModule.icon)?.label || newModule.icon}
              </p>
            </div>
            <div className="space-y-2">
              <Label>URL Path</Label>
              <Input
                value={newModule.href}
                onChange={(e) => setNewModule((p) => ({ ...p, href: e.target.value }))}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Module</Label>
              <Select
                value={newModule.parentId || "none"}
                onValueChange={(v) => setNewModule((p) => ({ ...p, parentId: v === "none" ? "" : v }))}
              >
                <SelectTrigger className="w-full bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">None (Top-level module)</SelectItem>
                  {parentModules
                    .filter((m) => m.id !== selectedModuleId)
                    .map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newModule.isActive}
                onCheckedChange={(c) => setNewModule((p) => ({ ...p, isActive: c }))}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModuleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditModule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Module Confirmation */}
      <Dialog open={deleteModuleConfirmOpen} onOpenChange={setDeleteModuleConfirmOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Delete Module</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedModule?.name}"? Child modules will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModuleConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteModule}>
              Delete Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </AdminLayout>
  )
}
