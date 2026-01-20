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
import { Briefcase, DollarSign, Calendar, FileText, Lock, Edit3, MoreHorizontal, UserPlus, UserMinus, Copy, Trash2, CheckCircle2, AlertCircle, MoveRight, Merge } from "lucide-react"
import { HistoryLog } from "./HistoryLog"
import { useStore } from "@/lib/store"
import { Position } from "@/lib/mock-data"

interface PositionViewProps {
    position: Position
    onMove: () => void
    onMerge: () => void
    onDelete: () => void
}

export function PositionView({ position, onMove, onMerge, onDelete }: PositionViewProps) {
    const { employees, organizationalUnits } = useStore()

    const incumbent = position.incumbentId ? employees.find(e => e.id === position.incumbentId) : null
    const orgUnit = organizationalUnits.find(u => u.id === position.organizationalUnitId)
    const isVacant = !incumbent

    // Mock Data
    const salaryBand = { min: 85000, max: 125000, current: 105000 } // Mock
    const comparisonPercent = Math.round(((salaryBand.current - salaryBand.min) / (salaryBand.max - salaryBand.min)) * 100)
    const competencies = ["Strategic Planning", "Team Leadership", "Project Management", "Agile Methodologies"]

    return (
        <div className="h-full flex flex-col">
            {/* Header Region */}
            <div className="p-6 border-b border-border bg-background flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {isVacant ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> Vacant
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Filled
                            </Badge>
                        )}
                        <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
                            {position.code}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-bold text-card-foreground">{position.title}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Reports to <span className="text-primary font-medium cursor-pointer hover:underline">Unit Lead</span> • {orgUnit?.name}
                    </p>
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
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="history">History & Audit</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Incumbency Card (The "Seat") */}
                            <Card className="md:col-span-2">
                                <CardHeader className="pb-3 border-b border-border/50">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        Seat Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {incumbent ? (
                                        <div className="flex items-start md:items-center gap-6">
                                            <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                                                <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">
                                                    {incumbent.firstName[0] + incumbent.lastName[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{incumbent.fullName}</h3>
                                                        <p className="text-muted-foreground text-sm">{incumbent.companyEmail}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">View Full Profile</Button>
                                                </div>

                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border/50">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Joined</p>
                                                        <p className="text-sm font-medium flex items-center gap-1.5 mt-1">
                                                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {new Date(incumbent.companyJoinDate || "").toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Employee ID</p>
                                                        <p className="text-sm font-medium mt-1">{incumbent.employeeId}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Performance</p>
                                                        <Badge variant="outline" className="mt-1 font-normal bg-green-50 text-green-700 border-green-200">Exceeds Expectations</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
                                            <div className="p-3 bg-background rounded-full mb-3 shadow-sm text-muted-foreground">
                                                <UserPlus className="h-6 w-6" />
                                            </div>
                                            <h3 className="text-lg font-medium">Position is Vacant</h3>
                                            <p className="text-muted-foreground mb-4 max-w-sm">This seat has been empty for 12 days. Recruitment pipeline is active.</p>
                                            <div className="flex gap-3">
                                                <Button variant="default">Start Recruitment</Button>
                                                <Button variant="outline">View Candidates (3)</Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Job Details */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Job Description
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1.5">Role Summary</p>
                                        <p className="text-sm leading-relaxed text-card-foreground/80">
                                            Responsible for leading the development team, ensuring code quality, and delivering projects on time.
                                            Mentors junior developers and collaborates with product managers to define feature specifications.
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Core Competencies</p>
                                        <div className="flex flex-wrap gap-2">
                                            {competencies.map(c => (
                                                <Badge key={c} variant="secondary" className="font-normal bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 transition-colors">{c}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="link" className="px-0 text-primary h-auto text-xs">View Full JD</Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Compensation */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        Compensation Band
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-5">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-muted-foreground font-medium">Range Penetration</span>
                                                <span className="font-bold text-primary">{comparisonPercent}%</span>
                                            </div>
                                            <Progress value={comparisonPercent} className="h-2.5" />
                                        </div>

                                        <div className="bg-muted/40 p-3 rounded-md grid grid-cols-3 gap-2 text-center text-sm border border-border/50">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground uppercase font-bold">Min</span>
                                                <span className="font-mono">${salaryBand.min.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col border-l border-r border-border/50">
                                                <span className="text-xs text-muted-foreground uppercase font-bold">Mid</span>
                                                <span className="font-mono">${((salaryBand.max + salaryBand.min) / 2).toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground uppercase font-bold">Max</span>
                                                <span className="font-mono">${salaryBand.max.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/10 p-2 rounded text-blue-700 dark:text-blue-300">
                                            <AlertCircle className="h-3 w-3" />
                                            <span>Current package is within Level 4 guidelines.</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
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
