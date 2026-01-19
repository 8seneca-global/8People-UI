"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Building2, Users } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  onAddEmployee: () => void
}

export function QuickActions({ onAddEmployee }: QuickActionsProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-card-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button onClick={onAddEmployee} className="w-full justify-start gap-2" variant="secondary">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
        <Button asChild className="w-full justify-start gap-2" variant="secondary">
          <Link href="/organization/org-units">
            <Building2 className="h-4 w-4" />
            Manage Organization
          </Link>
        </Button>
        <Button asChild className="w-full justify-start gap-2" variant="secondary">
          <Link href="/employees">
            <Users className="h-4 w-4" />
            View All Employees
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
