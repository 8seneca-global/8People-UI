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
import {
  Search,
  Star,
  Mail,
  Phone,
  Linkedin,
  Calendar,
  MoreVertical,
  ArrowRight,
  UserPlus,
  Upload,
  Brain,
  FileText,
  Sparkles,
  CheckCircle,
  Video,
  MapPin,
  ExternalLink,
  Users,
  Pencil,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Candidate, CandidateStage } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const stageConfig: Record<CandidateStage, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-500" },
  screening: { label: "Screening", color: "bg-purple-500" },
  interviewing: { label: "Interviewing", color: "bg-yellow-500" },
  testing: { label: "Testing", color: "bg-orange-500" },
  offering: { label: "Offering", color: "bg-cyan-500" },
  hired: { label: "Hired", color: "bg-green-500" },
  rejected: { label: "Rejected", color: "bg-red-500" },
}

const stageOrder: CandidateStage[] = ["new", "screening", "interviewing", "testing", "offering", "hired"]

interface EmployeeFormData {
  firstName: string
  lastName: string
  personalEmail: string
  companyEmail: string
  phone: string
  startDate: string
}

export default function ApplyingCandidatesPage() {
  const router = useRouter()
  const {
    candidates,
    jobRequisitions,
    employees,
    positions,
    organizationalUnits,
    moveCandidateStage,
    updateCandidate,
    addCandidate,
    addEmployee,
    updateJobRequisition,
  } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [jobFilter, setJobFilter] = useState<string>("all")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [addCandidateOpen, setAddCandidateOpen] = useState(false)
  const [createEmployeeDialogOpen, setCreateEmployeeDialogOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [newCandidate, setNewCandidate] = useState({
    fullName: "",
    email: "",
    phone: "",
    jobRequisitionId: "",
    source: "career_page" as Candidate["source"],
    linkedinUrl: "",
    expectedSalary: "",
    yearsOfExperience: "",
    skills: "",
  })
  const [employeeFormData, setEmployeeFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    personalEmail: "",
    companyEmail: "",
    phone: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  const applyingCandidates = candidates.filter((c) => c.stage !== "rejected")

  const filteredCandidates = applyingCandidates.filter((candidate) => {
    const matchesSearch =
      candidate.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesJob = jobFilter === "all" || candidate.jobRequisitionId === jobFilter
    const matchesStage = stageFilter === "all" || candidate.stage === stageFilter
    return matchesSearch && matchesJob && matchesStage
  })

  // Group candidates by stage for pipeline view
  const candidatesByStage = stageOrder.reduce(
    (acc, stage) => {
      acc[stage] = filteredCandidates.filter((c) => c.stage === stage)
      return acc
    },
    {} as Record<CandidateStage, Candidate[]>,
  )

  const moveToNextStage = (candidate: Candidate) => {
    const currentIndex = stageOrder.indexOf(candidate.stage)
    if (currentIndex < stageOrder.length - 1) {
      moveCandidateStage(candidate.id, stageOrder[currentIndex + 1])
    }
  }

  const handleReject = () => {
    if (selectedCandidate && rejectReason) {
      updateCandidate(selectedCandidate.id, {
        stage: "rejected",
        rejectionReason: rejectReason,
      })
      setRejectDialogOpen(false)
      setSelectedCandidate(null)
      setRejectReason("")
    }
  }

  const handleAcceptOffer = (candidate: Candidate) => {
    updateCandidate(candidate.id, {
      offerAccepted: true,
      offerAcceptedAt: new Date().toISOString(),
    })
    moveCandidateStage(candidate.id, "hired")

    const jobReq = jobRequisitions.find((j) => j.id === candidate.jobRequisitionId)
    if (jobReq) {
      const hiredCount = candidates.filter((c) => c.jobRequisitionId === jobReq.id && c.stage === "hired").length + 1

      if (hiredCount >= jobReq.openings) {
        updateJobRequisition(jobReq.id, {
          status: "closed",
          hired: hiredCount,
        })
      } else {
        updateJobRequisition(jobReq.id, { hired: hiredCount })
      }
    }
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

    const jobReq = jobRequisitions.find((j) => j.id === selectedCandidate.jobRequisitionId)
    if (!jobReq) return

    const orgUnit = organizationalUnits.find((u) => u.id === jobReq.organizationalUnitId)
    const position = positions.find((p) => p.id === jobReq.positionId)

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

  const simulateAiScan = async () => {
    setIsScanning(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const jobReq = jobRequisitions.find((j) => j.id === newCandidate.jobRequisitionId)
    const baseScore = Math.floor(Math.random() * 30) + 60
    const expBonus = Math.min(Number.parseInt(newCandidate.yearsOfExperience || "0") * 2, 10)
    const skillsCount = newCandidate.skills.split(",").filter((s) => s.trim()).length
    const skillBonus = Math.min(skillsCount * 2, 10)

    const aiScore = Math.min(baseScore + expBonus + skillBonus, 100)

    const analysisOptions = [
      `Strong candidate with ${newCandidate.yearsOfExperience || "N/A"} years of experience. Skills align well with ${jobReq?.title || "the position"} requirements.`,
      `Candidate shows potential for the ${jobReq?.title || "position"}. Consider for technical assessment.`,
      `Good technical background. Experience level matches job requirements. Recommend proceeding to screening.`,
    ]

    const analysis = analysisOptions[Math.floor(Math.random() * analysisOptions.length)]

    setIsScanning(false)
    return { aiScore, analysis }
  }

  const handleAddCandidate = async () => {
    const { aiScore, analysis } = await simulateAiScan()

    addCandidate({
      fullName: newCandidate.fullName,
      email: newCandidate.email,
      phone: newCandidate.phone || undefined,
      jobRequisitionId: newCandidate.jobRequisitionId,
      source: newCandidate.source,
      linkedinUrl: newCandidate.linkedinUrl || undefined,
      stage: "new",
      aiCvScore: aiScore,
      aiCvAnalysis: analysis,
      expectedSalary: newCandidate.expectedSalary ? Number.parseInt(newCandidate.expectedSalary) : undefined,
      yearsOfExperience: newCandidate.yearsOfExperience ? Number.parseInt(newCandidate.yearsOfExperience) : undefined,
      skills: newCandidate.skills
        ? newCandidate.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
    })

    setAddCandidateOpen(false)
    setNewCandidate({
      fullName: "",
      email: "",
      phone: "",
      jobRequisitionId: "",
      source: "career_page",
      linkedinUrl: "",
      expectedSalary: "",
      yearsOfExperience: "",
      skills: "",
    })
  }

  const getJobTitle = (jobId: string) => {
    const job = jobRequisitions.find((j) => j.id === jobId)
    return job?.title || "Unknown Position"
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

  // Stats
  const totalCandidates = applyingCandidates.length
  const newCandidates = applyingCandidates.filter((c) => c.stage === "new").length
  const inProgress = applyingCandidates.filter((c) =>
    ["screening", "interviewing", "testing", "offering"].includes(c.stage),
  ).length
  const hired = applyingCandidates.filter((c) => c.stage === "hired").length

  return (
    <AdminLayout title="Applying Candidates" subtitle="Track and manage candidates in your recruitment pipeline">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Total Applying</CardDescription>
              <CardTitle className="text-2xl">{totalCandidates}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>New Applications</CardDescription>
              <CardTitle className="text-2xl text-blue-500">{newCandidates}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-2xl text-warning">{inProgress}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription>Hired</CardDescription>
              <CardTitle className="text-2xl text-success">{hired}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-center flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-input border-border"
                  />
                </div>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-[200px] bg-input border-border">
                    <SelectValue placeholder="Filter by job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    {jobRequisitions.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="w-[150px] bg-input border-border">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stageOrder.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stageConfig[stage].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="gap-2" onClick={() => setAddCandidateOpen(true)}>
                <Upload className="h-4 w-4" />
                Add Candidate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline View */}
        <div className="grid gap-4 md:grid-cols-6">
          {stageOrder.map((stage) => (
            <Card key={stage} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", stageConfig[stage].color)} />
                    <CardTitle className="text-sm">{stageConfig[stage].label}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {candidatesByStage[stage]?.length || 0}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {candidatesByStage[stage]?.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-md border border-border p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{candidate.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getJobTitle(candidate.jobRequisitionId)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCandidate(candidate)
                            }}
                          >
                            View Profile
                          </DropdownMenuItem>
                          {stage === "offering" && !candidate.offerAccepted && (
                            <DropdownMenuItem onClick={() => handleAcceptOffer(candidate)}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                              Accept Offer
                            </DropdownMenuItem>
                          )}
                          {stage === "hired" && candidate.offerAccepted && (
                            <DropdownMenuItem onClick={() => handleCreateEmployeeClick(candidate)}>
                              <UserPlus className="h-4 w-4 mr-2 text-primary" />
                              Create Employee Profile
                            </DropdownMenuItem>
                          )}
                          {stage !== "hired" && stage !== "rejected" && stage !== "offering" && (
                            <>
                              <DropdownMenuItem onClick={() => moveToNextStage(candidate)}>
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Move to Next Stage
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedCandidate(candidate)
                                  setRejectDialogOpen(true)
                                }}
                              >
                                Reject Candidate
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {candidate.aiCvScore && (
                        <div className="flex items-center gap-1">
                          <Brain className={cn("h-3 w-3", getAiScoreColor(candidate.aiCvScore))} />
                          <span className={cn("text-xs font-medium", getAiScoreColor(candidate.aiCvScore))}>
                            {candidate.aiCvScore}
                          </span>
                        </div>
                      )}
                      {candidate.rating && (
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          <span className="text-xs">{candidate.rating}</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground capitalize">
                        {candidate.source.replace("_", " ")}
                      </span>
                    </div>
                    {candidate.interviews && candidate.interviews.length > 0 && (
                      <div className="mt-2">
                        {candidate.interviews
                          .filter((i) => i.status === "scheduled")
                          .slice(0, 1)
                          .map((interview) => (
                            <div
                              key={interview.id}
                              className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded"
                            >
                              <Video className="h-3 w-3" />
                              <span>{new Date(interview.scheduledAt).toLocaleDateString()}</span>
                            </div>
                          ))}
                      </div>
                    )}
                    {candidate.offerAccepted && stage === "hired" && (
                      <Badge variant="default" className="mt-2 text-xs bg-green-500">
                        Offer Accepted
                      </Badge>
                    )}
                  </div>
                ))}
                {(!candidatesByStage[stage] || candidatesByStage[stage].length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-4">No candidates</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rejected candidates */}
        {candidates.filter((c) => c.stage === "rejected").length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-destructive">Rejected Candidates</CardTitle>
              <CardDescription>Candidates who did not pass the selection process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-4">
                {candidates
                  .filter((c) => c.stage === "rejected")
                  .map((candidate) => (
                    <div key={candidate.id} className="rounded-md border border-border p-3 bg-destructive/5">
                      <p className="font-medium text-sm">{candidate.fullName}</p>
                      <p className="text-xs text-muted-foreground">{getJobTitle(candidate.jobRequisitionId)}</p>
                      {candidate.rejectionReason && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {candidate.rejectionReason}
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Candidate Detail Dialog */}
      <Dialog
        open={!!selectedCandidate && !rejectDialogOpen && !createEmployeeDialogOpen}
        onOpenChange={() => setSelectedCandidate(null)}
      >
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
                <Badge className={cn("text-primary-foreground", stageConfig[selectedCandidate.stage].color)}>
                  {stageConfig[selectedCandidate.stage].label}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {selectedCandidate.source.replace("_", " ")}
                </Badge>
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Reject Candidate</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting {selectedCandidate?.fullName}.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Label>Rejection Reason</Label>
            <Select value={rejectReason} onValueChange={setRejectReason}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not qualified">Not qualified</SelectItem>
                <SelectItem value="Failed interview">Failed interview</SelectItem>
                <SelectItem value="Salary mismatch">Salary mismatch</SelectItem>
                <SelectItem value="Position filled">Position filled</SelectItem>
                <SelectItem value="Withdrew application">Withdrew application</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
              Reject Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Add Candidate Dialog */}
      <Dialog open={addCandidateOpen} onOpenChange={setAddCandidateOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Add New Candidate
            </DialogTitle>
            <DialogDescription>
              Add a new candidate to the recruitment pipeline. AI will automatically analyze the profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidateName">Full Name *</Label>
                <Input
                  id="candidateName"
                  value={newCandidate.fullName}
                  onChange={(e) => setNewCandidate({ ...newCandidate, fullName: e.target.value })}
                  className="bg-input border-border"
                  placeholder="Nguyen Van A"
                />
              </div>
              <div>
                <Label htmlFor="candidateEmail">Email *</Label>
                <Input
                  id="candidateEmail"
                  type="email"
                  value={newCandidate.email}
                  onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                  className="bg-input border-border"
                  placeholder="candidate@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidatePhone">Phone</Label>
                <Input
                  id="candidatePhone"
                  value={newCandidate.phone}
                  onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                  className="bg-input border-border"
                  placeholder="+84 901 234 567"
                />
              </div>
              <div>
                <Label htmlFor="candidateJob">Job Position *</Label>
                <Select
                  value={newCandidate.jobRequisitionId}
                  onValueChange={(v) => setNewCandidate({ ...newCandidate, jobRequisitionId: v })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobRequisitions
                      .filter((j) => j.status === "open")
                      .map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidateSource">Source *</Label>
                <Select
                  value={newCandidate.source}
                  onValueChange={(v: Candidate["source"]) => setNewCandidate({ ...newCandidate, source: v })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="career_page">Career Page</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="topcv">TopCV</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="candidateLinkedin">LinkedIn URL</Label>
                <Input
                  id="candidateLinkedin"
                  value={newCandidate.linkedinUrl}
                  onChange={(e) => setNewCandidate({ ...newCandidate, linkedinUrl: e.target.value })}
                  className="bg-input border-border"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="candidateExp">Years of Experience</Label>
                <Input
                  id="candidateExp"
                  type="number"
                  value={newCandidate.yearsOfExperience}
                  onChange={(e) => setNewCandidate({ ...newCandidate, yearsOfExperience: e.target.value })}
                  className="bg-input border-border"
                  placeholder="3"
                />
              </div>
              <div>
                <Label htmlFor="candidateSalary">Expected Salary (VND)</Label>
                <Input
                  id="candidateSalary"
                  type="number"
                  value={newCandidate.expectedSalary}
                  onChange={(e) => setNewCandidate({ ...newCandidate, expectedSalary: e.target.value })}
                  className="bg-input border-border"
                  placeholder="25000000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="candidateSkills">Skills (comma separated)</Label>
              <Input
                id="candidateSkills"
                value={newCandidate.skills}
                onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })}
                className="bg-input border-border"
                placeholder="React, Node.js, TypeScript, PostgreSQL"
              />
            </div>

            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">CV/Resume upload (coming soon)</p>
            </div>

            {isScanning && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Brain className="h-6 w-6 text-primary animate-pulse" />
                    <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">AI is analyzing the profile...</p>
                    <p className="text-xs text-muted-foreground">Evaluating skills match and experience level</p>
                  </div>
                </div>
                <Progress value={66} className="mt-3 h-1" />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCandidateOpen(false)} disabled={isScanning}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCandidate}
              disabled={!newCandidate.fullName || !newCandidate.email || !newCandidate.jobRequisitionId || isScanning}
              className="gap-2"
            >
              {isScanning ? (
                <>
                  <Brain className="h-4 w-4 animate-pulse" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Add & Scan with AI
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
