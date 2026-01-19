"use client"

import type React from "react"

import { useStore } from "@/lib/store"
import type { Role } from "@/lib/rbac"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, Shield, UserCog, User, Crown, UserCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  hr: <UserCog className="h-4 w-4" />,
  "hr-specialist": <UserCheck className="h-4 w-4" />,
  "team-lead": <Crown className="h-4 w-4" />,
  employee: <User className="h-4 w-4" />,
}

export function RoleSwitcher() {
  const { currentRole, setCurrentRole, customRoles } = useStore()
  const router = useRouter()

  const currentRoleData = customRoles.find((r) => r.id === currentRole) || customRoles[0]

  const handleRoleSwitch = (roleId: string) => {
    setCurrentRole(roleId as Role)
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/50 p-3 transition-colors hover:bg-sidebar-accent">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", currentRoleData.color)}>
            {roleIcons[currentRole] || <User className="h-4 w-4" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-sidebar-foreground">{currentRoleData.name}</p>
            <p className="text-xs text-sidebar-foreground/60">Switch view mode</p>
          </div>
          <ChevronDown className="h-4 w-4 text-sidebar-foreground/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">View application as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {customRoles.map((role) => (
          <DropdownMenuItem
            key={role.id}
            onClick={() => handleRoleSwitch(role.id)}
            className="flex items-center gap-3 py-2"
          >
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", role.color)}>
              {roleIcons[role.id] || <User className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{role.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{role.description}</p>
            </div>
            {currentRole === role.id && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
