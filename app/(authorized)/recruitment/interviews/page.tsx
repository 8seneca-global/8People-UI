"use client";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { useStore } from "@/lib/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Badge } from "@/modules/core/components/ui/badge";
import { Button } from "@/modules/core/components/ui/button";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  User,
  CheckCircle,
  ExternalLink,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InterviewsPage() {
  const { candidates, employees, jobRequisitions } = useStore();

  // Get all interviews from candidates with full details
  const allInterviews = candidates
    .flatMap((candidate) =>
      (candidate.interviews || []).map((interview) => ({
        ...interview,
        candidate,
        jobTitle:
          jobRequisitions.find((j) => j.id === candidate.jobRequisitionId)
            ?.title || "Unknown",
        departmentName:
          jobRequisitions.find((j) => j.id === candidate.jobRequisitionId)
            ?.organizationalUnitName || "",
      })),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  // Use a reference date for demo (Jan 9, 2026)
  const today = "2026-01-09";
  const upcomingInterviews = allInterviews.filter(
    (i) =>
      i.status === "scheduled" &&
      new Date(i.scheduledAt).toISOString().split("T")[0] >= today,
  );
  const todayInterviews = upcomingInterviews.filter(
    (i) => new Date(i.scheduledAt).toISOString().split("T")[0] === today,
  );
  const thisWeekInterviews = upcomingInterviews.filter((i) => {
    const interviewDate = new Date(i.scheduledAt);
    const todayDate = new Date(today);
    const weekFromNow = new Date(todayDate);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return interviewDate >= todayDate && interviewDate <= weekFromNow;
  });
  const completedInterviews = allInterviews.filter(
    (i) => i.status === "completed",
  );

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "onsite":
        return <MapPin className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getInterviewerNames = (
    interviewerIds: string[],
    interviewerNamesArr?: string[],
  ) => {
    if (interviewerNamesArr && interviewerNamesArr.length > 0) {
      return interviewerNamesArr.join(", ");
    }
    return interviewerIds
      .map((id) => employees.find((e) => e.id === id)?.fullName || "Unknown")
      .join(", ");
  };

  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "bg-blue-500/20 text-blue-400";
      case "hr":
        return "bg-green-500/20 text-green-400";
      case "video":
        return "bg-purple-500/20 text-purple-400";
      case "phone":
        return "bg-yellow-500/20 text-yellow-400";
      case "onsite":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <>
      <PageHeader
        title="Interviews"
        subtitle="Manage interview schedules, calendar and meeting links"
      />
      <main className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Today's Interviews</CardDescription>
                <CardTitle className="text-2xl text-primary">
                  {todayInterviews.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>This Week</CardDescription>
                <CardTitle className="text-2xl text-warning">
                  {thisWeekInterviews.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>All Upcoming</CardDescription>
                <CardTitle className="text-2xl">
                  {upcomingInterviews.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardDescription>Completed</CardDescription>
                <CardTitle className="text-2xl text-success">
                  {completedInterviews.length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Today's Interviews */}
          {todayInterviews.length > 0 && (
            <Card className="bg-card border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>Today's Interviews - January 9, 2026</CardTitle>
                </div>
                <CardDescription>
                  Interviews scheduled for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 bg-primary/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                          {getInterviewTypeIcon(interview.type)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {interview.candidate.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {interview.jobTitle}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={cn(
                                "text-xs",
                                getInterviewTypeColor(interview.type),
                              )}
                            >
                              {interview.type.charAt(0).toUpperCase() +
                                interview.type.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-lg font-semibold">
                          <Clock className="h-4 w-4" />
                          {new Date(interview.scheduledAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {interview.duration} min
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Users className="h-3 w-3" />
                          {getInterviewerNames(
                            interview.interviewers,
                            interview.interviewerNames,
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {interview.meetingLink && (
                          <Button size="sm" className="gap-1" asChild>
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Video className="h-4 w-4" />
                              Join
                            </a>
                          </Button>
                        )}
                        {interview.location && (
                          <Badge variant="outline" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {interview.location}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interview Calendar View */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Interview Calendar</CardTitle>
              <CardDescription>
                All scheduled interviews this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {thisWeekInterviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No interviews scheduled this week</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {thisWeekInterviews.map((interview) => {
                    const interviewDate = new Date(interview.scheduledAt);
                    const isToday =
                      interviewDate.toISOString().split("T")[0] === today;

                    return (
                      <div
                        key={interview.id}
                        className={cn(
                          "flex items-center justify-between rounded-md border border-border p-4",
                          isToday && "bg-primary/5 border-primary/30",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[60px]">
                            <p className="text-xs text-muted-foreground uppercase">
                              {interviewDate.toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </p>
                            <p className="text-2xl font-bold">
                              {interviewDate.getDate()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {interviewDate.toLocaleDateString("en-US", {
                                month: "short",
                              })}
                            </p>
                          </div>
                          <div className="border-l border-border pl-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                                {getInterviewTypeIcon(interview.type)}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {interview.candidate.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {interview.jobTitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {interviewDate.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {interview.duration} minutes
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              "capitalize",
                              getInterviewTypeColor(interview.type),
                            )}
                          >
                            {interview.type}
                          </Badge>
                          {interview.meetingLink && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 bg-transparent"
                              asChild
                            >
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Join
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Interviews with Feedback */}
          {completedInterviews.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Completed Interviews</CardTitle>
                <CardDescription>
                  Past interviews with feedback and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between rounded-md border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/20">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {interview.candidate.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {interview.jobTitle} - {interview.type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Interviewers:{" "}
                            {getInterviewerNames(
                              interview.interviewers,
                              interview.interviewerNames,
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {new Date(interview.scheduledAt).toLocaleDateString()}
                        </p>
                        {interview.feedback &&
                          interview.feedback.length > 0 && (
                            <div className="flex items-center gap-1 justify-end mt-1">
                              {interview.feedback.map((fb, idx) => (
                                <Badge
                                  key={idx}
                                  variant={
                                    fb.recommendation === "strong_hire" ||
                                    fb.recommendation === "hire"
                                      ? "default"
                                      : fb.recommendation === "maybe"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="capitalize text-xs"
                                >
                                  {fb.recommendation.replace("_", " ")}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  );
}
