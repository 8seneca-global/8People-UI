"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, CalendarDays, Repeat, Pencil, Trash2, Shield, Clock, Globe, CheckCircle2, Workflow, FileText, ChevronRight, ShieldCheck, AlertCircle, Info, Settings2, Calculator, Save } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import type { LeaveType, PublicHoliday, LeavePolicyRule } from "@/lib/mock-data"

const LEAVE_CATALOGUES = [
    "Annual Leave",
    "Sick Leave",
    "Maternity Leave",
    "Compensation Leave",
    "Unpaid Leave",
    "Other"
]

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
const MONTHS_OF_YEAR = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
]

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
    // UI State
    const [activeSection, setActiveSection] = useState<"types" | "policy">("types")
    const [activePolicyTab, setActivePolicyTab] = useState<"calculation" | "holidays" | "levels">("calculation")

    // Leave Policy Rule State
    const [createPolicyOpen, setCreatePolicyOpen] = useState(false)
    const [editPolicyOpen, setEditPolicyOpen] = useState(false)
    const [deletePolicyConfirmOpen, setDeletePolicyConfirmOpen] = useState(false)
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null)
    const [newPolicy, setNewPolicy] = useState<Omit<LeavePolicyRule, "id">>({
        name: "",
        description: "",
        jobLevels: [],
        annualLeaveDays: 14,
        maxCarryForwardDays: 5,
        carryForwardExpiryMonth: 3,
        carryForwardExpiryDay: 31,
        effectiveFrom: new Date().toISOString().split('T')[0],
        status: "active",
    })

    const {
        leaveTypes,
        addLeaveType,
        updateLeaveType,
        deleteLeaveType,
        publicHolidays,
        addPublicHoliday,
        updatePublicHoliday,
        deletePublicHoliday,
        leavePolicyRules,
        addLeavePolicyRule,
        updateLeavePolicyRule,
        deleteLeavePolicyRule,
        currentRole,
        jobClassifications,
    } = useStore()

    // Leave Type State
    const [createLeaveTypeOpen, setCreateLeaveTypeOpen] = useState(false)
    const [editLeaveTypeOpen, setEditLeaveTypeOpen] = useState(false)
    const [deleteLeaveTypeConfirmOpen, setDeleteLeaveTypeConfirmOpen] = useState(false)
    const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<string | null>(null)
    const [newLeaveType, setNewLeaveType] = useState<Omit<LeaveType, "id">>({
        code: "",
        name: "",
        description: "",
        catalogue: "",
        genderRequirement: "All",
        entitlementMethod: "By Actual Balance",
        manageBalanceType: "Year",
        isPaid: true,
        paidPercentage: 100,
        allowOnHoliday: false,
        allowOnDaysOff: false,
        allowByHour: true,
        checkBalanceOnAssign: true,
        color: "#3B82F6",
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
            const typeToDelete = leaveTypes.find(t => t.id === selectedLeaveTypeId)
            if (typeToDelete?.code === "AL") return // Protect Annual Leave

            deleteLeaveType(selectedLeaveTypeId)
            setDeleteLeaveTypeConfirmOpen(false)
        }
    }

    const openEditLeaveType = (id: string) => {
        const type = leaveTypes.find(t => t.id === id)
        if (type) {
            setSelectedLeaveTypeId(id)
            setNewLeaveType({
                code: type.code,
                name: type.name,
                description: type.description,
                catalogue: type.catalogue,
                genderRequirement: type.genderRequirement,
                entitlementMethod: type.entitlementMethod,
                manageBalanceType: type.manageBalanceType,
                isPaid: type.isPaid,
                paidPercentage: type.paidPercentage,
                allowOnHoliday: type.allowOnHoliday,
                allowOnDaysOff: type.allowOnDaysOff,
                allowByHour: type.allowByHour,
                checkBalanceOnAssign: type.checkBalanceOnAssign,
                color: type.color,
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

    const handleCreatePolicy = () => {
        if (newPolicy.name.trim()) {
            addLeavePolicyRule(newPolicy)
            setCreatePolicyOpen(false)
            setNewPolicy({
                name: "",
                description: "",
                jobLevels: [],
                annualLeaveDays: 14,
                maxCarryForwardDays: 5,
                carryForwardExpiryMonth: 3,
                carryForwardExpiryDay: 31,
                effectiveFrom: new Date().toISOString().split('T')[0],
                status: "active",
            })
        }
    }

    const handleEditPolicy = () => {
        if (selectedPolicyId && newPolicy.name.trim()) {
            updateLeavePolicyRule(selectedPolicyId, newPolicy)
            setEditPolicyOpen(false)
        }
    }

    const handleDeletePolicy = () => {
        if (selectedPolicyId) {
            deleteLeavePolicyRule(selectedPolicyId)
            setDeletePolicyConfirmOpen(false)
        }
    }

    const openEditPolicy = (policy: LeavePolicyRule) => {
        setSelectedPolicyId(policy.id)
        setNewPolicy({
            name: policy.name,
            description: policy.description,
            jobLevels: [...policy.jobLevels],
            annualLeaveDays: policy.annualLeaveDays,
            maxCarryForwardDays: policy.maxCarryForwardDays,
            carryForwardExpiryMonth: policy.carryForwardExpiryMonth,
            carryForwardExpiryDay: policy.carryForwardExpiryDay,
            effectiveFrom: policy.effectiveFrom,
            status: policy.status,
        })
        setEditPolicyOpen(true)
    }

    const togglePolicyJobLevel = (level: string) => {
        const current = [...newPolicy.jobLevels]
        if (current.includes(level)) {
            setNewPolicy({ ...newPolicy, jobLevels: current.filter(l => l !== level) })
        } else {
            setNewPolicy({ ...newPolicy, jobLevels: [...current, level] })
        }
    }

    const AVAILABLE_JOB_LEVELS = ["Executive", "Manager", "Lead", "Senior", "Mid-level", "Professional", "Junior", "Intern"]

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
            title="Leave Data Setup"
            subtitle="Centralized management for leave types and policies"
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
                            onClick={() => setActiveSection("policy")}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 border ${activeSection === "policy"
                                ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                                : "text-muted-foreground border-transparent hover:bg-muted/50 dark:hover:bg-zinc-800/50 hover:text-foreground"
                                }`}
                        >
                            <ShieldCheck className="h-4 w-4" />
                            <span className="font-semibold flex-1 text-left">Leave Policy</span>
                            <ChevronRight className={`h-3 w-3 opacity-30 transition-transform ${activeSection === "policy" ? "rotate-90" : ""}`} />
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
                        <div className="p-10 space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
                            <div className="flex items-end justify-between border-b border-border/50 pb-8">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter uppercase dark:text-zinc-100">Leave Types</h2>
                                    <p className="text-muted-foreground font-medium mt-2 text-sm">Define compensation and entitlement categories</p>
                                </div>
                                <Button onClick={() => {
                                    setNewLeaveType({
                                        code: "",
                                        name: "",
                                        description: "",
                                        catalogue: "",
                                        genderRequirement: "All",
                                        entitlementMethod: "By Actual Balance",
                                        manageBalanceType: "Year",
                                        isPaid: true,
                                        paidPercentage: 100,
                                        allowOnHoliday: false,
                                        allowOnDaysOff: false,
                                        allowByHour: true,
                                        checkBalanceOnAssign: true,
                                        color: "#3B82F6",
                                    })
                                    setCreateLeaveTypeOpen(true)
                                }} className="rounded-full px-8 h-12 shadow-2xl shadow-primary/20 font-bold tracking-tight">
                                    <Plus className="h-4 w-4 mr-2" /> New Category
                                </Button>
                            </div>

                            <div className="bg-card/30 dark:bg-zinc-900/40 backdrop-blur-md border border-border/40 rounded-3xl overflow-hidden shadow-2xl shadow-black/5">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-border/50">
                                            <TableHead className="w-[100px] uppercase text-[10px] font-black tracking-widest text-muted-foreground py-6 pl-8">Code</TableHead>
                                            <TableHead className="uppercase text-[10px] font-black tracking-widest text-muted-foreground py-6">Leave Type</TableHead>
                                            <TableHead className="uppercase text-[10px] font-black tracking-widest text-muted-foreground py-6 transition-colors">Leave Catalogue</TableHead>
                                            <TableHead className="uppercase text-[10px] font-black tracking-widest text-muted-foreground py-6">Gender</TableHead>
                                            <TableHead className="w-[100px] text-right pr-8 py-6"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {leaveTypes.map((type) => (
                                            <TableRow
                                                key={type.id}
                                                className="group hover:bg-muted/30 border-border/40 transition-colors cursor-pointer"
                                                onClick={() => openEditLeaveType(type.id)}
                                            >
                                                <TableCell className="font-mono font-bold text-primary py-5 pl-8">{type.code}</TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{type.name}</span>
                                                        <span className="text-[11px] text-muted-foreground font-medium line-clamp-1">{type.description}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 font-medium text-muted-foreground">{type.catalogue}</TableCell>
                                                <TableCell className="py-5">
                                                    {type.genderRequirement !== "All" && (
                                                        <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2 shadow-sm ${type.genderRequirement === "Female" ? "border-pink-500/30 text-pink-500 bg-pink-500/5" :
                                                            type.genderRequirement === "Male" ? "border-blue-500/30 text-blue-500 bg-blue-500/5" :
                                                                "border-zinc-500/30 text-muted-foreground bg-muted/20"
                                                            }`}>
                                                            {type.genderRequirement}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-5 text-right pr-8">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
                                                            <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                                                        </Button>
                                                        {type.code !== "AL" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setSelectedLeaveTypeId(type.id)
                                                                    setDeleteLeaveTypeConfirmOpen(true)
                                                                }}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
                            <div className="border-b border-border/50 pb-6">
                                <h2 className="text-4xl font-black tracking-tighter uppercase dark:text-zinc-100">Leave Policy</h2>
                                <p className="text-muted-foreground font-medium mt-2 text-sm">Configure entitlement calculation and holiday rules</p>
                            </div>

                            {/* Sub Tabs */}
                            <div className="flex bg-muted/20 dark:bg-zinc-900/40 p-1.5 rounded-2xl w-fit border border-border/40 backdrop-blur-md">
                                <button
                                    onClick={() => setActivePolicyTab("calculation")}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300 flex items-center gap-2 ${activePolicyTab === "calculation"
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`}
                                >
                                    <Calculator className="h-4 w-4" />
                                    ANNUAL LEAVE CALCULATION
                                </button>
                                <button
                                    onClick={() => setActivePolicyTab("holidays")}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300 flex items-center gap-2 ${activePolicyTab === "holidays"
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`}
                                >
                                    <Globe className="h-4 w-4" />
                                    PUBLIC HOLIDAYS
                                </button>
                                <button
                                    onClick={() => setActivePolicyTab("levels")}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all duration-300 flex items-center gap-2 ${activePolicyTab === "levels"
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`}
                                >
                                    <Shield className="h-4 w-4" />
                                    LEVEL POLICIES
                                </button>
                            </div>

                            <div className="min-h-[400px]">
                                {activePolicyTab === "calculation" ? (
                                    <div className="grid gap-10 animate-in slide-in-from-bottom-4 duration-500 pb-20">
                                        {/* Section 1: Annual Leave Calculation */}
                                        <div className="space-y-8 bg-card/40 dark:bg-zinc-900/40 p-10 rounded-[2.5rem] border border-border/40 shadow-2xl shadow-black/5">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="bg-primary/10 p-3 rounded-2xl">
                                                    <Calculator className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight uppercase dark:text-zinc-100">Annual Leave Calculation</h3>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Define core accrual rules</p>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-[1fr,2fr] gap-12 items-start mt-8">
                                                <div className="space-y-8">
                                                    <div className="space-y-3">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Entitlement (*)</Label>
                                                        <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-2xl border border-border/40 w-fit">
                                                            <Input type="number" defaultValue={14} className="w-24 h-12 rounded-xl font-black text-center border-none bg-transparent text-lg" />
                                                            <span className="text-xs font-black uppercase tracking-tight pr-4 text-muted-foreground">day(s)</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start Date for Calculating</Label>
                                                        <RadioGroup defaultValue="service" className="grid gap-3">
                                                            {[
                                                                { id: "service", label: "From Service Start Date" },
                                                                { id: "group", label: "From Group Service Start Date" },
                                                                { id: "probation", label: "After Training/Probation period" }
                                                            ].map((opt) => (
                                                                <div key={opt.id} className="flex items-center space-x-3 bg-card/50 p-3.5 rounded-2xl border border-border/40 hover:border-primary/30 transition-all cursor-pointer group">
                                                                    <RadioGroupItem value={opt.id} id={opt.id} className="border-border/60" />
                                                                    <Label htmlFor={opt.id} className="text-xs font-bold tracking-tight cursor-pointer group-hover:text-primary transition-colors">{opt.label}</Label>
                                                                </div>
                                                            ))}
                                                        </RadioGroup>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Available days calculated to</Label>
                                                    <RadioGroup defaultValue="eoy" className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { id: "eoy", label: "End of the Year" },
                                                            { id: "ets", label: "End of current Time-sheet Period" },
                                                            { id: "sys", label: "Current System Date" },
                                                            { id: "ecm", label: "End of current Calendar Month" },
                                                            { id: "pts", label: "End of previous Time-sheet Period", span: true }
                                                        ].map((opt) => (
                                                            <div key={opt.id} className={`flex items-center space-x-3 bg-card/50 p-3.5 rounded-2xl border border-border/40 hover:border-primary/30 transition-all cursor-pointer group ${opt.span ? 'col-span-2' : ''}`}>
                                                                <RadioGroupItem value={opt.id} id={opt.id} />
                                                                <Label htmlFor={opt.id} className="text-xs font-bold tracking-tight cursor-pointer group-hover:text-primary transition-colors">{opt.label}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            </div>

                                            <div className="pt-10 border-t border-border/40 space-y-6">
                                                <div className="flex items-center gap-10">
                                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Probation Calculated</Label>
                                                    <RadioGroup defaultValue="month" className="flex items-center gap-8">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="calendar" id="calendar" />
                                                            <Label htmlFor="calendar" className="text-xs font-black tracking-tight cursor-pointer">BY CALENDAR DAYS</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="month" id="month_prob" />
                                                            <Label htmlFor="month_prob" className="text-xs font-black tracking-tight cursor-pointer">BY MONTH</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>

                                                <div className="grid lg:grid-cols-2 gap-10">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between px-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Start Date for Calculating</span>
                                                            <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black hover:bg-primary/10 hover:text-primary transition-all rounded-full">RESET</Button>
                                                        </div>
                                                        <div className="rounded-2xl border border-primary/10 overflow-hidden bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
                                                            <Table>
                                                                <TableHeader className="bg-primary/5">
                                                                    <TableRow className="hover:bg-transparent border-primary/10">
                                                                        <TableHead className="h-10 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/70">Entitlement</TableHead>
                                                                        <TableHead className="h-10 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/70">{'>'}= Day of Start Date</TableHead>
                                                                        <TableHead className="h-10 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/70">{'<'}= Day of Start Date</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    <TableRow className="hover:bg-primary/5 border-primary/5 transition-colors">
                                                                        <TableCell className="py-2.5"><Input defaultValue="1" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="1" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="16" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                    </TableRow>
                                                                    <TableRow className="hover:bg-primary/5 border-none transition-colors">
                                                                        <TableCell className="py-2.5"><Input defaultValue="0.5" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="16" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="32" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between px-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Available Date for Calculating</span>
                                                            <Button variant="ghost" size="sm" className="h-6 text-[9px] font-black hover:bg-primary/10 hover:text-primary transition-all rounded-full">RESET</Button>
                                                        </div>
                                                        <div className="rounded-2xl border border-primary/10 overflow-hidden bg-card/40 backdrop-blur-xl shadow-lg ring-1 ring-white/5">
                                                            <Table>
                                                                <TableHeader className="bg-primary/5">
                                                                    <TableRow className="hover:bg-transparent border-primary/10">
                                                                        <TableHead className="h-10 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/70">Entitlemnt</TableHead>
                                                                        <TableHead className="h-10 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/70">{'>'}= Day of Start Date</TableHead>
                                                                        <TableHead className="h-10 text-[9px] font-black uppercase tracking-tighter text-muted-foreground/70">{'<'}= Day of Start Date</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    <TableRow className="hover:bg-primary/5 border-primary/5 transition-colors">
                                                                        <TableCell className="py-2.5"><Input defaultValue="0" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="0" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="0" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                    </TableRow>
                                                                    <TableRow className="hover:bg-primary/5 border-primary/5 transition-colors">
                                                                        <TableCell className="py-2.5"><Input defaultValue="0.5" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="1" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="16" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                    </TableRow>
                                                                    <TableRow className="hover:bg-primary/5 border-none transition-colors">
                                                                        <TableCell className="py-2.5"><Input defaultValue="1" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="16" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                        <TableCell className="py-2.5"><Input defaultValue="32" className="h-8 text-xs font-black w-full bg-white/5 border-white/10 text-center rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50" /></TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Seniority Calculation */}
                                        <div className="space-y-8 bg-card/40 dark:bg-zinc-900/40 p-10 rounded-[2.5rem] border border-border/40 shadow-2xl shadow-black/5">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="bg-amber-500/10 p-3 rounded-2xl ring-1 ring-amber-500/20">
                                                    <ShieldCheck className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight uppercase dark:text-zinc-100">Seniority Calculation</h3>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Additional leave based on tenure</p>
                                                </div>
                                            </div>

                                            <div className="max-w-4xl rounded-[2rem] border border-amber-500/10 overflow-hidden bg-card/40 backdrop-blur-xl shadow-xl ring-1 ring-white/5 mt-8">
                                                <Table>
                                                    <TableHeader className="bg-amber-500/5">
                                                        <TableRow className="hover:bg-transparent border-amber-500/10">
                                                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/3 text-center">Period From (Months)</TableHead>
                                                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground w-1/3 text-center">Period To (Months)</TableHead>
                                                            <TableHead className="h-12 text-[10px] font-black uppercase tracking-widest text-amber-600 w-1/3 text-center">Annual Leave (Days)</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {[
                                                            { from: 21, to: 24, days: 7 },
                                                            { from: 18, to: 21, days: 6 },
                                                            { from: 15, to: 18, days: 5 },
                                                            { from: 12, to: 15, days: 4 }
                                                        ].map((row, i) => (
                                                            <TableRow key={i} className="hover:bg-amber-500/5 border-amber-500/5 transition-colors group">
                                                                <TableCell className="py-5"><Input defaultValue={row.from} className="h-11 font-black text-center border-white/5 bg-white/5 text-lg rounded-xl group-hover:border-amber-500/30 transition-all font-mono" /></TableCell>
                                                                <TableCell className="py-5"><Input defaultValue={row.to} className="h-11 font-black text-center border-white/5 bg-white/5 text-lg rounded-xl group-hover:border-amber-500/30 transition-all font-mono" /></TableCell>
                                                                <TableCell className="py-5"><Input defaultValue={row.days} className="h-11 font-black text-center border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-500 text-lg rounded-xl shadow-inner group-hover:bg-amber-500/20 transition-all font-mono" /></TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>

                                        {/* Section 3: Rollover Policy */}
                                        <div className="space-y-8 bg-card/40 dark:bg-zinc-900/40 p-10 rounded-[2.5rem] border border-border/40 shadow-2xl shadow-black/5">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="bg-blue-500/10 p-3 rounded-2xl">
                                                    <Repeat className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight uppercase dark:text-zinc-100">Rollover Policy</h3>
                                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Manage year-end balance transfers</p>
                                                </div>
                                            </div>

                                            <div className="grid lg:grid-cols-[1fr,1.5fr] gap-16 mt-8">
                                                <div className="space-y-8">
                                                    <div className="space-y-3">
                                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Rollover Policy</Label>
                                                        <Select defaultValue="roll">
                                                            <SelectTrigger className="h-12 rounded-2xl font-black border-border/40 bg-muted/20">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="roll" className="font-bold">ROLL OVER</SelectItem>
                                                                <SelectItem value="none" className="font-bold">NO ROLLOVER</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 block">Expired Date (*)</Label>
                                                        <div className="flex gap-3">
                                                            <div className="flex-1">
                                                                <Select defaultValue="30">
                                                                    <SelectTrigger className="h-12 rounded-2xl font-black border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-primary/30 transition-all shadow-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                                                                        {DAYS_OF_MONTH.map(day => (
                                                                            <SelectItem key={day} value={day} className="font-bold py-3">{day}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="flex-1">
                                                                <Select defaultValue="JUN">
                                                                    <SelectTrigger className="h-12 rounded-2xl font-black border-border/40 bg-muted/20 hover:bg-muted/30 hover:border-primary/30 transition-all shadow-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                                                                        {MONTHS_OF_YEAR.map(month => (
                                                                            <SelectItem key={month} value={month} className="font-bold py-3">{month}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 mb-2 block">After (*)</Label>
                                                        <div className="flex items-center gap-3 bg-muted/20 hover:bg-muted/30 p-1 rounded-2xl border border-border/40 hover:border-primary/30 transition-all w-fit pr-4 shadow-sm group">
                                                            <Input type="number" defaultValue={1} className="w-20 h-10 rounded-xl font-black text-center border-none bg-transparent group-hover:text-primary transition-colors" />
                                                            <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">year(s)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-card/30 p-8 rounded-[2rem] border border-border/30 backdrop-blur-sm">
                                                    <RadioGroup defaultValue="fixed" className="space-y-10">
                                                        <div className="space-y-6">
                                                            <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-2xl border border-border/30 w-fit">
                                                                <RadioGroupItem value="fixed" id="fixed_roll" className="border-border/60" />
                                                                <Label htmlFor="fixed_roll" className="text-xs font-black uppercase tracking-widest cursor-pointer">Fixed Days</Label>
                                                            </div>
                                                            <div className="pl-6 space-y-5 animate-in slide-in-from-left-2 duration-300">
                                                                <div className="flex items-center justify-between gap-8 group">
                                                                    <Label className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Maximum days carried forward to next year</Label>
                                                                    <Input type="number" defaultValue={5} className="w-20 h-10 rounded-xl font-black text-center border-primary/30 bg-primary/5 text-primary" />
                                                                </div>
                                                                <div className="flex items-center justify-between gap-8 group">
                                                                    <Label className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Maximum paid Days</Label>
                                                                    <Input type="number" className="w-20 h-10 rounded-xl font-black text-center border-border/40 bg-muted/20" placeholder="0" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-6 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-300">
                                                            <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-2xl border border-border/30 w-fit">
                                                                <RadioGroupItem value="percentage" id="percentage_roll" />
                                                                <Label htmlFor="percentage_roll" className="text-xs font-black uppercase tracking-widest cursor-pointer">Percentage of remaining leave days</Label>
                                                            </div>
                                                            <div className="pl-6 space-y-5">
                                                                <div className="flex items-center justify-between gap-8">
                                                                    <Label className="text-xs font-bold text-muted-foreground">Percentage days carried forward to next year</Label>
                                                                    <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/40">
                                                                        <Input disabled className="w-16 h-8 rounded-lg text-center border-none bg-transparent" />
                                                                        <span className="text-[10px] font-black pr-2 text-muted-foreground">%</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between gap-8">
                                                                    <Label className="text-xs font-bold text-muted-foreground">Percentage of paid days</Label>
                                                                    <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl border border-border/40">
                                                                        <Input disabled className="w-16 h-8 rounded-lg text-center border-none bg-transparent" />
                                                                        <span className="text-[10px] font-black pr-2 text-muted-foreground">%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-10 border-t border-border/20">
                                            <Button className="rounded-2xl px-12 h-14 shadow-2xl shadow-primary/20 font-black tracking-widest text-xs gap-3 group transition-all hover:scale-[1.02] active:scale-95">
                                                <Save className="h-4 w-4 text-primary-foreground group-hover:rotate-12 transition-transform" />
                                                SAVE CALCULATION ENGINE
                                            </Button>
                                        </div>
                                    </div>
                                ) : activePolicyTab === "holidays" ? (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-black tracking-widest text-muted-foreground/60 uppercase">Registered Holidays</h3>
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
                                            }} size="sm" className="rounded-full h-8 px-4 font-bold text-[10px] tracking-tight">
                                                <Plus className="h-3.5 w-3.5 mr-1" /> ADD HOLIDAY
                                            </Button>
                                        </div>
                                        <div className="grid gap-3">
                                            {publicHolidays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((holiday) => (
                                                <Card key={holiday.id} className="bg-card/30 border-border/40 hover:border-primary/30 transition-all group overflow-hidden">
                                                    <div className="flex items-center p-4">
                                                        <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex flex-col items-center justify-center border border-amber-500/20 shrink-0">
                                                            <span className="text-[8px] font-black text-amber-600 uppercase">
                                                                {new Date(holiday.date).toLocaleString('default', { month: 'short' })}
                                                            </span>
                                                            <span className="text-sm font-black text-amber-700 dark:text-amber-500 leading-none">
                                                                {new Date(holiday.date).getDate()}
                                                            </span>
                                                        </div>
                                                        <div className="ml-5 flex-1">
                                                            <h4 className="font-bold text-sm tracking-tight">{holiday.name}</h4>
                                                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                                                                {new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                                                {holiday.isRecurring && (
                                                                    <span className="h-1 w-1 rounded-full bg-amber-500/40" />
                                                                )}
                                                                {holiday.isRecurring && "Recurring Year-over-Year"}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button onClick={() => openEditHoliday(holiday)} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button onClick={() => {
                                                                setSelectedHolidayId(holiday.id)
                                                                setDeleteHolidayConfirmOpen(true)
                                                            }} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive/60 hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-black tracking-widest text-muted-foreground/60 uppercase">Level-Based Entitlements</h3>
                                            <Button onClick={() => {
                                                setNewPolicy({
                                                    name: "",
                                                    description: "",
                                                    jobLevels: [],
                                                    annualLeaveDays: 14,
                                                    maxCarryForwardDays: 5,
                                                    carryForwardExpiryMonth: 3,
                                                    carryForwardExpiryDay: 31,
                                                    effectiveFrom: new Date().toISOString().split('T')[0],
                                                    status: "active",
                                                })
                                                setCreatePolicyOpen(true)
                                            }} size="sm" className="rounded-full h-8 px-4 font-bold text-[10px] tracking-tight">
                                                <Plus className="h-3.5 w-3.5 mr-1" /> CREATE POLICY
                                            </Button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {leavePolicyRules.map((policy) => (
                                                <Card key={policy.id} className="bg-card/40 border-border/40 hover:border-primary/30 transition-all group p-6 space-y-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{policy.name}</h4>
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{policy.description}</p>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button onClick={() => openEditPolicy(policy)} variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button onClick={() => {
                                                                setSelectedPolicyId(policy.id)
                                                                setDeletePolicyConfirmOpen(true)
                                                            }} variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive/60">
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                                        {policy.jobLevels.map(level => (
                                                            <Badge key={level} variant="outline" className="text-[9px] font-black tracking-widest uppercase bg-muted/50 border-border/60">
                                                                {level}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/40">
                                                        <div>
                                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Entitlement</p>
                                                            <p className="font-black text-xl text-primary">{policy.annualLeaveDays} <span className="text-[10px] font-medium text-muted-foreground">DAYS</span></p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Carry Over</p>
                                                            <p className="font-black text-xl">MAX {policy.maxCarryForwardDays} <span className="text-[10px] font-medium text-muted-foreground">DAYS</span></p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Dialogs */}
            <Dialog open={createLeaveTypeOpen} onOpenChange={setCreateLeaveTypeOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add Leave Type</DialogTitle>
                        <DialogDescription>Create a new leave category with master rules.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. AL"
                                    value={newLeaveType.code}
                                    onChange={(e) => setNewLeaveType({ ...newLeaveType, code: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Annual Leave"
                                    value={newLeaveType.name}
                                    onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="catalogue">Leave Catalogue</Label>
                                <Select
                                    value={newLeaveType.catalogue}
                                    onValueChange={(val) => setNewLeaveType({ ...newLeaveType, catalogue: val })}
                                >
                                    <SelectTrigger id="catalogue">
                                        <SelectValue placeholder="Select catalogue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEAVE_CATALOGUES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select
                                    value={newLeaveType.genderRequirement}
                                    onValueChange={(val: any) => setNewLeaveType({ ...newLeaveType, genderRequirement: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select requirement" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Genders</SelectItem>
                                        <SelectItem value="Male">Male Only</SelectItem>
                                        <SelectItem value="Female">Female Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="entitlement">Leave Entitlement</Label>
                                <Select
                                    value={newLeaveType.entitlementMethod}
                                    onValueChange={(val) => setNewLeaveType({ ...newLeaveType, entitlementMethod: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="By Actual Balance">By Actual Balance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="manage">Manage Balance</Label>
                                <Select
                                    value={newLeaveType.manageBalanceType}
                                    onValueChange={(val) => setNewLeaveType({ ...newLeaveType, manageBalanceType: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Year">Year</SelectItem>
                                        <SelectItem value="Days">Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-center border-t border-border/40 pt-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="isPaid"
                                    checked={newLeaveType.isPaid}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, isPaid: checked, paidPercentage: checked ? 100 : 0 })}
                                />
                                <Label htmlFor="isPaid" className="font-bold">Paid by Company</Label>
                            </div>
                            {newLeaveType.isPaid && (
                                <div className="flex items-center gap-3 animate-in slide-in-from-right-2">
                                    <Input
                                        type="number"
                                        className="w-20 font-bold"
                                        value={newLeaveType.paidPercentage}
                                        onChange={(e) => setNewLeaveType({ ...newLeaveType, paidPercentage: parseInt(e.target.value) || 0 })}
                                    />
                                    <span className="text-sm font-bold text-muted-foreground">%</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-muted/20 p-4 rounded-2xl border border-border/40">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="hols"
                                    checked={newLeaveType.allowOnHoliday}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, allowOnHoliday: checked })}
                                />
                                <Label htmlFor="hols" className="text-[11px] font-bold uppercase tracking-tight">Allow on Holiday</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="off"
                                    checked={newLeaveType.allowOnDaysOff}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, allowOnDaysOff: checked })}
                                />
                                <Label htmlFor="off" className="text-[11px] font-bold uppercase tracking-tight">Allow on Days Off</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="hour"
                                    checked={newLeaveType.allowByHour}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, allowByHour: checked })}
                                />
                                <Label htmlFor="hour" className="text-[11px] font-bold uppercase tracking-tight">Allow by Hour</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="check"
                                    checked={newLeaveType.checkBalanceOnAssign}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, checkBalanceOnAssign: checked })}
                                />
                                <Label htmlFor="check" className="text-[11px] font-bold uppercase tracking-tight">Check Balance</Label>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description (Internal Notes)</Label>
                            <Textarea
                                id="description"
                                placeholder="Purpose of this leave type..."
                                className="h-20"
                                value={newLeaveType.description}
                                onChange={(e) => setNewLeaveType({ ...newLeaveType, description: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>UI Color Identity</Label>
                            <div className="flex flex-wrap gap-2">
                                {leaveTypeColorOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`h-7 w-7 rounded-full border-2 transition-transform ${newLeaveType.color === opt.value ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-60 hover:opacity-100"}`}
                                        style={{ backgroundColor: opt.value }}
                                        onClick={() => setNewLeaveType({ ...newLeaveType, color: opt.value })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border/40 pt-4">
                        <Button variant="outline" onClick={() => setCreateLeaveTypeOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateLeaveType} className="px-8 font-bold">Create Type</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editLeaveTypeOpen} onOpenChange={setEditLeaveTypeOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Leave Type</DialogTitle>
                        <DialogDescription>Update master rules and metadata.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-code">Code</Label>
                                <Input
                                    id="edit-code"
                                    value={newLeaveType.code}
                                    onChange={(e) => setNewLeaveType({ ...newLeaveType, code: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                    id="edit-name"
                                    value={newLeaveType.name}
                                    onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-catalogue">Leave Catalogue</Label>
                                <Select
                                    value={newLeaveType.catalogue}
                                    onValueChange={(val) => setNewLeaveType({ ...newLeaveType, catalogue: val })}
                                >
                                    <SelectTrigger id="edit-catalogue">
                                        <SelectValue placeholder="Select catalogue" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEAVE_CATALOGUES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-gender">Gender</Label>
                                <Select
                                    value={newLeaveType.genderRequirement}
                                    onValueChange={(val: any) => setNewLeaveType({ ...newLeaveType, genderRequirement: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Genders</SelectItem>
                                        <SelectItem value="Male">Male Only</SelectItem>
                                        <SelectItem value="Female">Female Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-entitlement">Leave Entitlement</Label>
                                <Select
                                    value={newLeaveType.entitlementMethod}
                                    onValueChange={(val) => setNewLeaveType({ ...newLeaveType, entitlementMethod: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="By Actual Balance">By Actual Balance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-manage">Manage Balance</Label>
                                <Select
                                    value={newLeaveType.manageBalanceType}
                                    onValueChange={(val) => setNewLeaveType({ ...newLeaveType, manageBalanceType: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Year">Year</SelectItem>
                                        <SelectItem value="Days">Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-center border-t border-border/40 pt-4">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="edit-isPaid"
                                    checked={newLeaveType.isPaid}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, isPaid: checked, paidPercentage: checked ? 100 : 0 })}
                                />
                                <Label htmlFor="edit-isPaid" className="font-bold">Paid by Company</Label>
                            </div>
                            {newLeaveType.isPaid && (
                                <div className="flex items-center gap-3 animate-in slide-in-from-right-2">
                                    <Input
                                        type="number"
                                        className="w-20 font-bold"
                                        value={newLeaveType.paidPercentage}
                                        onChange={(e) => setNewLeaveType({ ...newLeaveType, paidPercentage: parseInt(e.target.value) || 0 })}
                                    />
                                    <span className="text-sm font-bold text-muted-foreground">%</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 bg-muted/20 p-4 rounded-2xl border border-border/40">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="edit-hols"
                                    checked={newLeaveType.allowOnHoliday}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, allowOnHoliday: checked })}
                                />
                                <Label htmlFor="edit-hols" className="text-[11px] font-bold uppercase tracking-tight">Allow on Holiday</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="edit-off"
                                    checked={newLeaveType.allowOnDaysOff}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, allowOnDaysOff: checked })}
                                />
                                <Label htmlFor="edit-off" className="text-[11px] font-bold uppercase tracking-tight">Allow on Days Off</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="edit-hour"
                                    checked={newLeaveType.allowByHour}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, allowByHour: checked })}
                                />
                                <Label htmlFor="edit-hour" className="text-[11px] font-bold uppercase tracking-tight">Allow by Hour</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="edit-check"
                                    checked={newLeaveType.checkBalanceOnAssign}
                                    onCheckedChange={(checked) => setNewLeaveType({ ...newLeaveType, checkBalanceOnAssign: checked })}
                                />
                                <Label htmlFor="edit-check" className="text-[11px] font-bold uppercase tracking-tight">Check Balance</Label>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                className="h-20"
                                value={newLeaveType.description}
                                onChange={(e) => setNewLeaveType({ ...newLeaveType, description: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>UI Color Identity</Label>
                            <div className="flex flex-wrap gap-2">
                                {leaveTypeColorOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={`h-7 w-7 rounded-full border-2 transition-transform ${newLeaveType.color === opt.value ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-60 hover:opacity-100"}`}
                                        style={{ backgroundColor: opt.value }}
                                        onClick={() => setNewLeaveType({ ...newLeaveType, color: opt.value })}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="border-t border-border/40 pt-4">
                        <Button variant="outline" onClick={() => setEditLeaveTypeOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditLeaveType} className="px-8 font-bold">Save Changes</Button>
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

            {/* Level Policy Dialogs */}
            <Dialog open={createPolicyOpen} onOpenChange={setCreatePolicyOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Level Policy</DialogTitle>
                        <DialogDescription>Define leave rules for specific job levels.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="policy-name">Policy Name</Label>
                            <Input
                                id="policy-name"
                                value={newPolicy.name}
                                onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                                placeholder="e.g. Executive Package"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Target Job Levels</Label>
                            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border/40 bg-muted/20">
                                {AVAILABLE_JOB_LEVELS.map((level) => (
                                    <Badge
                                        key={level}
                                        variant={newPolicy.jobLevels.includes(level) ? "default" : "outline"}
                                        className={`cursor-pointer transition-all ${newPolicy.jobLevels.includes(level) ? "shadow-md" : "opacity-60 hover:opacity-100"}`}
                                        onClick={() => togglePolicyJobLevel(level)}
                                    >
                                        {level}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="policy-days">Annual Days</Label>
                                <Input
                                    id="policy-days"
                                    type="number"
                                    value={newPolicy.annualLeaveDays}
                                    onChange={(e) => setNewPolicy({ ...newPolicy, annualLeaveDays: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="policy-carry">Max Carry Over</Label>
                                <Input
                                    id="policy-carry"
                                    type="number"
                                    value={newPolicy.maxCarryForwardDays}
                                    onChange={(e) => setNewPolicy({ ...newPolicy, maxCarryForwardDays: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreatePolicyOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreatePolicy}>Create Policy</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editPolicyOpen} onOpenChange={setEditPolicyOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Level Policy</DialogTitle>
                        <DialogDescription>Update rules for {newPolicy.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-policy-name">Policy Name</Label>
                            <Input
                                id="edit-policy-name"
                                value={newPolicy.name}
                                onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Target Job Levels</Label>
                            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-border/40 bg-muted/20">
                                {AVAILABLE_JOB_LEVELS.map((level) => (
                                    <Badge
                                        key={level}
                                        variant={newPolicy.jobLevels.includes(level) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => togglePolicyJobLevel(level)}
                                    >
                                        {level}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-policy-days">Annual Days</Label>
                                <Input
                                    id="edit-policy-days"
                                    type="number"
                                    value={newPolicy.annualLeaveDays}
                                    onChange={(e) => setNewPolicy({ ...newPolicy, annualLeaveDays: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-policy-carry">Max Carry Over</Label>
                                <Input
                                    id="edit-policy-carry"
                                    type="number"
                                    value={newPolicy.maxCarryForwardDays}
                                    onChange={(e) => setNewPolicy({ ...newPolicy, maxCarryForwardDays: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditPolicyOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditPolicy}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deletePolicyConfirmOpen} onOpenChange={setDeletePolicyConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Level Policy</DialogTitle>
                        <DialogDescription>Are you sure? Employees assigned to these levels will revert to default organization rules.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletePolicyConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeletePolicy}>Delete Policy</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </AdminLayout>
    )
}
