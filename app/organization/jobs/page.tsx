"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/lib/store"
import { FileText, Plus, Search, Edit, Trash2, Eye, Briefcase } from "lucide-react"
import type { JobClassification } from "@/lib/mock-data"

export default function JobsPage() {
  const [search, setSearch] = useState("")
  const [filterFamily, setFilterFamily] = useState<string>("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [viewingJob, setViewingJob] = useState<JobClassification | null>(null)
  const [editingJob, setEditingJob] = useState<JobClassification | null>(null)

  const { jobClassifications, positions, addJobClassification, updateJobClassification, deleteJobClassification } =
    useStore()

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    jobFamily: "",
    jobLevel: "",
    payGradeGroup: "",
    standardHours: 40,
    flsaStatus: "non-exempt" as "exempt" | "non-exempt",
    description: "",
    requirements: "",
    responsibilities: "",
    competencies: "",
  })

  const jobFamilies = [...new Set(jobClassifications.map((j) => j.jobFamily))]

  const filteredJobs = jobClassifications.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) || job.code.toLowerCase().includes(search.toLowerCase())
    const matchesFamily = filterFamily === "all" || job.jobFamily === filterFamily
    return matchesSearch && matchesFamily
  })

  const getPositionCount = (jobId: string) => {
    return positions.filter((p) => p.jobClassificationId === jobId).length
  }

  const handleOpenAdd = () => {
    setFormData({
      code: "",
      title: "",
      jobFamily: "",
      jobLevel: "",
      payGradeGroup: "",
      standardHours: 40,
      flsaStatus: "non-exempt",
      description: "",
      requirements: "",
      responsibilities: "",
      competencies: "",
    })
    setEditingJob(null)
    setIsAddOpen(true)
  }

  const handleOpenEdit = (job: JobClassification) => {
    setFormData({
      code: job.code,
      title: job.title,
      jobFamily: job.jobFamily,
      jobLevel: job.jobLevel,
      payGradeGroup: job.payGradeGroup,
      standardHours: job.standardHours,
      flsaStatus: job.flsaStatus,
      description: job.description || "",
      requirements: job.requirements.join("\n"),
      responsibilities: job.responsibilities.join("\n"),
      competencies: job.competencies.join("\n"),
    })
    setEditingJob(job)
    setIsAddOpen(true)
  }

  const handleSave = () => {
    const jobData = {
      ...formData,
      requirements: formData.requirements.split("\n").filter((r) => r.trim()),
      responsibilities: formData.responsibilities.split("\n").filter((r) => r.trim()),
      competencies: formData.competencies.split("\n").filter((r) => r.trim()),
      status: "active" as const,
    }

    if (editingJob) {
      updateJobClassification(editingJob.id, jobData)
    } else {
      addJobClassification(jobData)
    }
    setIsAddOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job classification?")) {
      deleteJobClassification(id)
    }
  }

  const getLevelColor = (level: string) => {
    if (level.includes("Executive")) return "bg-rose-500/20 text-rose-500"
    if (level.includes("Manager") || level.includes("Lead")) return "bg-purple-500/20 text-purple-500"
    if (level.includes("Senior")) return "bg-blue-500/20 text-blue-500"
    if (level.includes("Mid")) return "bg-green-500/20 text-green-500"
    if (level.includes("Junior")) return "bg-orange-500/20 text-orange-500"
    return "bg-gray-500/20 text-gray-500"
  }

  return (
    <AdminLayout title="Job Classifications" subtitle="Manage job templates (C)">
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {jobClassifications.filter((j) => j.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">{jobFamilies.length}</p>
                  <p className="text-sm text-muted-foreground">Job Families</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <FileText className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {jobClassifications.filter((j) => j.flsaStatus === "exempt").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Exempt</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <FileText className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {jobClassifications.filter((j) => j.flsaStatus === "non-exempt").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Non-Exempt</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-card-foreground">All Job Classifications</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-input"
                  />
                </div>
                <Select value={filterFamily} onValueChange={setFilterFamily}>
                  <SelectTrigger className="w-48 bg-input">
                    <SelectValue placeholder="Filter by family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Families</SelectItem>
                    {jobFamilies.map((family) => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleOpenAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Title</TableHead>
                  <TableHead className="text-muted-foreground">Job Family</TableHead>
                  <TableHead className="text-muted-foreground">Level</TableHead>
                  <TableHead className="text-muted-foreground">Pay Grade</TableHead>
                  <TableHead className="text-muted-foreground">Positions</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id} className="border-border">
                    <TableCell className="font-medium text-card-foreground">{job.title}</TableCell>
                    <TableCell className="text-muted-foreground">{job.jobFamily}</TableCell>
                    <TableCell>
                      <Badge className={getLevelColor(job.jobLevel)} variant="secondary">
                        {job.jobLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{job.payGradeGroup}</TableCell>
                    <TableCell className="text-card-foreground">{getPositionCount(job.id)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={job.status === "active" ? "default" : "secondary"}
                        className={job.status === "active" ? "bg-success/20 text-success" : ""}
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingJob(job)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(job)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingJob} onOpenChange={() => setViewingJob(null)}>
        <DialogContent className="bg-card border-border sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-card-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewingJob?.title}
            </DialogTitle>
          </DialogHeader>
          {viewingJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">

                <div>
                  <p className="text-sm text-muted-foreground">Job Family</p>
                  <p className="text-card-foreground">{viewingJob.jobFamily}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <Badge className={getLevelColor(viewingJob.jobLevel)}>{viewingJob.jobLevel}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pay Grade</p>
                  <p className="text-card-foreground">{viewingJob.payGradeGroup}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Standard Hours</p>
                  <p className="text-card-foreground">{viewingJob.standardHours}h/week</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">FLSA Status</p>
                  <Badge variant="outline" className="capitalize">
                    {viewingJob.flsaStatus}
                  </Badge>
                </div>
              </div>

              {viewingJob.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-card-foreground">{viewingJob.description}</p>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Requirements</p>
                  <ul className="space-y-1">
                    {viewingJob.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Responsibilities</p>
                  <ul className="space-y-1">
                    {viewingJob.responsibilities.map((resp, i) => (
                      <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Competencies</p>
                  <ul className="space-y-1">
                    {viewingJob.competencies.map((comp, i) => (
                      <li key={i} className="text-sm text-card-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {comp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-card border-border sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              {editingJob ? "Edit Job Classification" : "Add Job Classification"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Job Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="bg-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Family</Label>
                <Input
                  value={formData.jobFamily}
                  onChange={(e) => setFormData({ ...formData, jobFamily: e.target.value })}
                  placeholder="e.g. Engineering"
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Job Level</Label>
                <Input
                  value={formData.jobLevel}
                  onChange={(e) => setFormData({ ...formData, jobLevel: e.target.value })}
                  placeholder="e.g. Senior"
                  className="bg-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Pay Grade Group</Label>
                <Input
                  value={formData.payGradeGroup}
                  onChange={(e) => setFormData({ ...formData, payGradeGroup: e.target.value })}
                  placeholder="e.g. S1"
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Standard Hours</Label>
                <Input
                  type="number"
                  value={formData.standardHours}
                  onChange={(e) => setFormData({ ...formData, standardHours: Number.parseInt(e.target.value) })}
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label>FLSA Status</Label>
                <Select
                  value={formData.flsaStatus}
                  onValueChange={(v) => setFormData({ ...formData, flsaStatus: v as "exempt" | "non-exempt" })}
                >
                  <SelectTrigger className="bg-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exempt">Exempt</SelectItem>
                    <SelectItem value="non-exempt">Non-Exempt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Job description"
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Requirements (one per line)</Label>
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="5+ years experience&#10;Bachelor's degree"
                className="bg-input"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsibilities (one per line)</Label>
              <Textarea
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                placeholder="Lead development&#10;Code review"
                className="bg-input"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Competencies (one per line)</Label>
              <Textarea
                value={formData.competencies}
                onChange={(e) => setFormData({ ...formData, competencies: e.target.value })}
                placeholder="Technical Leadership&#10;Problem Solving"
                className="bg-input"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingJob ? "Save Changes" : "Create Job"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
