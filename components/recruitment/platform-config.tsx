"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Linkedin, Globe, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Types
export interface ScreeningQuestion {
    id: string
    type: string
    label: string
    field?: string
    idealAnswer?: number
    mustHave: boolean
}

export interface ITViecSettings {
    jobType?: string
    topReasons: string[]
    jobExpertise?: string
    jobDomains: string[]
    jobLevels: string[]
    workingModel?: string
}

export interface PlatformConfig {
    id: "linkedin" | "itviec" | "website"
    name: string
    icon: React.ReactNode
    enabled: boolean
    screeningQuestions?: ScreeningQuestion[]
    itviecSettings?: ITViecSettings
    websiteSettings?: {
        applicationLink?: string
        useInternalForm: boolean
    }
}

interface PlatformConfiguratorProps {
    value: PlatformConfig[]
    onChange: (platforms: PlatformConfig[]) => void
}

const AVAILABLE_PLATFORMS = [
    { id: "linkedin" as const, name: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
    { id: "itviec" as const, name: "ITViec", icon: <Globe className="h-4 w-4" /> },
    { id: "website" as const, name: "Website", icon: <Globe className="h-4 w-4" /> },
]

const QUESTION_TEMPLATES = [
    { type: "background_check", label: "Background Check" },
    { type: "drivers_license", label: "Driver's License" },
    { type: "drug_test", label: "Drug Test" },
    { type: "education", label: "Education" },
    { type: "expertise", label: "Expertise with Skill" },
    { type: "hybrid_work", label: "Hybrid Work" },
    { type: "industry_experience", label: "Industry Experience" },
    { type: "language", label: "Language" },
    { type: "location", label: "Location" },
    { type: "onsite_work", label: "Onsite Work" },
    { type: "remote_work", label: "Remote Work" },
    { type: "visa_status", label: "Visa Status" },
    { type: "work_experience", label: "Work Experience" },
    { type: "custom", label: "Custom Question" },
]

const JOB_TYPES = [
    { value: "super_hot_ai", label: "Super Hot Job + AI Match (0 available)" },
    { value: "super_hot_plus", label: "Super Hot Job Plus (0 available)" },
    { value: "hot_job_plus", label: "Hot Job Plus (0 available)" },
    { value: "super_hot", label: "Super Hot Job (0 available)" },
    { value: "hot_job", label: "Hot Job (0 available)" },
    { value: "regular", label: "Regular Job (0 available)" },
]

const JOB_EXPERTISES = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "QA Engineer",
    "UI/UX Designer",
    "Product Manager",
    "Data Analyst",
    "Business Analyst",
]

const JOB_DOMAINS = [
    "E-commerce",
    "Fintech",
    "Healthcare",
    "Education",
    "Gaming",
    "Social Network",
    "Enterprise Software",
    "AI/ML",
    "Blockchain",
    "IoT",
]

const JOB_LEVELS = [
    { value: "fresher", label: "Fresher (0 - 10 months of experience)" },
    { value: "junior", label: "Junior (10 - 36 months of experience)" },
    { value: "senior", label: "Senior (37 - 60 months of experience)" },
    { value: "manager", label: "Manager (> 60 months of experience)" },
]

