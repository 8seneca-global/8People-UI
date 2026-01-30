"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useStore } from "@/lib/store"
import { Pencil, Save, X, Users, Upload, FileText, Download, Calendar, HelpCircle, Info, Plus, Trash2 } from "lucide-react"
import type { Employee, EmployeeDependent, EmployeeContract, OrganizationalUnit } from "@/lib/mock-data"
import { contractTypeOptions } from "@/lib/mock-data"

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"]
const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"]
const relationshipOptions = ["Spouse", "Child", "Parent", "Sibling", "Other"]

function calculateSeniority(date: string | undefined): string {
    if (!date) return "—"

    const startDate = new Date(date)
    const today = new Date()

    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "Not started"

    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    const days = diffDays % 30

    if (years > 0) {
        return months > 0 ? `${years}y ${months}m` : `${years}y`
    } else if (months > 0) {
        return days > 0 ? `${months}m ${days}d` : `${months}m`
    } else {
        return `${days}d`
    }
}

function formatDate(date: string | undefined): string {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function getInitials(name: string): string {
    const parts = name.split(" ")
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
}

export default function EmployeeDetailPage() {
    const router = useRouter()
    const params = useParams()
    const employeeId = params.id as string

    // Added positions to destructured store
    const { employees, organizationalUnits, positions, updateEmployee, deleteEmployee } = useStore()
    const employee = employees.find((e) => e.id === employeeId)

    const [activeTab, setActiveTab] = useState("personal")
    const [formData, setFormData] = useState<Partial<Employee>>({})

    // Separate edit states for each section
    const [isEditingWorkInfo, setIsEditingWorkInfo] = useState(false)
    const [isEditingPersonal, setIsEditingPersonal] = useState(false)


    // Position change confirmation state
    const [showPositionConfirm, setShowPositionConfirm] = useState(false)
    const [pendingPositionId, setPendingPositionId] = useState<string | null>(null)



    // Contract management
    // Contract management
    const [editingContractId, setEditingContractId] = useState<string | null>(null)
    const [draftContract, setDraftContract] = useState<EmployeeContract | null>(null)
    const [contractError, setContractError] = useState<string | null>(null)
    const [contractToDelete, setContractToDelete] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const validateActiveContract = (status: string, excludeId?: string) => {
        if (status !== 'active') {
            setContractError(null)
            return true
        }

        const hasActive = formData.contracts?.some(c =>
            c.status === 'active' && c.id !== excludeId
        )

        if (hasActive) {
            setContractError("Only one contract can be active at a time.")
            return false
        }

        setContractError(null)
        return true
    }

    const handleEditContractClick = (contract: EmployeeContract) => {
        setEditingContractId(contract.id)
        setDraftContract({ ...contract })
        setContractError(null)
        setShowAddContract(false)
    }

    const handleCancelContractEdit = () => {
        setEditingContractId(null)
        setDraftContract(null)
        setContractError(null)
    }

    const handleSaveContractEdit = () => {
        if (formData.id && draftContract) {
            if (!validateActiveContract(draftContract.status || 'active', draftContract.id)) {
                return
            }
            const updatedContracts = formData.contracts?.map((c) =>
                c.id === draftContract.id ? (draftContract) : c
            ) || []

            const updatedFormData = { ...formData, contracts: updatedContracts }
            setFormData(updatedFormData)
            updateEmployee(formData.id, updatedFormData)

            setEditingContractId(null)
            setDraftContract(null)
        }
    }

    const confirmDeleteContract = (contractId: string) => {
        setContractToDelete(contractId)
    }

    const handleDeleteContract = () => {
        if (contractToDelete && formData.id) {
            const updatedContracts = formData.contracts?.filter(c => c.id !== contractToDelete) || []
            const updatedFormData = { ...formData, contracts: updatedContracts }

            setFormData(updatedFormData)
            updateEmployee(formData.id, updatedFormData)
            setContractToDelete(null)
        }
    }
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // In a real app, you would upload to a server here.
        // For this mock, we'll create a fake URL.
        const mockFileUrl = URL.createObjectURL(file)
        const mockFileName = file.name

        if (editingContractId && draftContract) {
            // Updating draft contract
            setDraftContract({
                ...draftContract,
                fileName: mockFileName,
                fileUrl: mockFileUrl
            })
        } else if (showAddContract) {
            // Updating new contract form
            setNewContract((prev) => ({
                ...prev,
                fileName: mockFileName,
                fileUrl: mockFileUrl,
            }))
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ""
    }
    const [showAddContract, setShowAddContract] = useState(false)
    const [newContract, setNewContract] = useState<Omit<EmployeeContract, "id" | "signDate">>({
        contractNumber: "",
        contractType: "",
        startDate: "",
        endDate: "",
        status: "active",
    })

    useEffect(() => {
        if (employee) {
            setFormData(employee)
        }
    }, [employee])

    if (!employee) {
        return (
            <AdminLayout title="Employee Not Found" subtitle="">
                <div className="flex flex-col items-center justify-center h-64">
                    <p className="text-muted-foreground mb-4">Employee not found</p>
                    <Button onClick={() => router.push("/employees")}>Back to Employees</Button>
                </div>
            </AdminLayout>
        )
    }

    const handleFieldChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleNestedFieldChange = (parentField: string, nestedField: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [parentField]: {
                ...(prev[parentField as keyof Employee] as any || {}),
                [nestedField]: value
            }
        }))
    }

    const handleWorkInfoSaveClick = () => {
        // Check if position has changed
        if (formData.positionId && formData.positionId !== employee?.positionId) {
            setShowPositionConfirm(true)
        } else {
            handleSaveWorkInfo()
        }
    }

    const handleSaveWorkInfo = () => {
        if (formData.id) {
            // Update position title if position ID changed
            const updatedData = { ...formData }
            if (formData.positionId && formData.positionId !== employee?.positionId) {
                const newPosition = positions.find(p => p.id === formData.positionId)
                if (newPosition) {
                    updatedData.positionTitle = newPosition.title
                    // Here you might also trigger backend logic to update reporting lines
                }
            }

            updateEmployee(formData.id, updatedData)
            setIsEditingWorkInfo(false)
            setShowPositionConfirm(false)
        }
    }

    const handleCancelWorkInfo = () => {
        setFormData(employee)
        setIsEditingWorkInfo(false)
        setShowPositionConfirm(false)
    }

    const handleSavePersonal = () => {
        if (formData.id) {
            updateEmployee(formData.id, formData)
            setIsEditingPersonal(false)
        }
    }

    const handleCancelPersonal = () => {
        setFormData(employee)
        setIsEditingPersonal(false)
    }





    const handleOpenAddContract = () => {
        const hasActive = formData.contracts?.some(c => c.status === 'active')
        setNewContract(prev => ({
            ...prev,
            status: hasActive ? 'terminated' : 'active'
        }))
        setContractError(null)
        setEditingContractId(null)
        setDraftContract(null)
        setShowAddContract(true)
    }

    const handleAddContract = () => {
        if (!validateActiveContract(newContract.status || 'active')) {
            return
        }

        const contract: EmployeeContract = {
            ...newContract,
            id: `CON-${Date.now()}`,
        }
        setFormData((prev) => ({
            ...prev,
            contracts: [...(prev.contracts || []), contract],
        }))
        setNewContract({
            contractNumber: "",
            contractType: "",
            startDate: "",
            endDate: "",
            status: "active",
        })
        setShowAddContract(false)
        setContractError(null)
    }

    const handleDeleteEmployee = () => {
        if (employee?.id) {
            deleteEmployee(employee.id)
            router.push('/employees')
        }
    }

    // Get organizational hierarchy
    const getOrgHierarchy = () => {
        const orgUnit = organizationalUnits.find((u) => u.id === formData.organizationalUnitId)
        if (!orgUnit) return { division: null, department: null, team: null }

        let division: OrganizationalUnit | null = null
        let department: OrganizationalUnit | null = null
        let team: OrganizationalUnit | null = null

        if (orgUnit.unitType === "division") {
            division = orgUnit
        } else if (orgUnit.unitType === "department") {
            department = orgUnit
            division = organizationalUnits.find((u) => u.id === orgUnit.parentId && u.unitType === "division") || null
        } else if (orgUnit.unitType === "team") {
            team = orgUnit
            department = organizationalUnits.find((u) => u.id === orgUnit.parentId && u.unitType === "department") || null
            if (department) {
                division = organizationalUnits.find((u) => u.id === department!.parentId && u.unitType === "division") || null
            }
        }

        return { division, department, team }
    }

    const hierarchy = getOrgHierarchy()

    // Breadcrumb component
    const breadcrumbNav = (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/employees" className="cursor-pointer hover:text-foreground transition-colors">
                        Employees
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">{employee.fullName}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    )

    return (
        <TooltipProvider>
            <AdminLayout title="" subtitle="" breadcrumb={breadcrumbNav}>
                <div className="space-y-6">
                    {/* Position Change Confirmation Modal */}
                    <Dialog open={showPositionConfirm} onOpenChange={setShowPositionConfirm}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Position Change</DialogTitle>
                                <DialogDescription>
                                    Changing the employee's position may affect reporting lines, team structure, and access permissions.
                                    Are you sure you want to proceed with this change?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowPositionConfirm(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveWorkInfo}>
                                    Confirm Change
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Contract Confirmation Modal */}
                    <Dialog open={!!contractToDelete} onOpenChange={(open) => !open && setContractToDelete(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Contract</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this contract? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setContractToDelete(null)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteContract}>
                                    Delete
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Employee Confirmation Modal */}
                    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Employee</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete {employee.fullName}? This action cannot be undone and will remove all employee data including contracts, transactions, and personal information.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteEmployee}>
                                    Delete Employee
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Two-Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
                        {/* Left Column - Work Information Card */}
                        <Card className="h-fit sticky top-6">
                            <CardContent className="p-6 space-y-6">
                                {/* Card Header Actions - Moved to top */}
                                <div className="flex justify-end mb-2">
                                    {!isEditingWorkInfo ? (
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setIsEditingWorkInfo(true)} className="h-8 w-8 p-0">
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit Work Info</span>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete Employee</span>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handleCancelWorkInfo} className="h-8">
                                                <X className="h-3.5 w-3.5 mr-1" />
                                                Cancel
                                            </Button>
                                            <Button variant="default" size="sm" onClick={handleWorkInfoSaveClick} className="h-8">
                                                <Save className="h-3.5 w-3.5 mr-1" />
                                                Save
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Photo & Name */}
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <Avatar className="h-24 w-24">
                                        <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                                            {getInitials(formData.fullName || "")}
                                        </AvatarFallback>
                                    </Avatar>

                                    {isEditingWorkInfo ? (
                                        <div className="w-full text-left space-y-1.5">
                                            <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">
                                                Full Name
                                            </Label>
                                            <Input
                                                id="fullName"
                                                value={formData.fullName || ""}
                                                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                                                className="" // Standard styling
                                                aria-label="Employee full name"
                                            />
                                        </div>
                                    ) : (
                                        <h2 className="text-xl font-bold text-foreground">{formData.fullName}</h2>
                                    )}
                                </div>

                                <Separator />

                                {/* Group 1: Employee ID, Company Email */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="employeeId" className="text-xs font-medium text-muted-foreground">
                                            Employee ID
                                        </Label>
                                        {isEditingWorkInfo ? (
                                            <Input
                                                id="employeeId"
                                                value={formData.employeeId || ""}
                                                onChange={(e) => handleFieldChange("employeeId", e.target.value)}
                                                className="h-9"
                                                aria-label="Employee ID"
                                            />
                                        ) : (
                                            <p className="text-sm text-foreground">{formData.employeeId || "—"}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="companyEmail" className="text-xs font-medium text-muted-foreground">
                                            Company Email
                                        </Label>
                                        <p id="companyEmail" className="text-sm text-foreground">
                                            {formData.companyEmail}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="client" className="text-xs font-medium text-muted-foreground">
                                            Client
                                        </Label>
                                        {isEditingWorkInfo ? (
                                            <Input
                                                id="client"
                                                value={formData.client || ""}
                                                onChange={(e) => handleFieldChange("client", e.target.value)}
                                                className="h-9"
                                                aria-label="Client"
                                            />
                                        ) : (
                                            <p className="text-sm text-foreground">{formData.client || "—"}</p>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Group 2: Position, Division/Department/Team, Direct Manager */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="position" className="text-xs font-medium text-muted-foreground">Position</Label>
                                        {isEditingWorkInfo ? (
                                            <Select
                                                value={formData.positionId || ""}
                                                onValueChange={(value) => handleFieldChange("positionId", value)}
                                            >
                                                <SelectTrigger id="position" className="h-9">
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {positions.map((pos) => (
                                                        <SelectItem key={pos.id} value={pos.id}>
                                                            {pos.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="text-sm text-foreground">{formData.positionTitle || "—"}</p>
                                        )}
                                    </div>

                                    {hierarchy.division && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Division</Label>
                                            <p className="text-sm text-foreground">{hierarchy.division.name}</p>
                                        </div>
                                    )}

                                    {hierarchy.department && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Department</Label>
                                            <p className="text-sm text-foreground">{hierarchy.department.name}</p>
                                        </div>
                                    )}

                                    {hierarchy.team && (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Team</Label>
                                            <p className="text-sm text-foreground">{hierarchy.team.name}</p>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">Direct Manager</Label>
                                        <p className="text-sm text-foreground">{formData.lineManagerName || "—"}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-muted-foreground">Direct Reports</Label>
                                        <p className="text-sm text-foreground">
                                            {employees.filter(e => e.lineManagerId === employee?.id).length} employee(s)
                                        </p>
                                    </div>


                                </div>

                                <Separator />

                                {/* Group 3: Start Date, Seniority */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Label htmlFor="startDate" className="text-xs font-medium text-muted-foreground">
                                                Start Date
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="max-w-xs">
                                                    <p className="text-xs">The date when the employee officially joined the company (Onboarding Day).</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {isEditingWorkInfo ? (
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.companyJoinDate || ""}
                                                onChange={(e) => handleFieldChange("companyJoinDate", e.target.value)}
                                                className="h-9"
                                                aria-label="Start date"
                                            />
                                        ) : (
                                            <p className="text-sm text-foreground">{formatDate(formData.companyJoinDate)}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Label htmlFor="officialStartDate" className="text-xs font-medium text-muted-foreground">
                                                Employment Start Date
                                            </Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="max-w-xs">
                                                    <p className="text-xs">The day start working as full-time employee</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        {isEditingWorkInfo ? (
                                            <Input
                                                id="officialStartDate"
                                                type="date"
                                                value={formData.officialStartDate || ""}
                                                onChange={(e) => handleFieldChange("officialStartDate", e.target.value)}
                                                className="h-9"
                                                aria-label="Employment start date"
                                            />
                                        ) : (
                                            <p className="text-sm text-foreground">{formatDate(formData.officialStartDate)}</p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Label className="text-xs font-medium text-muted-foreground">Seniority</Label>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="max-w-xs">
                                                    <p className="text-xs">
                                                        Calculated from the Start Date. Shows years, months, and days since the employee joined the company.
                                                        Formula: Current Date - Start Date.
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="font-semibold">
                                                {calculateSeniority(formData.companyJoinDate)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column - Tabbed Content */}
                        <div className="space-y-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="personal">Personal</TabsTrigger>
                                    <TabsTrigger value="contract">Contract</TabsTrigger>
                                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                                </TabsList>

                                {/* Personal Tab */}
                                <TabsContent value="personal" className="space-y-4 mt-4">
                                    <Card>
                                        <CardContent className="p-6 space-y-6">
                                            {/* Header & Edit Button */}
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold">Personal Information</h2>
                                                {!isEditingPersonal ? (
                                                    <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(true)} className="gap-2">
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={handleCancelPersonal} className="gap-2">
                                                            <X className="h-4 w-4" />
                                                            Cancel
                                                        </Button>
                                                        <Button variant="default" size="sm" onClick={handleSavePersonal} className="gap-2">
                                                            <Save className="h-4 w-4" />
                                                            Save
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 1. General Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">General Information</h3>
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="cellphone" className="text-xs font-medium text-muted-foreground">Cellphone number</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="cellphone"
                                                                value={formData.cellphone || ""}
                                                                onChange={(e) => handleFieldChange("cellphone", e.target.value)}
                                                                aria-label="Cellphone number"
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.cellphone || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="personalEmail" className="text-xs font-medium text-muted-foreground">Personal email</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="personalEmail"
                                                                value={formData.personalEmail || ""}
                                                                onChange={(e) => handleFieldChange("personalEmail", e.target.value)}
                                                                aria-label="Personal email"
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.personalEmail || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="dateOfBirth" className="text-xs font-medium text-muted-foreground">Date of birth</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="dateOfBirth"
                                                                type="date"
                                                                value={formData.dateOfBirth || ""}
                                                                onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)}
                                                                aria-label="Date of birth"
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formatDate(formData.dateOfBirth)}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="gender" className="text-xs font-medium text-muted-foreground">Gender</Label>
                                                        {isEditingPersonal ? (
                                                            <Select value={formData.gender || ""} onValueChange={(value) => handleFieldChange("gender", value)}>
                                                                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                                <SelectContent>
                                                                    {genderOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.gender || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="nationality" className="text-xs font-medium text-muted-foreground">Nationality</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="nationality"
                                                                value={formData.nationality || ""}
                                                                onChange={(e) => handleFieldChange("nationality", e.target.value)}
                                                                aria-label="Nationality"
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.nationality || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="maritalStatus" className="text-xs font-medium text-muted-foreground">Marital status</Label>
                                                        {isEditingPersonal ? (
                                                            <Select value={formData.maritalStatus || ""} onValueChange={(value) => handleFieldChange("maritalStatus", value)}>
                                                                <SelectTrigger id="maritalStatus"><SelectValue placeholder="Select status" /></SelectTrigger>
                                                                <SelectContent>
                                                                    {maritalStatusOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.maritalStatus || "—"}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 2. Citizenship */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Citizenship</h3>
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="nationalIdNumber" className="text-xs font-medium text-muted-foreground">National ID/Passport number</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="nationalIdNumber"
                                                                value={formData.nationalIdNumber || ""}
                                                                onChange={(e) => handleFieldChange("nationalIdNumber", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.nationalIdNumber || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="nationalIdIssueDate" className="text-xs font-medium text-muted-foreground">Issue date</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="nationalIdIssueDate"
                                                                type="date"
                                                                value={formData.nationalIdIssueDate || ""}
                                                                onChange={(e) => handleFieldChange("nationalIdIssueDate", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formatDate(formData.nationalIdIssueDate)}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 space-y-1.5">
                                                        <Label htmlFor="nationalIdIssuePlace" className="text-xs font-medium text-muted-foreground">Issue place</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="nationalIdIssuePlace"
                                                                value={formData.nationalIdIssuePlace || ""}
                                                                onChange={(e) => handleFieldChange("nationalIdIssuePlace", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.nationalIdIssuePlace || "—"}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. Address */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Address</h3>
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div className="col-span-2 space-y-1.5">
                                                        <Label htmlFor="birthRegisterAddress" className="text-xs font-medium text-muted-foreground">Birth register address</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="birthRegisterAddress"
                                                                value={formData.birthRegisterAddress?.fullAddress || ""}
                                                                onChange={(e) => handleNestedFieldChange("birthRegisterAddress", "fullAddress", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.birthRegisterAddress?.fullAddress || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 space-y-1.5">
                                                        <Label htmlFor="permanentAddress" className="text-xs font-medium text-muted-foreground">Permanent address</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="permanentAddress"
                                                                value={formData.permanentAddress?.fullAddress || ""}
                                                                onChange={(e) => handleNestedFieldChange("permanentAddress", "fullAddress", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.permanentAddress?.fullAddress || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2 space-y-1.5">
                                                        <Label htmlFor="currentAddress" className="text-xs font-medium text-muted-foreground">Current address</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="currentAddress"
                                                                value={formData.currentAddress?.fullAddress || ""}
                                                                onChange={(e) => handleNestedFieldChange("currentAddress", "fullAddress", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.currentAddress?.fullAddress || "—"}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 4. Tax Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Tax Information</h3>
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="personalTaxCode" className="text-xs font-medium text-muted-foreground">Personal Tax code</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="personalTaxCode"
                                                                value={formData.taxInfo?.personalTaxCode || ""}
                                                                onChange={(e) => handleNestedFieldChange("taxInfo", "personalTaxCode", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.taxInfo?.personalTaxCode || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="taxDependents" className="text-xs font-medium text-muted-foreground">Tax dependents</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="taxDependents"
                                                                type="number"
                                                                value={formData.taxInfo?.taxDependents || 0}
                                                                onChange={(e) => handleNestedFieldChange("taxInfo", "taxDependents", parseInt(e.target.value) || 0)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.taxInfo?.taxDependents || 0}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="socialInsurance" className="text-xs font-medium text-muted-foreground">Social insurance book number</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="socialInsurance"
                                                                value={formData.taxInfo?.socialInsuranceBookNumber || ""}
                                                                onChange={(e) => handleNestedFieldChange("taxInfo", "socialInsuranceBookNumber", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.taxInfo?.socialInsuranceBookNumber || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="hospitalCode" className="text-xs font-medium text-muted-foreground">Initial Registration Hospital Code</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="hospitalCode"
                                                                value={formData.taxInfo?.initialRegistrationHospitalCode || ""}
                                                                onChange={(e) => handleNestedFieldChange("taxInfo", "initialRegistrationHospitalCode", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.taxInfo?.initialRegistrationHospitalCode || "—"}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 5. Bank Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Bank Information</h3>
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="bankAccount" className="text-xs font-medium text-muted-foreground">Bank account</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="bankAccount"
                                                                value={formData.bankInfo?.accountNumber || ""}
                                                                onChange={(e) => handleNestedFieldChange("bankInfo", "accountNumber", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.bankInfo?.accountNumber || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="bankName" className="text-xs font-medium text-muted-foreground">Bank name - Branch</Label>
                                                        {isEditingPersonal ? (
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <Input
                                                                    placeholder="Bank Name"
                                                                    value={formData.bankInfo?.bankName || ""}
                                                                    onChange={(e) => handleNestedFieldChange("bankInfo", "bankName", e.target.value)}
                                                                />
                                                                <Input
                                                                    placeholder="Branch"
                                                                    value={formData.bankInfo?.branch || ""}
                                                                    onChange={(e) => handleNestedFieldChange("bankInfo", "branch", e.target.value)}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm font-medium">
                                                                {formData.bankInfo ? `${formData.bankInfo.bankName} - ${formData.bankInfo.branch}` : "—"}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 6. Emergency Contact */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="contactName" className="text-xs font-medium text-muted-foreground">Contact person's name</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="contactName"
                                                                value={formData.emergencyContact?.contactPersonName || ""}
                                                                onChange={(e) => handleNestedFieldChange("emergencyContact", "contactPersonName", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.emergencyContact?.contactPersonName || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="contactRelationship" className="text-xs font-medium text-muted-foreground">Relationship with employee</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="contactRelationship"
                                                                value={formData.emergencyContact?.relationship || ""}
                                                                onChange={(e) => handleNestedFieldChange("emergencyContact", "relationship", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.emergencyContact?.relationship || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="contactPhone" className="text-xs font-medium text-muted-foreground">Phone number</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="contactPhone"
                                                                value={formData.emergencyContact?.phone || ""}
                                                                onChange={(e) => handleNestedFieldChange("emergencyContact", "phone", e.target.value)}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.emergencyContact?.phone || "—"}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 7. Education */}
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold">Education</h3>
                                                <div className="grid gap-6 sm:grid-cols-2">
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="eduInstitute" className="text-xs font-medium text-muted-foreground">Name of Institute</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="eduInstitute"
                                                                value={formData.education?.[0]?.institution || ""}
                                                                onChange={(e) => {
                                                                    const education = [...(formData.education || [])];
                                                                    if (!education[0]) education[0] = { institution: "", major: "", degree: "", graduationYear: "" } as any;
                                                                    education[0].institution = e.target.value;
                                                                    handleFieldChange("education", education);
                                                                }}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.education?.[0]?.institution || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="eduMajor" className="text-xs font-medium text-muted-foreground">Major</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="eduMajor"
                                                                value={formData.education?.[0]?.fieldOfStudy || ""}
                                                                onChange={(e) => {
                                                                    const education = [...(formData.education || [])];
                                                                    if (!education[0]) education[0] = { institution: "", major: "", degree: "", graduationYear: "" } as any;
                                                                    education[0].fieldOfStudy = e.target.value;
                                                                    handleFieldChange("education", education);
                                                                }}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.education?.[0]?.fieldOfStudy || "—"}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label htmlFor="eduDegree" className="text-xs font-medium text-muted-foreground">Education type</Label>
                                                        {isEditingPersonal ? (
                                                            <Input
                                                                id="eduDegree"
                                                                value={formData.education?.[0]?.degree || ""}
                                                                onChange={(e) => {
                                                                    const education = [...(formData.education || [])];
                                                                    if (!education[0]) education[0] = { institution: "", major: "", degree: "", graduationYear: "" } as any;
                                                                    education[0].degree = e.target.value;
                                                                    handleFieldChange("education", education);
                                                                }}
                                                            />
                                                        ) : (
                                                            <p className="text-sm font-medium">{formData.education?.[0]?.degree || "—"}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>


                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Contract Tab */}
                                <TabsContent value="contract" className="space-y-4 mt-4">
                                    <Card>
                                        <CardContent className="p-6 space-y-6">
                                            {/* Header */}
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-xl font-bold">Contract Information</h2>
                                            </div>

                                            {/* Hidden File Input */}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                            />

                                            {/* Current Contract */}
                                            {formData.contracts && formData.contracts.length > 0 ? (
                                                <div className="space-y-4">
                                                    {formData.contracts
                                                        .sort((a, b) => {
                                                            if (a.status === 'active' && b.status !== 'active') return -1
                                                            if (b.status === 'active' && a.status !== 'active') return 1
                                                            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                                                        })
                                                        .map((contract) => (
                                                            <div
                                                                key={contract.id}
                                                                className={`rounded-lg border p-4 space-y-4 ${contract.status === 'active'
                                                                    ? 'border-green-500/50 bg-green-500/5'
                                                                    : 'bg-muted/30'
                                                                    }`}
                                                            >
                                                                {/* Card Header & Inline Edit Actions */}
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className={`h-5 w-5 ${contract.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`} />
                                                                        <span className="font-medium">{contract.contractNumber}</span>
                                                                        {contract.status === 'active' && (
                                                                            <Badge variant="outline" className="border-green-500 text-green-700 bg-green-100">
                                                                                Active
                                                                            </Badge>
                                                                        )}
                                                                        {contract.status === 'terminated' && (
                                                                            <Badge variant="outline" className="text-muted-foreground">
                                                                                Terminated
                                                                            </Badge>
                                                                        )}
                                                                    </div>

                                                                    {/* Inline Edit Buttons */}
                                                                    {editingContractId === contract.id ? (
                                                                        <div className="flex gap-2">
                                                                            <Button variant="ghost" size="sm" onClick={handleCancelContractEdit} className="h-8 w-8 p-0">
                                                                                <X className="h-4 w-4" />
                                                                                <span className="sr-only">Cancel</span>
                                                                            </Button>
                                                                            <Button variant="ghost" size="sm" onClick={handleSaveContractEdit} className="h-8 px-2 text-green-600 hover:text-green-700 gap-1">
                                                                                <Save className="h-4 w-4" />
                                                                                <span>Save</span>
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex gap-1">
                                                                            <Button variant="ghost" size="sm" onClick={() => handleEditContractClick(contract)} className="h-8 w-8 p-0">
                                                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                                                                <span className="sr-only">Edit</span>
                                                                            </Button>
                                                                            <Button variant="ghost" size="sm" onClick={() => confirmDeleteContract(contract.id)} className="h-8 w-8 p-0 hover:text-destructive">
                                                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                                                <span className="sr-only">Delete</span>
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="grid gap-4 sm:grid-cols-2">
                                                                    <div className="space-y-1.5">
                                                                        <Label htmlFor={`contractNumber-${contract.id}`} className="text-xs font-medium text-muted-foreground">
                                                                            Contract Number
                                                                        </Label>
                                                                        {editingContractId === contract.id ? (
                                                                            <Input
                                                                                id={`contractNumber-${contract.id}`}
                                                                                value={draftContract?.contractNumber || ""}
                                                                                onChange={(e) => setDraftContract(prev => prev ? ({ ...prev, contractNumber: e.target.value }) : null)}
                                                                                aria-label="Contract number"
                                                                            />
                                                                        ) : (
                                                                            <p className="text-sm text-foreground">{contract.contractNumber}</p>
                                                                        )}
                                                                    </div>

                                                                    <div className="space-y-1.5">
                                                                        <Label htmlFor={`contractStatus-${contract.id}`} className="text-xs font-medium text-muted-foreground">
                                                                            Status
                                                                        </Label>
                                                                        {editingContractId === contract.id ? (
                                                                            <Select
                                                                                value={draftContract?.status || "active"}
                                                                                onValueChange={(value: "active" | "terminated") =>
                                                                                    setDraftContract(prev => prev ? ({ ...prev, status: value }) : null)
                                                                                }
                                                                            >
                                                                                <SelectTrigger id={`contractStatus-${contract.id}`} aria-label="Contract status">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="active">Active</SelectItem>
                                                                                    <SelectItem value="terminated">Terminated</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        ) : (
                                                                            <p className="text-sm text-foreground capitalize">{contract.status}</p>
                                                                        )}
                                                                    </div>
                                                                    {editingContractId === contract.id && contractError && (
                                                                        <div className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded">
                                                                            {contractError}
                                                                        </div>
                                                                    )}

                                                                    <div className="space-y-1.5">
                                                                        <Label htmlFor={`contractType-${contract.id}`} className="text-xs font-medium text-muted-foreground">
                                                                            Contract Type
                                                                        </Label>
                                                                        {editingContractId === contract.id ? (
                                                                            <Select
                                                                                value={draftContract?.contractType || ""}
                                                                                onValueChange={(value) => setDraftContract(prev => prev ? ({ ...prev, contractType: value }) : null)}
                                                                            >
                                                                                <SelectTrigger id={`contractType-${contract.id}`} aria-label="Contract type">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    {contractTypeOptions.map((type) => (
                                                                                        <SelectItem key={type} value={type}>
                                                                                            {type}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        ) : (
                                                                            <p className="text-sm text-foreground">{contract.contractType}</p>
                                                                        )}
                                                                    </div>

                                                                    <div className="space-y-1.5">
                                                                        <Label htmlFor={`startDate-${contract.id}`} className="text-xs font-medium text-muted-foreground">
                                                                            Start Date
                                                                        </Label>
                                                                        {editingContractId === contract.id ? (
                                                                            <Input
                                                                                id={`startDate-${contract.id}`}
                                                                                type="date"
                                                                                value={draftContract?.startDate || ""}
                                                                                onChange={(e) => setDraftContract(prev => prev ? ({ ...prev, startDate: e.target.value }) : null)}
                                                                                aria-label="Contract start date"
                                                                            />
                                                                        ) : (
                                                                            <p className="text-sm text-foreground">{formatDate(contract.startDate)}</p>
                                                                        )}
                                                                    </div>

                                                                    <div className="space-y-1.5">
                                                                        <Label htmlFor={`endDate-${contract.id}`} className="text-xs font-medium text-muted-foreground">
                                                                            End Date
                                                                        </Label>
                                                                        {editingContractId === contract.id ? (
                                                                            <Input
                                                                                id={`endDate-${contract.id}`}
                                                                                type="date"
                                                                                value={draftContract?.endDate || ""}
                                                                                onChange={(e) => setDraftContract(prev => prev ? ({ ...prev, endDate: e.target.value }) : null)}
                                                                                aria-label="Contract end date"
                                                                            />
                                                                        ) : (
                                                                            <p className="text-sm text-foreground">{formatDate(contract.endDate)}</p>
                                                                        )}
                                                                    </div>


                                                                </div>

                                                                {/* File Attachment Section */}
                                                                < Separator />
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs font-medium text-muted-foreground">Contract File</Label>
                                                                    {(editingContractId === contract.id ? draftContract?.fileUrl : contract.fileUrl) ? (
                                                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                                                            <div className="flex items-center gap-2">
                                                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                                                <span className="text-sm">
                                                                                    {(editingContractId === contract.id && draftContract?.fileName)
                                                                                        ? draftContract.fileName
                                                                                        : (contract.fileName || "contract.pdf")}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                {editingContractId === contract.id && (
                                                                                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="Replace contract file">
                                                                                        <Upload className="h-4 w-4" />
                                                                                    </Button>
                                                                                )}
                                                                                <Button variant="ghost" size="sm" onClick={() => window.open((editingContractId === contract.id && draftContract?.fileUrl) ? draftContract.fileUrl : contract.fileUrl, '_blank')} aria-label="Download contract file">
                                                                                    <Download className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed">
                                                                            {editingContractId === contract.id ? (
                                                                                <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                                                                                    <Upload className="h-4 w-4" />
                                                                                    Upload Contract PDF
                                                                                </Button>
                                                                            ) : (
                                                                                <p className="text-sm text-muted-foreground">No file attached</p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}

                                                    {/* Add New Contract Button at Bottom Right */}
                                                    {!showAddContract && (
                                                        <div className="flex justify-end pt-4">
                                                            <Button variant="outline" onClick={handleOpenAddContract} className="gap-2">
                                                                <Plus className="h-4 w-4" />
                                                                Add New Contract
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-muted-foreground mb-4">No contracts found</p>
                                                    <Button variant="outline" onClick={handleOpenAddContract}>
                                                        Add Contract
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Add New Contract Form */}
                                            {showAddContract && (
                                                <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium">Add New Contract</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setShowAddContract(false)
                                                                setContractError(null)
                                                            }}
                                                            className="h-6 w-6 p-0"
                                                            aria-label="Close add contract form"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <div className="space-y-1">
                                                            <Label htmlFor="newContractNumber" className="text-xs">
                                                                Contract Number *
                                                            </Label>
                                                            <Input
                                                                id="newContractNumber"
                                                                value={newContract.contractNumber}
                                                                onChange={(e) =>
                                                                    setNewContract((prev) => ({
                                                                        ...prev,
                                                                        contractNumber: e.target.value,
                                                                    }))
                                                                }
                                                                placeholder="e.g., CON-2024-001"
                                                                aria-required="true"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label htmlFor="newContractType" className="text-xs">
                                                                Contract Type *
                                                            </Label>
                                                            <Select
                                                                value={newContract.contractType}
                                                                onValueChange={(value) =>
                                                                    setNewContract((prev) => ({
                                                                        ...prev,
                                                                        contractType: value,
                                                                    }))
                                                                }
                                                            >
                                                                <SelectTrigger id="newContractType" aria-required="true">
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {contractTypeOptions.map((type) => (
                                                                        <SelectItem key={type} value={type}>
                                                                            {type}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label htmlFor="newContractStartDate" className="text-xs">
                                                                Start Date *
                                                            </Label>
                                                            <Input
                                                                id="newContractStartDate"
                                                                type="date"
                                                                value={newContract.startDate}
                                                                onChange={(e) =>
                                                                    setNewContract((prev) => ({
                                                                        ...prev,
                                                                        startDate: e.target.value,
                                                                    }))
                                                                }
                                                                aria-required="true"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label htmlFor="newContractEndDate" className="text-xs">
                                                                End Date *
                                                            </Label>
                                                            <Input
                                                                id="newContractEndDate"
                                                                type="date"
                                                                value={newContract.endDate}
                                                                onChange={(e) =>
                                                                    setNewContract((prev) => ({
                                                                        ...prev,
                                                                        endDate: e.target.value,
                                                                    }))
                                                                }
                                                                aria-required="true"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <Label htmlFor="newContractStatus" className="text-xs">
                                                                Status
                                                            </Label>
                                                            <Select
                                                                value={newContract.status}
                                                                onValueChange={(value: "active" | "terminated") => {
                                                                    setNewContract((prev) => ({
                                                                        ...prev,
                                                                        status: value,
                                                                    }))
                                                                    validateActiveContract(value)
                                                                }}
                                                            >
                                                                <SelectTrigger id="newContractStatus">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="active">Active</SelectItem>
                                                                    <SelectItem value="terminated">Terminated</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {contractError && (
                                                            <div className="sm:col-span-2 text-xs text-destructive font-medium bg-destructive/10 p-2 rounded flex items-center gap-2">
                                                                <X className="h-3 w-3" />
                                                                {contractError}
                                                            </div>
                                                        )}
                                                        <div className="space-y-1 sm:col-span-2">
                                                            <Label className="text-xs">
                                                                Contract File *
                                                            </Label>
                                                            {newContract.fileUrl ? (
                                                                <div className="flex items-center justify-between p-2 rounded-md border bg-muted/50">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-sm">{newContract.fileName}</span>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        className="h-6 w-6 p-0"
                                                                    >
                                                                        <Upload className="h-4 w-4" />
                                                                        <span className="sr-only">Replace</span>
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full gap-2 border-dashed"
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                    >
                                                                        <Upload className="h-4 w-4" />
                                                                        Upload PDF
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => setShowAddContract(false)}>
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={handleAddContract}
                                                            disabled={
                                                                !newContract.contractNumber ||
                                                                !newContract.contractType ||
                                                                !newContract.startDate ||
                                                                !newContract.endDate ||
                                                                !newContract.fileUrl
                                                            }
                                                        >
                                                            Add Contract
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Transactions Tab */}
                                <TabsContent value="transactions" className="space-y-4 mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <h2 className="text-xl font-bold mb-4">Transactions</h2>
                                            {formData.transactions && formData.transactions.length > 0 ? (
                                                <div className="space-y-3">
                                                    {formData.transactions.map((transaction) => (
                                                        <div key={transaction.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                <Calendar className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{transaction.text}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {formatDate(transaction.effectiveDate)} • {transaction.createdBy}
                                                                </p>
                                                                {transaction.notes && <p className="text-xs text-muted-foreground mt-1">{transaction.notes}</p>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-8">No transactions recorded</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </AdminLayout >
        </TooltipProvider >
    )
}
