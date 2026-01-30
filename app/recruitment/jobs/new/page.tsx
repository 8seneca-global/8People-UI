"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { WizardStepper } from "@/components/recruitment/wizard-stepper"
import { PlatformConfigurator, type PlatformConfig } from "@/components/recruitment/platform-config"
import { PositionSelector } from "@/components/recruitment/position-selector"
import { ArrowLeft, ArrowRight, Save, ChevronRight, Building2 } from "lucide-react"
import { buildHierarchyChain } from "@/lib/hierarchy-utils"
import type { JobRequisition } from "@/lib/mock-data"

const WIZARD_STEPS = [
    { id: 1, label: "Job Overview", description: "Position & Type" },
    { id: 2, label: "Job Detail", description: "Description & Requirements" },
    { id: 3, label: "Job Settings", description: "Publishing & Dates" },
]

const publishPlatformOptions = [
    { id: "topcv", label: "TopCV" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "landing_page", label: "Landing Page" },
    { id: "vietnamworks", label: "VietnamWorks" },
    { id: "itviec", label: "ITviec" },
    { id: "facebook", label: "Facebook Jobs" },
]

interface FormData {
    // Step 1
    positionId: string
    jobTitle: string
    organizationalUnitId: string
    organizationalUnitName: string
    employmentType: JobRequisition["employmentType"]

    // Step 2
    description: string
    requirements: string
    openings: number
    salaryMin: string
    salaryMax: string
    salaryHidden: boolean

    // Step 3
    closingDate: string
    platformConfigs: PlatformConfig[]
    jobClassificationId: string
    status: JobRequisition["status"]
}

