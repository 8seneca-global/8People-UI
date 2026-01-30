"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  MoreVertical,
  Trash2,
  Archive,
  EyeOff,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { JobRequisition } from "@/lib/mock-data"

export default function JobManagementPage() {
  const router = useRouter()
  const {
    jobRequisitions,
    candidates,
    deleteJobRequisition,
    updateJobRequisition,
  } = useStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")


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

  const handleCloseJob = (job: JobRequisition) => {
    updateJobRequisition(job.id, { status: "closed" })
  }

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
            <Button onClick={() => router.push("/recruitment/jobs/new")} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              New Job
            </Button>
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
                onClick={() => router.push(`/recruitment/jobs/${job.id}`)}
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
                  <Button variant="outline" className="mt-4" onClick={() => router.push("/recruitment/jobs/new")}>
                    Create New Job
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>


    </AdminLayout>
  )
}
