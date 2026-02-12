"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, User, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export interface FilterState {
    type: "users" | "groups"
    selectedIds: string[]
}

interface AttendanceFilterProps {
    employees: { id: string; fullName: string; jobTitle?: string; organizationalUnitId?: string }[]
    orgUnits: { id: string; name: string; unitType: string }[]
    value: FilterState
    onChange: (value: FilterState) => void
}

export function AttendanceFilter({
    employees,
    orgUnits,
    value,
    onChange,
}: AttendanceFilterProps) {
    const [open, setOpen] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState<"users" | "groups">(value.type)

    // Filter to only show departments
    const departments = React.useMemo(() => {
        return orgUnits.filter(unit => unit.unitType === 'department')
    }, [orgUnits])

    // Calculate employee count for each department
    const departmentEmployeeCounts = React.useMemo(() => {
        const counts: Record<string, number> = {}
        departments.forEach(dept => {
            counts[dept.id] = employees.filter(emp => emp.organizationalUnitId === dept.id).length
        })
        return counts
    }, [departments, employees])

    // Sync internal tab state with external value type if it changes securely
    React.useEffect(() => {
        setActiveTab(value.type)
    }, [value.type])

    const handleTabChange = (tab: string) => {
        const newTab = tab as "users" | "groups"
        setActiveTab(newTab)
        // When switching tabs, we clear selection to avoid confusion or mixed states
        if (newTab !== value.type) {
            onChange({ type: newTab, selectedIds: [] })
        }
    }

    const toggleSelection = (id: string) => {
        const currentIds = value.selectedIds
        const isSelected = currentIds.includes(id)
        let newIds = []

        if (isSelected) {
            newIds = currentIds.filter((item) => item !== id)
        } else {
            newIds = [...currentIds, id]
        }

        onChange({ ...value, selectedIds: newIds })
    }

    const toggleSelectAll = () => {
        // Select All logic depends on active tab
        if (activeTab === 'users') {
            if (value.selectedIds.length === employees.length) {
                onChange({ ...value, selectedIds: [] })
            } else {
                onChange({ ...value, selectedIds: employees.map(e => e.id) })
            }
        } else {
            if (value.selectedIds.length === departments.length) {
                onChange({ ...value, selectedIds: [] })
            } else {
                onChange({ ...value, selectedIds: departments.map(o => o.id) })
            }
        }
    }

    const getLabel = () => {
        if (value.selectedIds.length === 0) {
            return activeTab === "users" ? "All Users" : "All Departments"
        }
        if (value.type === 'users') {
            if (value.selectedIds.length === employees.length) return "All Users"
            if (value.selectedIds.length === 1) {
                return employees.find(e => e.id === value.selectedIds[0])?.fullName || "1 User"
            }
            return `${value.selectedIds.length} Users`
        } else {
            if (value.selectedIds.length === departments.length) return "All Departments"
            if (value.selectedIds.length === 1) {
                return departments.find(o => o.id === value.selectedIds[0])?.name || "1 Department"
            }
            return `${value.selectedIds.length} Departments`
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Filter attendance by users or departments"
                    className="w-[200px] justify-between min-h-[44px]"
                >
                    <span className="truncate text-sm">
                        {getLabel()}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-0" align="start">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <div className="flex items-center justify-center p-2 border-b">
                        <TabsList className="w-full h-auto p-1 bg-muted">
                            <TabsTrigger value="users" className="flex-1">
                                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                                <span className="text-sm">Users</span>
                            </TabsTrigger>
                            <TabsTrigger value="groups" className="flex-1">
                                <Users className="mr-2 h-4 w-4" aria-hidden="true" />
                                <span className="text-sm">Departments</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <Command className="border-none">
                        <CommandInput placeholder={`Search ${activeTab === 'users' ? 'users' : 'departments'}...`} className="text-sm" />
                        <CommandList>
                            <CommandEmpty>No results found.</CommandEmpty>

                            <div className="px-2 py-1.5 border-b">
                                <CommandItem
                                    value="select-all-toggle"
                                    onSelect={toggleSelectAll}
                                    className="cursor-pointer min-h-[44px] aria-selected:bg-accent"
                                >
                                    <div className="flex items-center space-x-2 w-full">
                                        <Checkbox
                                            id="select-all"
                                            checked={
                                                activeTab === 'users'
                                                    ? (value.selectedIds.length === employees.length && employees.length > 0)
                                                    : (value.selectedIds.length === departments.length && departments.length > 0)
                                            }
                                            aria-label="Select all items"
                                            className="pointer-events-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        />
                                        <span className="font-medium text-sm">Select All</span>
                                    </div>
                                </CommandItem>
                            </div>

                            <TabsContent value="users" className="mt-0">
                                <CommandGroup>
                                    {employees.map((employee) => (
                                        <CommandItem
                                            key={employee.id}
                                            value={employee.fullName} // Search by name
                                            onSelect={() => toggleSelection(employee.id)}
                                            className="min-h-[44px] aria-selected:bg-accent cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-2 w-full">
                                                <Checkbox
                                                    checked={value.selectedIds.includes(employee.id)}
                                                    aria-label={`Select ${employee.fullName}`}
                                                    className="pointer-events-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                />
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate text-sm font-medium">{employee.fullName}</span>
                                                    {employee.jobTitle && (
                                                        <span className="text-xs text-muted-foreground truncate">{employee.jobTitle}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </TabsContent>

                            <TabsContent value="groups" className="mt-0">
                                <CommandGroup>
                                    {departments.map((dept) => (
                                        <CommandItem
                                            key={dept.id}
                                            value={dept.name}
                                            onSelect={() => toggleSelection(dept.id)}
                                            className="min-h-[44px] aria-selected:bg-accent cursor-pointer"
                                        >
                                            <div className="flex items-center space-x-2 w-full">
                                                <Checkbox
                                                    checked={value.selectedIds.includes(dept.id)}
                                                    aria-label={`Select ${dept.name} department with ${departmentEmployeeCounts[dept.id]} employees`}
                                                    className="pointer-events-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                />
                                                <span className="text-sm font-medium truncate">
                                                    {dept.name} ({departmentEmployeeCounts[dept.id] || 0})
                                                </span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </TabsContent>

                        </CommandList>
                    </Command>
                </Tabs>
            </PopoverContent>
        </Popover>
    )
}
