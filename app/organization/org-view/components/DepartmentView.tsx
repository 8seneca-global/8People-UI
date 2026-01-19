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
import { Search, UserPlus, Zap, Settings, MoreHorizontal, ArrowRightLeft, Merge, Trash2, Users, Building, ShieldAlert } from "lucide-react"
import { HistoryLog } from "./HistoryLog"
import { useStore } from "@/lib/store"
import { OrgUnitNode } from "../types"
import { useState } from "react"

interface DepartmentViewProps {
    node: OrgUnitNode
}

export function DepartmentView({ node }: DepartmentViewProps) {
    const { employees } = useStore()
    const [employeeSearch, setEmployeeSearch] = useState("")

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
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                            Department
                        </Badge>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                            Active
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-card-foreground">{node.name}</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{node.code}</span>
                        <span>•</span>
                        <span>Operational Unit</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Details
                    </Button>
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
                            <DropdownMenuItem>
                                <ArrowRightLeft className="h-4 w-4 mr-2" /> Move Unit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Unit Lead */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Department Lead</CardTitle>
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

                    {/* Cost Center */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Budget ({node.costCenter})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-2xl font-bold">{budgetUtilization}%</span>
                                    <span className="text-xs text-muted-foreground">Target: 95%</span>
                                </div>
                                <Progress value={budgetUtilization} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    {budgetUtilization > 100 ? <span className="text-destructive font-medium">Over Budget</span> : "Within allocation"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Headcount */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Headcount</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-2xl font-bold">{node.employeeCount}</span>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full cursor-pointer hover:bg-blue-100">
                                    1 Open Role
                                </span>
                            </div>
                            <div className="flex gap-1 h-2 w-full rounded-full overflow-hidden bg-muted">
                                <div className="bg-blue-500" style={{ width: `${(fteCount / node.employeeCount) * 100}%` }} title="FTE" />
                                <div className="bg-amber-500" style={{ width: `${(contractorCount / node.employeeCount) * 100}%` }} title="Contractors" />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> {fteCount} FTE</div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> {contractorCount} Ext</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Sub-Teams (if any) */}
                        {node.children.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Teams</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {node.children.map(child => (
                                            <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors bg-card">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{child.name}</p>
                                                        <p className="text-xs text-muted-foreground">{child.employeeCount} members</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Direct Positions / Directory */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Direct Positions</CardTitle>
                                <div className="relative w-[200px]">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search..."
                                        className="pl-8 h-8 text-xs"
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    {node.positions.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No direct positions in this department root.
                                        </div>
                                    ) : (
                                        node.positions
                                            .filter(p => p.title.toLowerCase().includes(employeeSearch.toLowerCase()))
                                            .map(pos => {
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
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant={incumbent ? "outline" : "destructive"} className="text-[10px] font-normal h-5">
                                                                {incumbent ? "Filled" : "Vacant"}
                                                            </Badge>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skill Gaps */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                                    Critical Gaps
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                                    <span className="text-sm text-amber-900">Senior React Developer needed for Mobile Team</span>
                                    <Button size="sm" variant="ghost" className="h-7 text-amber-700 hover:text-amber-800 hover:bg-amber-100">View JD</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - History Log */}
                    <div className="lg:col-span-1">
                        <HistoryLog entityId={node.id} entityType="department" />
                    </div>
                </div>
            </div>
        </div>
    )
}
