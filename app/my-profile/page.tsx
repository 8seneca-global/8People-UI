"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { useStore } from "@/lib/store"
import { Pencil, Save, X, Calendar, HelpCircle, FileText, Download } from "lucide-react"
import type { Employee, OrganizationalUnit, EmployeeContract } from "@/lib/mock-data"

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"]
const maritalStatusOptions = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"]

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


function MyProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { employees, organizationalUnits, currentRole, updateEmployee, updateEmployeeSelfService } = useStore()

  // Determine the current employee ID based on the simulated role
  // 'admin' -> P-001, 'hr' -> P-003, 'employee' -> P-011
  const currentEmployeeId =
    currentRole === 'admin' ? 'P-001' :
      currentRole === 'hr' ? 'P-003' :
        'P-011';

  const employee = employees.find((e) => e.id === currentEmployeeId)

  const [activeTab, setActiveTab] = useState("personal")
  const [formData, setFormData] = useState<Partial<Employee>>({})
  const [isEditingPersonal, setIsEditingPersonal] = useState(false)

  useEffect(() => {
    if (employee) {
      setFormData(employee)
    }
  }, [employee])

  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditingPersonal(true)
      setActiveTab("personal") // Ensure we are on the personal tab
    }
  }, [searchParams])

  if (!employee) {
    return (
      <AdminLayout title="Profile Not Found" subtitle="">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
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

  const handleSavePersonal = () => {
    if (formData.id) {
      // In a real self-service scenario, some fields might need approval.
      // For this simulation, we'll update directly using the store method.
      updateEmployee(formData.id, formData)

      // Mark onboarding step as complete
      useStore.getState().completeOnboardingStep('personalInfo')

      setIsEditingPersonal(false)
      // Optional: remove query param after save
      router.replace("/my-profile")
    }
  }

  const handleCancelPersonal = () => {
    setFormData(employee)
    setIsEditingPersonal(false)
    router.replace("/my-profile")
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
          <BreadcrumbLink href="/" className="cursor-pointer hover:text-foreground transition-colors">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">My Profile</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )

  return (
    <TooltipProvider>
      <AdminLayout title="" subtitle="" breadcrumb={breadcrumbNav}>
        <div className="space-y-6">
          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
            {/* Left Column - Work Information Card */}
            <Card className="h-fit sticky top-6">
              <CardContent className="p-6 space-y-6">
                {/* Profile Photo & Name */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary font-semibold">
                      {getInitials(formData.fullName || "")}
                    </AvatarFallback>
                  </Avatar>

                  <h2 className="text-xl font-bold text-foreground">{formData.fullName}</h2>
                </div>

                <Separator />

                {/* Group 1: Employee ID, Company Email */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Employee ID
                    </Label>
                    <p className="text-sm text-foreground">{formData.employeeId || "—"}</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Company Email
                    </Label>
                    <p className="text-sm text-foreground">
                      {formData.companyEmail}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Client
                    </Label>
                    <p className="text-sm text-foreground">{formData.client || "—"}</p>
                  </div>
                </div>

                <Separator />

                {/* Group 2: Position, Division/Department/Team, Direct Manager */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Position</Label>
                    <p className="text-sm text-foreground">{formData.positionTitle || "—"}</p>
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
                      <Label className="text-xs font-medium text-muted-foreground">
                        Start Date
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs">The date when you officially joined the company (Onboarding Day).</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-foreground">{formatDate(formData.companyJoinDate)}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
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
                    <p className="text-sm text-foreground">{formatDate(formData.officialStartDate)}</p>
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
                            Calculated from the Start Date.
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
                  {currentRole !== 'employee' && (
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  )}
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
                                  if (!education[0]) education[0] = { institution: "", fieldOfStudy: "", degree: "", graduationYear: "" } as any;
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
                                  if (!education[0]) education[0] = { institution: "", fieldOfStudy: "", degree: "", graduationYear: "" } as any;
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
                                  if (!education[0]) education[0] = { institution: "", fieldOfStudy: "", degree: "", graduationYear: "" } as any;
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
                                {/* Card Header */}
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
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Contract Number
                                    </Label>
                                    <p className="text-sm text-foreground">{contract.contractNumber}</p>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Status
                                    </Label>
                                    <p className="text-sm text-foreground capitalize">{contract.status}</p>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Contract Type
                                    </Label>
                                    <p className="text-sm text-foreground">{contract.contractType}</p>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      Start Date
                                    </Label>
                                    <p className="text-sm text-foreground">{formatDate(contract.startDate)}</p>
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-muted-foreground">
                                      End Date
                                    </Label>
                                    <p className="text-sm text-foreground">{formatDate(contract.endDate)}</p>
                                  </div>
                                </div>

                                {/* File Attachment Section */}
                                <Separator />
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium text-muted-foreground">Contract File</Label>
                                  {contract.fileUrl ? (
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                          {contract.fileName || "contract.pdf"}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => window.open(contract.fileUrl, '_blank')} aria-label="Download contract file">
                                          <Download className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed">
                                      <p className="text-sm text-muted-foreground">No file attached</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">No contracts found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transactions Tab */}
                {currentRole !== 'employee' && (
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
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </AdminLayout >
    </TooltipProvider >
  )
}

export default function MyProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyProfileContent />
    </Suspense>
  )
}
