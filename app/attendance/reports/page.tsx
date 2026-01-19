"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/layout/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AttendanceReportsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/attendance/timesheet")
  }, [router])

  return (
    <AdminLayout title="Attendance Reports" subtitle="Redirecting...">
      <Card className="h-[200px] flex items-center justify-center">
        <CardContent className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecting to the merged Timesheet view...</p>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
