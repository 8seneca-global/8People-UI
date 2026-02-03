"use client";

import type React from "react";
import { useStore } from "@/lib/store";
import type { Role as RoleType } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Shield,
  UserCog,
  User,
  Crown,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMyRoles } from "@/modules/settings/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/modules/core/components/ui/dropdown-menu";

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  hr_manager: <UserCog className="h-4 w-4" />,
  "hr-specialist": <UserCheck className="h-4 w-4" />,
  "team-lead": <Crown className="h-4 w-4" />,
  employee: <User className="h-4 w-4" />,
};

// Map role slugs to icons helper
const getRoleIcon = (name: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, "_");
  return roleIcons[slug] || <User className="h-4 w-4" />;
};

const colorOptions = [
  "bg-rose-500/20 text-rose-400",
  "bg-sky-500/20 text-sky-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-amber-500/20 text-amber-400",
  "bg-violet-500/20 text-violet-400",
  "bg-pink-500/20 text-pink-400",
  "bg-cyan-500/20 text-cyan-400",
  "bg-orange-500/20 text-orange-400",
];

import { useEffect } from "react";

export function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useStore();
  const { data: roles = [], isLoading } = useMyRoles();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Find the current role data. If currentRole is a slug (default), find by name.
  // Otherwise find by ID (UUID).
  // Map role name to the slug used by rbac.ts
  const getRoleSlug = (name: string): any => {
    const n = name.toLowerCase();
    if (n.includes("admin")) return "admin";
    if (n.includes("hr")) return "hr";
    if (n.includes("employee")) return "employee";
    return "employee";
  };

  const { activeRoleId } = useStore();

  // Find the current role data. Prioritize activeRoleId (UUID).
  const currentRoleData =
    roles.find((r) => r.id === activeRoleId) ||
    roles.find((r) => r.name.toLowerCase() === currentRole.toLowerCase()) ||
    roles[0];

  useEffect(() => {
    if (!isLoading && roles.length > 0) {
      // If current role is still a initial value or we don't have activeRoleId, initialize
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          currentRole,
        );

      const { activeRoleId } = useStore.getState();

      if (!isUuid || !activeRoleId) {
        const matchingRole =
          roles.find((r) => r.name.toLowerCase().includes(currentRole)) ||
          roles[0];
        if (matchingRole) {
          console.log(
            `[RoleSwitcher] Initializing currentRole with Slug: ${getRoleSlug(matchingRole.name)} and UUID: ${matchingRole.id}`,
          );
          setCurrentRole(getRoleSlug(matchingRole.name), matchingRole.id);
        }
      }
    }
  }, [isLoading, roles, currentRole, setCurrentRole]);

  const handleRoleSwitch = (roleId: string) => {
    // Clear all cached data to ensure the new role doesn't reuse unauthorized data
    queryClient.clear();

    const roleData = roles.find((r) => r.id === roleId);
    if (roleData) {
      setCurrentRole(getRoleSlug(roleData.name), roleId);
    }

    router.push("/");
  };

  const getRoleColor = (index: number) => {
    return colorOptions[index % colorOptions.length];
  };

  if (!currentRoleData) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex w-full items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3 transition-all hover:bg-primary/10 hover:border-primary/20 hover:shadow-sm">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-transform group-hover:scale-105",
              getRoleColor(roles.indexOf(currentRoleData)),
            )}
          >
            {getRoleIcon(currentRoleData.name)}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-foreground leading-tight">
              {currentRoleData.name}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
              Switch view mode
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72 p-2 bg-background/80 backdrop-blur-xl border-primary/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic opacity-70">
          View application as
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/5 mx-2" />
        <div className="mt-1 space-y-1">
          {roles.map((role, idx) => (
            <DropdownMenuItem
              key={role.id}
              onClick={() => handleRoleSwitch(role.id)}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl border border-transparent transition-all cursor-pointer group/item",
                currentRole === role.id &&
                  "bg-primary/5 border-primary/10 shadow-sm",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-xs transition-transform group-hover/item:scale-105",
                  getRoleColor(idx),
                )}
              >
                {getRoleIcon(role.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground leading-none">
                  {role.name}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1 font-medium italic opacity-80">
                  {role.description}
                </p>
              </div>
              {currentRole === role.id && (
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
