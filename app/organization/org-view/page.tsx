"use client"

import { useState, useMemo, useEffect } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
  Settings2,
  ArrowDown,
  Merge,
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

  // Dynamic Add Unit modal state
  const [addUnitModalOpen, setAddUnitModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"division" | "department" | "team" | "position">("division")
  const [selectedDivision, setSelectedDivision] = useState<string>("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedTeam, setSelectedTeam] = useState<string>("")
  const [unitFormData, setUnitFormData] = useState({
    name: "",
    code: "",
  })

  // Move Unit modal state
  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [unitToMove, setUnitToMove] = useState<{ id: string, name: string, type: "department" | "team" | "position", currentDivisionId: string, currentDepartmentId?: string } | null>(null)
  const [moveTargetDivision, setMoveTargetDivision] = useState<string>("")
  const [moveTargetDepartment, setMoveTargetDepartment] = useState<string>("")
  const [moveTargetTeam, setMoveTargetTeam] = useState<string>("")

  // Merge Unit modal state
  const [mergeModalOpen, setMergeModalOpen] = useState(false)
  const [unitToMerge, setUnitToMerge] = useState<{ id: string, name: string, type: "division" | "department" | "team" | "position", level: number } | null>(null)
  const [mergeTargetUnit, setMergeTargetUnit] = useState<string>("")
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null)

  // Delete Unit modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<{
    id: string
    name: string
    type: "division" | "department" | "team" | "position"
    parentId?: string
    descendantCount: number
    positionCount: number
  } | null>(null)

  // Hierarchy configuration drawer state
  const [hierarchyConfigOpen, setHierarchyConfigOpen] = useState(false)
  const [hierarchyLevels, setHierarchyLevels] = useState([
    { id: 1, name: "Division", enabled: true },
    { id: 2, name: "Department", enabled: true },
    { id: 3, name: "Team", enabled: true },
    { id: 4, name: "Unit", enabled: false },
  ])
  const [tempHierarchyLevels, setTempHierarchyLevels] = useState(hierarchyLevels)

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

  // Handle post-merge redirect with fresh data
  useEffect(() => {
    if (pendingRedirect && orgTree) {
      const targetNode = findNodeById(orgTree, pendingRedirect)
      if (targetNode && targetNode.type !== "company") {
        setSelectedDetail({ type: targetNode.type, node: targetNode })
      }
      setPendingRedirect(null)
    }
  }, [orgTree, pendingRedirect])

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


  // Handle create unit with dynamic type-based logic
  const handleCreateUnit = () => {
    const { addOrganizationalUnit } = useStore.getState()

    // Determine parent ID and level based on selected type and parent selections
    let parentId = "O-001" // Default to root company
    let level = 2 // Default to division level
    let unitType: "division" | "department" | "team" | "company" = "division"

    if (selectedType === "division") {
      parentId = "O-001"
      level = 2
      unitType = "division"
    } else if (selectedType === "department") {
      parentId = selectedDivision
      level = 3
      unitType = "department"
    } else if (selectedType === "team") {
      // Team can skip department (flexible hierarchy)
      parentId = (selectedDepartment && selectedDepartment !== "__none__") ? selectedDepartment : selectedDivision
      level = (selectedDepartment && selectedDepartment !== "__none__") ? 4 : 3
      unitType = "team"
    } else if (selectedType === "position") {
      // Position can skip team and/or department
      // For now, treat position as a team-level unit since OrganizationalUnit doesn't support "position" type
      if (selectedTeam && selectedTeam !== "__none__") {
        parentId = selectedTeam
        level = 5
      } else if (selectedDepartment && selectedDepartment !== "__none__") {
        parentId = selectedDepartment
        level = 4
      } else {
        parentId = selectedDivision
        level = 3
      }
      unitType = "team" // Map position to team type for now
    }

    const newUnit = {
      code: unitFormData.code || `AUTO-${Date.now()}`,
      name: unitFormData.name,
      abbreviation: "",
      parentId: parentId,
      costCenter: "",
      validFrom: new Date().toISOString().split('T')[0],
      status: "active" as const,
      level: level,
      unitType: unitType,
    }

    // Add to store - this will trigger immediate UI update
    addOrganizationalUnit(newUnit)

    // Reset form and close modal
    resetUnitForm()
    setAddUnitModalOpen(false)
  }

  // Reset form helper
  const resetUnitForm = () => {
    setUnitFormData({ name: "", code: "" })
    setSelectedType("division")
    setSelectedDivision("")
    setSelectedDepartment("")
    setSelectedTeam("")
  }

  // Handle type change - reset parent selections
  const handleTypeChange = (type: "division" | "department" | "team" | "position") => {
    setSelectedType(type)
    setSelectedDivision("")
    setSelectedDepartment("")
    setSelectedTeam("")
  }

  // Handle division change - reset department and team selections
  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivision(divisionId)
    setSelectedDepartment("") // Reset department when division changes
    setSelectedTeam("") // Reset team when division changes
  }

  // --- Move Unit Logic ---

  const openMoveModal = (unit: { id: string, name: string, type: "department" | "team" | "position" }) => {
    // Reset targets
    setMoveTargetDivision("")
    setMoveTargetDepartment("")
    setMoveTargetTeam("")

    setUnitToMove({
      ...unit,
      currentDivisionId: "",
      currentDepartmentId: ""
    })
    setMoveModalOpen(true)
  }

  const handleMoveUnit = () => {
    if (!unitToMove) return

    const { moveOrganizationalUnit, movePosition } = useStore.getState()

    if (unitToMove.type === "department") {
      if (!moveTargetDivision) return
      moveOrganizationalUnit(unitToMove.id, moveTargetDivision, 3)
    } else if (unitToMove.type === "team") {
      if (!moveTargetDivision) return

      let newParentId = moveTargetDivision
      let newLevel = 3

      if (moveTargetDepartment && moveTargetDepartment !== "__none__") {
        newParentId = moveTargetDepartment
        newLevel = 4
      }

      moveOrganizationalUnit(unitToMove.id, newParentId, newLevel)
    } else if (unitToMove.type === "position") {
      if (!moveTargetDivision) return

      let newUnitId = moveTargetDivision

      if (moveTargetTeam && moveTargetTeam !== "__none__") {
        newUnitId = moveTargetTeam
      } else if (moveTargetDepartment && moveTargetDepartment !== "__none__") {
        newUnitId = moveTargetDepartment
      }

      movePosition(unitToMove.id, newUnitId)
    }

    setMoveModalOpen(false)
    setUnitToMove(null)
    setMoveTargetDivision("")
    setMoveTargetDepartment("")
    setMoveTargetTeam("")
  }

  // --- Merge Unit Logic ---

  const openMergeModal = (unit: { id: string, name: string, type: "division" | "department" | "team" | "position", level: number }) => {
    setMergeTargetUnit("")
    setUnitToMerge(unit)
    setMergeModalOpen(true)
  }

  const handleMergeUnit = () => {
    if (!unitToMerge || !mergeTargetUnit) return

    const { mergeOrganizationalUnits, mergePosition } = useStore.getState()

    if (unitToMerge.type === "position") {
      mergePosition(unitToMerge.id, mergeTargetUnit)

      // Redirect to the target organizational unit
      const targetUnit = organizationalUnits.find(u => u.id === mergeTargetUnit)
      if (targetUnit) {
        const targetNode = findNodeById(orgTree, mergeTargetUnit)
        if (targetNode && targetNode.type !== "company") {
          setSelectedDetail({ type: targetNode.type, node: targetNode })
        }
      }
    } else {
      mergeOrganizationalUnits(unitToMerge.id, mergeTargetUnit)

      // Redirect to the target organizational unit
      const targetNode = findNodeById(orgTree, mergeTargetUnit)
      if (targetNode && targetNode.type !== "company") {
        setSelectedDetail({ type: targetNode.type, node: targetNode })
      }
    }

    // Set pending redirect - useEffect will handle it after orgTree updates
    setPendingRedirect(mergeTargetUnit)

    setMergeModalOpen(false)
    setUnitToMerge(null)
    setMergeTargetUnit("")
  }

  // Helper function to find a node by ID in the tree
  const findNodeById = (node: OrgUnitNode | null, id: string): OrgUnitNode | null => {
    if (!node) return null
    if (node.id === id) return node

    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }

    return null
  }

  // Hierarchy configuration handlers
  const openHierarchyConfig = () => {
    setTempHierarchyLevels(hierarchyLevels)
    setHierarchyConfigOpen(true)
  }

  const handleSaveHierarchyConfig = () => {
    setHierarchyLevels(tempHierarchyLevels)
    setHierarchyConfigOpen(false)
  }

  // --- Delete Unit Logic ---

  const openDeleteModal = (unit: { id: string, name: string, type: "division" | "department" | "team" | "position", parentId?: string }) => {
    // Calculate descendant and position counts
    const collectDescendants = (unitId: string): string[] => {
      const children = organizationalUnits.filter((u) => u.parentId === unitId)
      const descendantIds = children.map((child) => child.id)

      children.forEach((child) => {
        descendantIds.push(...collectDescendants(child.id))
      })

      return descendantIds
    }

    const descendantIds = unit.type === "position" ? [] : collectDescendants(unit.id)
    const allUnitIds = unit.type === "position" ? [] : [unit.id, ...descendantIds]

    const descendantCount = descendantIds.length
    const positionCount = unit.type === "position"
      ? 1
      : positions.filter(p => allUnitIds.includes(p.organizationalUnitId)).length

    setUnitToDelete({
      ...unit,
      descendantCount,
      positionCount
    })
    setDeleteModalOpen(true)
  }

  const handleDeleteUnit = () => {
    if (!unitToDelete) return

    const { deleteOrganizationalUnitCascade, deletePosition } = useStore.getState()

    if (unitToDelete.type === "position") {
      deletePosition(unitToDelete.id)
    } else {
      deleteOrganizationalUnitCascade(unitToDelete.id)
    }

    // Navigate to parent unit if it exists
    if (unitToDelete.parentId) {
      setPendingRedirect(unitToDelete.parentId)
    } else {
      // If no parent, clear selection
      setSelectedDetail(null)
    }

    setDeleteModalOpen(false)
    setUnitToDelete(null)
  }

  const handleCancelHierarchyConfig = () => {
    setTempHierarchyLevels(hierarchyLevels)
    setHierarchyConfigOpen(false)
  }

  const updateHierarchyLevel = (id: number, field: "name" | "enabled", value: string | boolean) => {
    setTempHierarchyLevels(prev =>
      prev.map(level =>
        level.id === id ? { ...level, [field]: value } : level
      )
    )
  }

  // Render position node with icon
  const renderPositionNode = (position: Position, level = 0, isLastSibling = false, totalSiblings = 1): JSX.Element => {
    const isSelected =
      selectedDetail &&
      selectedDetail.type === "position" &&
      selectedDetail.position.id === position.id

    return (
      <div key={position.id} className="relative">
        <div
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
                left: (level - 1) * 20 + 24, // Align with parent text (20px indent + 4px icon)
                top: '-2px',
                bottom: isLastSibling ? '50%' : '-6px',
              }}
            />
          )}

          {/* User icon for positions */}
          <User className="h-4 w-4 text-neutral-600 dark:text-neutral-400" strokeWidth={1.5} />

          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate flex-1">{position.title}</span>
        </div>
      </div>
    )
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
                left: (level - 1) * 20 + 24, // Align with parent text (20px indent + 4px icon)
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
        return <DivisionView
          node={selectedDetail.node}
          onMerge={() => openMergeModal({
            id: selectedDetail.node.id,
            name: selectedDetail.node.name,
            type: "division",
            level: selectedDetail.node.level
          })}
        />
      case "department":
        return <DepartmentView
          node={selectedDetail.node}
          onMove={() => openMoveModal({ id: selectedDetail.node.id, name: selectedDetail.node.name, type: "department" })}
          onMerge={() => openMergeModal({
            id: selectedDetail.node.id,
            name: selectedDetail.node.name,
            type: "department",
            level: selectedDetail.node.level
          })}
        />
      case "team":
        return <TeamView
          node={selectedDetail.node}
          onMove={() => openMoveModal({ id: selectedDetail.node.id, name: selectedDetail.node.name, type: "team" })}
          onMerge={() => openMergeModal({
            id: selectedDetail.node.id,
            name: selectedDetail.node.name,
            type: "team",
            level: selectedDetail.node.level
          })}
        />
      case "position":
        if (!selectedDetail.position) return <div>Position not found</div>
        return <PositionView
          position={selectedDetail.position}
          onMove={() => openMoveModal({ id: selectedDetail.position!.id, name: selectedDetail.position!.title, type: "position" })}
          onMerge={() => openMergeModal({
            id: selectedDetail.position!.id,
            name: selectedDetail.position!.title,
            type: "position",
            level: 5 // Positions are conceptually level 5
          })}
        />
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

              {/* Button Group - Add Unit and Structure Config */}
              <ButtonGroup className="w-full mt-3">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAddUnitModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={openHierarchyConfig}
                >
                  <Settings2 className="h-4 w-4 mr-2" />
                  Structure Config
                </Button>
              </ButtonGroup>
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



        {/* Dynamic Add Unit Modal */}
        <Dialog open={addUnitModalOpen} onOpenChange={setAddUnitModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Unit</DialogTitle>
              <DialogDescription>
                Create a new organizational unit. Select the type and provide the required information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Type Selector */}
              <div className="grid gap-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={selectedType} onValueChange={(value) => handleTypeChange(value as any)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="division">Division</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="position">Position</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name">
                  {selectedType === "division" && "Name *"}
                  {selectedType === "department" && "Name *"}
                  {selectedType === "team" && "Name *"}
                  {selectedType === "position" && "Name *"}
                </Label>
                <Input
                  id="name"
                  value={unitFormData.name}
                  onChange={(e) => setUnitFormData({ ...unitFormData, name: e.target.value })}
                  placeholder={
                    selectedType === "division" ? "Enter Division Name" :
                      selectedType === "department" ? "Enter Department Name" :
                        selectedType === "team" ? "Enter Team Name" :
                          "Enter Position Title"
                  }
                  required
                />
              </div>

              {/* Unit Code Field - Hidden for Position type */}
              {selectedType !== "position" && (
                <div className="grid gap-2">
                  <Label htmlFor="code">Unit Code</Label>
                  <Input
                    id="code"
                    value={unitFormData.code}
                    onChange={(e) => setUnitFormData({ ...unitFormData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., TECH (optional)"
                  />
                </div>
              )}

              {/* Parent Selection - Division (for Department, Team, Position) */}
              {(selectedType === "department" || selectedType === "team" || selectedType === "position") && (
                <div className="grid gap-2">
                  <Label htmlFor="division">Parent Division *</Label>
                  <Select value={selectedDivision} onValueChange={handleDivisionChange}>
                    <SelectTrigger id="division">
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationalUnits
                        .filter(u => u.level === 2 && u.status === "active")
                        .map(division => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Parent Selection - Department (for Team, Position) with "None" option */}
              {(selectedType === "team" || selectedType === "position") && (
                <div className="grid gap-2">
                  <Label htmlFor="department">Parent Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                    disabled={!selectedDivision}
                  >
                    <SelectTrigger id="department" disabled={!selectedDivision}>
                      <SelectValue placeholder={selectedDivision ? "Select department (or None)" : "Select division first"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None (skip this level)</SelectItem>
                      {organizationalUnits
                        .filter(u =>
                          u.level === 3 &&
                          u.status === "active" &&
                          u.parentId === selectedDivision &&
                          u.unitType === "department" // Only show actual departments, not teams or positions
                        )
                        .map(department => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Parent Selection - Team (for Position) with "None" option */}
              {selectedType === "position" && (
                <div className="grid gap-2">
                  <Label htmlFor="team">Parent Team</Label>
                  <Select
                    value={selectedTeam}
                    onValueChange={setSelectedTeam}
                    disabled={!selectedDepartment}
                  >
                    <SelectTrigger id="team" disabled={!selectedDepartment}>
                      <SelectValue placeholder={selectedDepartment ? "Select team (or None)" : "Select department first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const availableTeams = organizationalUnits.filter(u => {
                          // Must be active and a team
                          if (u.status !== "active" || u.unitType !== "team") return false

                          // Scenario 1: Department IS selected (not "None")
                          if (selectedDepartment && selectedDepartment !== "__none__") {
                            // Show only teams under the selected department (level 4)
                            return u.level === 4 && u.parentId === selectedDepartment
                          }

                          // Scenario 2: Department IS "None" - show teams directly under division
                          // These teams are at level 3 (skipped department level)
                          return u.level === 3 && u.parentId === selectedDivision
                        })

                        if (availableTeams.length === 0) {
                          return (
                            <SelectItem value="__none__" disabled className="text-muted-foreground italic">
                              No teams available
                            </SelectItem>
                          )
                        }

                        return (
                          <>
                            <SelectItem value="__none__">None (skip this level)</SelectItem>
                            {availableTeams.map(team => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </>
                        )
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}

            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetUnitForm()
                setAddUnitModalOpen(false)
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateUnit}
                disabled={
                  !unitFormData.name ||
                  (selectedType !== "division" && !selectedDivision)
                }
              >
                Create {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hierarchy Configuration Drawer */}
        <Drawer direction="right" open={hierarchyConfigOpen} onOpenChange={setHierarchyConfigOpen}>
          <DrawerContent className="sm:max-w-lg">
            <DrawerHeader className="border-b">
              <DrawerTitle>Hierarchy Configuration</DrawerTitle>
              <DrawerDescription>
                Customize your organizational structure by renaming levels and toggling them on or off.
              </DrawerDescription>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {tempHierarchyLevels.map((level, index) => (
                  <div key={level.id} className="relative">
                    {/* Visual connector line */}
                    {index < tempHierarchyLevels.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                    )}

                    <Card className={cn(
                      "transition-all",
                      !level.enabled && "opacity-50 bg-muted/50"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Level indicator with arrow */}
                          <div className="flex flex-col items-center gap-1 pt-1">
                            <div className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm bg-background",
                              level.enabled ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                            )}>
                              L{level.id}
                            </div>
                            {index < tempHierarchyLevels.length - 1 && (
                              <ArrowDown className="h-4 w-4 text-muted-foreground mt-1" />
                            )}
                          </div>

                          {/* Level configuration */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`level-${level.id}-name`} className="text-sm font-medium">
                                Level {level.id} Name
                              </Label>
                              <div className="flex items-center gap-2">
                                <Label htmlFor={`level-${level.id}-toggle`} className="text-sm text-muted-foreground">
                                  {level.enabled ? "Enabled" : "Disabled"}
                                </Label>
                                <Switch
                                  id={`level-${level.id}-toggle`}
                                  checked={level.enabled}
                                  onCheckedChange={(checked) => updateHierarchyLevel(level.id, "enabled", checked)}
                                />
                              </div>
                            </div>

                            <Input
                              id={`level-${level.id}-name`}
                              value={level.name}
                              onChange={(e) => updateHierarchyLevel(level.id, "name", e.target.value)}
                              placeholder={`e.g., ${level.name}`}
                              disabled={!level.enabled}
                              className={cn(!level.enabled && "bg-muted")}
                            />

                            {/* Helper text */}
                            <p className="text-xs text-muted-foreground">
                              {level.enabled
                                ? `This level will be used in your org structure as "${level.name}"`
                                : "This level is disabled and won't appear in your structure"
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Info card */}
              <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Example Configuration
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        To switch from a 3-level structure (Division → Department → Team) to a 2-level structure
                        (Department → Team), simply disable "Division" and rename the remaining levels as needed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DrawerFooter className="border-t">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleCancelHierarchyConfig}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveHierarchyConfig}
                  className="flex-1"
                >
                  Save Configuration
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Move Unit Modal */}
        <Dialog open={moveModalOpen} onOpenChange={setMoveModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Move Unit</DialogTitle>
              <DialogDescription>
                Select a new parent for <strong>{unitToMove?.name}</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Target Division - Always Required */}
              <div className="space-y-2">
                <Label>Target Division</Label>
                <Select value={moveTargetDivision} onValueChange={(val) => {
                  setMoveTargetDivision(val)
                  setMoveTargetDepartment("")
                  setMoveTargetTeam("")
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationalUnits
                      .filter((u) => u.unitType === "division" && u.status === "active")
                      .filter((u) => u.id !== unitToMove?.id) // Cannot move into self
                      .map((div) => {
                        // Check if this is the current parent
                        const currentUnit = organizationalUnits.find(u => u.id === unitToMove?.id)
                        const isCurrentParent = currentUnit?.parentId === div.id

                        return (
                          <SelectItem
                            key={div.id}
                            value={div.id}
                            disabled={isCurrentParent}
                            className={isCurrentParent ? "text-muted-foreground" : ""}
                          >
                            {div.name} {isCurrentParent && "(Current)"}
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Department - Conditional */}
              {(unitToMove?.type === "team" || unitToMove?.type === "position") && (
                <div className="space-y-2">
                  <Label>Target Department</Label>
                  <Select
                    value={moveTargetDepartment}
                    onValueChange={(val) => {
                      setMoveTargetDepartment(val)
                      setMoveTargetTeam("")
                    }}
                    disabled={!moveTargetDivision}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" className="text-muted-foreground italic">None (Directly under Division)</SelectItem>
                      {organizationalUnits
                        .filter((u) => u.unitType === "department" && u.parentId === moveTargetDivision && u.status === "active")
                        .filter((u) => u.id !== unitToMove?.id) // Cannot move into self
                        .map((dept) => {
                          // Check if this is the current parent
                          const currentUnit = organizationalUnits.find(u => u.id === unitToMove?.id)
                          const isCurrentParent = currentUnit?.parentId === dept.id

                          return (
                            <SelectItem
                              key={dept.id}
                              value={dept.id}
                              disabled={isCurrentParent}
                              className={isCurrentParent ? "text-muted-foreground" : ""}
                            >
                              {dept.name} {isCurrentParent && "(Current)"}
                            </SelectItem>
                          )
                        })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Target Team - Conditional (Position only) */}
              {unitToMove?.type === "position" && (
                <div className="space-y-2">
                  <Label>Target Team</Label>
                  <Select
                    value={moveTargetTeam}
                    onValueChange={setMoveTargetTeam}
                    disabled={!moveTargetDivision || (!!moveTargetDepartment && moveTargetDepartment === "__none__") || (!moveTargetDepartment)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__" className="text-muted-foreground italic">None (skip this level)</SelectItem>
                      {organizationalUnits
                        .filter((u) => {
                          if (moveTargetDepartment && moveTargetDepartment !== "__none__") {
                            return u.unitType === "team" && u.parentId === moveTargetDepartment
                          }
                          if (moveTargetDivision) {
                            return u.unitType === "team" && u.parentId === moveTargetDivision
                          }
                          return false
                        })
                        .map((team) => {
                          // Check if this is the current parent
                          const currentUnit = organizationalUnits.find(u => u.id === unitToMove?.id)
                          const isCurrentParent = currentUnit?.parentId === team.id

                          return (
                            <SelectItem
                              key={team.id}
                              value={team.id}
                              disabled={isCurrentParent}
                              className={isCurrentParent ? "text-muted-foreground" : ""}
                            >
                              {team.name} {isCurrentParent && "(Current)"}
                            </SelectItem>
                          )
                        })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setMoveModalOpen(false)}>Cancel</Button>
              <Button onClick={handleMoveUnit} disabled={!moveTargetDivision}>
                <MoveRight className="h-4 w-4 mr-2" />
                Move Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Merge Unit Modal */}
        <Dialog open={mergeModalOpen} onOpenChange={setMergeModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Merge Unit</DialogTitle>
              <DialogDescription>
                Select a target unit to merge <strong>{unitToMerge?.name}</strong> into.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Target Unit</Label>
                <Select value={mergeTargetUnit} onValueChange={setMergeTargetUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      if (!unitToMerge) return null

                      // Helper function to check if a unit is a descendant
                      const isDescendant = (potentialDescendant: typeof organizationalUnits[0], ancestorId: string): boolean => {
                        let current = potentialDescendant
                        while (current.parentId && current.parentId !== "root") {
                          if (current.parentId === ancestorId) return true
                          const parent = organizationalUnits.find(u => u.id === current.parentId)
                          if (!parent) break
                          current = parent
                        }
                        return false
                      }

                      // Filter valid targets based on unit type
                      const validTargets = organizationalUnits.filter(u => {
                        // Must be active
                        if (u.status !== "active") return false

                        // Cannot merge into self
                        if (u.id === unitToMerge.id) return false

                        // Cannot merge into descendants
                        if (unitToMerge.type !== "position" && isDescendant(u, unitToMerge.id)) return false

                        // Cannot merge into lower-level units
                        // Division (level 2) can only merge into Division
                        // Department (level 3) can merge into Division or Department
                        // Team (level 4) can merge into Division, Department, or Team
                        if (unitToMerge.type === "division") {
                          return u.unitType === "division"
                        } else if (unitToMerge.type === "department") {
                          return u.unitType === "division" || u.unitType === "department"
                        } else if (unitToMerge.type === "team") {
                          return u.unitType === "division" || u.unitType === "department" || u.unitType === "team"
                        }

                        return true
                      })

                      // For positions, show all organizational units
                      const positionTargets = unitToMerge.type === "position"
                        ? organizationalUnits.filter(u => u.status === "active")
                        : []

                      const targets = unitToMerge.type === "position" ? positionTargets : validTargets

                      if (targets.length === 0) {
                        return (
                          <SelectItem value="__none__" disabled className="text-muted-foreground italic">
                            No valid targets available
                          </SelectItem>
                        )
                      }

                      return targets.map(unit => {
                        const isSameLevel = unit.level === unitToMerge.level
                        const mergeMode = isSameLevel ? "Consolidate" : "Nest"

                        // Check if this is the current parent
                        const currentUnit = unitToMerge.type === "position"
                          ? positions.find(p => p.id === unitToMerge.id)
                          : organizationalUnits.find(u => u.id === unitToMerge.id)
                        const isCurrentParent = unitToMerge.type === "position"
                          ? currentUnit && 'organizationalUnitId' in currentUnit && currentUnit.organizationalUnitId === unit.id
                          : currentUnit && 'parentId' in currentUnit && currentUnit.parentId === unit.id

                        return (
                          <SelectItem
                            key={unit.id}
                            value={unit.id}
                            disabled={isCurrentParent}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={isCurrentParent ? "text-muted-foreground" : ""}>
                                {unit.name} {isCurrentParent && "(Current)"}
                              </span>
                              <Badge variant={isSameLevel ? "destructive" : "secondary"} className="ml-2 text-xs">
                                {mergeMode}
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })
                    })()}
                  </SelectContent>
                </Select>
                {mergeTargetUnit && unitToMerge && (() => {
                  const target = organizationalUnits.find(u => u.id === mergeTargetUnit)
                  if (!target) return null
                  const isSameLevel = target.level === unitToMerge.level
                  return (
                    <p className="text-xs text-muted-foreground mt-2">
                      {isSameLevel ? (
                        <>⚠️ <strong>Consolidation:</strong> All contents will transfer to target, source will be deleted.</>
                      ) : (
                        <>✓ <strong>Nesting:</strong> Source will be moved under target and preserved.</>
                      )}
                    </p>
                  )
                })()}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setMergeModalOpen(false)}>Cancel</Button>
              <Button onClick={handleMergeUnit} disabled={!mergeTargetUnit}>
                <Merge className="h-4 w-4 mr-2" />
                Merge Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Unit Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Delete {unitToDelete?.name}?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {unitToDelete?.type}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {unitToDelete && (unitToDelete.descendantCount > 0 || unitToDelete.positionCount > 0) && (
              <div className="py-4">
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-destructive">⚠️</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">Warning: This unit contains:</p>
                      <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                        {unitToDelete.descendantCount > 0 && (
                          <li>• <strong>{unitToDelete.descendantCount}</strong> sub-unit{unitToDelete.descendantCount !== 1 ? 's' : ''}</li>
                        )}
                        {unitToDelete.positionCount > 0 && (
                          <li>• <strong>{unitToDelete.positionCount}</strong> position{unitToDelete.positionCount !== 1 ? 's' : ''}</li>
                        )}
                      </ul>
                      <p className="mt-2 text-sm text-destructive font-medium">
                        Deleting it will permanently remove all these items as well.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteUnit}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {unitToDelete?.type === "position" ? "Position" : "Unit"}
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
