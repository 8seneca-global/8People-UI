"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/modules/core/components/ui/card"
import { Badge } from "@/modules/core/components/ui/badge"
import { useStore } from "@/lib/store"
import { Network, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/modules/core/components/ui/button"

export function OrgTreePreview() {
  const { organizationalUnits, positions } = useStore()

  // Get divisions (level 2) and departments (level 3)
  const divisions = organizationalUnits.filter((u) => u.level === 2 && u.status === "active")

  // Get positions count per org unit
  const getPositionStats = (unitId: string) => {
    const unitPositions = positions.filter((p) => p.organizationalUnitId === unitId && p.status === "active")
    const filled = unitPositions.filter((p) => p.hiringStatus === "filled").length
    const vacant = unitPositions.filter((p) => p.hiringStatus === "vacant" || p.hiringStatus === "hiring").length
    return { total: unitPositions.length, filled, vacant }
  }

  // Get child units
  const getChildUnits = (parentId: string) => {
    return organizationalUnits.filter((u) => u.parentId === parentId && u.status === "active")
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">Organization Structure</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/organization">View Full Chart</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {divisions.slice(0, 3).map((division) => {
            const departments = getChildUnits(division.id)
            const divStats = getPositionStats(division.id)

            return (
              <div key={division.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-purple-500/20">
                    <Network className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="font-medium text-card-foreground">{division.name}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {division.code}
                  </Badge>
                </div>
                {departments.length > 0 && (
                  <div className="mt-2 ml-6 space-y-1">
                    {departments.slice(0, 3).map((dept) => {
                      const deptStats = getPositionStats(dept.id)
                      return (
                        <div key={dept.id} className="flex items-center gap-2 text-sm py-1">
                          <Users className="h-3 w-3 text-blue-500" />
                          <span className="text-muted-foreground">{dept.name}</span>
                          <div className="ml-auto flex items-center gap-2">
                            {deptStats.vacant > 0 && (
                              <Badge variant="destructive" className="text-xs h-5">
                                {deptStats.vacant} vacant
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">{deptStats.filled} filled</span>
                          </div>
                        </div>
                      )
                    })}
                    {departments.length > 3 && (
                      <p className="text-xs text-muted-foreground ml-5">+{departments.length - 3} more departments</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
