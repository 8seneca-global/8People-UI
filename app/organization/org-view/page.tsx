"use client"

import { useState, useMemo } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DivisionView } from "./components/DivisionView"
import { DepartmentView } from "./components/DepartmentView"
import { TeamView } from "./components/TeamView"
import { PositionView } from "./components/PositionView"
import type { OrgUnitNode, SelectedDetail, ActiveSection } from "./types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import {
  Building2,
  Users,
  User,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Network,
  Plus,
  Mail,
  Phone,
  Calendar,
  Target,
  TrendingUp,
  UserCheck,
  MapPin,
  ExternalLink,
  Edit,
  Trash2,
  MoveRight,
  UserX,
  FileText,
  History,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Position } from "@/lib/mock-data"
import type { JSX } from "react"



export default function OrgViewPage() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["O-001"]))
  const [selectedDetail, setSelectedDetail] = useState<SelectedDetail>(null)
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview")
  const [expandedSubStructures, setExpandedSubStructures] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Create unit modal state
  const [createUnitOpen, setCreateUnitOpen] = useState(false)
  const [unitType, setUnitType] = useState<"division" | "department">("division")
  const [unitFormData, setUnitFormData] = useState({
    name: "",
    code: "",
    abbreviation: "",
    costCenter: "",
  })

  const { organizationalUnits, positions, employees } = useStore()

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

  const toggleSubStructure = (nodeId: string) => {
    setExpandedSubStructures((prev) => {
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
    if (node.type === "department" || node.type === "division") {
      setSelectedDetail({ type: node.type === "division" ? "division" : "department", node })
      setActiveSection("overview")
    } else if (node.type === "team") {
      setSelectedDetail({ type: "team", node })
      setActiveSection("overview")
    }
  }

  const handlePositionClick = (position: Position) => {
    setSelectedDetail({ type: "position", position })
  }

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

  // Filter tree based on search query
  const filterTreeBySearch = (node: OrgUnitNode, query: string): OrgUnitNode | null => {
    if (!query.trim()) return node

    const lowerQuery = query.toLowerCase()

    // Check if current node matches
    const nodeMatches = node.name.toLowerCase().includes(lowerQuery) ||
      node.type.toLowerCase().includes(lowerQuery) ||
      node.code.toLowerCase().includes(lowerQuery)

    // Filter positions
    const matchingPositions = node.positions.filter(pos =>
      pos.title.toLowerCase().includes(lowerQuery) ||
      pos.code.toLowerCase().includes(lowerQuery)
    )

    // Recursively filter children
    const matchingChildren = node.children
      .map(child => filterTreeBySearch(child, query))
      .filter((child): child is OrgUnitNode => child !== null)

    // Include node if it matches, has matching positions, or has matching children
    if (nodeMatches || matchingPositions.length > 0 || matchingChildren.length > 0) {
      return {
        ...node,
        positions: matchingPositions,
        children: matchingChildren,
      }
    }

    return null
  }

  const filteredOrgTree = useMemo(() => {
    if (!orgTree) return null
    return filterTreeBySearch(orgTree, searchQuery)
  }, [orgTree, searchQuery])


  // Handle create unit
  const handleCreateUnit = () => {
    // TODO: Integrate with store to add new organizational unit
    const newUnit = {
      id: `O-${Date.now()}`,
      code: unitFormData.code,
      name: unitFormData.name,
      abbreviation: unitFormData.abbreviation,
      parentId: unitType === "division" ? "O-001" : undefined,
      costCenter: unitFormData.costCenter,
      validFrom: new Date().toISOString().split('T')[0],
      status: "active" as const,
      level: unitType === "division" ? 2 : 3,
      unitType: unitType,
    }

    // Reset form and close modal
    setUnitFormData({ name: "", code: "", abbreviation: "", costCenter: "" })
    setCreateUnitOpen(false)

    // Note: In production, this would call a store action to add the unit
    console.log("Creating unit:", newUnit)
  }

  const openCreateUnitModal = (type: "division" | "department") => {
    setUnitType(type)
    setCreateUnitOpen(true)
  }



  const renderTreeNode = (node: OrgUnitNode, level = 0, isLastSibling = false, totalSiblings = 1): JSX.Element | null => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0 || node.positions.length > 0
    const isSelected =
      selectedDetail &&
      (selectedDetail.type === "department" || selectedDetail.type === "team" || selectedDetail.type === "division") &&
      selectedDetail.node.id === node.id

    // Only show chevron for department and team, not for division
    const showChevron = hasChildren && (node.type === "department" || node.type === "team")

    // Add icon for divisions
    const isDivision = node.type === "division"

    // Divisions are always expanded (no chevron), departments/teams can be toggled
    const shouldShowChildren = isDivision || isExpanded

    // Rule 1: No connectors for single child
    const showConnectors = level > 0 && totalSiblings > 1

    return (
      <div key={node.id} className="relative">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors relative z-10",
            "hover:bg-primary/10",
            isSelected && "bg-primary/10 border border-primary/20",
          )}
          style={{ marginLeft: level * 20 }}
          onClick={() => handleNodeClick(node)}
        >
          {/* Vertical connector line - only render if more than 1 sibling */}
          {totalSiblings > 1 && level > 0 && (
            <div
              className="absolute w-px bg-neutral-300 dark:bg-neutral-700"
              style={{
                left: (level - 1) * 20 + 10,
                top: '-2px',
                bottom: isLastSibling ? '50%' : '-6px',  // Extended to bridge gap
              }}
            />
          )}

          {showChevron ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded z-10"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>
          ) : isDivision ? (
            <Network className="h-4 w-4 text-neutral-600 dark:text-neutral-400" strokeWidth={1.5} />
          ) : (
            <div className="w-5" />
          )}
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate flex-1">{node.name}</span>
        </div>
        {shouldShowChildren && (
          <div className="relative">
            {/* Calculate total children for proper connector rendering */}
            {(() => {
              const allChildren = [...node.positions, ...node.children]
              const totalChildren = allChildren.length

              return (
                <>
                  {node.positions.map((pos, index) =>
                    renderPositionNode(
                      pos,
                      level + 1,
                      index === node.positions.length - 1 && node.children.length === 0,
                      totalChildren
                    )
                  )}
                  {node.children.map((child, index) =>
                    renderTreeNode(
                      child,
                      level + 1,
                      index === node.children.length - 1,
                      totalChildren
                    )
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>
    )
  }

  const renderPositionNode = (position: Position, level: number, isLastSibling = false, totalSiblings = 1): JSX.Element => {
    const isSelected =
      selectedDetail && selectedDetail.type === "position" && selectedDetail.position.id === position.id

    // Rule 1: No connectors for single child
    const showConnectors = level > 0 && totalSiblings > 1

    return (
      <div
        key={position.id}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors relative z-10",
          "hover:bg-primary/10",
          isSelected && "bg-primary/10 border border-primary/20",
        )}
        style={{ marginLeft: level * 20 }}
        onClick={() => handlePositionClick(position)}
      >
        {/* Vertical connector line - only render if more than 1 sibling */}
        {totalSiblings > 1 && level > 0 && (
          <div
            className="absolute w-px bg-neutral-300 dark:bg-neutral-700"
            style={{
              left: (level - 1) * 20 + 10,
              top: '-2px',
              bottom: isLastSibling ? '50%' : '-6px',  // Extended to bridge gap
            }}
          />
        )}

        <div className="w-5" />
        <User className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-400" strokeWidth={1.5} />
        <span className="text-sm text-neutral-600 dark:text-neutral-300 truncate flex-1">{position.title}</span>
      </div>
    )
  }

  const renderDetailPanel = () => {
    if (!selectedDetail) {
      return (
        <div className="h-full overflow-auto p-6">
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Building2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold">Welcome to 8seneca Org Chart</h2>
            <p className="text-muted-foreground max-w-md">
              Select an organization unit from the sidebar to view details, management tools, and metrics.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-lg">
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <span className="text-3xl font-bold">{employees.length}</span>
                  <span className="text-sm text-muted-foreground">Total Employees</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <span className="text-3xl font-bold">{positions.length}</span>
                  <span className="text-sm text-muted-foreground">Total Positions</span>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    }

    switch (selectedDetail.type) {
      case "division":
        return <DivisionView node={selectedDetail.node} />
      case "department":
        return <DepartmentView node={selectedDetail.node} />
      case "team":
        return <TeamView node={selectedDetail.node} />
      case "position":
        return <PositionView position={selectedDetail.position} />
      default:
        return <div>Select an item</div>
    }
  }

  return (
    <AdminLayout title="Org Structure" icon={Building2}>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Tree View with Fixed Header */}
        <div className="w-1/4 border-r border-border bg-card flex flex-col">
          {/* Fixed Header (Non-scrollable) */}
          <div className="p-4 border-b border-border">
            {/* Company Overview Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">8seneca</h2>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{employees.filter(e => e.status === "active").length} employees</span>
                  </div>
                </div>
              </div>

              {/* Create Unit Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Unit
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => openCreateUnitModal("division")}>
                    <Network className="h-4 w-4 mr-2" />
                    New Division
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openCreateUnitModal("department")}>
                    <Building2 className="h-4 w-4 mr-2" />
                    New Department
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Scrollable Tree Container */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="border border-border rounded-lg bg-transparent">
              {/* Sticky Search Bar */}
              <div className="sticky top-0 z-20 bg-card p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search division, role, etc."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-input"
                  />
                </div>
              </div>

              {/* Tree Data */}
              <div className="p-3">
                {filteredOrgTree && filteredOrgTree.children.map((division) => renderTreeNode(division, 0))}
              </div>
            </div>
          </div>
        </div>


        {/* Create Unit Modal */}
        <Dialog open={createUnitOpen} onOpenChange={setCreateUnitOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New {unitType === "division" ? "Division" : "Department"}</DialogTitle>
              <DialogDescription>
                Add a new {unitType} to your organizational structure.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={unitFormData.name}
                  onChange={(e) => setUnitFormData({ ...unitFormData, name: e.target.value })}
                  placeholder="e.g., Technology Division"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="abbreviation">Abbreviation</Label>
                <Input
                  id="abbreviation"
                  value={unitFormData.abbreviation}
                  onChange={(e) => setUnitFormData({ ...unitFormData, abbreviation: e.target.value })}
                  placeholder="e.g., TECH"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="costCenter">Cost Center</Label>
                <Input
                  id="costCenter"
                  value={unitFormData.costCenter}
                  onChange={(e) => setUnitFormData({ ...unitFormData, costCenter: e.target.value })}
                  placeholder="e.g., CC-TECH"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateUnitOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUnit}>
                Create {unitType === "division" ? "Division" : "Department"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Right Panel - Detail View */}
        <div className="flex-1 bg-background">{renderDetailPanel()}</div>
      </div>
    </AdminLayout >
  )
}
