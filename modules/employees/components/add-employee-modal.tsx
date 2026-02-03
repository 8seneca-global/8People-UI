"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/modules/core/components/ui/dialog"
import { Button } from "@/modules/core/components/ui/button"
import { Input } from "@/modules/core/components/ui/input"
import { Label } from "@/modules/core/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/core/components/ui/select"
import { useStore } from "@/lib/store"
import { Check, ChevronLeft, ChevronRight, Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddEmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const steps = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Organization" },
  { id: 3, name: "Review" },
]

export function AddEmployeeModal({ open, onOpenChange }: AddEmployeeModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    nationalIdNumber: "",
    nationalIdIssueDate: "",
    nationalIdIssuePlace: "",
    citizenshipIdFile: null as File | null,
    positionId: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { organizationalUnits, jobClassifications, positions, addEmployee, updatePosition } = useStore()

  const availablePositions = positions.filter(
    (p) => (p.hiringStatus === "vacant" || p.hiringStatus === "hiring") && p.status === "active",
  )

  const selectedPosition = positions.find((p) => p.id === formData.positionId)
  const selectedOrgUnit = selectedPosition
    ? organizationalUnits.find((u) => u.id === selectedPosition.organizationalUnitId)
    : null
  const selectedJobClass = selectedPosition
    ? jobClassifications.find((j) => j.id === selectedPosition.jobClassificationId)
    : null

  const companyEmail =
    formData.firstName && formData.lastName
      ? `${formData.lastName.toLowerCase().replace(/\s+/g, "")}.${formData.firstName.toLowerCase()}@8seneca.com`
      : ""

  const generateEmployeeCode = () => {
    const timestamp = Date.now().toString().slice(-4)
    return `P-${timestamp}`
  }

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, citizenshipIdFile: file })
    }
  }

  const handleRemoveFile = () => {
    setFormData({ ...formData, citizenshipIdFile: null })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = () => {
    if (!selectedPosition || !selectedOrgUnit || !selectedJobClass) return

    const employeeCode = generateEmployeeCode()
    const employeeId = `P-${Date.now()}`

    const parentPosition = selectedPosition.parentPositionId
      ? positions.find((p) => p.id === selectedPosition.parentPositionId)
      : null

    addEmployee({
      code: employeeCode,
      fullName: `${formData.lastName} ${formData.firstName}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      personalEmail: formData.personalEmail,
      companyEmail,
      positionId: selectedPosition.id,
      positionCode: selectedPosition.code,
      positionTitle: selectedPosition.title,
      jobClassificationId: selectedJobClass.id,
      jobClassificationTitle: selectedJobClass.title,
      organizationalUnitId: selectedOrgUnit.id,
      organizationalUnitName: selectedOrgUnit.name,
      costCenter: selectedPosition.costCenter || selectedOrgUnit.costCenter,
      lineManagerId: parentPosition?.incumbentId,
      lineManagerName: parentPosition?.incumbentName,
      status: "pending",
      onboardingStatus: {
        emailSent: false,
        accountActivated: false,
        profileCompleted: false,
      },
      startDate: new Date().toISOString().split("T")[0],
      fte: selectedPosition.fte,
      nationalIdNumber: formData.nationalIdNumber,
      nationalIdIssueDate: formData.nationalIdIssueDate,
      nationalIdIssuePlace: formData.nationalIdIssuePlace,
    })

    updatePosition(selectedPosition.id, {
      hiringStatus: "filled",
      incumbentId: employeeId,
      incumbentName: `${formData.lastName} ${formData.firstName}`,
    })

    setFormData({
      firstName: "",
      lastName: "",
      personalEmail: "",
      nationalIdNumber: "",
      nationalIdIssueDate: "",
      nationalIdIssuePlace: "",
      citizenshipIdFile: null,
      positionId: "",
    })
    setCurrentStep(1)
    onOpenChange(false)
  }

  const isStep1Valid = formData.firstName && formData.lastName && formData.personalEmail
  const isStep2Valid = formData.positionId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Add New Employee</DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-between px-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">{step.name}</span>
              </div>
              {index < steps.length - 1 && <div className="mx-4 h-px w-12 bg-border" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[420px] py-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-card-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Nguyen Van"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-card-foreground">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="An"
                    className="bg-input border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalEmail" className="text-card-foreground">
                  Personal Email
                </Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  placeholder="an.nguyen@gmail.com"
                  className="bg-input border-border"
                />
              </div>
              {companyEmail && (
                <div className="rounded-lg border border-border bg-secondary/50 p-3">
                  <p className="text-xs text-muted-foreground">Company Email (auto-generated)</p>
                  <p className="font-mono text-sm text-primary">{companyEmail}</p>
                </div>
              )}

              <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
                <Label className="text-card-foreground font-medium">National ID / Passport</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">Upload ID Card Image</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {formData.citizenshipIdFile ? (
                      <div className="flex items-center gap-2 rounded-md border border-border bg-input p-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="flex-1 truncate text-sm text-card-foreground">
                          {formData.citizenshipIdFile.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full justify-center gap-2 border-dashed"
                      >
                        <Upload className="h-4 w-4" />
                        Upload ID Card
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">National ID / Passport Number</Label>
                    <Input
                      value={formData.nationalIdNumber}
                      onChange={(e) => setFormData({ ...formData, nationalIdNumber: e.target.value })}
                      placeholder="e.g., 079123456789"
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Issue Date</Label>
                      <Input
                        type="date"
                        value={formData.nationalIdIssueDate}
                        onChange={(e) => setFormData({ ...formData, nationalIdIssueDate: e.target.value })}
                        className="w-full bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-xs">Issue Place</Label>
                      <Input
                        value={formData.nationalIdIssuePlace}
                        onChange={(e) => setFormData({ ...formData, nationalIdIssuePlace: e.target.value })}
                        placeholder="Cục trưởng cục cảnh sát..."
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="positionId" className="text-card-foreground">
                  Select Position (S)
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Only vacant or hiring positions are shown. Position determines Org Unit and Job Classification.
                </p>
                <Select value={formData.positionId} onValueChange={(v) => setFormData({ ...formData, positionId: v })}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePositions.length === 0 ? (
                      <div className="p-3 text-center text-sm text-muted-foreground">No vacant positions available</div>
                    ) : (
                      availablePositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          <div className="flex flex-col">
                            <span>
                              {pos.title} ({pos.code})
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {pos.organizationalUnitName} • {pos.jobClassificationTitle}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedPosition && (
                <div className="space-y-4 rounded-lg border border-border bg-secondary/30 p-4">
                  <h4 className="font-medium text-card-foreground">Position Details (Auto-filled)</h4>
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position Code</span>
                      <span className="font-mono text-card-foreground">{selectedPosition.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Org Unit (O)</span>
                      <span className="text-card-foreground">{selectedOrgUnit?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Job Classification (C)</span>
                      <span className="text-card-foreground">{selectedJobClass?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reports To</span>
                      <span className="text-card-foreground">{selectedPosition.parentPositionTitle || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost Center</span>
                      <span className="text-card-foreground">
                        {selectedPosition.costCenter || selectedOrgUnit?.costCenter || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">FTE</span>
                      <span className="text-card-foreground">{selectedPosition.fte}</span>
                    </div>
                    {selectedPosition.workMode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Work Mode</span>
                        <span className="text-card-foreground capitalize">{selectedPosition.workMode}</span>
                      </div>
                    )}
                    {selectedPosition.officeLocation && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Office Location</span>
                        <span className="text-card-foreground">{selectedPosition.officeLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="font-medium text-card-foreground mb-3">Personal Information (P)</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Name</span>
                    <span className="text-card-foreground">
                      {formData.lastName} {formData.firstName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Personal Email</span>
                    <span className="text-card-foreground">{formData.personalEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company Email</span>
                    <span className="text-primary font-mono">{companyEmail}</span>
                  </div>
                  {formData.nationalIdNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">National ID</span>
                      <span className="text-card-foreground">{formData.nationalIdNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedPosition && (
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <h4 className="font-medium text-card-foreground mb-3">Organization Assignment</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position (S)</span>
                      <span className="text-card-foreground">{selectedPosition.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Org Unit (O)</span>
                      <span className="text-card-foreground">{selectedOrgUnit?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Job Classification (C)</span>
                      <span className="text-card-foreground">{selectedJobClass?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reports To</span>
                      <span className="text-card-foreground">{selectedPosition.parentPositionTitle || "—"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
                <p className="text-sm text-warning">
                  After creation, an onboarding email will be sent to {formData.personalEmail} with instructions to
                  activate their account.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={currentStep === 1 ? !isStep1Valid : !isStep2Valid}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!isStep1Valid || !isStep2Valid}>
              Create Employee
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
