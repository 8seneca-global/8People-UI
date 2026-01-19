"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Briefcase,
  Users,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  EyeOff,
  Archive,
  UserCheck,
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

export default function JobOpeningsPage() {
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
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null)
  const [activeTab, setActiveTab] = useState("active")
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

  const getCandidateCount = (jobId: string) => {
    return candidates.filter((c) => c.jobRequisitionId === jobId && c.stage !== "rejected").length
  }

  const activeJobs = jobRequisitions.filter(
    (j) => j.status === "open" || j.status === "draft" || j.status === "on_hold",
  )
  const closedJobs = jobRequisitions.filter((j) => j.status === "closed")

  const filteredJobs = (activeTab === "active" ? activeJobs : closedJobs).filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
    return <Badge variant={variant}>{label}</Badge>
  }

  const handlePlatformToggle = (platformId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      publishPlatforms: checked
        ? [...prev.publishPlatforms, platformId]
        : prev.publishPlatforms.filter((p) => p !== platformId),
    }))
  }

  const handleCreate = () => {
    const orgUnit = organizationalUnits.find((u) => u.id === formData.organizationalUnitId)
    const jobClass = jobClassifications.find((j) => j.id === formData.jobClassificationId)

    addJobRequisition({
      title: formData.title,
      organizationalUnitId: formData.organizationalUnitId,
      organizationalUnitName: orgUnit?.name || "",
      jobClassificationId: formData.jobClassificationId || undefined,
      jobClassificationTitle: jobClass?.title || undefined,
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

  // Stats
  const openJobs = jobRequisitions.filter((j) => j.status === "open").length
  const totalOpenings = jobRequisitions.filter((j) => j.status === "open").reduce((sum, j) => sum + j.openings, 0)
  const totalHired = jobRequisitions.reduce((sum, j) => sum + j.hired, 0)

  const departmentUnits = organizationalUnits.filter((u) => u.unitType === "department" || u.unitType === "division")

  return (
    <AdminLayout title="Job Openings" subtitle="Manage job requisitions and open positions">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Open Positions</CardDescription>
              <CardTitle className="text-2xl">{openJobs}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Total Openings</CardDescription>
              <CardTitle className="text-2xl text-primary">{totalOpenings}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Total Hired</CardDescription>
              <CardTitle className="text-2xl text-success">{totalHired}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Closed/History</CardDescription>
              <CardTitle className="text-2xl">{closedJobs.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search job titles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-input border-border"
                  />
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
                    <TabsTrigger value="closed">Closed ({closedJobs.length})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
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
                        <Label htmlFor="orgUnit">Department *</Label>
                        <Select
                          value={formData.organizationalUnitId}
                          onValueChange={(v) => setFormData({ ...formData, organizationalUnitId: v })}
                        >
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue placeholder="Select department" />
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
          </CardContent>
        </Card>

        {/* Job Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const candidateCount = getCandidateCount(job.id)
            return (
              <Card key={job.id} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Briefcase className="h-3 w-3" />
                        {job.organizationalUnitName}
                        {job.jobClassificationTitle && ` - ${job.jobClassificationTitle}`}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => {
                            setSelectedJob(job)
                            setViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {job.status === "open" && (
                          <DropdownMenuItem className="gap-2" onClick={() => handleCloseJob(job)}>
                            <Archive className="h-4 w-4" />
                            Close Job
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="gap-2 text-destructive"
                          onClick={() => deleteJobRequisition(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {getStatusBadge(job.status)}
                    <Badge variant="outline">{job.employmentType}</Badge>
                    {job.salaryHidden && (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" />
                        Deal
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Openings
                      </span>
                      <span className="font-medium">
                        {job.hired}/{job.openings}
                        {job.hired >= job.openings && (
                          <Badge variant="default" className="ml-2 text-xs bg-green-500">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Filled
                          </Badge>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Candidates
                      </span>
                      <span className="font-medium text-primary">{candidateCount} applied</span>
                    </div>
                    {!job.salaryHidden && job.salaryRange && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Salary</span>
                        <span className="font-medium">
                          {(job.salaryRange.min / 1000000).toFixed(0)}-{(job.salaryRange.max / 1000000).toFixed(0)}M{" "}
                          {job.salaryRange.currency}
                        </span>
                      </div>
                    )}
                    {job.closingDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Closing
                        </span>
                        <span className="font-medium">{new Date(job.closingDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {job.publishPlatforms && job.publishPlatforms.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1 flex-wrap">
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        {job.publishPlatforms.slice(0, 3).map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs capitalize">
                            {platform.replace("_", " ")}
                          </Badge>
                        ))}
                        {job.publishPlatforms.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.publishPlatforms.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {activeTab === "active" ? "No active job requisitions found" : "No closed job requisitions found"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Job Dialog */}
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
                  <span className="text-muted-foreground">Candidates:</span>{" "}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
