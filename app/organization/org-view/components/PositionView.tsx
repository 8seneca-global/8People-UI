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
import { Briefcase, DollarSign, Calendar, FileText, Lock, Edit3, MoreHorizontal, UserPlus, UserMinus, Copy, Trash2, CheckCircle2, AlertCircle, MoveRight, Merge, Mail, User, Settings, ArrowUp, ArrowDown } from "lucide-react"
import { HistoryLog } from "./HistoryLog"
import { useStore } from "@/lib/store"
import { Position } from "@/lib/mock-data"

interface PositionViewProps {
    position: Position
    onMove: () => void
    onMerge: () => void
    onDelete: () => void
    onSelectPosition?: (positionId: string) => void
}

export function PositionView({ position, onMove, onMerge, onDelete, onSelectPosition }: PositionViewProps) {
    const { employees, organizationalUnits, positions } = useStore()

    const incumbent = position.incumbentId ? employees.find(e => e.id === position.incumbentId) : null
    const orgUnit = organizationalUnits.find(u => u.id === position.organizationalUnitId)
    const isVacant = !incumbent

    // Find reporter (manager) - position this role reports to
    const reporterPosition = position.reportsToId ? positions.find(p => p.id === position.reportsToId) : null
    const reporterIncumbent = reporterPosition?.incumbentId ? employees.find(e => e.id === reporterPosition.incumbentId) : null

    // Find reportees (direct reports) - positions that report to this position
    const reporteePositions = positions.filter(p => p.reportsToId === position.id)

    return (
        <div className="h-full flex flex-col">
            {/* Header Region */}
            <div className="p-6 border-b border-border bg-background flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-card-foreground mb-3">{position.title}</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="font-semibold text-foreground">{isVacant ? "Vacant" : "Filled"}</span>
                            <span className="text-xs">Status</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isVacant ? (
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Assign Employee
                        </Button>
                    ) : (
                        <Button variant="outline">
                            <UserMinus className="h-4 w-4 mr-2" />
                            Offboard
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <Edit3 className="h-4 w-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" /> Clone Position
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Lock className="h-4 w-4 mr-2" /> Freeze Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onMove}>
                                <MoveRight className="h-4 w-4 mr-2" /> Move Position
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onMerge}>
                                <Merge className="h-4 w-4 mr-2" /> Merge
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
                                <Trash2 className="h-4 w-4 mr-2" /> Close Position
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-transparent border-0 p-0 h-auto gap-4">
                        <TabsTrigger
                            value="overview"
                            className="data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=inactive]:border-0 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground rounded-md px-4 py-2"
                        >
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=inactive]:border-0 data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground rounded-md px-4 py-2"
                        >
                            History & Audit
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Associated Employee Table */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Associated Employee</h2>
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
                                            const status = position.status || (incumbent ? "Filled" : "Vacant")
                                            const teamName = orgUnit?.type === "team" ? orgUnit.name : "—"

                                            return (
                                                <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                    <td className="p-3 font-medium text-sm">{position.title}</td>
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
                                                        {reporterPosition ? reporterPosition.title : <span className="text-muted-foreground/40">—</span>}
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
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Reporter (Direct Manager) */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ArrowUp className="h-4 w-4 text-muted-foreground" />
                                Reporter (Direct Manager)
                            </h2>
                            <div className="rounded-md border">
                                {reporterPosition ? (
                                    <div
                                        className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                                        onClick={() => onSelectPosition?.(reporterPosition.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {reporterIncumbent && (
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                                        {reporterIncumbent.firstName[0]}{reporterIncumbent.lastName[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium text-sm text-primary hover:underline">{reporterPosition.title}</p>
                                                    {reporterIncumbent && (
                                                        <p className="text-xs text-muted-foreground">{reporterIncumbent.fullName}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {reporterPosition.status || (reporterIncumbent ? "Filled" : "Vacant")}
                                            </Badge>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No direct manager assigned
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reportees (Direct Subordinates) */}
                        <div>
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                                Reportees (Direct Subordinates)
                            </h2>
                            <div className="rounded-md border">
                                {reporteePositions.length > 0 ? (
                                    <div className="divide-y">
                                        {reporteePositions.map(reporteePos => {
                                            const reporteeIncumbent = reporteePos.incumbentId ? employees.find(e => e.id === reporteePos.incumbentId) : null
                                            const status = reporteePos.status || (reporteeIncumbent ? "Filled" : "Vacant")

                                            return (
                                                <div
                                                    key={reporteePos.id}
                                                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                                                    onClick={() => onSelectPosition?.(reporteePos.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {reporteeIncumbent && (
                                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                                                    {reporteeIncumbent.firstName[0]}{reporteeIncumbent.lastName[0]}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-sm text-primary hover:underline">{reporteePos.title}</p>
                                                                {reporteeIncumbent && (
                                                                    <p className="text-xs text-muted-foreground">{reporteeIncumbent.fullName}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            variant={status === "Filled" ? "outline" : status === "Hiring" ? "secondary" : "destructive"}
                                                            className="text-xs"
                                                        >
                                                            {status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No direct reports
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="history">
                        <HistoryLog entityId={position.id} entityType="position" />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