export function PlatformConfigurator({ value, onChange }: PlatformConfiguratorProps) {
    const [expandedPlatforms, setExpandedPlatforms] = useState<string[]>([])

    const availablePlatforms = AVAILABLE_PLATFORMS.filter(
        (p) => !value.find((v) => v.id === p.id)
    )

    const addPlatform = (platformId: "linkedin" | "itviec" | "website") => {
        const platform = AVAILABLE_PLATFORMS.find((p) => p.id === platformId)
        if (!platform) return

        const newPlatform: PlatformConfig = {
            id: platformId,
            name: platform.name,
            icon: platform.icon,
            enabled: true,
            ...(platformId === "website"
                ? { websiteSettings: { useInternalForm: false } }
                : platformId === "itviec"
                    ? {
                        itviecSettings: {
                            topReasons: ["", "", ""],
                            jobDomains: [],
                            jobLevels: [],
                        },
                    }
                    : { screeningQuestions: [] }),
        }

        onChange([...value, newPlatform])
        setExpandedPlatforms([...expandedPlatforms, platformId])
    }

    const removePlatform = (platformId: string) => {
        onChange(value.filter((p) => p.id !== platformId))
        setExpandedPlatforms(expandedPlatforms.filter((id) => id !== platformId))
    }

    const togglePlatform = (platformId: string, enabled: boolean) => {
        onChange(
            value.map((p) => (p.id === platformId ? { ...p, enabled } : p))
        )
    }

    const addQuestion = (platformId: string, template: typeof QUESTION_TEMPLATES[0]) => {
        onChange(
            value.map((p) => {
                if (p.id !== platformId || !p.screeningQuestions) return p

                const newQuestion: ScreeningQuestion = {
                    id: `${Date.now()}-${Math.random()}`,
                    type: template.type,
                    label: template.label,
                    field: template.type === "expertise" ? "" : undefined,
                    idealAnswer: template.type === "expertise" || template.type === "work_experience" ? 0 : undefined,
                    mustHave: false,
                }

                return {
                    ...p,
                    screeningQuestions: [...p.screeningQuestions, newQuestion],
                }
            })
        )
    }

    const updateQuestion = (platformId: string, questionId: string, updates: Partial<ScreeningQuestion>) => {
        onChange(
            value.map((p) => {
                if (p.id !== platformId || !p.screeningQuestions) return p

                return {
                    ...p,
                    screeningQuestions: p.screeningQuestions.map((q) =>
                        q.id === questionId ? { ...q, ...updates } : q
                    ),
                }
            })
        )
    }

    const removeQuestion = (platformId: string, questionId: string) => {
        onChange(
            value.map((p) => {
                if (p.id !== platformId || !p.screeningQuestions) return p

                return {
                    ...p,
                    screeningQuestions: p.screeningQuestions.filter((q) => q.id !== questionId),
                }
            })
        )
    }

    const updateITViecSettings = (platformId: string, updates: Partial<ITViecSettings>) => {
        onChange(
            value.map((p) => {
                if (p.id !== platformId || !p.itviecSettings) return p

                return {
                    ...p,
                    itviecSettings: { ...p.itviecSettings, ...updates },
                }
            })
        )
    }

    const updateTopReason = (platformId: string, index: number, text: string) => {
        onChange(
            value.map((p) => {
                if (p.id !== platformId || !p.itviecSettings) return p

                const newReasons = [...p.itviecSettings.topReasons]
                newReasons[index] = text

                return {
                    ...p,
                    itviecSettings: { ...p.itviecSettings, topReasons: newReasons },
                }
            })
        )
    }

    const toggleJobLevel = (platformId: string, level: string) => {
        onChange(
            value.map((p) => {
                if (p.id !== platformId || !p.itviecSettings) return p

                const levels = p.itviecSettings.jobLevels || []
                const newLevels = levels.includes(level)
                    ? levels.filter((l) => l !== level)
                    : [...levels, level]

                return {
                    ...p,
                    itviecSettings: { ...p.itviecSettings, jobLevels: newLevels },
                }
            })
        )
    }

    const toggleJobDomain = (platformId: string, domain: string) => {
        onChange(
            value.map((p) => {
                if (p.id !== platformId || !p.itviecSettings) return p

                const domains = p.itviecSettings.jobDomains || []
                const newDomains = domains.includes(domain)
                    ? domains.filter((d) => d !== domain)
                    : [...domains, domain]

                return {
                    ...p,
                    itviecSettings: { ...p.itviecSettings, jobDomains: newDomains },
                }
            })
        )
    }

    const updateWebsiteSettings = (platformId: string, updates: Partial<PlatformConfig["websiteSettings"]>) => {
        onChange(
            value.map((p) => {
                if (p.id !== platformId || !p.websiteSettings) return p

                return {
                    ...p,
                    websiteSettings: { ...p.websiteSettings, ...updates },
                }
            })
        )
    }

    return (
        <div className="space-y-4">
            {/* Add Platform Button */}
            <div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2" disabled={availablePlatforms.length === 0}>
                            <Plus className="h-4 w-4" />
                            Add Platform
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        {availablePlatforms.map((platform) => (
                            <DropdownMenuItem key={platform.id} onClick={() => addPlatform(platform.id)}>
                                <span className="flex items-center gap-2">
                                    {platform.icon}
                                    {platform.name}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Platform Cards */}
            {value.length > 0 ? (
                <Accordion
                    type="multiple"
                    value={expandedPlatforms}
                    onValueChange={setExpandedPlatforms}
                    className="space-y-3"
                >
                    {value.map((platform) => (
                        <AccordionItem key={platform.id} value={platform.id} className="border rounded-lg">
                            <Card className="border-0">
                                <AccordionTrigger className="hover:no-underline px-4 py-3">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <div className="flex items-center gap-3">
                                            {platform.icon}
                                            <span className="font-semibold">{platform.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={`toggle-${platform.id}`} className="text-sm cursor-pointer">
                                                    Publish
                                                </Label>
                                                <Switch
                                                    id={`toggle-${platform.id}`}
                                                    checked={platform.enabled}
                                                    onCheckedChange={(checked) => togglePlatform(platform.id, checked)}
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removePlatform(platform.id)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent>
                                    <CardContent className="pt-4 space-y-6">
                                        {/* LinkedIn: Screening Questions */}
                                        {platform.id === "linkedin" && (
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium mb-3">Screening questions</h4>

                                                    {/* Question List */}
                                                    {platform.screeningQuestions && platform.screeningQuestions.length > 0 && (
                                                        <div className="space-y-3 mb-4">
                                                            {platform.screeningQuestions.map((question) => (
                                                                <Card key={question.id} className="bg-muted/50">
                                                                    <CardContent className="p-4 space-y-3">
                                                                        <div className="flex items-start justify-between">
                                                                            <p className="text-sm font-medium">
                                                                                {question.type === "expertise"
                                                                                    ? `How many years of work experience do you have with ${question.field || "[Field]"}?`
                                                                                    : question.type === "work_experience"
                                                                                        ? "How many years of work experience do you currently have?"
                                                                                        : question.label}
                                                                            </p>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-6 w-6 -mt-1"
                                                                                onClick={() => removeQuestion(platform.id, question.id)}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>

                                                                        {(question.type === "expertise" || question.type === "work_experience") && (
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                {question.type === "expertise" && (
                                                                                    <div>
                                                                                        <Label className="text-xs">Field Name</Label>
                                                                                        <Input
                                                                                            placeholder="e.g., Java, Project Management"
                                                                                            value={question.field || ""}
                                                                                            onChange={(e) =>
                                                                                                updateQuestion(platform.id, question.id, { field: e.target.value })
                                                                                            }
                                                                                            className="h-8 text-sm"
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                                <div>
                                                                                    <Label className="text-xs">Ideal Answer (years)</Label>
                                                                                    <Input
                                                                                        type="number"
                                                                                        min={0}
                                                                                        placeholder="e.g., 3"
                                                                                        value={question.idealAnswer || ""}
                                                                                        onChange={(e) =>
                                                                                            updateQuestion(platform.id, question.id, {
                                                                                                idealAnswer: Number.parseInt(e.target.value) || 0,
                                                                                            })
                                                                                        }
                                                                                        className="h-8 text-sm"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="flex items-center gap-2">
                                                                            <Checkbox
                                                                                id={`must-have-${question.id}`}
                                                                                checked={question.mustHave}
                                                                                onCheckedChange={(checked) =>
                                                                                    updateQuestion(platform.id, question.id, { mustHave: checked === true })
                                                                                }
                                                                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                                            />
                                                                            <Label
                                                                                htmlFor={`must-have-${question.id}`}
                                                                                className="text-sm font-normal cursor-pointer flex items-center gap-1"
                                                                            >
                                                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                                Must-have qualification
                                                                            </Label>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Add Question Pills */}
                                                    <div>
                                                        <p className="text-sm text-muted-foreground mb-2">Add screening question:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {QUESTION_TEMPLATES.map((template) => {
                                                                const isAdded = platform.screeningQuestions?.some((q) => q.type === template.type)
                                                                return (
                                                                    <Button
                                                                        key={template.type}
                                                                        variant={isAdded ? "secondary" : "outline"}
                                                                        size="sm"
                                                                        className={cn(
                                                                            "h-8 text-xs",
                                                                            isAdded && "opacity-50 cursor-not-allowed"
                                                                        )}
                                                                        onClick={() => !isAdded && addQuestion(platform.id, template)}
                                                                        disabled={isAdded}
                                                                    >
                                                                        {isAdded && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                                        {template.label}
                                                                    </Button>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ITViec: Platform-Specific Configuration */}
                                        {platform.id === "itviec" && platform.itviecSettings && (
                                            <div className="space-y-6">
                                                {/* Job Type */}
                                                <div className="space-y-3">
                                                    <Label>Job Type *</Label>
                                                    <RadioGroup
                                                        value={platform.itviecSettings.jobType}
                                                        onValueChange={(value) => updateITViecSettings(platform.id, { jobType: value })}
                                                    >
                                                        {JOB_TYPES.map((type) => (
                                                            <div key={type.value} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={type.value} id={`${platform.id}-${type.value}`} />
                                                                <Label htmlFor={`${platform.id}-${type.value}`} className="font-normal cursor-pointer">
                                                                    {type.label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                </div>

                                                {/* Top 3 Reasons to Join Us */}
                                                <div className="space-y-3">
                                                    <Label>Top 3 Reasons to Join Us *</Label>
                                                    {platform.itviecSettings.topReasons.map((reason, index) => (
                                                        <div key={index} className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                                                    {index + 1}
                                                                </span>
                                                                <Input
                                                                    placeholder={`Reason ${index + 1}`}
                                                                    value={reason}
                                                                    onChange={(e) => updateTopReason(platform.id, index, e.target.value)}
                                                                    maxLength={50}
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground text-right">{reason.length}/50 characters</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Job Expertise */}
                                                <div className="space-y-2">
                                                    <Label>Job Expertise *</Label>
                                                    <Select
                                                        value={platform.itviecSettings.jobExpertise}
                                                        onValueChange={(value) => updateITViecSettings(platform.id, { jobExpertise: value })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a job expertise" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {JOB_EXPERTISES.map((expertise) => (
                                                                <SelectItem key={expertise} value={expertise}>
                                                                    {expertise}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Job Domain */}
                                                <div className="space-y-2">
                                                    <Label>Job Domain *</Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        {platform.itviecSettings.jobDomains.length}/5 domains
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {JOB_DOMAINS.map((domain) => {
                                                            const isSelected = platform.itviecSettings?.jobDomains.includes(domain)
                                                            const canSelect = (platform.itviecSettings?.jobDomains.length || 0) < 5
                                                            return (
                                                                <div key={domain} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`${platform.id}-domain-${domain}`}
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => toggleJobDomain(platform.id, domain)}
                                                                        disabled={!isSelected && !canSelect}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`${platform.id}-domain-${domain}`}
                                                                        className="text-sm font-normal cursor-pointer"
                                                                    >
                                                                        {domain}
                                                                    </Label>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Job Levels */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Job Levels *</Label>
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="h-auto p-0 text-xs"
                                                            onClick={() => {
                                                                const allSelected = JOB_LEVELS.every((level) =>
                                                                    platform.itviecSettings?.jobLevels.includes(level.value)
                                                                )
                                                                updateITViecSettings(platform.id, {
                                                                    jobLevels: allSelected ? [] : JOB_LEVELS.map((l) => l.value),
                                                                })
                                                            }}
                                                        >
                                                            Select all non-manager levels
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {JOB_LEVELS.map((level) => (
                                                            <div key={level.value} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`${platform.id}-level-${level.value}`}
                                                                    checked={platform.itviecSettings?.jobLevels.includes(level.value)}
                                                                    onCheckedChange={() => toggleJobLevel(platform.id, level.value)}
                                                                />
                                                                <Label
                                                                    htmlFor={`${platform.id}-level-${level.value}`}
                                                                    className="text-sm font-normal cursor-pointer"
                                                                >
                                                                    {level.label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Working Model */}
                                                <div className="space-y-3">
                                                    <Label>Working Model *</Label>
                                                    <RadioGroup
                                                        value={platform.itviecSettings.workingModel}
                                                        onValueChange={(value) => updateITViecSettings(platform.id, { workingModel: value })}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="office" id={`${platform.id}-office`} />
                                                            <Label htmlFor={`${platform.id}-office`} className="font-normal cursor-pointer">
                                                                At office
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="remote" id={`${platform.id}-remote`} />
                                                            <Label htmlFor={`${platform.id}-remote`} className="font-normal cursor-pointer">
                                                                Remote (don't have to come to the office)
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="hybrid" id={`${platform.id}-hybrid`} />
                                                            <Label htmlFor={`${platform.id}-hybrid`} className="font-normal cursor-pointer">
                                                                Hybrid (flexible between home and office)
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        )}

                                        {/* Website: Simple Configuration */}
                                        {platform.id === "website" && platform.websiteSettings && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="application-link">Application Link</Label>
                                                    <Input
                                                        id="application-link"
                                                        type="url"
                                                        placeholder="https://careers.company.com/job/123"
                                                        value={platform.websiteSettings.applicationLink || ""}
                                                        onChange={(e) =>
                                                            updateWebsiteSettings(platform.id, { applicationLink: e.target.value })
                                                        }
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        External URL where candidates can apply
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="use-internal-form"
                                                        checked={platform.websiteSettings.useInternalForm}
                                                        onCheckedChange={(checked) =>
                                                            updateWebsiteSettings(platform.id, { useInternalForm: checked === true })
                                                        }
                                                    />
                                                    <Label htmlFor="use-internal-form" className="text-sm font-normal cursor-pointer">
                                                        Use Internal Application Form
                                                    </Label>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="py-8 text-center text-muted-foreground">
                        <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No platforms added yet</p>
                        <p className="text-xs mt-1">Click "Add Platform" to configure job posting platforms</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
