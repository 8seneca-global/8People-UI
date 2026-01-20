"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Calendar, CheckSquare, MessageSquare, AlertCircle, MoreHorizontal, Settings, UserPlus, Trash2, ArrowRightLeft, Users, Clock, Building, ShieldAlert, MoveRight, Merge } from "lucide-react"
import { HistoryLog } from "./HistoryLog"
import { useStore } from "@/lib/store"
import { OrgUnitNode } from "../types"

interface TeamViewProps {
    node: OrgUnitNode
    onMove: () => void
    onMerge: () => void
    onDelete: () => void
}

export function TeamView({ node, onMove, onMerge, onDelete }: TeamViewProps) {
    const { employees } = useStore()

    // Mock Workload Data
    const getWorkload = (id: string) => {
        // Deterministic random mock
        const val = (id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 60) + 40
        return Math.min(val, 100)
    }

    const teamLead = employees.find(e => e.fullName === node.managerName)
    const avgWorkload = 78
    const sprintProgress = 65

    return (
        <div className="h-full flex flex-col">
            {/* Header Region */}
            <div className="p-6 border-b border-border bg-background flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                            Team
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                            Sprint Active
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
                            <span>Execution Unit</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule 1:1s
                    </Button>
                    <Button>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Plan Sprint
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
                                <Settings className="h-4 w-4 mr-2" /> Team Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <ArrowRightLeft className="h-4 w-4 mr-2" /> Reassign Members
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onMove}>
                                <MoveRight className="h-4 w-4 mr-2" /> Move Team
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onMerge}>
                                <Merge className="h-4 w-4 mr-2" /> Merge
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                                <Trash2 className="h-4 w-4 mr-2" /> Disband Team
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
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Team Lead */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Team Lead</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {teamLead ? (teamLead.firstName[0] + teamLead.lastName[0]) : "T"}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{node.managerName || "Unassigned"}</p>
                                            <p className="text-xs text-muted-foreground">4 Direct Reports</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sprint Velocity */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Sprint Progress</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-2xl font-bold">{sprintProgress}%</span>
                                            <span className="text-xs text-muted-foreground">Day 6 of 10</span>
                                        </div>
                                        <Progress value={sprintProgress} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Avg Workload */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Workload</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-2xl font-bold">{avgWorkload}%</span>
                                        <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                                            High Load
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500" style={{ width: `${avgWorkload}%` }} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Roster Table */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Team Roster & Utilization</CardTitle>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-8">
                                                <Clock className="h-3.5 w-3.5 mr-2" /> Timesheets
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-border">
                                            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-semibold text-muted-foreground bg-muted/30">
                                                <div className="col-span-4">Member</div>
                                                <div className="col-span-3">Role</div>
                                                <div className="col-span-3">Workload</div>
                                                <div className="col-span-2 text-right">Actions</div>
                                            </div>

                                            {node.positions.map(pos => {
                                                const incumbent = employees.find(e => e.id === pos.incumbentId)
                                                const utilization = incumbent ? getWorkload(incumbent.id) : 0

                                                return (
                                                    <div key={pos.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/30 transition-colors">
                                                        <div className="col-span-4 flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                                    {incumbent ? incumbent.firstName[0] + incumbent.lastName[0] : "?"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-sm truncate">{incumbent ? incumbent.fullName : "Vacant"}</p>
                                                                <p className="text-xs text-muted-foreground truncate">{incumbent?.companyEmail || "-"}</p>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <p className="text-sm truncate">{pos.title}</p>
                                                            {/* Skills mock */}
                                                            <div className="flex gap-1 mt-1">
                                                                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" title="React" />
                                                                <span className="inline-block w-2 h-2 rounded-full bg-yellow-500" title="TypeScript" />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3">
                                                            {incumbent ? (
                                                                <div className="space-y-1">
                                                                    <div className="flex justify-between text-xs">
                                                                        <span>{utilization}%</span>
                                                                        <span className={utilization > 85 ? "text-red-500" : "text-muted-foreground"}>
                                                                            {utilization > 85 ? "High" : "Good"}
                                                                        </span>
                                                                    </div>
                                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full ${utilization > 85 ? "bg-red-500" : "bg-green-500"}`}
                                                                            style={{ width: `${utilization}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">N/A</span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2 flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                                <MessageSquare className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Sub-Teams (if any - rare for Teams but possible) */}
                                {node.children.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Sub-Teams</CardTitle>
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

                                {/* Dependency Risks */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center gap-2 pb-2">
                                        <AlertCircle className="h-4 w-4 text-orange-500" />
                                        <CardTitle className="text-base">Risk Radar</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900 rounded-lg p-3">
                                            <p className="text-sm font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2 mb-1">
                                                Single Point of Failure
                                            </p>
                                            <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
                                                Only 1 member (Sarah Connor) has approval rights for "Legacy Systems". Consider cross-training or delegating permissions to reduce bottleneck risk.
                                            </p>
                                            <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-orange-700">View Mitigation Plan</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar - History Log */}
                            <div className="lg:col-span-1">
                                {/* Placeholders or Team Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Team Stats</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>Utilization</span> <span className="font-bold">85%</span></div>
                                            <div className="flex justify-between"><span>Meeting Load</span> <span className="font-bold">12h/w</span></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <HistoryLog entityId={node.id} entityType="team" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