export default function NewJobWizardPage() {
    const router = useRouter()
    const { positions, organizationalUnits, jobClassifications, addJobRequisition } = useStore()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<FormData>({
        positionId: "",
        jobTitle: "",
        organizationalUnitId: "",
        organizationalUnitName: "",
        employmentType: "full-time",
        description: "",
        requirements: "",
        openings: 1,
        salaryMin: "",
        salaryMax: "",
        salaryHidden: false,
        closingDate: "",
        platformConfigs: [],
        jobClassificationId: "",
        status: "draft",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    // Handle position selection - auto-populate job title and org unit
    const handlePositionSelect = (positionId: string) => {
        const position = positions.find((p) => p.id === positionId)
        if (!position) return

        setFormData((prev) => ({
            ...prev,
            positionId,
            jobTitle: position.title,
            organizationalUnitId: position.organizationalUnitId,
            organizationalUnitName: position.organizationalUnitName,
            jobClassificationId: position.jobClassificationId || "",
        }))
        setErrors((prev) => ({ ...prev, positionId: "" }))
    }

    // Get hierarchy for display
    const hierarchy = formData.organizationalUnitId
        ? buildHierarchyChain(formData.organizationalUnitId, organizationalUnits).reverse()
        : []

    // Validation
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        if (step === 1) {
            if (!formData.positionId) newErrors.positionId = "Position is required"
            if (!formData.employmentType) newErrors.employmentType = "Employment type is required"
        }

        if (step === 2) {
            if (!formData.description.trim()) newErrors.description = "Job description is required"
            if (!formData.requirements.trim()) newErrors.requirements = "Requirements are required"
            if (formData.openings < 1) newErrors.openings = "At least 1 opening is required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Navigation
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 3))
        }
    }

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const handleCancel = () => {
        router.push("/recruitment/jobs")
    }

    // Submit handlers
    const handleSaveAsDraft = () => {
        if (!validateStep(1)) return // At minimum, need Step 1 data

        submitJob("draft")
    }

    const handleSubmit = () => {
        if (!validateStep(1) || !validateStep(2)) return

        submitJob(formData.status)
    }

    const submitJob = (status: JobRequisition["status"]) => {
        const jobClass = jobClassifications.find((j) => j.id === formData.jobClassificationId)

        const newJobId = addJobRequisition({
            title: formData.jobTitle,
            positionId: formData.positionId,
            organizationalUnitId: formData.organizationalUnitId,
            organizationalUnitName: formData.organizationalUnitName,
            jobClassificationId: formData.jobClassificationId || undefined,
            jobClassificationTitle: jobClass?.title || "",
            description: formData.description,
            requirements: formData.requirements.split("\n").filter((r) => r.trim()),
            employmentType: formData.employmentType,
            status,
            openings: formData.openings,
            hired: 0,
            createdBy: "P-003",
            salaryRange:
                formData.salaryMin && formData.salaryMax && !formData.salaryHidden
                    ? {
                        min: Number.parseInt(formData.salaryMin),
                        max: Number.parseInt(formData.salaryMax),
                        currency: "VND",
                    }
                    : undefined,
            salaryHidden: formData.salaryHidden,
            closingDate: formData.closingDate || undefined,
            publishPlatforms: formData.platformConfigs
                .filter((p) => p.enabled)
                .map((p) => p.id),
            // TODO: Store platform configs in job data for screening questions
        })

        router.push(`/recruitment/jobs/${newJobId}`)
    }

    // Platform configuration is now handled by PlatformConfigurator component

    return (
        <AdminLayout title="Create New Job" subtitle="Add a new job requisition to your recruitment pipeline">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Stepper */}
                <WizardStepper steps={WIZARD_STEPS} currentStep={currentStep} />

                {/* Step 1: Job Overview */}
                {currentStep === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Overview</CardTitle>
                            <CardDescription>Select the position and define basic job information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Position Selector */}
                            <div className="space-y-2">
                                <Label htmlFor="position">
                                    Position <span className="text-destructive">*</span>
                                </Label>
                                <PositionSelector
                                    positions={positions}
                                    organizationalUnits={organizationalUnits}
                                    value={formData.positionId}
                                    onValueChange={handlePositionSelect}
                                    placeholder="Search and select a position..."
                                />
                                {errors.positionId && <p className="text-sm text-destructive">{errors.positionId}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Select the position from your organization chart that you're hiring for
                                </p>
                            </div>

                            {/* Job Title (Auto-populated) */}
                            {formData.positionId && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">Job Title</Label>
                                        <Input
                                            id="jobTitle"
                                            value={formData.jobTitle}
                                            disabled
                                            className="bg-muted cursor-not-allowed"
                                        />
                                        <p className="text-xs text-muted-foreground">Auto-populated from selected position</p>
                                    </div>

                                    {/* Parent Unit Hierarchy */}
                                    <div className="space-y-2">
                                        <Label>Parent Unit Hierarchy</Label>
                                        <div className="bg-muted/50 p-3 rounded-md border border-border">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                                {hierarchy.map((unit, index) => (
                                                    <div key={unit.id} className="flex items-center gap-2">
                                                        {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                                                        <span
                                                            className={
                                                                index === hierarchy.length - 1
                                                                    ? "font-medium text-foreground"
                                                                    : "text-muted-foreground"
                                                            }
                                                        >
                                                            {unit.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Organizational hierarchy from top level to position's unit
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Employment Type */}
                            <div className="space-y-2">
                                <Label htmlFor="employmentType">
                                    Employment Type <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.employmentType}
                                    onValueChange={(v: JobRequisition["employmentType"]) =>
                                        setFormData({ ...formData, employmentType: v })
                                    }
                                >
                                    <SelectTrigger className="bg-input border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="intern">Intern</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.employmentType && <p className="text-sm text-destructive">{errors.employmentType}</p>}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Job Detail */}
                {currentStep === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Detail</CardTitle>
                            <CardDescription>Provide detailed job description and requirements</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Number of Openings */}
                            <div className="space-y-2">
                                <Label htmlFor="openings">
                                    Number of Openings <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="openings"
                                    type="number"
                                    min={1}
                                    value={formData.openings}
                                    onChange={(e) => setFormData({ ...formData, openings: Number.parseInt(e.target.value) || 1 })}
                                    className="bg-input border-border"
                                />
                                {errors.openings && <p className="text-sm text-destructive">{errors.openings}</p>}
                            </div>

                            {/* Job Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Job Description <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-input border-border min-h-[200px]"
                                    placeholder="Describe the role, responsibilities, what you offer, and company culture..."
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            {/* Requirements */}
                            <div className="space-y-2">
                                <Label htmlFor="requirements">
                                    Requirements (one per line) <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="requirements"
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    className="bg-input border-border min-h-[150px]"
                                    placeholder="3+ years experience&#10;React/Next.js proficiency&#10;Strong communication skills&#10;Bachelor's degree in CS or related field"
                                />
                                {errors.requirements && <p className="text-sm text-destructive">{errors.requirements}</p>}
                            </div>

                            {/* Salary Range */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Salary Range</Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="salaryHidden"
                                            checked={formData.salaryHidden}
                                            onCheckedChange={(checked) => setFormData({ ...formData, salaryHidden: checked === true })}
                                        />
                                        <Label htmlFor="salaryHidden" className="text-sm font-normal cursor-pointer">
                                            Hide salary (Negotiable/Deal)
                                        </Label>
                                    </div>
                                </div>
                                {!formData.salaryHidden && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="salaryMin">Min (VND)</Label>
                                            <Input
                                                id="salaryMin"
                                                type="number"
                                                value={formData.salaryMin}
                                                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                                className="bg-input border-border"
                                                placeholder="15000000"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="salaryMax">Max (VND)</Label>
                                            <Input
                                                id="salaryMax"
                                                type="number"
                                                value={formData.salaryMax}
                                                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                                className="bg-input border-border"
                                                placeholder="25000000"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: Job Settings */}
                {currentStep === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Settings</CardTitle>
                            <CardDescription>Configure publishing platforms and additional settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Job Classification */}
                            <div className="space-y-2">
                                <Label htmlFor="jobClass">Job Classification (Optional)</Label>
                                <Select
                                    value={formData.jobClassificationId}
                                    onValueChange={(v) => setFormData({ ...formData, jobClassificationId: v })}
                                >
                                    <SelectTrigger className="bg-input border-border">
                                        <SelectValue placeholder="Select job classification" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobClassifications.map((job) => (
                                            <SelectItem key={job.id} value={job.id}>
                                                {job.title} ({job.jobLevel})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Closing Date */}
                            <div className="space-y-2">
                                <Label htmlFor="closing">Closing Date</Label>
                                <Input
                                    id="closing"
                                    type="date"
                                    value={formData.closingDate}
                                    onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                                    className="bg-input border-border"
                                />
                            </div>

                            {/* Platform Configuration */}
                            <div className="space-y-2">
                                <Label>Publishing Platforms</Label>
                                <p className="text-xs text-muted-foreground mb-3">
                                    Configure where to publish this job and set up screening questions
                                </p>
                                <PlatformConfigurator
                                    value={formData.platformConfigs}
                                    onChange={(configs) => setFormData({ ...formData, platformConfigs: configs })}
                                />
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Initial Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(v: JobRequisition["status"]) => setFormData({ ...formData, status: v })}
                                >
                                    <SelectTrigger className="bg-input border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Draft jobs are not visible to candidates. Open jobs are published and accepting applications.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={handleCancel} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Cancel
                    </Button>

                    <div className="flex items-center gap-2">
                        {currentStep > 1 && (
                            <Button variant="outline" onClick={handlePrevious} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </Button>
                        )}

                        {currentStep < 3 && (
                            <>
                                <Button variant="outline" onClick={handleSaveAsDraft} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    Save as Draft
                                </Button>
                                <Button onClick={handleNext} className="gap-2">
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        {currentStep === 3 && (
                            <>
                                <Button variant="outline" onClick={handleSaveAsDraft} className="gap-2">
                                    <Save className="h-4 w-4" />
                                    Save as Draft
                                </Button>
                                <Button onClick={handleSubmit} className="gap-2">
                                    Submit Job
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
