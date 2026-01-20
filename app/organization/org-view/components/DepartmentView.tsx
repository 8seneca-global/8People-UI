"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Zap, Settings, MoreHorizontal, ArrowRightLeft, Merge, Trash2, Users, Building, ShieldAlert, MoveRight } from "lucide-react"
import { HistoryLog } from "./HistoryLog"
import { useStore } from "@/lib/store"
import { OrgUnitNode } from "../types"
import { useState } from "react"

interface DepartmentViewProps {
    node: OrgUnitNode
    onMove: () => void
    onMerge: () => void
    onDelete: () => void
}

export function DepartmentView({ node, onMove, onMerge, onDelete }: DepartmentViewProps) {
    const { employees } = useStore()
    const [employeeSearch, setEmployeeSearch] = useState("")
    const [filterUnit, setFilterUnit] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")

    // Mock calculations
    const budgetUtilization = 92
    const openAudits = 1
    const fteCount = Math.floor(node.employeeCount * 0.9)
    const contractorCount = node.employeeCount - fteCount
    const manager = employees.find(e => e.fullName === node.managerName)

    return (
        <div className="h-full flex flex-col">
            {/* Header Region */}
            <div className="p-6 border-b border-border bg-background flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-card-foreground mb-3">{node.name}</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="font-semibold text-foreground">{node.employeeCount}</span>
                            <span className="text-xs">Headcount</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span className="font-semibold text-foreground">{node.children.length}</span>
                            <span className="text-xs">Sub-units</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Position
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Building className="h-4 w-4 mr-2" /> Add Sub-Team
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onMove}>
                                <MoveRight className="h-4 w-4 mr-2" /> Move Unit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onMerge}>
                                <Merge className="h-4 w-4 mr-2" /> Merge
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <Tabs defaultValue="members" className="space-y-6">
                    <TabsList className="bg-transparent border-0 p-0 h-auto gap-4">
                        <TabsTrigger
                            value="members"
                            className="data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=inactive]:border-0 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground rounded-md px-4 py-2"
                        >
                            Directory ({node.positions.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=inactive]:border-0 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground rounded-md px-4 py-2"
                        >
                            History & Audit
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="space-y-6">
                        {/* Directory Table - All Positions in Tree Order */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Directory</h2>
                                <div className="flex gap-3">
                                    <Select value={filterUnit} onValueChange={setFilterUnit}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Units</SelectItem>
                                            {(() => {
                                                const collectUnits = (currentNode: OrgUnitNode): string[] => {
                                                    const units = [currentNode.name]
                                                    currentNode.children.forEach(child => {
                                                        units.push(...collectUnits(child))
                                                    })
                                                    return units
                                                }
                                                const allUnits = collectUnits(node)
                                                return allUnits.map(unitName => (
                                                    <SelectItem key={unitName} value={unitName}>{unitName}</SelectItem>
                                                ))
                                            })()}
                                        </SelectContent>
                                    </Select>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Filter by Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="Filled">Filled</SelectItem>
                                            <SelectItem value="Vacant">Vacant</SelectItem>
                                            <SelectItem value="Hiring">Hiring</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left p-3 font-medium text-sm">Position Title</th>
                                            <th className="text-left p-3 font-medium text-sm">Team</th>
                                            <th className="text-left p-3 font-medium text-sm">Incumbent</th>
                                            <th className="text-left p-3 font-medium text-sm">Status</th>
                                            <th className="text-left p-3 font-medium text-sm">Reports To</th>
                                            <th className="text-left p-3 font-medium text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const flattenPositionsInTreeOrder = (currentNode: OrgUnitNode): Array<{ position: any, unitNode: OrgUnitNode }> => {
                                                const result: Array<{ position: any, unitNode: OrgUnitNode }> = []
                                                currentNode.positions.forEach(pos => {
                                                    result.push({ position: pos, unitNode: currentNode })
                                                })
                                                currentNode.children.forEach(child => {
                                                    result.push(...flattenPositionsInTreeOrder(child))
                                                })
                                                return result
                                            }

                                            const allPositions = flattenPositionsInTreeOrder(node)
                                            const filteredPositions = allPositions.filter(({ position: pos, unitNode }) => {
                                                const incumbent = employees.find(e => e.id === pos.incumbentId)
                                                const status = pos.status || (incumbent ? "Filled" : "Vacant")
                                                const matchesUnit = filterUnit === "all" || unitNode.name === filterUnit
                                                const matchesStatus = filterStatus === "all" || status === filterStatus
                                                return matchesUnit && matchesStatus
                                            })

                                            if (filteredPositions.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                                            No positions found matching the selected filters
                                                        </td>
                                                    </tr>
                                                )
                                            }

                                            return filteredPositions.map(({ position: pos, unitNode }) => {
                                                const incumbent = employees.find(e => e.id === pos.incumbentId)
                                                const status = pos.status || (incumbent ? "Filled" : "Vacant")
                                                const reportsTo = pos.reportsToId ? employees.find(e => e.id === pos.reportsToId) : null

                                                // Determine Team name
                                                const teamName = unitNode.type === "team" ? unitNode.name : "—"

                                                return (
                                                    <tr key={pos.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                        <td className="p-3 font-medium text-sm">{pos.title}</td>
                                                        <td className="p-3 text-sm text-muted-foreground">
                                                            {teamName === "—" ? <span className="text-muted-foreground/40">—</span> : teamName}
                                                        </td>
                                                        <td className="p-3">
                                                            {incumbent ? (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                                                        {incumbent.firstName[0]}{incumbent.lastName[0]}
                                                                    </div>
                                                                    <span className="text-sm">{incumbent.fullName}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted-foreground/40">—</span>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge
                                                                variant={status === "Filled" ? "outline" : status === "Hiring" ? "secondary" : "destructive"}
                                                                className="text-xs"
                                                            >
                                                                {status}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-sm text-muted-foreground">
                                                            {reportsTo ? reportsTo.fullName : <span className="text-muted-foreground/40">—</span>}
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                                    <Settings className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <HistoryLog entityId={node.id} entityType="department" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
