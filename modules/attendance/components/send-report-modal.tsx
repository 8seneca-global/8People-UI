"use client"

import { useState } from "react"
import { format, subMonths, addDays } from "date-fns"
import { CalendarIcon, Send, Link, Check, ChevronsUpDown, X } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import type { Employee, OrganizationalUnit } from "@/lib/mock-data"
import { toast } from "sonner"

interface SendReportModalProps {
    isOpen: boolean
    onClose: () => void
    employees: Employee[]
    organizationalUnits: OrganizationalUnit[]
}

type DateMode = "month" | "range"
type RecipientMode = "all" | "unit" | "specific"

export function SendReportModal({
    isOpen,
    onClose,
    employees,
    organizationalUnits
}: SendReportModalProps) {
    // Stage 1: Date Selection
    const [dateMode, setDateMode] = useState<DateMode>("month")
    const [selectedMonth, setSelectedMonth] = useState<Date>(subMonths(new Date(), 1)) // Default last month
    const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: subMonths(new Date(), 1),
        to: new Date()
    })

    // Stage 2: Recipient Selection
    const [recipientMode, setRecipientMode] = useState<RecipientMode>("all")
    const [selectedUnitId, setSelectedUnitId] = useState<string>("")
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
    const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false)

    // Stage 3: Template
    const [subject, setSubject] = useState("Attendance Record for {{Month}}")
    const [message, setMessage] = useState("Dear {{Name}},\n\nPlease find attached your attendance record for {{Month}}.\n\nBest regards,\nHR Team")

    // Helpers
    const handleSend = () => {
        // Validation
        if (recipientMode === "unit" && !selectedUnitId) {
            toast.error("Please select an organizational unit")
            return
        }
        if (recipientMode === "specific" && selectedEmployeeIds.length === 0) {
            toast.error("Please select at least one employee")
            return
        }

        // Logic to simulate sending
        let count = 0
        if (recipientMode === "all") count = employees.length
        else if (recipientMode === "unit") {
            // Simplified logic: finding employees in that unit directly
            count = employees.filter(e => e.organizationalUnitId === selectedUnitId).length
        } else {
            count = selectedEmployeeIds.length
        }

        const dateStr = dateMode === "month"
            ? format(selectedMonth, "MMMM yyyy")
            : `${format(dateRange.from!, "dd/MM/yyyy")} - ${format(dateRange.to!, "dd/MM/yyyy")}`

        toast.success(`Successfully queued ${count} emails!`, {
            description: `Sending attendance records for ${dateStr}`
        })
        onClose()
    }

    const toggleEmployee = (id: string) => {
        if (selectedEmployeeIds.includes(id)) {
            setSelectedEmployeeIds(prev => prev.filter(e => e !== id))
        } else {
            setSelectedEmployeeIds(prev => [...prev, id])
        }
    }

    const selectedEmployeeNames = employees.filter(e => selectedEmployeeIds.includes(e.id))

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary" />
                        Send Attendance Records
                    </DialogTitle>
                    <DialogDescription>
                        Email attendance reports to employees for review.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* 1. Time Period */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">1. Time Period</Label>
                        <RadioGroup
                            value={dateMode}
                            onValueChange={(v) => setDateMode(v as DateMode)}
                            className="flex flex-col gap-3"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="month" id="r-month" />
                                <Label htmlFor="r-month" className="font-normal">Specific Month</Label>
                                {dateMode === "month" && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-[200px] justify-start text-left font-normal ml-2 h-8">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {format(selectedMonth, "MMMM yyyy")}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={selectedMonth}
                                                onSelect={(date) => date && setSelectedMonth(date)}
                                                initialFocus
                                            // Simplified implementation for month picking (just typical calendar)
                                            // Ideally would use a month-picker plugin or simplified view
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="range" id="r-range" />
                                <Label htmlFor="r-range" className="font-normal">Date Range</Label>
                                {dateMode === "range" && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-[240px] justify-start text-left font-normal ml-2 h-8">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateRange.from ? (
                                                    dateRange.to ? (
                                                        <>
                                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                                            {format(dateRange.to, "LLL dd, y")}
                                                        </>
                                                    ) : (
                                                        format(dateRange.from, "LLL dd, y")
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={dateRange.from}
                                                selected={dateRange}
                                                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="border-t" />

                    {/* 2. Recipients */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">2. Recipients</Label>
                        <RadioGroup
                            value={recipientMode}
                            onValueChange={(v) => setRecipientMode(v as RecipientMode)}
                            className="flex flex-col gap-3"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="rec-all" />
                                <Label htmlFor="rec-all" className="font-normal">
                                    All Active Employees
                                    <span className="ml-2 text-xs text-muted-foreground">({employees.length} recipients)</span>
                                </Label>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="unit" id="rec-unit" />
                                    <Label htmlFor="rec-unit" className="font-normal">Organizational Unit</Label>
                                </div>
                                {recipientMode === "unit" && (
                                    <div className="ml-6 w-[300px]">
                                        <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Division / Dept / Team" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Group by type roughly or just flat list */}
                                                {organizationalUnits.map(unit => (
                                                    <SelectItem key={unit.id} value={unit.id}>
                                                        {unit.name} ({unit.unitType})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="specific" id="rec-spec" />
                                    <Label htmlFor="rec-spec" className="font-normal">Specific Employees</Label>
                                </div>
                                {recipientMode === "specific" && (
                                    <div className="ml-6 space-y-2">
                                        <Popover open={employeeSearchOpen} onOpenChange={setEmployeeSearchOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={employeeSearchOpen}
                                                    className="w-[300px] justify-between"
                                                >
                                                    Select employees...
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search employee..." />
                                                    <CommandList>
                                                        <CommandEmpty>No employee found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {employees.map((employee) => (
                                                                <CommandItem
                                                                    key={employee.id}
                                                                    value={employee.fullName}
                                                                    onSelect={() => toggleEmployee(employee.id)}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            selectedEmployeeIds.includes(employee.id) ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {employee.fullName}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>

                                        {/* Selected Chips */}
                                        {selectedEmployeeNames.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {selectedEmployeeNames.map(emp => (
                                                    <Badge key={emp.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                                        {emp.fullName}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-4 w-4 ml-1 hover:bg-transparent"
                                                            onClick={() => toggleEmployee(emp.id)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="border-t" />

                    {/* 3. Email Template */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">3. Email Template</Label>
                        <div className="grid gap-3 p-4 border rounded-md bg-muted/20">
                            <div className="grid gap-2">
                                <Label htmlFor="subject" className="text-sm">Subject Line</Label>
                                <Input
                                    id="subject"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="message" className="text-sm">Message Body</Label>
                                <Textarea
                                    id="message"
                                    className="min-h-[120px]"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Supported variables: <code className="bg-muted px-1 rounded">{"{{Name}}"}</code>, <code className="bg-muted px-1 rounded">{"{{Month}}"}</code>, <code className="bg-muted px-1 rounded">{"{{Department}}"}</code>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSend} className="bg-primary text-primary-foreground">
                        <Send className="w-4 h-4 mr-2" />
                        Send Records
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
