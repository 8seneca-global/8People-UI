"use client"

import { useState, useMemo } from "react"
import { Check, ChevronsUpDown, Search, Briefcase, Users, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import type { Position, OrganizationalUnit } from "@/lib/mock-data"
import { formatHierarchyCompact, buildHierarchyChain } from "@/lib/hierarchy-utils"

interface PositionSelectorProps {
    positions: Position[]
    organizationalUnits: OrganizationalUnit[]
    value?: string
    onValueChange: (positionId: string) => void
    placeholder?: string
    disabled?: boolean
}

export function PositionSelector({
    positions,
    organizationalUnits,
    value,
    onValueChange,
    placeholder = "Select position...",
    disabled = false,
}: PositionSelectorProps) {
    const [open, setOpen] = useState(false)

    // Enrich positions with hierarchy info
    const enrichedPositions = useMemo(() => {
        return positions.map((position) => {
            const hierarchy = buildHierarchyChain(position.organizationalUnitId, organizationalUnits)
            return {
                ...position,
                hierarchyDisplay: formatHierarchyCompact(hierarchy),
                hierarchyFull: hierarchy,
            }
        })
    }, [positions, organizationalUnits])

    const selectedPosition = enrichedPositions.find((p) => p.id === value)

    const getStatusIcon = (status: Position["hiringStatus"]) => {
        switch (status) {
            case "vacant":
                return <Briefcase className="h-3 w-3 text-muted-foreground" />
            case "filled":
                return <UserCheck className="h-3 w-3 text-green-600" />
            case "hiring":
                return <Users className="h-3 w-3 text-blue-600" />
        }
    }

    const getStatusBadge = (status: Position["hiringStatus"]) => {
        const variants = {
            vacant: { label: "Vacant", className: "bg-muted text-muted-foreground" },
            filled: { label: "Filled", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
            hiring: { label: "Hiring", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
        }
        const config = variants[status]
        return (
            <Badge variant="outline" className={cn("text-xs", config.className)}>
                {config.label}
            </Badge>
        )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between bg-input border-border"
                    disabled={disabled}
                >
                    {selectedPosition ? (
                        <div className="flex items-center gap-2 truncate">
                            {getStatusIcon(selectedPosition.hiringStatus)}
                            <span className="truncate">{selectedPosition.title}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search positions..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No position found.</CommandEmpty>
                        <CommandGroup>
                            {enrichedPositions.map((position) => (
                                <CommandItem
                                    key={position.id}
                                    value={`${position.title} ${position.hierarchyDisplay}`}
                                    onSelect={() => {
                                        onValueChange(position.id)
                                        setOpen(false)
                                    }}
                                    className="flex items-start gap-2 py-3"
                                >
                                    <Check className={cn("mt-0.5 h-4 w-4", value === position.id ? "opacity-100" : "opacity-0")} />
                                    <div className="flex flex-1 flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{position.title}</span>
                                            {getStatusBadge(position.hiringStatus)}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Briefcase className="h-3 w-3" />
                                            <span>{position.hierarchyDisplay}</span>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
