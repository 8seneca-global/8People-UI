"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { History, ArrowRight, RotateCcw, FileDown, Calendar } from "lucide-react"

interface HistoryLogProps {
    entityId: string
    entityType: "division" | "department" | "team" | "position"
}

interface LogEntry {
    id: string
    date: string
    actionType: "moved" | "edited" | "created" | "deleted" | "promoted"
    description: string
    user: string
    changes?: {
        field: string
        oldValue: string
        newValue: string
    }[]
}

export function HistoryLog({ entityId, entityType }: HistoryLogProps) {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [filter, setFilter] = useState<string>("all")
    const [loading, setLoading] = useState(true)

    // Mock async fetch
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            setLogs([
                {
                    id: "1",
                    date: "2024-03-15T10:30:00",
                    actionType: "edited",
                    description: "Updated cost center",
                    user: "Alice Admin",
                    changes: [{ field: "Cost Center", oldValue: "CC-001", newValue: "CC-002" }],
                },
                {
                    id: "2",
                    date: "2024-03-10T14:20:00",
                    actionType: "moved",
                    description: "Moved from Operations to Technology",
                    user: "Bob Manager",
                    changes: [{ field: "Parent", oldValue: "Operations", newValue: "Technology" }],
                },
                {
                    id: "3",
                    date: "2024-02-01T09:00:00",
                    actionType: "created",
                    description: "Entity created",
                    user: "System",
                },
            ])
            setLoading(false)
        }, 800)
    }, [entityId, entityType])

    const filteredLogs = filter === "all" ? logs : logs.filter(l => l.actionType === filter)

    if (loading) {
        return <div className="p-4 text-center text-muted-foreground">Loading history...</div>
    }

    return (
        <Card className="h-full border-border bg-card">
            <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        History & Audit
                    </CardTitle>
                    <div className="flex gap-2">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue placeholder="Filter by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="edited">Edited</SelectItem>
                                <SelectItem value="moved">Moved</SelectItem>
                                <SelectItem value="promoted">Promoted</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <FileDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-6 relative ml-2">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-border sm:left-2.5" />

                        {filteredLogs.map((log) => (
                            <div key={log.id} className="relative pl-8">
                                {/* Timeline Dot */}
                                <div className="absolute left-0 top-1 h-5 w-5 rounded-full border border-border bg-background flex items-center justify-center sm:left-0.5">
                                    <div className={`h-2 w-2 rounded-full ${log.actionType === 'created' ? 'bg-green-500' :
                                            log.actionType === 'moved' ? 'bg-orange-500' :
                                                'bg-blue-500'
                                        }`} />
                                </div>

                                <div className="bg-muted/30 p-3 rounded-lg border border-border">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-sm">{log.description}</span>
                                        <Badge variant="outline" className="text-[10px] capitalize">
                                            {log.actionType}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(log.date).toLocaleString()}</span>
                                        <span>•</span>
                                        <span>{log.user}</span>
                                    </div>

                                    {log.changes && (
                                        <div className="mt-2 space-y-1 bg-background p-2 rounded border border-border/50 text-xs">
                                            {log.changes.map((change, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="font-medium">{change.field}:</span>
                                                    <span className="text-red-500 line-through">{change.oldValue}</span>
                                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-green-500">{change.newValue}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {log.actionType === 'edited' && (
                                        <div className="mt-2 text-right">
                                            <Button variant="ghost" size="sm" className="h-6 text-xs hover:text-destructive">
                                                <RotateCcw className="h-3 w-3 mr-1" /> Revert
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
