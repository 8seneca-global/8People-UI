"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
    ArrowLeft,
    Upload,
    X,
    FileText,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Search,
    Users,
    Briefcase,
    User,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ExtractedData {
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    nationality: string
    idNumber: string
    issueDate: string
    issuePlace: string
    address: string
    workEmail: string
    personalEmail: string
}

type ProvisioningStage = "idle" | "creating-email" | "sending-credentials" | "complete" | "cancelled"

export default function AddEmployeePage() {
    const router = useRouter()
    const { organizationalUnits, jobClassifications, positions, addEmployee, updatePosition, employees } = useStore()

    // Section 1: Position
    const [selectedPositionId, setSelectedPositionId] = useState("")
    const [employeeCode, setEmployeeCode] = useState("")
    const [positionSearch, setPositionSearch] = useState("")

    // Section 2: Identity Verification
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null)
    const [idBackFile, setIdBackFile] = useState<File | null>(null)
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
    const [isExtracting, setIsExtracting] = useState(false)
    const idFrontInputRef = useRef<HTMLInputElement>(null)
    const idBackInputRef = useRef<HTMLInputElement>(null)

    // Section 3: Contract Settings
    const [contractNumber, setContractNumber] = useState("")
    const [contractType, setContractType] = useState("")
    const [contractStartDate, setContractStartDate] = useState("")
    const [contractEndDate, setContractEndDate] = useState("")
    const [contractFile, setContractFile] = useState<File | null>(null)
    const contractFileInputRef = useRef<HTMLInputElement>(null)

    // Section 4: Account Provisioning
    const [provisioningStage, setProvisioningStage] = useState<ProvisioningStage>("idle")
    const [progress, setProgress] = useState(0)
    const [generatedCredentials, setGeneratedCredentials] = useState<{
        email: string
        tempPassword: string
    } | null>(null)
    const [createdEmployeeId, setCreatedEmployeeId] = useState<string | null>(null)
    const [showProvisioningModal, setShowProvisioningModal] = useState(false)
    const [isProvisioning, setIsProvisioning] = useState(false)

    // Navigation guard
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isProvisioning) {
                e.preventDefault()
                e.returnValue = ""
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [isProvisioning])

    // Computed values
    const availablePositions = positions.filter(
        (p) => (p.hiringStatus === "vacant" || p.hiringStatus === "hiring") && p.status === "active"
    )

    // Filter positions based on search
    const filteredPositions = availablePositions.filter((p) => {
        if (!positionSearch) return true
        const searchLower = positionSearch.toLowerCase()
        return (
            p.title.toLowerCase().includes(searchLower) ||
            p.code.toLowerCase().includes(searchLower) ||
            p.organizationalUnitName.toLowerCase().includes(searchLower)
        )
    })

    const selectedPosition = positions.find((p) => p.id === selectedPositionId)
    const selectedOrgUnit = selectedPosition
        ? organizationalUnits.find((u) => u.id === selectedPosition.organizationalUnitId)
        : null
    const selectedJobClass = selectedPosition
        ? jobClassifications.find((j) => j.id === selectedPosition.jobClassificationId)
        : null

    // Get organizational hierarchy
    const getOrgHierarchy = () => {
        if (!selectedOrgUnit) return { division: null, department: null, team: null }

        const findParent = (unitId: string) => organizationalUnits.find((u) => u.id === unitId)

        let division = null
        let department = null
        let team = null

        if (selectedOrgUnit.unitType === "division") {
            division = selectedOrgUnit
        } else if (selectedOrgUnit.unitType === "department") {
            department = selectedOrgUnit
            if (selectedOrgUnit.parentId) division = findParent(selectedOrgUnit.parentId)
        } else if (selectedOrgUnit.unitType === "team") {
            team = selectedOrgUnit
            if (selectedOrgUnit.parentId) {
                department = findParent(selectedOrgUnit.parentId)
                if (department?.parentId) division = findParent(department.parentId)
            }
        }

        return { division, department, team }
    }

    const hierarchy = getOrgHierarchy()
    const directManager = selectedPosition?.parentPositionId
        ? positions.find((p) => p.id === selectedPosition.parentPositionId)
        : null

    // Get direct reports (positions that report to this position)
    const directReports = selectedPosition
        ? positions.filter((p) => p.parentPositionId === selectedPosition.id)
        : []

    // Validation
    const isEmployeeCodeUnique = !employees.some(e => e.code === employeeCode)
    const isContractNumberUnique = !employees.some(e => e.contractNumber === contractNumber || e.contracts?.some(c => c.contractNumber === contractNumber))

    const isSection1Valid = !!selectedPositionId && !!employeeCode && isEmployeeCodeUnique
    const isSection2Valid =
        !!extractedData &&
        extractedData.firstName &&
        extractedData.lastName &&
        extractedData.idNumber &&
        extractedData.workEmail &&
        extractedData.personalEmail
    const isSection3Valid =
        !!contractNumber &&
        !!contractType &&
        !!contractStartDate &&
        !!contractEndDate &&
        !!contractFile &&
        isContractNumberUnique

    // OCR Simulation
    const simulateOCR = async () => {
        if (!idFrontFile || !idBackFile) return

        setIsExtracting(true)

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Generate mock extracted data
        const mockData: ExtractedData = {
            firstName: "An",
            lastName: "Nguyen Van",
            dateOfBirth: "1990-05-15",
            gender: "Male",
            nationality: "Vietnamese",
            idNumber: `079${Math.floor(Math.random() * 1000000000)}`,
            issueDate: "2020-01-10",
            issuePlace: "Cục trưởng cục cảnh sát ĐKQL cư trú và DLQG về dân cư",
            address: "123 Nguyen Hue St, District 1, Ho Chi Minh City",
            workEmail: "nguyenvan.an@8seneca.com",
            personalEmail: "",
        }

        setExtractedData(mockData)
        setIsExtracting(false)
    }

    useEffect(() => {
        if (idFrontFile && idBackFile && !extractedData && !isExtracting) {
            simulateOCR()
        }
    }, [idFrontFile, idBackFile])

    const handleStartProvisioning = () => {
        setShowProvisioningModal(true)
        handleCreateAccount()
    }

    // Account Provisioning
    const handleCreateAccount = async () => {
        if (!selectedPosition || !selectedOrgUnit || !selectedJobClass || !extractedData) return

        setIsProvisioning(true)
        setProvisioningStage("creating-email")
        setProgress(0)

        // Stage 1: Creating Google Workspace Email (0-50%)
        for (let i = 0; i <= 50; i += 2) {
            await new Promise((resolve) => setTimeout(resolve, 40))
            setProgress(i)
            if (provisioningStage === "cancelled") {
                // Check if cancelled externally (though modal handles it now)
                return
            }
        }

        // Generate credentials
        const companyEmail = extractedData.workEmail || `${extractedData.lastName.toLowerCase().replace(/\s+/g, "")}.${extractedData.firstName.toLowerCase()}@8seneca.com`
        const tempPassword = `Temp${Math.floor(Math.random() * 10000)}!`

        setProvisioningStage("sending-credentials")

        // Stage 2: Sending Credentials (50-100%)
        for (let i = 50; i <= 100; i += 2) {
            await new Promise((resolve) => setTimeout(resolve, 40))
            setProgress(i)
            if (provisioningStage === "cancelled") {
                return
            }
        }

        // Create employee in store
        // Use provided employee code or generate one if empty (though validation prevents empty)
        const finalEmployeeCode = employeeCode || `P-${Date.now().toString().slice(-4)}`
        const employeeId = `P-${Date.now()}`
        setCreatedEmployeeId(employeeId)

        // Create initial contract object
        const initialContract = {
            id: `CONTRACT-${Date.now()}`,
            contractNumber,
            contractType,
            startDate: contractStartDate,
            endDate: contractEndDate,
            fileUrl: contractFile ? URL.createObjectURL(contractFile) : undefined,
            fileName: contractFile?.name,
            status: "active" as const,
        }

        addEmployee({
            id: employeeId,
            code: finalEmployeeCode,
            fullName: `${extractedData.lastName} ${extractedData.firstName}`,
            firstName: extractedData.firstName,
            lastName: extractedData.lastName,
            personalEmail: extractedData.personalEmail,
            companyEmail,
            positionId: selectedPosition.id,
            positionCode: selectedPosition.code,
            positionTitle: selectedPosition.title,
            jobClassificationId: selectedJobClass.id,
            jobClassificationTitle: selectedJobClass.title,
            organizationalUnitId: selectedOrgUnit.id,
            organizationalUnitName: selectedOrgUnit.name,
            costCenter: selectedPosition.costCenter || selectedOrgUnit.costCenter,
            lineManagerId: directManager?.incumbentId,
            lineManagerName: directManager?.incumbentName,
            status: "pending",
            onboardingStatus: {
                emailSent: true,
                accountActivated: false,
                profileCompleted: false,
            },
            startDate: new Date().toISOString().split("T")[0],
            fte: selectedPosition.fte,
            nationalIdNumber: extractedData.idNumber,
            nationalIdIssueDate: extractedData.issueDate,
            nationalIdIssuePlace: extractedData.issuePlace,
            dateOfBirth: extractedData.dateOfBirth,
            gender: extractedData.gender as "male" | "female" | "other",
            nationality: extractedData.nationality,
            address: extractedData.address,
            // Contract information (top-level for backward compatibility)
            contractNumber,
            contractType: contractType as "full-time" | "part-time" | "contract" | "internship",
            contractStartDate,
            contractEndDate,
            contractFileUrl: contractFile ? URL.createObjectURL(contractFile) : undefined,
            contractFileName: contractFile?.name,
            // Contracts array (for employee detail page)
            contracts: [initialContract],
            // Onboarding tracking (will be populated on first login)
            onboardingDate: null,
        })

        updatePosition(selectedPosition.id, {
            hiringStatus: "filled",
            incumbentId: employeeId,
            incumbentName: `${extractedData.lastName} ${extractedData.firstName}`,
        })

        setGeneratedCredentials({ email: companyEmail, tempPassword })
        setProvisioningStage("complete")
        setIsProvisioning(false)
    }

    const handleCancelProvisioning = () => {
        setProvisioningStage("cancelled")
        setIsProvisioning(false)
        setShowProvisioningModal(false)
        setProgress(0)
    }

    const handleSuccessClose = () => {
        setShowProvisioningModal(false)
        router.push(createdEmployeeId ? `/employees?id=${createdEmployeeId}` : "/employees")
    }

    return (
        <AdminLayout title="Add New Employee" subtitle="Position-first onboarding wizard">
            <div className="space-y-6">
                {/* Back Button */}
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Employees
                </Button>

                {/* Section 1: Position */}
                <Card className={cn("border-2", isSection1Valid && "border-success/50")}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold",
                                        isSection1Valid ? "bg-success text-success-foreground" : "bg-secondary text-secondary-foreground"
                                    )}
                                >
                                    {isSection1Valid ? <CheckCircle2 className="h-6 w-6" /> : "1"}
                                </div>
                                <div>
                                    <CardTitle>Position</CardTitle>
                                    <CardDescription>Select the vacant position to fill</CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Position Select with search bar */}
                        <div className="space-y-2">
                            <Label htmlFor="position">Vacant Position</Label>
                            <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
                                <SelectTrigger id="position" className="bg-input">
                                    <SelectValue placeholder="Select a vacant position" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[400px]">
                                    {/* Search bar inside dropdown */}
                                    <div className="sticky top-0 z-10 bg-popover p-2 border-b">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                placeholder="Search positions..."
                                                value={positionSearch}
                                                onChange={(e) => setPositionSearch(e.target.value)}
                                                className="pl-8 h-8"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                    {filteredPositions.length === 0 ? (
                                        <div className="p-3 text-center text-sm text-muted-foreground">No vacant positions found</div>
                                    ) : (
                                        filteredPositions.map((pos) => (
                                            <SelectItem key={pos.id} value={pos.id}>
                                                {pos.title}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Context Fields (Post-Selection) - Disabled Form Fields */}
                        {selectedPosition && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {hierarchy.division && (
                                    <div className="space-y-2">
                                        <Label htmlFor="division">Division</Label>
                                        <Input
                                            id="division"
                                            value={hierarchy.division.name}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                )}
                                {hierarchy.department && (
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Input
                                            id="department"
                                            value={hierarchy.department.name}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                )}
                                {hierarchy.team && (
                                    <div className="space-y-2">
                                        <Label htmlFor="team">Team</Label>
                                        <Input
                                            id="team"
                                            value={hierarchy.team.name}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="directManager">Direct Manager</Label>
                                    <Input
                                        id="directManager"
                                        value={directManager?.incumbentName || "—"}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                {directReports.length > 0 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="directReports">Direct Reports</Label>
                                        <Input
                                            id="directReports"
                                            value={`${directReports.length} position(s): ${directReports.map(p => p.title).join(", ")}`}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Employee ID Input */}
                        {selectedPosition && (
                            <div className="mt-4 pt-4 border-t space-y-2">
                                <Label htmlFor="employeeCode">Employee ID *</Label>
                                <Input
                                    id="employeeCode"
                                    value={employeeCode}
                                    onChange={(e) => setEmployeeCode(e.target.value)}
                                    placeholder="e.g. EMP-001"
                                    className={cn(!isEmployeeCodeUnique && employeeCode && "border-destructive focus-visible:ring-destructive")}
                                />
                                {!isEmployeeCodeUnique && employeeCode && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        This Employee ID is already taken.
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Unique identifier for this employee.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 2: Identity Verification */}
                <Card
                    className={cn(
                        "border-2",
                        !isSection1Valid && "opacity-50 pointer-events-none",
                        isSection2Valid && "border-success/50"
                    )}
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold",
                                        isSection2Valid
                                            ? "bg-success text-success-foreground"
                                            : isSection1Valid
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary text-secondary-foreground"
                                    )}
                                >
                                    {isSection2Valid ? <CheckCircle2 className="h-6 w-6" /> : "2"}
                                </div>
                                <div>
                                    <CardTitle>Identity Verification</CardTitle>
                                    <CardDescription>Upload ID card for OCR extraction</CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* File Uploads */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>ID Card Front</Label>
                                <input
                                    ref={idFrontInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setIdFrontFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                {idFrontFile ? (
                                    <div className="flex items-center gap-2 rounded-md border border-border bg-input p-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <span className="flex-1 truncate text-sm">{idFrontFile.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setIdFrontFile(null)
                                                setExtractedData(null)
                                                if (idFrontInputRef.current) idFrontInputRef.current.value = ""
                                            }}
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => idFrontInputRef.current?.click()}
                                        className="w-full justify-center gap-2 border-dashed"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Front
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>ID Card Back</Label>
                                <input
                                    ref={idBackInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setIdBackFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                />
                                {idBackFile ? (
                                    <div className="flex items-center gap-2 rounded-md border border-border bg-input p-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <span className="flex-1 truncate text-sm">{idBackFile.name}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setIdBackFile(null)
                                                setExtractedData(null)
                                                if (idBackInputRef.current) idBackInputRef.current.value = ""
                                            }}
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => idBackInputRef.current?.click()}
                                        className="w-full justify-center gap-2 border-dashed"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload Back
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* OCR Processing */}
                        {isExtracting && (
                            <Alert>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <AlertDescription>Extracting data from ID card...</AlertDescription>
                            </Alert>
                        )}

                        {/* Extracted Data Review */}
                        {extractedData && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={extractedData.lastName}
                                        onChange={(e) => setExtractedData({ ...extractedData, lastName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={extractedData.firstName}
                                        onChange={(e) => setExtractedData({ ...extractedData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={extractedData.dateOfBirth}
                                        onChange={(e) => setExtractedData({ ...extractedData, dateOfBirth: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        value={extractedData.gender}
                                        onValueChange={(v) => setExtractedData({ ...extractedData, gender: v })}
                                    >
                                        <SelectTrigger id="gender">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <Input
                                        id="nationality"
                                        value={extractedData.nationality}
                                        onChange={(e) => setExtractedData({ ...extractedData, nationality: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="idNumber">ID Number</Label>
                                    <Input
                                        id="idNumber"
                                        value={extractedData.idNumber}
                                        onChange={(e) => setExtractedData({ ...extractedData, idNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="issueDate">Issue Date</Label>
                                    <Input
                                        id="issueDate"
                                        type="date"
                                        value={extractedData.issueDate}
                                        onChange={(e) => setExtractedData({ ...extractedData, issueDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="issuePlace">Issue Place</Label>
                                    <Input
                                        id="issuePlace"
                                        value={extractedData.issuePlace}
                                        onChange={(e) => setExtractedData({ ...extractedData, issuePlace: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={extractedData.address}
                                        onChange={(e) => setExtractedData({ ...extractedData, address: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="workEmail">Work Email (Auto-generated)</Label>
                                    <Input
                                        id="workEmail"
                                        value={extractedData.workEmail}
                                        onChange={(e) => setExtractedData({ ...extractedData, workEmail: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="personalEmail">Personal Email (Required)</Label>
                                    <Input
                                        id="personalEmail"
                                        value={extractedData.personalEmail}
                                        onChange={(e) => setExtractedData({ ...extractedData, personalEmail: e.target.value })}
                                        placeholder="e.g. employee@gmail.com"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 3: Contract Settings */}
                <Card
                    className={cn(
                        "border-2",
                        !isSection1Valid || !isSection2Valid ? "opacity-50 pointer-events-none" : "",
                        isSection3Valid && "border-success/50"
                    )}
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold",
                                        isSection3Valid
                                            ? "bg-success text-success-foreground"
                                            : isSection1Valid && isSection2Valid
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary text-secondary-foreground"
                                    )}
                                >
                                    {isSection3Valid ? <CheckCircle2 className="h-6 w-6" /> : "3"}
                                </div>
                                <div>
                                    <CardTitle>Contract Settings</CardTitle>
                                    <CardDescription>Enter contract details and upload contract file</CardDescription>
                                </div>
                            </div>
                            {!isSection1Valid || !isSection2Valid ? (
                                <Badge variant="secondary" className="gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Locked
                                </Badge>
                            ) : isSection3Valid ? (
                                <Badge variant="default" className="gap-1 bg-success">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Complete
                                </Badge>
                            ) : null}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isSection1Valid && isSection2Valid && (
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="contractNumber">Contract Number *</Label>
                                        <Input
                                            id="contractNumber"
                                            value={contractNumber}
                                            onChange={(e) => setContractNumber(e.target.value)}
                                            placeholder="e.g. CT-2024-001"
                                            className={cn(!isContractNumberUnique && contractNumber && "border-destructive focus-visible:ring-destructive")}
                                        />
                                        {!isContractNumberUnique && contractNumber && (
                                            <p className="text-xs text-destructive flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                This Contract Number is already taken.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contractType">Contract Type *</Label>
                                        <Select value={contractType} onValueChange={setContractType}>
                                            <SelectTrigger id="contractType">
                                                <SelectValue placeholder="Select contract type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full-time">Full-time Employee</SelectItem>
                                                <SelectItem value="part-time">Part-time Employee</SelectItem>
                                                <SelectItem value="contract">Fixed-term Contract</SelectItem>
                                                <SelectItem value="internship">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contractStartDate">Start Date *</Label>
                                        <Input
                                            id="contractStartDate"
                                            type="date"
                                            value={contractStartDate}
                                            onChange={(e) => setContractStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contractEndDate">End Date *</Label>
                                        <Input
                                            id="contractEndDate"
                                            type="date"
                                            value={contractEndDate}
                                            onChange={(e) => setContractEndDate(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            For permanent contracts, set a far future date
                                        </p>
                                    </div>
                                </div>

                                {/* Contract File Upload */}
                                <div className="space-y-2">
                                    <Label>Contract File *</Label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            ref={contractFileInputRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) setContractFile(file)
                                            }}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => contractFileInputRef.current?.click()}
                                            className="gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {contractFile ? "Change File" : "Upload Contract"}
                                        </Button>
                                        {contractFile && (
                                            <div className="flex items-center gap-2 rounded-md border px-3 py-2 flex-1">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm flex-1 truncate">{contractFile.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {(contractFile.size / 1024).toFixed(1)} KB
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setContractFile(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Accepted formats: PDF, DOC, DOCX
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 4: Account Provisioning */}
                <Card
                    className={cn(
                        "border-2",
                        !isSection1Valid || !isSection2Valid || !isSection3Valid ? "opacity-50 pointer-events-none" : "",
                        provisioningStage === "complete" && "border-success/50"
                    )}
                >
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold",
                                        provisioningStage === "complete"
                                            ? "bg-success text-success-foreground"
                                            : isSection1Valid && isSection2Valid && isSection3Valid
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary text-secondary-foreground"
                                    )}
                                >
                                    {provisioningStage === "complete" ? <CheckCircle2 className="h-6 w-6" /> : "4"}
                                </div>
                                <div>
                                    <CardTitle>Account Provisioning</CardTitle>
                                    <CardDescription>Create Google Workspace account and send credentials</CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    A work account and profile will be created.
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={handleStartProvisioning}
                                disabled={!isSection1Valid || !isSection2Valid}
                                className="w-full"
                                size="lg"
                            >
                                <User className="mr-2 h-5 w-5" />
                                Create Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Provisioning Modal */}
            <Dialog open={showProvisioningModal} onOpenChange={(open) => {
                if (!open && provisioningStage === "complete") {
                    setShowProvisioningModal(false)
                }
            }}>
                <DialogContent onInteractOutside={(e) => {
                    if (provisioningStage !== "complete") {
                        e.preventDefault()
                    }
                }}>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            {provisioningStage === "complete" ? (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/20">
                                    <CheckCircle2 className="h-6 w-6 text-success" />
                                </div>
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                </div>
                            )}
                            <div>
                                <DialogTitle>{provisioningStage === "complete" ? "Account Created Successfully!" : "Provisioning Account..."}</DialogTitle>
                                <DialogDescription>
                                    {provisioningStage === "complete"
                                        ? "Credential has been sent to employee's personal email."
                                        : "Please wait while we set up the employee's account."}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Progress State */}
                    {provisioningStage !== "complete" && (
                        <div className="space-y-6 py-4">
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full border-4 border-muted"></div>
                                    <div
                                        className="absolute top-0 left-0 h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin"
                                        style={{
                                            background: `conic-gradient(from 0deg, hsl(var(--primary)) ${progress}%, transparent ${progress}%)`,
                                            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)",
                                            mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), #000 0)",
                                        }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-primary">{progress}%</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-lg font-medium text-center">
                                    {provisioningStage === "creating-email"
                                        ? "Creating Google Workspace Email..."
                                        : "Sending Credentials to User..."}
                                </p>
                            </div>
                            <Button onClick={handleCancelProvisioning} variant="destructive" className="w-full">
                                Cancel
                            </Button>
                        </div>
                    )}

                    {/* Success State */}
                    {provisioningStage === "complete" && generatedCredentials && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Company Email</Label>
                                    <p className="font-mono text-sm font-medium">{generatedCredentials.email}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                                    <p className="font-mono text-sm font-medium">{generatedCredentials.tempPassword}</p>
                                </div>
                            </div>
                            <Button onClick={handleSuccessClose} className="w-full">
                                Go to Employee
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout >
    )
}
