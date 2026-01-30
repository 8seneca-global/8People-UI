"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
    ArrowLeft,
    Briefcase,
    Trash2,
    Archive,
    EyeOff,
    Edit,
    Users,
} from "lucide-react"
import type { JobRequisition } from "@/lib/mock-data"

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const {
        jobRequisitions,
        candidates,
        deleteJobRequisition,
        updateJobRequisition,
    } = useStore()

    const job = jobRequisitions.find((j) => j.id === id)

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

    const handleCloseJob = () => {
        if (job) {
            updateJobRequisition(job.id, { status: "closed" })
        }
    }

    const handleDelete = () => {
        if (job) {
            deleteJobRequisition(job.id)
            router.push("/recruitment/jobs")
        }
    }

    if (!job) {
        return (
            <AdminLayout title="Job Not Found" subtitle="">
                <Card>
                    <CardContent className="py-12 text-center">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <h3 className="font-semibold text-lg">Job not found</h3>
                        <p className="text-muted-foreground mt-1">The job you're looking for doesn't exist.</p>
                        <Button variant="outline" className="mt-4" onClick={() => router.push("/recruitment/jobs")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Jobs
                        </Button>
                    </CardContent>
                </Card>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title={job.title}
            subtitle={`${job.organizationalUnitName}${job.jobClassificationTitle ? ` - ${job.jobClassificationTitle}` : ""}`}
        >
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.push("/recruitment/jobs")} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Jobs
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                        {job.status === "open" && (
                            <Button variant="outline" size="sm" onClick={handleCloseJob} className="gap-2">
                                <Archive className="h-4 w-4" />
                                Close Job
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive gap-2"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Job Overview Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Job Overview</CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                                {getStatusBadge(job.status)}
                                <Badge variant="outline">{job.employmentType}</Badge>
                                {job.salaryHidden && (
                                    <Badge variant="secondary" className="gap-1">
                                        <EyeOff className="h-3 w-3" />
                                        Negotiable
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Openings</p>
                                <p className="text-2xl font-semibold">
                                    {job.hired}/{job.openings}
                                </p>
                                <p className="text-xs text-muted-foreground">Hired / Total</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Applications</p>
                                <p className="text-2xl font-semibold text-primary">{getCandidateCount(job.id)}</p>
                                <p className="text-xs text-muted-foreground">Active candidates</p>
                            </div>
                            {!job.salaryHidden && job.salaryRange && (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Salary Range</p>
                                    <p className="text-lg font-semibold">
                                        {(job.salaryRange.min / 1000000).toFixed(0)}-
                                        {(job.salaryRange.max / 1000000).toFixed(0)}M
                                    </p>
                                    <p className="text-xs text-muted-foreground">VND</p>
                                </div>
                            )}
                            {job.closingDate && (
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Closing Date</p>
                                    <p className="text-lg font-semibold">
                                        {new Date(job.closingDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Application deadline</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Job Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Job Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{job.description}</p>
                    </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm space-y-2">
                            {job.requirements.map((req, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span>{req}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Publishing Platforms */}
                {job.publishPlatforms && job.publishPlatforms.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Publishing Platforms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 flex-wrap">
                                {job.publishPlatforms.map((platform) => (
                                    <Badge key={platform} variant="secondary" className="capitalize">
                                        {platform.replace("_", " ")}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                            <Users className="h-4 w-4" />
                            View Candidates ({getCandidateCount(job.id)})
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Job
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
