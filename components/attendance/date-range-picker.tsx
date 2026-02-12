"use client"

import * as React from "react"
import { addDays, format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays } from "date-fns"
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps {
    dateRange: DateRange | undefined
    onChange: (range: DateRange | undefined) => void
    align?: "center" | "start" | "end"
}

export function DateRangePicker({
    dateRange,
    onChange,
    align = "start",
}: DateRangePickerProps) {
    const [preset, setPreset] = React.useState<string>("custom")
    const [localRange, setLocalRange] = React.useState<DateRange | undefined>(dateRange)
    const [isOpen, setIsOpen] = React.useState(false)

    // Sync prop changes to local state
    React.useEffect(() => {
        setLocalRange(dateRange)
    }, [dateRange])

    const handlePresetChange = (value: string) => {
        setPreset(value)
        const today = new Date()

        switch (value) {
            case "this_week":
                onChange({ from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) })
                setIsOpen(false)
                break
            case "last_week":
                const lastWeek = subDays(today, 7)
                onChange({ from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) })
                setIsOpen(false)
                break
            case "this_month":
                onChange({ from: startOfMonth(today), to: endOfMonth(today) })
                setIsOpen(false)
                break
            case "last_month":
                const lastMonth = subDays(startOfMonth(today), 1)
                onChange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) })
                setIsOpen(false)
                break
            case "custom":
                // Keep current selection but allow editing
                break
        }
    }

    const handleSelect = (range: DateRange | undefined) => {
        setLocalRange(range)
        if (range?.from && range?.to) {
            const diff = differenceInDays(range.to, range.from)
            // Constraint: Must be at least 7 days (6 days difference + 1)
            if (diff >= 6) {
                onChange(range)
                setPreset("custom")
                // Don't close immediately to allow viewing the selection
            }
        }
    }

    return (
        <div className={cn("grid gap-2")}>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[260px] justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
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
                        <div className="ml-auto border-l pl-2 h-full flex items-center">
                            <ChevronRight className="h-4 w-4 opacity-50 rotate-90" />
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align={align}>
                    <div className="flex flex-col">
                        <div className="p-3 border-b">
                            <Select value={preset} onValueChange={handlePresetChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select preset" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="last_week">Last Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="last_month">Last Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="p-3">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={localRange?.from}
                                selected={localRange}
                                onSelect={handleSelect}
                                numberOfMonths={2}
                            />
                            <div className="mt-2 text-xs text-muted-foreground text-center">
                                * Minimum selection: 7 days
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
