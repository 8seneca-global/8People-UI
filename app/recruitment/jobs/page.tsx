"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Users,
  EyeOff,
  Filter,
  Briefcase,
  ExternalLink,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Archive,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { JobRequisition } from "@/lib/mock-data"

const publishPlatformOptions = [
  { id: "topcv", label: "TopCV" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "landing_page", label: "Landing Page" },
  { id: "vietnamworks", label: "VietnamWorks" },
  { id: "itviec", label: "ITviec" },
  { id: "facebook", label: "Facebook Jobs" },
]

export default function JobManagementPage() {
  const {
    jobRequisitions,
    organizationalUnits,
    jobClassifications,
    candidates,
    addJobRequisition,
    deleteJobRequisition,
    updateJobRequisition,
  } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    organizationalUnitId: "",
    jobClassificationId: "",
    description: "",
    requirements: "",
    employmentType: "full-time" as JobRequisition["employmentType"],
    status: "draft" as JobRequisition["status"],
    openings: 1,
    salaryMin: "",
    salaryMax: "",
    salaryHidden: false,
    closingDate: "",
    publishPlatforms: [] as string[],
  })

  // Helper to count candidates
  const getCandidateCount = (jobId: string) => {
    return candidates.filter((c) => c.jobRequisitionId === jobId && c.stage !== "rejected").length
  }

  // Helper for Status Badge Color
  const getStatusBadge = (status: JobRequisition["status"]) => {
    const variants: Record<
      JobRequisition["status"],
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      draft: { variant: "outline", label: "Draft" },
      open: { variant: "default", label: "Open" },
      closed: { variant: "secondary", label: "Closed" },
      on_hold: { variant: "destructive", label: "On Hold" },
    }
    const { variant, label } = variants[status]
    return <Badge variant={variant} className="capitalize">{label}</Badge>
  }

  // Filtering Logic
  const filteredJobs = jobRequisitions.filter((job) => {
    // 1. Tab Filter
    let matchesTab = true
    if (activeTab === "open") matchesTab = job.status === "open"
    else if (activeTab === "draft") matchesTab = job.status === "draft"
    else if (activeTab === "closed") matchesTab = job.status === "closed"

    // 2. Search Filter
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.organizationalUnitName.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesTab && matchesSearch
  })

  const handleCreate = () => {
    const orgUnit = organizationalUnits.find((u) => u.id === formData.organizationalUnitId)
    const jobClass = jobClassifications.find((j) => j.id === formData.jobClassificationId)

    addJobRequisition({
      title: formData.title,
      organizationalUnitId: formData.organizationalUnitId,
      organizationalUnitName: orgUnit?.name || "",
      jobClassificationId: formData.jobClassificationId || undefined,
      jobClassificationTitle: jobClass?.title || "",
      description: formData.description,
      requirements: formData.requirements.split("\n").filter((r) => r.trim()),
      employmentType: formData.employmentType,
      status: formData.status,
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
      publishPlatforms: formData.publishPlatforms.length > 0 ? formData.publishPlatforms : undefined,
    })

    setCreateDialogOpen(false)
    resetFormData()
  }

  const resetFormData = () => {
    setFormData({
      title: "",
      organizationalUnitId: "",
      jobClassificationId: "",
      description: "",
      requirements: "",
      employmentType: "full-time",
      status: "draft",
      openings: 1,
      salaryMin: "",
      salaryMax: "",
      salaryHidden: false,
      closingDate: "",
      publishPlatforms: [],
    })
  }

  const handleCloseJob = (job: JobRequisition) => {
    updateJobRequisition(job.id, { status: "closed" })
  }

  const handlePlatformToggle = (platformId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      publishPlatforms: checked
        ? [...prev.publishPlatforms, platformId]
        : prev.publishPlatforms.filter((p) => p !== platformId),
    }))
  }

  const departmentUnits = organizationalUnits.filter((u) => u.unitType === "department" || u.unitType === "division" || u.unitType === "team")

  return (
    <AdminLayout title="Job Management" subtitle="Manage recruitment pipeline and requisitions">
      <div className="space-y-4">
        {/* Header Actions & Search */}
        <div className="flex flex-col gap-4 sticky top-0 z-10 bg-background/95 backdrop-blur pb-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by job title, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Button variant="outline" className="gap-2 shrink-0">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Job Requisition</DialogTitle>
                  <DialogDescription>Add a new open position to your recruitment pipeline</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-input border-border"
                        placeholder="e.g. Senior Developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="openings">Number of Openings</Label>
                      <Input
                        id="openings"
                        type="number"
                        min={1}
                        value={formData.openings}
                        onChange={(e) => setFormData({ ...formData, openings: Number.parseInt(e.target.value) || 1 })}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgUnit">Department/Team *</Label>
                      <Select
                        value={formData.organizationalUnitId}
                        onValueChange={(v) => setFormData({ ...formData, organizationalUnitId: v })}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {departmentUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="jobClass">Job Classification</Label>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Employment Type</Label>
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
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="closing">Closing Date</Label>
                      <Input
                        id="closing"
                        type="date"
                        value={formData.closingDate}
                        onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-input border-border min-h-[200px]"
                      placeholder="Describe the role, responsibilities, what you offer, and company culture..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="requirements">Requirements (one per line) *</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className="bg-input border-border min-h-[150px]"
                      placeholder="3+ years experience&#10;React/Next.js proficiency&#10;Strong communication skills&#10;Bachelor's degree in CS or related field"
                    />
                  </div>

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

                  <div>
                    <Label>Publish Platforms</Label>
                    <p className="text-xs text-muted-foreground mb-2">Select where to publish this job posting</p>
                    <div className="grid grid-cols-3 gap-3">
                      {publishPlatformOptions.map((platform) => (
                        <div key={platform.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`platform-${platform.id}`}
                            checked={formData.publishPlatforms.includes(platform.id)}
                            onCheckedChange={(checked) => handlePlatformToggle(platform.id, checked === true)}
                          />
                          <Label htmlFor={`platform-${platform.id}`} className="text-sm font-normal cursor-pointer">
                            {platform.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={!formData.title || !formData.organizationalUnitId || !formData.description}
                  >
                    Create Job
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none">
              <TabsTrigger value="all" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">All Jobs</TabsTrigger>
              <TabsTrigger value="open" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Open</TabsTrigger>
              <TabsTrigger value="draft" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Draft</TabsTrigger>
              <TabsTrigger value="closed" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Job List Area */}
        <div className="grid gap-3">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedJob(job)
                  setViewDialogOpen(true)
                }}
              >
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">{job.title}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {job.organizationalUnitName}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="hidden md:inline">{job.employmentType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 text-sm">
                    <div className="text-center w-20">
                      <div className="font-medium text-foreground">{job.openings}</div>
                      <div className="text-xs text-muted-foreground">Openings</div>
                    </div>
                    <div className="text-center w-20">
                      <div className="font-medium text-primary">{getCandidateCount(job.id)}</div>
                      <div className="text-xs text-muted-foreground">Applications</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-muted/40 border-dashed">
              <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="font-semibold text-lg">No jobs found</h3>
                <p className="text-muted-foreground max-w-sm mt-1">
                  {activeTab === 'all'
                    ? "Get started by creating a new job requisition."
                    : `There are no ${activeTab} jobs at the moment.`}
                </p>
                {(activeTab === 'all' || activeTab === 'open') && (
                  <Button variant="outline" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                    Create New Job
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* View Job Dialog (Reused logic) */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              {selectedJob?.organizationalUnitName}
              {selectedJob?.jobClassificationTitle && ` - ${selectedJob.jobClassificationTitle}`}
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(selectedJob.status)}
                <Badge variant="outline">{selectedJob.employmentType}</Badge>
                {selectedJob.salaryHidden && (
                  <Badge variant="secondary" className="gap-1">
                    <EyeOff className="h-3 w-3" />
                    Negotiable
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Openings:</span>{" "}
                  <span className="font-medium">
                    {selectedJob.hired}/{selectedJob.openings}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Applications:</span>{" "}
                  <span className="font-medium text-primary">{getCandidateCount(selectedJob.id)}</span>
                </div>
                {!selectedJob.salaryHidden && selectedJob.salaryRange && (
                  <div>
                    <span className="text-muted-foreground">Salary:</span>{" "}
                    <span className="font-medium">
                      {(selectedJob.salaryRange.min / 1000000).toFixed(0)}-
                      {(selectedJob.salaryRange.max / 1000000).toFixed(0)}M VND
                    </span>
                  </div>
                )}
                {selectedJob.closingDate && (
                  <div>
                    <span className="text-muted-foreground">Closing:</span>{" "}
                    <span className="font-medium">{new Date(selectedJob.closingDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{selectedJob.description}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Requirements</Label>
                <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              {selectedJob.publishPlatforms && selectedJob.publishPlatforms.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Published On</Label>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {selectedJob.publishPlatforms.map((platform) => (
                      <Badge key={platform} variant="secondary" className="capitalize">
                        {platform.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex items-center gap-2 mr-auto">
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => {
                if (selectedJob) {
                  deleteJobRequisition(selectedJob.id)
                  setViewDialogOpen(false)
                }
              }}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              {selectedJob?.status === 'open' && (
                <Button variant="outline" size="sm" onClick={() => {
                  if (selectedJob) {
                    handleCloseJob(selectedJob)
                    setViewDialogOpen(false)
                  }
                }}>
                  <Archive className="h-4 w-4 mr-2" />
                  Close Job
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
