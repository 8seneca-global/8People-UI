"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Users, TrendingUp, AlertTriangle, Settings, FileBarChart, MoreHorizontal, User, Building, Trash2, ArrowRightLeft, Merge } from "lucide-react"
import { HistoryLog } from "./HistoryLog"
import { useStore } from "@/lib/store"
import { OrgUnitNode } from "../types"

interface DivisionViewProps {
    node: OrgUnitNode
    onMerge: () => void
    onDelete: () => void
}

export function DivisionView({ node, onMerge, onDelete }: DivisionViewProps) {
    const { employees } = useStore()

    // Mock calculations
    const budgetUtilization = 85 // Mock percent
    const openAudits = 3
    const fteCount = Math.floor(node.employeeCount * 0.8)
    const contractorCount = node.employeeCount - fteCount
    const manager = employees.find(e => e.fullName === node.managerName) // Simplified lookup

    return (
        <div className="h-full flex flex-col">
            {/* Header Region */}
            <div className="p-6 border-b border-border bg-background flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200">
                            Division
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                            Active
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-card-foreground">{node.name}</h1>
                    <div className="flex items-center gap-6 mt-2">
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
                        <div className="h-4 w-px bg-border" />
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{node.code}</span>
                            <span>•</span>
                            <span>Strategic Unit</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Details
                    </Button>
                    <Button>
                        <Building className="h-4 w-4 mr-2" />
                        Add Sub-unit
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
                    <TabsList>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="history">History & Audit</TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="space-y-6">
                        {/* Key Metrics Grid (The "Pulse") */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Unit Lead */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Division Head</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {manager ? (manager.firstName[0] + manager.lastName[0]) : "U"}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{node.managerName || "Unassigned"}</p>
                                            <Button variant="link" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                                                Change Lead
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Cost Center & Budget */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Budget Utilization ({node.costCenter})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-2xl font-bold">{budgetUtilization}%</span>
                                            <span className="text-xs text-muted-foreground">Target: 90%</span>
                                        </div>
                                        <Progress value={budgetUtilization} className="h-2" />
                                        <p className="text-xs text-muted-foreground">
                                            {budgetUtilization > 100 ? <span className="text-destructive font-medium">Over Budget</span> : "Within allocation"}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Headcount Breakdown */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Headcount Composition</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Moved total Count to header, keeping breakdown here */}
                                    <div className="flex gap-1 h-2 w-full rounded-full overflow-hidden bg-muted mb-2">
                                        <div className="bg-blue-500" style={{ width: `${(fteCount / node.employeeCount) * 100}%` }} title="FTE" />
                                        <div className="bg-amber-500" style={{ width: `${(contractorCount / node.employeeCount) * 100}%` }} title="Contractors" />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> {fteCount} FTE</div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> {contractorCount} Ext</div>
                                    </div>
                                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-full">
                                        3 Open Roles
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Content Area - Positions FIRST, then Sub-Units */}
                        <div className="space-y-6">

                            {/* Direct Positions / Directory  - Added for Division Level per requirement */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Direct Positions</CardTitle>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </CardHeader>
                                <CardContent>
                                    {node.positions.length === 0 ? (
                                        <div className="text-center py-4 text-muted-foreground text-sm">
                                            No direct positions assigned to Division root.
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {node.positions.map(pos => {
                                                const incumbent = employees.find(e => e.id === pos.incumbentId)
                                                return (
                                                    <div key={pos.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${incumbent ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                                                                {incumbent ? incumbent.firstName[0] + incumbent.lastName[0] : "!"}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{incumbent ? incumbent.fullName : "Vacant Position"}</p>
                                                                <p className="text-xs text-muted-foreground">{pos.title}</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant={incumbent ? "outline" : "destructive"} className="text-[10px] font-normal h-5">
                                                            {incumbent ? "Filled" : "Vacant"}
                                                        </Badge>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Sub-Units Table */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Sub-Units</CardTitle>
                                    <Button variant="ghost" size="sm">View All</Button>
                                </CardHeader>
                                <CardContent>
                                    {node.children.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                            No sub-units defined.
                                            <div className="mt-2">
                                                <Button variant="outline" size="sm">Create Department</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {node.children.map(child => (
                                                <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-background group-hover:text-primary transition-colors">
                                                            <Building className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{child.name}</p>
                                                            <div className="flex gap-3 text-xs text-muted-foreground">
                                                                <span>{child.code}</span>
                                                                <span>•</span>
                                                                <span>{child.employeeCount} Members</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-green-50/50 text-green-700 font-normal">On Track</Badge>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <HistoryLog entityId={node.id} entityType="division" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
