"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Star,
  Mail,
  Phone,
  Linkedin,
  Calendar,
  Brain,
  Sparkles,
  Users,
  Database,
  Eye,
  UserPlus,
  Video,
  ExternalLink,
  MapPin,
  Pencil,
} from "lucide-react"
import type { Candidate } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface EmployeeFormData {
  firstName: string
  lastName: string
  personalEmail: string
  companyEmail: string
  phone: string
  startDate: string
}

export default function CandidatesPoolPage() {
  const router = useRouter()
  const { candidates, jobRequisitions, employees, positions, organizationalUnits, currentRole, addEmployee } =
    useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [createEmployeeDialogOpen, setCreateEmployeeDialogOpen] = useState(false)
  const [employeeFormData, setEmployeeFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    personalEmail: "",
    companyEmail: "",
    phone: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  // Only HR and Admin can view this page
  const canViewPool = currentRole === "admin" || currentRole === "hr"

  // All candidates in the pool
  const allCandidates = candidates

  const filteredCandidates = allCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (candidate.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
    const matchesSource = sourceFilter === "all" || candidate.source === sourceFilter
    const matchesStage = stageFilter === "all" || candidate.stage === stageFilter
    return matchesSearch && matchesSource && matchesStage
  })

  const getJobTitle = (jobId: string) => {
    const job = jobRequisitions.find((j) => j.id === jobId)
    return job?.title || "Unknown Position"
  }

  const getJobRequisition = (jobId: string) => {
    return jobRequisitions.find((j) => j.id === jobId)
  }

  const getAiScoreColor = (score: number) => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    return "text-orange-500"
  }

  const getInterviewerName = (interviewerId: string) => {
    const emp = employees.find((e) => e.id === interviewerId)
    return emp?.fullName || "Unknown"
  }

  const getStageLabel = (stage: Candidate["stage"]) => {
    const labels: Record<Candidate["stage"], string> = {
      new: "New",
      screening: "Screening",
      interviewing: "Interviewing",
      testing: "Testing",
      offering: "Offering",
      hired: "Hired",
      rejected: "Rejected",
    }
    return labels[stage]
  }

  const getStageColor = (stage: Candidate["stage"]) => {
    const colors: Record<Candidate["stage"], string> = {
      new: "bg-blue-500",
      screening: "bg-purple-500",
      interviewing: "bg-yellow-500",
      testing: "bg-orange-500",
      offering: "bg-cyan-500",
      hired: "bg-green-500",
      rejected: "bg-red-500",
    }
    return colors[stage]
  }

  const generateCompanyEmail = (lastName: string, firstName: string) => {
    if (!lastName || !firstName) return ""
    return `${lastName.toLowerCase().replace(/\s+/g, "")}.${firstName.toLowerCase()}@8seneca.com`
  }

  const handleCreateEmployeeClick = (candidate: Candidate) => {
    const nameParts = candidate.fullName.split(" ")
    const firstName = nameParts[nameParts.length - 1]
    const lastName = nameParts.slice(0, -1).join(" ")

    setEmployeeFormData({
      firstName,
      lastName,
      personalEmail: candidate.email,
      companyEmail: generateCompanyEmail(lastName, firstName),
      phone: candidate.phone || "",
      startDate: new Date().toISOString().split("T")[0],
    })
    setSelectedCandidate(candidate)
    setCreateEmployeeDialogOpen(true)
  }

  const handleNameChange = (field: "firstName" | "lastName", value: string) => {
    const newData = { ...employeeFormData, [field]: value }
    newData.companyEmail = generateCompanyEmail(
      field === "lastName" ? value : newData.lastName,
      field === "firstName" ? value : newData.firstName,
    )
    setEmployeeFormData(newData)
  }

  const handleConfirmCreateEmployee = () => {
    if (!selectedCandidate) return

    const jobReq = getJobRequisition(selectedCandidate.jobRequisitionId)
    if (!jobReq) return

    const orgUnit = organizationalUnits.find((u) => u.id === jobReq.organizationalUnitId)
    const position = positions.find((p) => p.id === jobReq.positionId)

    // Generate new employee ID
    const maxId = Math.max(...employees.map((e) => Number.parseInt(e.id.replace("P-", "")) || 0), 0)
    const newEmployeeId = `P-${String(maxId + 1).padStart(3, "0")}`

    addEmployee({
      code: newEmployeeId,
      fullName: `${employeeFormData.lastName} ${employeeFormData.firstName}`,
      firstName: employeeFormData.firstName,
      lastName: employeeFormData.lastName,
      personalEmail: employeeFormData.personalEmail,
      companyEmail: employeeFormData.companyEmail,
      positionId: position?.id || "",
      positionCode: position?.code || "",
      positionTitle: position?.title || jobReq.title,
      jobClassificationId: jobReq.jobClassificationId || "",
      jobClassificationTitle: jobReq.jobClassificationTitle || "",
      organizationalUnitId: jobReq.organizationalUnitId,
      organizationalUnitName: orgUnit?.name || jobReq.organizationalUnitName,
      costCenter: orgUnit?.costCenter,
      status: "pending",
      onboardingStatus: {
        emailSent: false,
        accountActivated: false,
        profileCompleted: false,
      },
      startDate: employeeFormData.startDate,
      fte: 1.0,
      cellphone: employeeFormData.phone,
    })

    setCreateEmployeeDialogOpen(false)
    setSelectedCandidate(null)
    router.push("/onboarding")
  }

  // Stats
  const totalInPool = allCandidates.length
  const hiredCount = allCandidates.filter((c) => c.stage === "hired").length
  const avgScore = Math.round(
    allCandidates.filter((c) => c.aiCvScore).reduce((sum, c) => sum + (c.aiCvScore || 0), 0) /
      (allCandidates.filter((c) => c.aiCvScore).length || 1),
  )
  const sources = [...new Set(allCandidates.map((c) => c.source))]

  if (!canViewPool) {
    return (
      <AdminLayout title="Candidates Pool" subtitle="Access restricted">
        <Card className="bg-card border-border">
          <CardContent className="py-12">
            <div className="text-center">
              <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">Access Restricted</h3>
              <p className="text-muted-foreground">
                Candidates Pool is only available for HR Department and Administrators.
              </p>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Candidates Pool" subtitle="View all candidates in your talent database">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Database className="h-4 w-4" />
                Total in Pool
              </CardDescription>
              <CardTitle className="text-2xl">{totalInPool}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Successfully Hired</CardDescription>
              <CardTitle className="text-2xl text-success">{hiredCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                Avg AI Score
              </CardDescription>
              <CardTitle className="text-2xl text-primary">{avgScore}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Unique Sources</CardDescription>
              <CardTitle className="text-2xl">{sources.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-input border-border"
                />
              </div>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[180px] bg-input border-border">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="career_page">Career Page</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="topcv">TopCV</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="agency">Agency</SelectItem>
                  <SelectItem value="vietnamworks">VietnamWorks</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-[150px] bg-input border-border">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="offering">Offering</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Candidates Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Candidates</CardTitle>
            <CardDescription>Complete talent pool with application history</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Applied For</TableHead>
                  <TableHead className="text-center">AI Score</TableHead>
                  <TableHead className="text-center">Stage</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium">{candidate.fullName}</p>
                        <p className="text-xs text-muted-foreground">{candidate.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{getJobTitle(candidate.jobRequisitionId)}</TableCell>
                    <TableCell className="text-center">
                      {candidate.aiCvScore ? (
                        <div className="flex items-center justify-center gap-1">
                          <Brain className={cn("h-4 w-4", getAiScoreColor(candidate.aiCvScore))} />
                          <span className={cn("font-medium", getAiScoreColor(candidate.aiCvScore))}>
                            {candidate.aiCvScore}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-primary-foreground", getStageColor(candidate.stage))}>
                        {getStageLabel(candidate.stage)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {candidate.source.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(candidate.appliedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        {candidate.stage === "hired" && candidate.offerAccepted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-primary"
                            onClick={() => handleCreateEmployeeClick(candidate)}
                          >
                            <UserPlus className="h-4 w-4" />
                            Onboard
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredCandidates.length === 0 && (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No candidates found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Candidate Details Dialog */}
      <Dialog open={!!selectedCandidate && !createEmployeeDialogOpen} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCandidate?.fullName}</DialogTitle>
            <DialogDescription>
              {selectedCandidate && getJobTitle(selectedCandidate.jobRequisitionId)}
            </DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-primary-foreground", getStageColor(selectedCandidate.stage))}>
                  {getStageLabel(selectedCandidate.stage)}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {selectedCandidate.source.replace("_", " ")}
                </Badge>
                {selectedCandidate.offerAccepted && <Badge className="bg-green-500">Offer Accepted</Badge>}
                {selectedCandidate.rejectionReason && (
                  <Badge variant="destructive">{selectedCandidate.rejectionReason}</Badge>
                )}
              </div>

              {selectedCandidate.aiCvScore && (
                <div className="rounded-lg border border-border p-4 bg-secondary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">AI CV Analysis</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <Progress value={selectedCandidate.aiCvScore} className="h-2" />
                    </div>
                    <span className={cn("font-bold text-lg", getAiScoreColor(selectedCandidate.aiCvScore))}>
                      {selectedCandidate.aiCvScore}/100
                    </span>
                  </div>
                  {selectedCandidate.aiCvAnalysis && (
                    <p className="text-xs text-muted-foreground">{selectedCandidate.aiCvAnalysis}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedCandidate.email}`} className="text-primary hover:underline">
                    {selectedCandidate.email}
                  </a>
                </div>
                {selectedCandidate.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCandidate.phone}</span>
                  </div>
                )}
                {selectedCandidate.linkedinUrl && (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={selectedCandidate.linkedinUrl}
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied {new Date(selectedCandidate.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedCandidate.yearsOfExperience !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Experience:</span>{" "}
                    <span className="font-medium">{selectedCandidate.yearsOfExperience} years</span>
                  </div>
                )}
                {selectedCandidate.expectedSalary && (
                  <div>
                    <span className="text-muted-foreground">Expected:</span>{" "}
                    <span className="font-medium">{(selectedCandidate.expectedSalary / 1000000).toFixed(0)}M VND</span>
                  </div>
                )}
              </div>

              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Skills</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCandidate.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.rating && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-5 w-5",
                        star <= selectedCandidate.rating! ? "fill-warning text-warning" : "text-muted-foreground",
                      )}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{selectedCandidate.rating}/5</span>
                </div>
              )}

              {selectedCandidate.interviews && selectedCandidate.interviews.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Interview History</Label>
                  <div className="space-y-2 mt-1">
                    {selectedCandidate.interviews.map((interview) => (
                      <div key={interview.id} className="rounded-md border border-border p-3 bg-secondary/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-primary" />
                            <p className="text-sm font-medium capitalize">{interview.type} Interview</p>
                          </div>
                          <Badge
                            variant={interview.status === "completed" ? "default" : "secondary"}
                            className="capitalize"
                          >
                            {interview.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(interview.scheduledAt).toLocaleString()} ({interview.duration} min)
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {interview.interviewerNames?.join(", ") ||
                              interview.interviewers.map((id) => getInterviewerName(id)).join(", ")}
                          </div>
                          {interview.meetingLink && (
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-3 w-3" />
                              <a
                                href={interview.meetingLink}
                                className="text-primary hover:underline"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Join Meeting
                              </a>
                            </div>
                          )}
                          {interview.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {interview.location}
                            </div>
                          )}
                        </div>
                        {interview.feedback && interview.feedback.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <p className="text-xs font-medium mb-1">Feedback:</p>
                            {interview.feedback.map((fb, i) => (
                              <div key={i} className="text-xs text-muted-foreground">
                                <span className="font-medium">{getInterviewerName(fb.interviewerId)}:</span>{" "}
                                {fb.strengths && <span>{fb.strengths}</span>}
                                <Badge variant="outline" className="ml-2 text-xs capitalize">
                                  {fb.recommendation.replace("_", " ")}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedCandidate?.stage === "hired" && selectedCandidate?.offerAccepted && (
              <Button onClick={() => handleCreateEmployeeClick(selectedCandidate)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Create Employee Profile
              </Button>
            )}
            <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Employee Confirmation Dialog - CHANGE: Now with editable form */}
      <Dialog open={createEmployeeDialogOpen} onOpenChange={setCreateEmployeeDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Create Employee Profile
            </DialogTitle>
            <DialogDescription>
              Review and edit the information below before creating an employee profile.
            </DialogDescription>
          </DialogHeader>

          {selectedCandidate && (
            <div className="space-y-4 py-2">
              {/* Editable Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={employeeFormData.lastName}
                      onChange={(e) => handleNameChange("lastName", e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={employeeFormData.firstName}
                      onChange={(e) => handleNameChange("firstName", e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personalEmail">Personal Email</Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    value={employeeFormData.personalEmail}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, personalEmail: e.target.value })}
                    className="bg-input border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <div className="relative">
                    <Input
                      id="companyEmail"
                      value={employeeFormData.companyEmail}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, companyEmail: e.target.value })}
                      className="bg-input border-border pr-10"
                    />
                    <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Auto-generated as Lastname.Firstname@8seneca.com</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={employeeFormData.phone}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={employeeFormData.startDate}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, startDate: e.target.value })}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Position Info - Read Only */}
              <div className="rounded-lg border border-border p-4 bg-secondary/30">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Badge variant="outline">Position Assignment</Badge>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <Label className="text-muted-foreground text-xs">Position</Label>
                    <p className="font-medium">{getJobTitle(selectedCandidate.jobRequisitionId)}</p>
                  </div>
                  {selectedCandidate.yearsOfExperience !== undefined && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Experience</Label>
                      <p className="font-medium">{selectedCandidate.yearsOfExperience} years</p>
                    </div>
                  )}
                </div>
                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div className="mt-3">
                    <Label className="text-muted-foreground text-xs">Skills</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCandidate.skills.slice(0, 5).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {selectedCandidate.skills.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{selectedCandidate.skills.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm">
                  This will create a new employee profile and start the onboarding process. An invite email will be sent
                  to <strong>{employeeFormData.personalEmail}</strong>.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateEmployeeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCreateEmployee}
              className="gap-2"
              disabled={!employeeFormData.firstName || !employeeFormData.lastName || !employeeFormData.companyEmail}
            >
              <UserPlus className="h-4 w-4" />
              Confirm & Create Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
