"use client"

import type React from "react"

import { useState, useMemo, useCallback } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import {
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  User,
  Briefcase,
  AlertCircle,
  Download,
  ZoomIn,
  ZoomOut,
  Network,
  GripVertical,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Position } from "@/lib/mock-data"
import type { JSX } from "react"

interface OrgUnitNode {
  id: string
  code: string
  name: string
  type: "company" | "division" | "department" | "team"
  level: number
  managerName?: string
  costCenter?: string
  employeeCount: number
  children: OrgUnitNode[]
  positions: Position[]
}

type SelectedDetail =
  | { type: "department"; node: OrgUnitNode }
  | { type: "team"; node: OrgUnitNode }
  | { type: "position"; position: Position }
  | null

export default function OrganizationPage() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["O-001"]))
  const [selectedNode, setSelectedNode] = useState<OrgUnitNode | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [positionDetailOpen, setPositionDetailOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [zoom, setZoom] = useState(100)
  const [viewMode, setViewMode] = useState<"units" | "positions">("units")

  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail>(null)
  const [orgViewExpandedNodes, setOrgViewExpandedNodes] = useState<Set<string>>(new Set(["O-001"]))

  const [draggedNode, setDraggedNode] = useState<OrgUnitNode | null>(null)
  const [dragOverNode, setDragOverNode] = useState<string | null>(null)

  const { organizationalUnits, positions, employees, updateOrganizationalUnit } = useStore()

  // Build org tree from O-S-C-P model
  const orgTree = useMemo((): OrgUnitNode | null => {
    const rootUnit = organizationalUnits.find((u) => u.level === 1 && u.status === "active")
    if (!rootUnit) return null

    const getEmployeeCount = (unitId: string): number => {
      const unitPositions = positions.filter((p) => p.organizationalUnitId === unitId)
      return unitPositions.filter((p) => p.incumbentId).length
    }

    const getPositionsForUnit = (unitId: string): Position[] => {
      return positions.filter((p) => p.organizationalUnitId === unitId && p.status === "active")
    }

    const getManagerName = (unitId: string): string | undefined => {
      const unit = organizationalUnits.find((u) => u.id === unitId)
      if (unit?.managerPositionId) {
        const managerPosition = positions.find((p) => p.id === unit.managerPositionId)
        return managerPosition?.incumbentName
      }
      return undefined
    }

    const buildNode = (unit: typeof rootUnit): OrgUnitNode => {
      const childUnits = organizationalUnits.filter((u) => u.parentId === unit.id && u.status === "active")

      const childNodes = childUnits.map(buildNode)
      const directEmployees = getEmployeeCount(unit.id)
      const totalEmployees = directEmployees + childNodes.reduce((sum, n) => sum + n.employeeCount, 0)

      return {
        id: unit.id,
        code: unit.code,
        name: unit.name,
        type: unit.unitType,
        level: unit.level,
        managerName: getManagerName(unit.id),
        costCenter: unit.costCenter,
        employeeCount: totalEmployees,
        children: childNodes,
        positions: getPositionsForUnit(unit.id),
      }
    }

    return buildNode(rootUnit)
  }, [organizationalUnits, positions])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const toggleOrgViewNode = (nodeId: string) => {
    setOrgViewExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const handleNodeClick = (node: OrgUnitNode) => {
    setSelectedNode(node)
    setDetailOpen(true)
  }

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position)
    setPositionDetailOpen(true)
  }

  const handleOrgViewNodeClick = (node: OrgUnitNode) => {
    if (node.type === "department" || node.type === "division") {
      setSelectedDetail({ type: "department", node })
    } else if (node.type === "team") {
      setSelectedDetail({ type: "team", node })
    }
  }

  const handleOrgViewPositionClick = (position: Position) => {
    setSelectedDetail({ type: "position", position })
  }

  const handleDragStart = useCallback((e: React.DragEvent, node: OrgUnitNode) => {
    // Only allow dragging departments and teams (level 3 and 4)
    if (node.level < 2) {
      e.preventDefault()
      return
    }
    setDraggedNode(node)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", node.id)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, node: OrgUnitNode) => {
      e.preventDefault()
      if (!draggedNode) return

      // Can only drop on units that are one level above the dragged item
      // e.g., department (level 3) can only be dropped on division (level 2)
      // team (level 4) can only be dropped on department (level 3)
      if (node.level === draggedNode.level - 1 && node.id !== draggedNode.id) {
        e.dataTransfer.dropEffect = "move"
        setDragOverNode(node.id)
      }
    },
    [draggedNode],
  )

  const handleDragLeave = useCallback(() => {
    setDragOverNode(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetNode: OrgUnitNode) => {
      e.preventDefault()
      if (!draggedNode) return

      // Validate the drop target
      if (targetNode.level !== draggedNode.level - 1) return

      // Get the original unit data to preserve all fields
      const originalUnit = organizationalUnits.find((u) => u.id === draggedNode.id)
      if (!originalUnit) return

      // Update the organizational unit's parent
      updateOrganizationalUnit(draggedNode.id, {
        parentId: targetNode.id,
      })

      setDraggedNode(null)
      setDragOverNode(null)
    },
    [draggedNode, organizationalUnits, updateOrganizationalUnit],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null)
    setDragOverNode(null)
  }, [])

  const getNodeIcon = (type: OrgUnitNode["type"]) => {
    switch (type) {
      case "company":
        return <Building2 className="h-4 w-4" />
      case "division":
        return <Network className="h-4 w-4" />
      case "department":
        return <Users className="h-4 w-4" />
      case "team":
        return <Users className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: OrgUnitNode["type"]) => {
    switch (type) {
      case "company":
        return "bg-primary/20 text-primary"
      case "division":
        return "bg-purple-500/20 text-purple-500"
      case "department":
        return "bg-blue-500/20 text-blue-500"
      case "team":
        return "bg-green-500/20 text-green-500"
    }
  }

  const getHiringStatusBadge = (status: Position["hiringStatus"]) => {
    switch (status) {
      case "vacant":
        return (
          <Badge variant="destructive" className="text-xs">
            Vacant
          </Badge>
        )
      case "hiring":
        return <Badge className="text-xs bg-warning/20 text-warning border-warning/30">Hiring</Badge>
      default:
        return null
    }
  }

  const renderPositionNode = (position: Position, level: number) => {
    return (
      <div
        key={position.id}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
          "hover:bg-secondary/80 border border-transparent",
          selectedPosition?.id === position.id && "bg-primary/10 border-primary/20",
        )}
        style={{ marginLeft: (level + 1) * 24 }}
        onClick={() => handlePositionClick(position)}
      >
        <div className="w-5" />
        <div className="p-1.5 rounded bg-gray-500/20 text-gray-500">
          <Briefcase className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-card-foreground truncate text-sm">{position.title}</span>
            {getHiringStatusBadge(position.hiringStatus)}
          </div>
          {position.incumbentName ? (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {position.incumbentName}
            </p>
          ) : (
            <p className="text-xs text-destructive/70">No incumbent</p>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          {position.code}
        </Badge>
      </div>
    )
  }

  const renderOrgNode = (node: OrgUnitNode, level = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0 || (viewMode === "positions" && node.positions.length > 0)
    const isDraggable = node.level >= 2 // Divisions, departments, and teams can be dragged
    const isDropTarget = draggedNode && node.level === draggedNode.level - 1
    const isDragOver = dragOverNode === node.id

    if (search) {
      const matchesSearch =
        node.name.toLowerCase().includes(search.toLowerCase()) || node.code.toLowerCase().includes(search.toLowerCase())
      const childrenMatch = node.children.some(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()),
      )
      const positionsMatch = node.positions.some(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          p.incumbentName?.toLowerCase().includes(search.toLowerCase()),
      )
      if (!matchesSearch && !childrenMatch && !positionsMatch) return null
    }

    return (
      <div key={node.id} className="select-none">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
            "hover:bg-secondary/80",
            selectedNode?.id === node.id && "bg-primary/10 border border-primary/20",
            isDragOver && "ring-2 ring-primary bg-primary/10",
            draggedNode?.id === node.id && "opacity-50",
          )}
          style={{ marginLeft: level * 24 }}
          onClick={() => handleNodeClick(node)}
          draggable={isDraggable}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => (isDropTarget ? handleDragOver(e, node) : undefined)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => (isDropTarget ? handleDrop(e, node) : undefined)}
          onDragEnd={handleDragEnd}
        >
          {isDraggable ? (
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
          ) : (
            <div className="w-4" />
          )}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="p-0.5 hover:bg-secondary rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          <div className={cn("p-1.5 rounded", getTypeColor(node.type))}>{getNodeIcon(node.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-card-foreground truncate">{node.name}</span>
              <Badge variant="outline" className="text-xs">
                {node.code}
              </Badge>
            </div>
            {node.managerName && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {node.managerName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {node.costCenter && (
              <Badge variant="secondary" className="text-xs">
                {node.costCenter}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {node.employeeCount} <Users className="h-3 w-3 ml-1" />
            </Badge>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-1">
            {node.children.map((child) => renderOrgNode(child, level + 1))}
            {viewMode === "positions" && node.positions.map((pos) => renderPositionNode(pos, level))}
          </div>
        )}
      </div>
    )
  }

  const renderOrgViewTree = (node: OrgUnitNode, level = 0): JSX.Element | null => {
    const isExpanded = orgViewExpandedNodes.has(node.id)
    const hasChildren = node.children.length > 0 || node.positions.length > 0
    const isSelected =
      selectedDetail &&
      (selectedDetail.type === "department" || selectedDetail.type === "team") &&
      selectedDetail.node.id === node.id

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
            "hover:bg-secondary/80",
            isSelected && "bg-primary/10 border border-primary/20",
          )}
          style={{ marginLeft: level * 16 }}
          onClick={() => handleOrgViewNodeClick(node)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleOrgViewNode(node.id)
              }}
              className="p-0.5 hover:bg-secondary rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
          <div className={cn("p-1 rounded", getTypeColor(node.type))}>{getNodeIcon(node.type)}</div>
          <span className="text-sm font-medium text-card-foreground truncate flex-1">{node.name}</span>
          <Badge variant="secondary" className="text-xs">
            {node.employeeCount}
          </Badge>
        </div>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children.map((child) => renderOrgViewTree(child, level + 1))}
            {node.positions.map((pos) => renderOrgViewPosition(pos, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const renderOrgViewPosition = (position: Position, level: number): JSX.Element => {
    const isSelected =
      selectedDetail && selectedDetail.type === "position" && selectedDetail.position.id === position.id

    return (
      <div
        key={position.id}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
          "hover:bg-secondary/80",
          isSelected && "bg-primary/10 border border-primary/20",
        )}
        style={{ marginLeft: level * 16 }}
        onClick={() => handleOrgViewPositionClick(position)}
      >
        <div className="w-5" />
        <div className="p-1 rounded bg-gray-500/20 text-gray-500">
          <Briefcase className="h-3 w-3" />
        </div>
        <span className="text-sm text-card-foreground truncate flex-1">{position.title}</span>
        {getHiringStatusBadge(position.hiringStatus)}
      </div>
    )
  }

  const renderDetailPanel = () => {
    if (!selectedDetail) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center space-y-2">
            <Network className="h-12 w-12 mx-auto opacity-50" />
            <p>Select a department, team, or position to view details</p>
          </div>
        </div>
      )
    }

    if (selectedDetail.type === "department" || selectedDetail.type === "team") {
      const node = selectedDetail.node
      const unit = organizationalUnits.find((u) => u.id === node.id)
      const managerPosition = unit?.managerPositionId ? positions.find((p) => p.id === unit.managerPositionId) : null
      const managerEmployee = managerPosition?.incumbentId
        ? employees.find((e) => e.id === managerPosition.incumbentId)
        : null

      // Calculate metrics
      const unitPositions = positions.filter((p) => p.organizationalUnitId === node.id)
      const filledPositions = unitPositions.filter((p) => p.incumbentId)
      const vacantPositions = unitPositions.filter((p) => p.hiringStatus === "vacant")
      const hiringPositions = unitPositions.filter((p) => p.hiringStatus === "hiring")

      // Get all employees in this unit
      const unitEmployees = employees.filter(
        (e) => unitPositions.some((p) => p.incumbentId === e.id) && e.status === "active",
      )

      // Calculate diversity stats (example)
      const maleCount = unitEmployees.filter((e) => e.gender === "male").length
      const femaleCount = unitEmployees.filter((e) => e.gender === "female").length

      // Calculate average tenure (mock calculation)
      const avgTenure =
        unitEmployees.length > 0
          ? Math.round(
            (unitEmployees.reduce((sum, e) => {
              const startDate = new Date(e.hireDate)
              const now = new Date()
              const years = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
              return sum + years
            }, 0) /
              unitEmployees.length) *
            10,
          ) / 10
          : 0

      return (
        <div className="h-full overflow-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-3 rounded-lg", getTypeColor(node.type))}>{getNodeIcon(node.type)}</div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">{node.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {node.code} • {unit?.description || "No description"}
                </p>
              </div>
            </div>
          </div>

          {/* Manager Info */}
          {managerPosition && (
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Manager</p>
                    <p className="font-semibold text-card-foreground">{managerPosition.incumbentName || "Vacant"}</p>
                    <p className="text-sm text-muted-foreground">{managerPosition.title}</p>
                    {managerEmployee && (
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {managerEmployee.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {managerEmployee.phoneNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Employee Metrics */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-3">Employee Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">{filledPositions.length}</p>
                      <p className="text-xs text-muted-foreground">Total Headcount</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <UserX className="h-4 w-4 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">{vacantPositions.length}</p>
                      <p className="text-xs text-muted-foreground">Open Positions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">{avgTenure}y</p>
                      <p className="text-xs text-muted-foreground">Avg. Tenure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-warning" />
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">{hiringPositions.length}</p>
                      <p className="text-xs text-muted-foreground">Hiring</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Diversity Stats */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-3">Diversity & Composition</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gender Distribution</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {maleCount}M / {femaleCount}F
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Full-time</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {unitPositions.filter((p) => p.fte === 1).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Part-time</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {unitPositions.filter((p) => p.fte < 1).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial/Operational Data */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-3">Operational Data</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Cost Center</span>
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{node.costCenter || "Not assigned"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Established</span>
                  </div>
                  <span className="text-sm font-medium text-card-foreground">{unit?.validFrom || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Status</span>
                  </div>
                  <Badge className="bg-success/20 text-success">{unit?.status || "active"}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sub-Structure */}
          {node.children.length > 0 && (
            <div>
              <h3 className="font-semibold text-card-foreground mb-3">
                {selectedDetail.type === "department" ? "Teams" : "Sub-Departments"}
              </h3>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {node.children.map((child) => (
                      <div
                        key={child.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-secondary/50 cursor-pointer"
                        onClick={() => handleOrgViewNodeClick(child)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1 rounded", getTypeColor(child.type))}>{getNodeIcon(child.type)}</div>
                          <span className="text-sm font-medium text-card-foreground">{child.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {child.employeeCount} employees
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Member List for Teams */}
          {selectedDetail.type === "team" && unitEmployees.length > 0 && (
            <div>
              <h3 className="font-semibold text-card-foreground mb-3">Team Members</h3>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {unitEmployees.slice(0, 10).map((emp) => {
                      const empPosition = unitPositions.find((p) => p.incumbentId === emp.id)
                      return (
                        <div key={emp.id} className="flex items-center gap-3 p-2 rounded hover:bg-secondary/50">
                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-card-foreground">{emp.fullName}</p>
                            <p className="text-xs text-muted-foreground">{empPosition?.title}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {emp.employeeCode}
                          </Badge>
                        </div>
                      )
                    })}
                    {unitEmployees.length > 10 && (
                      <p className="text-xs text-center text-muted-foreground pt-2">
                        +{unitEmployees.length - 10} more employees
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )
    }

    if (selectedDetail.type === "position") {
      const position = selectedDetail.position
      const incumbent = position.incumbentId ? employees.find((e) => e.id === position.incumbentId) : null
      const parentPosition = position.parentPositionId
        ? positions.find((p) => p.id === position.parentPositionId)
        : null
      const directReports = positions.filter((p) => p.parentPositionId === position.id && p.status === "active")

      return (
        <div className="h-full overflow-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-lg bg-gray-500/20">
                <Briefcase className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">{position.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {position.code} • {position.organizationalUnitName}
                </p>
              </div>
            </div>
          </div>

          {/* Overview */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getHiringStatusBadge(position.hiringStatus)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">FTE</span>
                <span className="text-sm font-medium text-card-foreground">{position.fte}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Work Mode</span>
                <Badge variant="secondary" className="capitalize">
                  {position.workMode || "hybrid"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="text-sm font-medium text-card-foreground">{position.officeLocation || "N/A"}</span>
              </div>
              {position.costCenter && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cost Center</span>
                  <span className="text-sm font-medium text-card-foreground">{position.costCenter}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incumbent Info */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-3">Current Holder</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                {incumbent ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground">{incumbent.fullName}</p>
                        <p className="text-sm text-muted-foreground">{incumbent.employeeCode}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email</p>
                        <p className="text-sm text-card-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {incumbent.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <p className="text-sm text-card-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {incumbent.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Hire Date</p>
                        <p className="text-sm text-card-foreground">{incumbent.hireDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Tenure</p>
                        <p className="text-sm text-card-foreground">
                          {(() => {
                            const startDate = new Date(incumbent.hireDate)
                            const now = new Date()
                            const years = Math.floor(
                              (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365),
                            )
                            return `${years} years`
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <UserX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No incumbent assigned</p>
                    {position.hiringStatus === "hiring" && (
                      <p className="text-xs mt-1">Currently hiring for this position</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reporting Line */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-3">Reporting Structure</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-4 space-y-3">
                {parentPosition ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Reports To</p>
                    <div className="flex items-center gap-2 p-2 rounded bg-secondary/50">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{parentPosition.title}</p>
                        <p className="text-xs text-muted-foreground">{parentPosition.incumbentName || "Vacant"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Top-level position</div>
                )}

                {directReports.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Direct Reports ({directReports.length})</p>
                    <div className="space-y-1">
                      {directReports.slice(0, 5).map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50 cursor-pointer"
                          onClick={() => handleOrgViewPositionClick(report)}
                        >
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm text-card-foreground">{report.title}</p>
                            <p className="text-xs text-muted-foreground">{report.incumbentName || "Vacant"}</p>
                          </div>
                        </div>
                      ))}
                      {directReports.length > 5 && (
                        <p className="text-xs text-center text-muted-foreground pt-1">
                          +{directReports.length - 5} more reports
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-3">Requirements & Qualifications</h3>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Job Classification</span>
                    <span className="text-sm font-medium text-card-foreground">{position.jobClassificationTitle}</span>
                  </div>
                  {position.focusArea && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Focus Area</span>
                      <span className="text-sm font-medium text-card-foreground">{position.focusArea}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Required Skills & Competencies</p>
                    <p className="text-sm text-card-foreground">
                      Based on {position.jobClassificationTitle} classification
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return null
  }

  // Calculate stats
  const totalEmployees = employees.filter((e) => e.status === "active").length
  const totalOrgUnits = organizationalUnits.filter((u) => u.status === "active").length
  const vacantPositions = positions.filter((p) => p.hiringStatus === "vacant" && p.status === "active")
  const hiringPositions = positions.filter((p) => p.hiringStatus === "hiring" && p.status === "active")

  if (!orgTree) {
    return (
      <AdminLayout title="Organization" subtitle="O-S-C-P Organization Structure">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No organization data found.</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Organization Chart" subtitle="O-S-C-P Organization Structure">
      <Tabs defaultValue="chart" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="chart">Org Chart</TabsTrigger>
            <TabsTrigger value="hierarchy">Position Hierarchy</TabsTrigger>
            <TabsTrigger value="orgview">Org Structure</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search org units, positions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-input"
              />
            </div>
            <div className="flex items-center gap-1 border border-border rounded-lg px-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom(Math.min(150, zoom + 10))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{totalEmployees}</p>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{totalOrgUnits}</p>
                  <p className="text-sm text-muted-foreground">Org Units</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/20">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{vacantPositions.length}</p>
                  <p className="text-sm text-muted-foreground">Vacant Positions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Briefcase className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{hiringPositions.length}</p>
                  <p className="text-sm text-muted-foreground">Hiring</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <TabsContent value="chart" className="mt-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">View:</span>
                  <Button
                    variant={viewMode === "units" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("units")}
                  >
                    Org Units Only
                  </Button>
                  <Button
                    variant={viewMode === "positions" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("positions")}
                  >
                    With Positions
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Drag and drop units to change their parent</p>
              </div>
              <div className="overflow-auto" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}>
                {renderOrgNode(orgTree)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-card-foreground mb-4">Position Reporting Lines</h3>
              <div className="space-y-2">
                {positions
                  .filter((p) => !p.parentPositionId && p.status === "active")
                  .map((topPos) => {
                    const renderPositionHierarchy = (pos: Position, level = 0): JSX.Element => {
                      const children = positions.filter((p) => p.parentPositionId === pos.id && p.status === "active")
                      return (
                        <div key={pos.id}>
                          <div
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer",
                              "hover:bg-secondary/80 transition-colors",
                            )}
                            style={{ marginLeft: level * 24 }}
                            onClick={() => handlePositionClick(pos)}
                          >
                            <div className="p-1.5 rounded bg-gray-500/20">
                              <Briefcase className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-card-foreground truncate">{pos.title}</span>
                                {getHiringStatusBadge(pos.hiringStatus)}
                              </div>
                              {pos.incumbentName && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {pos.incumbentName}
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {pos.code}
                            </Badge>
                          </div>
                          {children.length > 0 && (
                            <div className="mt-1">{children.map((c) => renderPositionHierarchy(c, level + 1))}</div>
                          )}
                        </div>
                      )
                    }
                    return renderPositionHierarchy(topPos)
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orgview" className="mt-4">
          <div className="grid grid-cols-3 gap-4 h-[calc(100vh-280px)]">
            {/* Left Panel - Tree Structure */}
            <Card className="bg-card border-border col-span-1">
              <CardContent className="p-4 h-full overflow-auto">
                <h3 className="font-semibold text-card-foreground mb-4">Organization Structure</h3>
                <div className="space-y-1">{orgTree && renderOrgViewTree(orgTree)}</div>
              </CardContent>
            </Card>

            {/* Right Panel - Detail View */}
            <Card className="bg-card border-border col-span-2">
              <CardContent className="p-0 h-full">{renderDetailPanel()}</CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Existing dialogs */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{selectedNode?.name} Details</DialogTitle>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-medium text-card-foreground">{selectedNode.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge className={getTypeColor(selectedNode.type)}>{selectedNode.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <p className="font-medium text-card-foreground">{selectedNode.managerName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="font-medium text-card-foreground">{selectedNode.employeeCount}</p>
                </div>
                {selectedNode.costCenter && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Center</p>
                    <p className="font-medium text-card-foreground">{selectedNode.costCenter}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={positionDetailOpen} onOpenChange={setPositionDetailOpen}>
        <DialogContent className="bg-card border-border sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">{selectedPosition?.title}</DialogTitle>
          </DialogHeader>
          {selectedPosition && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Code</p>
                  <p className="font-medium text-card-foreground">{selectedPosition.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getHiringStatusBadge(selectedPosition.hiringStatus)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Incumbent</p>
                  <p className="font-medium text-card-foreground">{selectedPosition.incumbentName || "Vacant"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">FTE</p>
                  <p className="font-medium text-card-foreground">{selectedPosition.fte}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Org Unit</p>
                  <p className="font-medium text-card-foreground">{selectedPosition.organizationalUnitName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Job Classification</p>
                  <p className="font-medium text-card-foreground">{selectedPosition.jobClassificationTitle}</p>
                </div>
                {selectedPosition.parentPositionTitle && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Reports To</p>
                    <p className="font-medium text-card-foreground">{selectedPosition.parentPositionTitle}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
