"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CalendarDays, Repeat, Pencil, Trash2, Shield, Clock, Globe, CheckCircle2, Workflow, FileText, ChevronRight } from "lucide-react"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { LeaveType, PublicHoliday } from "@/lib/mock-data"

const leaveTypeColorOptions = [
    { value: "#3B82F6", label: "Blue" },
    { value: "#10B981", label: "Green" },
    { value: "#F59E0B", label: "Amber" },
    { value: "#EF4444", label: "Red" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#EC4899", label: "Pink" },
    { value: "#06B6D4", label: "Cyan" },
    { value: "#F97316", label: "Orange" },
    { value: "#9CA3AF", label: "Gray" },
]

export default function LeaveConfigurePage() {
    const {
        leaveTypes,
        addLeaveType,
        updateLeaveType,
        deleteLeaveType,
        publicHolidays,
        addPublicHoliday,
        updatePublicHoliday,
        deletePublicHoliday,
        currentRole,
        jobClassifications,
    } = useStore()

    // UI State
    const [activeSection, setActiveSection] = useState<"types" | "holidays" | "status" | "flow">("types")

    // Leave Type State
    const [createLeaveTypeOpen, setCreateLeaveTypeOpen] = useState(false)
    const [editLeaveTypeOpen, setEditLeaveTypeOpen] = useState(false)
    const [deleteLeaveTypeConfirmOpen, setDeleteLeaveTypeConfirmOpen] = useState(false)
    const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<string | null>(null)
    const [newLeaveType, setNewLeaveType] = useState<Omit<LeaveType, "id">>({
        name: "",
        description: "",
        isPaid: true,
        defaultDays: 0,
        carryForward: false,
        maxCarryForwardDays: 0,
        color: "#3B82F6",
        applyFor: "everyone",
        totalDays: undefined,
    })

    // Public Holiday State
    const [createHolidayOpen, setCreateHolidayOpen] = useState(false)
    const [editHolidayOpen, setEditHolidayOpen] = useState(false)
    const [deleteHolidayConfirmOpen, setDeleteHolidayConfirmOpen] = useState(false)
    const [selectedHolidayId, setSelectedHolidayId] = useState<string | null>(null)
    const [newHoliday, setNewHoliday] = useState<Omit<PublicHoliday, "id">>({
        name: "",
        date: new Date().toISOString().split('T')[0],
        year: new Date().getFullYear(),
        description: "",
        isRecurring: true,
        status: "active",
    })

    // Selected items
    const selectedLeaveType = selectedLeaveTypeId ? leaveTypes.find((t) => t.id === selectedLeaveTypeId) : null
    const selectedHoliday = selectedHolidayId ? publicHolidays.find((h) => h.id === selectedHolidayId) : null

    // Handlers
    const handleCreateLeaveType = () => {
        if (newLeaveType.name.trim()) {
            addLeaveType(newLeaveType)
            setCreateLeaveTypeOpen(false)
        }
    }

    const handleEditLeaveType = () => {
        if (selectedLeaveTypeId && newLeaveType.name.trim()) {
            updateLeaveType(selectedLeaveTypeId, newLeaveType)
            setEditLeaveTypeOpen(false)
        }
    }

    const handleDeleteLeaveType = () => {
        if (selectedLeaveTypeId) {
            deleteLeaveType(selectedLeaveTypeId)
            setDeleteLeaveTypeConfirmOpen(false)
        }
    }

    const openEditLeaveType = (id: string) => {
        const type = leaveTypes.find(t => t.id === id)
        if (type) {
            setSelectedLeaveTypeId(id)
            setNewLeaveType({
                name: type.name,
                description: type.description,
                isPaid: type.isPaid,
                defaultDays: type.defaultDays,
                carryForward: type.carryForward,
                maxCarryForwardDays: type.maxCarryForwardDays,
                color: type.color,
                applyFor: type.applyFor || "everyone",
                totalDays: type.totalDays,
            })
            setEditLeaveTypeOpen(true)
        }
    }

    const handleCreateHoliday = () => {
        if (newHoliday.name.trim() && newHoliday.date) {
            const year = new Date(newHoliday.date).getFullYear()
            addPublicHoliday({ ...newHoliday, year })
            setCreateHolidayOpen(false)
        }
    }

    const openEditHoliday = (holiday: PublicHoliday) => {
        setSelectedHolidayId(holiday.id)
        setNewHoliday({
            name: holiday.name,
            date: holiday.date,
            year: holiday.year,
            description: holiday.description,
            isRecurring: holiday.isRecurring,
            status: holiday.status,
        })
        setEditHolidayOpen(true)
    }

    const handleEditHoliday = () => {
        if (selectedHolidayId && newHoliday.name.trim() && newHoliday.date) {
            const year = new Date(newHoliday.date).getFullYear()
            updatePublicHoliday(selectedHolidayId, { ...newHoliday, year })
            setEditHolidayOpen(false)
        }
    }

    const handleDeleteHoliday = () => {
        if (selectedHolidayId) {
            deletePublicHoliday(selectedHolidayId)
            setDeleteHolidayConfirmOpen(false)
        }
    }

    if (currentRole !== "admin" && currentRole !== "hr") {
        return (
            <AdminLayout title="Access Denied">
                <div className="flex h-[80vh] items-center justify-center">
                    <p className="text-muted-foreground">You do not have permission to access this page.</p>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="Leave Configuration"
            subtitle="Centralized management for leave rules and workflows"
        >
            <div className="flex h-full -m-6 bg-background/50 dark:bg-zinc-950/50">
                {/* Side Navigation */}
                <div className="w-64 border-r border-border bg-card/60 dark:bg-zinc-900/60 backdrop-blur-xl flex flex-col shrink-0">
                    <div className="p-4 border-b border-border bg-muted/30 dark:bg-zinc-800/20">
                        <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">Configuration</h3>
                    </div>
                    <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                        <button
                            onClick={() => setActiveSection("types")}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 border ${activeSection === "types"
                                ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                                : "text-muted-foreground border-transparent hover:bg-muted/50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                }`}
                        >
                            <CalendarDays className="h-4 w-4" />
                            <span className="font-semibold flex-1 text-left">Leave Types</span>
                            <ChevronRight className={`h-3 w-3 opacity-30 transition-transform ${activeSection === "types" ? "rotate-90" : ""}`} />
                        </button>

                        <button
                            onClick={() => setActiveSection("holidays")}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 border ${activeSection === "holidays"
                                ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                                : "text-muted-foreground border-transparent hover:bg-muted/50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                }`}
                        >
                            <Globe className="h-4 w-4" />
                            <span className="font-semibold flex-1 text-left">Public Holidays</span>
                            <ChevronRight className={`h-3 w-3 opacity-30 transition-transform ${activeSection === "holidays" ? "rotate-90" : ""}`} />
                        </button>

                        <button
                            onClick={() => setActiveSection("status")}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 border ${activeSection === "status"
                                ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                                : "text-muted-foreground border-transparent hover:bg-muted/50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                }`}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="font-semibold flex-1 text-left">Request Status</span>
                            <ChevronRight className={`h-3 w-3 opacity-30 transition-transform ${activeSection === "status" ? "rotate-90" : ""}`} />
                        </button>

                        <button
                            onClick={() => setActiveSection("flow")}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 border ${activeSection === "flow"
                                ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                                : "text-muted-foreground border-transparent hover:bg-muted/50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                }`}
                        >
                            <Workflow className="h-4 w-4" />
                            <span className="font-semibold flex-1 text-left">Report Flow</span>
                            <ChevronRight className={`h-3 w-3 opacity-30 transition-transform ${activeSection === "flow" ? "rotate-90" : ""}`} />
                        </button>
                    </div>
                    <div className="p-4 border-t border-border bg-muted/10 dark:bg-zinc-900/40 text-[9px] text-muted-foreground/60 uppercase font-black tracking-widest flex items-center gap-2">
                        <Clock className="h-3 w-3 opacity-40" />
                        <span>Cloud Synced</span>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-background/5 dark:bg-zinc-950/50 overflow-y-auto custom-scrollbar">
                    {activeSection === "types" ? (
                        <div className="p-10 space-y-10 animate-in fade-in duration-700 max-w-4xl mx-auto pb-20">
                            <div className="flex items-end justify-between border-b border-border/50 pb-8">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter uppercase dark:text-zinc-100">Leave Types</h2>
                                    <p className="text-muted-foreground font-medium mt-2 text-sm">Define compensation and entitlement categories</p>
                                </div>
                                <Button onClick={() => {
                                    setNewLeaveType({
                                        name: "",
                                        description: "",
                                        isPaid: true,
                                        defaultDays: 0,
                                        carryForward: false,
                                        maxCarryForwardDays: 0,
                                        color: "#3B82F6",
                                        applyFor: "everyone",
                                        totalDays: undefined,
                                    })
                                    setCreateLeaveTypeOpen(true)
                                }} className="rounded-full px-8 h-12 shadow-2xl shadow-primary/20 font-bold tracking-tight">
                                    <Plus className="h-4 w-4 mr-2" /> New Category
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {leaveTypes.map((type) => (
                                    <Card
                                        key={type.id}
                                        className="group cursor-pointer hover:border-primary/40 transition-all duration-300 shadow-xl shadow-black/5 bg-card/30 dark:bg-zinc-900/40 backdrop-blur-md border border-border/40 overflow-hidden"
                                        onClick={() => openEditLeaveType(type.id)}
                                    >
                                        <div className="flex items-stretch h-24">
                                            <div className="w-1.5 transition-all group-hover:w-2" style={{ backgroundColor: type.color }} />
                                            <div className="flex-1 px-6 flex items-center">
                                                <div className="flex-1 flex items-center justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ backgroundColor: `${type.color}15` }}>
                                                            <CalendarDays className="h-6 w-6" style={{ color: type.color }} />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl font-bold tracking-tight dark:text-zinc-100 group-hover:text-primary transition-colors">{type.name}</CardTitle>
                                                            <p className="text-sm text-muted-foreground/70 mt-0.5 line-clamp-1 font-medium">
                                                                {type.description || "System default leave category."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <Badge variant={type.isPaid ? "default" : "secondary"} className={`text-[10px] px-3 py-1 uppercase font-black tracking-widest ${type.isPaid ? "bg-primary/20 text-primary border-primary/20" : "bg-zinc-500/10 dark:bg-zinc-800/50"}`}>
                                                            {type.isPaid ? "Paid" : "Unpaid"}
                                                        </Badge>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10">
                                                                <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 rounded-full text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setSelectedLeaveTypeId(type.id)
                                                                    setDeleteLeaveTypeConfirmOpen(true)
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                    ) : activeSection === "holidays" ? (
                        <div className="p-10 space-y-10 animate-in fade-in duration-700 max-w-4xl mx-auto pb-20">
                            <div className="flex items-end justify-between border-b border-border/50 pb-8">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter uppercase dark:text-zinc-100">Public Holidays</h2>
                                    <p className="text-muted-foreground font-medium mt-2 text-sm">System-wide non-working days for the current year</p>
                                </div>
                                <Button onClick={() => {
                                    setNewHoliday({
                                        name: "",
                                        date: new Date().toISOString().split('T')[0],
                                        year: new Date().getFullYear(),
                                        description: "",
                                        isRecurring: true,
                                        status: "active",
                                    })
                                    setCreateHolidayOpen(true)
                                }} className="rounded-full px-8 h-12 shadow-2xl shadow-primary/20 font-bold tracking-tight">
                                    <Plus className="h-4 w-4 mr-2" /> New Holiday
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {publicHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((holiday) => (
                                    <Card
                                        key={holiday.id}
                                        className="group cursor-pointer hover:border-primary/40 transition-all duration-300 shadow-xl shadow-black/5 bg-card/30 dark:bg-zinc-900/40 backdrop-blur-md border border-border/40 overflow-hidden"
                                        onClick={() => openEditHoliday(holiday)}
                                    >
                                        <div className="flex items-stretch h-24">
                                            <div className="w-1.5 transition-all group-hover:w-2 bg-amber-500/50" />
                                            <div className="flex-1 px-8 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex flex-col items-center justify-center border border-amber-500/20">
                                                        <span className="text-[10px] font-black text-amber-600 uppercase">
                                                            {new Date(holiday.date).toLocaleString('default', { month: 'short' })}
                                                        </span>
                                                        <span className="text-lg font-black text-amber-700 dark:text-amber-500 leading-none">
                                                            {new Date(holiday.date).getDate()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold tracking-tight dark:text-zinc-100 group-hover:text-primary transition-colors">{holiday.name}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-sm text-muted-foreground font-medium">{new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric' })}</p>
                                                            {holiday.isRecurring && (
                                                                <Badge variant="outline" className="text-[8px] h-4 uppercase font-black tracking-tighter border-amber-500/20 text-amber-500/60">Recurring</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <Badge className="bg-amber-500 text-white font-black text-[10px] uppercase px-3 py-1">PH</Badge>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10">
                                                            <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-full text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setSelectedHolidayId(holiday.id)
                                                                setDeleteHolidayConfirmOpen(true)
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : activeSection === "status" ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500 bg-dot-pattern dark:opacity-80">
                            <div className="p-14 rounded-[3rem] bg-muted/20 dark:bg-zinc-900/40 border border-border/50 text-muted-foreground/20 mb-10 shadow-inner">
                                <CheckCircle2 className="h-24 w-24" />
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter uppercase dark:text-zinc-200">Request States</h3>
                            <p className="text-muted-foreground max-w-sm mt-4 text-sm font-medium leading-relaxed">
                                Blueprint required. Define custom status codes and outcome triggers for approval pipelines.
                            </p>
                            <Button className="mt-12 rounded-full px-10 h-12 text-[10px] font-black tracking-widest border-2 border-dashed border-primary/20 text-primary hover:bg-primary/5" variant="ghost">CONFIGURE ENGINE</Button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-500 bg-dot-pattern dark:opacity-80">
                            <div className="p-14 rounded-[3rem] bg-primary/5 dark:bg-primary/5 border border-primary/10 text-primary/30 mb-10 shadow-inner">
                                <Workflow className="h-24 w-24" />
                            </div>
                            <h3 className="text-4xl font-black tracking-tighter uppercase dark:text-zinc-200">Approval Flow</h3>
                            <p className="text-muted-foreground max-w-sm mt-4 text-sm font-medium leading-relaxed">
                                Sequence architect. Design multi-level authorities and conditional routing for leave requests.
                            </p>
                            <Button className="mt-12 rounded-full px-12 h-14 bg-primary text-primary-foreground font-black text-[10px] tracking-widest shadow-2xl shadow-primary/20" variant="default">
                                OPEN DESIGNER
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={createLeaveTypeOpen} onOpenChange={setCreateLeaveTypeOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Leave Type</DialogTitle>
                        <DialogDescription>Create a new leave category.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newLeaveType.name}
                                onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={newLeaveType.description}
                                onChange={(e) => setNewLeaveType({ ...newLeaveType, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="applyFor">Apply For</Label>
                            <Select
                                value={newLeaveType.applyFor}
                                onValueChange={(val) => setNewLeaveType({ ...newLeaveType, applyFor: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select who this applies to" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="everyone">Everyone</SelectItem>
                                    <SelectItem value="management">Management only</SelectItem>
                                    <SelectItem value="probation">Probation only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="isPaid"
                                checked={newLeaveType.isPaid}
                                onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, isPaid: checked })}
                            />
                            <Label htmlFor="isPaid">Paid Leave</Label>
                        </div>
                        {newLeaveType.isPaid && (
                            <div className="grid gap-2 animate-in slide-in-from-top-2">
                                <Label htmlFor="totalDays">Total Paid Days (Optional)</Label>
                                <Input
                                    id="totalDays"
                                    type="number"
                                    placeholder="e.g. 12"
                                    value={newLeaveType.totalDays || ""}
                                    onChange={(e) => setNewLeaveType({
                                        ...newLeaveType,
                                        totalDays: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    If defined, this fixed amount will apply to all selected employees.
                                </p>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label>Color Identity</Label>
                            <div className="flex flex-wrap gap-2">
                                {leaveTypeColorOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`h-8 w-8 rounded-full border-2 transition-transform ${newLeaveType.color === opt.value ? "border-primary scale-110" : "border-transparent"}`}
                                        style={{ backgroundColor: opt.value }}
                                        onClick={() => setNewLeaveType({ ...newLeaveType, color: opt.value })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateLeaveTypeOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateLeaveType}>Create Type</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editLeaveTypeOpen} onOpenChange={setEditLeaveTypeOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Leave Type</DialogTitle>
                        <DialogDescription>Update configuration.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={newLeaveType.name}
                                onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={newLeaveType.description}
                                onChange={(e) => setNewLeaveType({ ...newLeaveType, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-applyFor">Apply For</Label>
                            <Select
                                value={newLeaveType.applyFor}
                                onValueChange={(val) => setNewLeaveType({ ...newLeaveType, applyFor: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select who this applies to" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="everyone">Everyone</SelectItem>
                                    <SelectItem value="management">Management only</SelectItem>
                                    <SelectItem value="probation">Probation only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="edit-isPaid"
                                checked={newLeaveType.isPaid}
                                onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, isPaid: checked })}
                            />
                            <Label htmlFor="edit-isPaid">Paid Leave</Label>
                        </div>
                        {newLeaveType.isPaid && (
                            <div className="grid gap-2 animate-in slide-in-from-top-2">
                                <Label htmlFor="edit-totalDays">Total Paid Days (Optional)</Label>
                                <Input
                                    id="edit-totalDays"
                                    type="number"
                                    placeholder="e.g. 12"
                                    value={newLeaveType.totalDays || ""}
                                    onChange={(e) => setNewLeaveType({
                                        ...newLeaveType,
                                        totalDays: e.target.value ? parseInt(e.target.value) : undefined
                                    })}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    If defined, this fixed amount cannot be modified in employee records.
                                </p>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label>Color Identity</Label>
                            <div className="flex flex-wrap gap-2">
                                {leaveTypeColorOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`h-8 w-8 rounded-full border-2 transition-transform ${newLeaveType.color === opt.value ? "border-primary scale-110" : "border-transparent"}`}
                                        style={{ backgroundColor: opt.value }}
                                        onClick={() => setNewLeaveType({ ...newLeaveType, color: opt.value })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditLeaveTypeOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditLeaveType}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteLeaveTypeConfirmOpen} onOpenChange={setDeleteLeaveTypeConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Leave Type</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this leave type?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteLeaveTypeConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteLeaveType}>Delete Type</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* Public Holiday Dialogs */}
            <Dialog open={createHolidayOpen} onOpenChange={setCreateHolidayOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Public Holiday</DialogTitle>
                        <DialogDescription>Define a new non-working day.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="holiday-name">Holiday Name</Label>
                            <Input
                                id="holiday-name"
                                value={newHoliday.name}
                                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                placeholder="e.g. New Year's Day"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="holiday-date">Date</Label>
                            <Input
                                id="holiday-date"
                                type="date"
                                value={newHoliday.date}
                                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="isRecurring"
                                checked={newHoliday.isRecurring}
                                onCheckedChange={(checked) => setNewHoliday({ ...newHoliday, isRecurring: checked })}
                            />
                            <Label htmlFor="isRecurring">Recurring every year</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateHolidayOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateHoliday}>Create Holiday</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editHolidayOpen} onOpenChange={setEditHolidayOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Public Holiday</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-holiday-name">Holiday Name</Label>
                            <Input
                                id="edit-holiday-name"
                                value={newHoliday.name}
                                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-holiday-date">Date</Label>
                            <Input
                                id="edit-holiday-date"
                                type="date"
                                value={newHoliday.date}
                                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="edit-isRecurring"
                                checked={newHoliday.isRecurring}
                                onCheckedChange={(checked) => setNewHoliday({ ...newHoliday, isRecurring: checked })}
                            />
                            <Label htmlFor="edit-isRecurring">Recurring every year</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditHolidayOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditHoliday}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteHolidayConfirmOpen} onOpenChange={setDeleteHolidayConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Holiday</DialogTitle>
                        <DialogDescription>Are you sure you want to remove this public holiday?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteHolidayConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteHoliday}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AdminLayout>
    )
}
