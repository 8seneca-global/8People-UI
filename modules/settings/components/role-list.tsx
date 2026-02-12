import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Button } from "@/modules/core/components/ui/button";
import { Badge } from "@/modules/core/components/ui/badge";
import { Plus, User } from "lucide-react";
import { roleIcons } from "./constants";
import { Role } from "@/modules/settings/api/types";

interface RoleListProps {
  roles: Role[];
  selectedRoleId: string | null;
  onSelectRole: (roleId: string) => void;
  onAddRole: () => void;
}

export const RoleList = ({
  roles,
  selectedRoleId,
  onSelectRole,
  onAddRole,
}: RoleListProps) => {
  return (
    <Card className="bg-card border-border lg:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground text-base">
            User Roles
          </CardTitle>
          <Button size="sm" onClick={onAddRole}>
            <Plus className="h-4 w-4 mr-1" />
            Add Role
          </Button>
        </div>
        <CardDescription>
          Select a role to view and edit permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
              selectedRoleId === role.id
                ? "border-primary bg-primary/10"
                : "border-border bg-transparent hover:bg-secondary"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-md ${(role as any).color}`}
            >
              {roleIcons[role.id] || <User className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-card-foreground">
                  {(role as any).description || role.name}
                </p>
                {(role as any).isBuiltIn && (
                  <Badge
                    variant="outline"
                    className="text-xs border-muted-foreground/30"
                  >
                    Built-in
                  </Badge>
                )}
              </div>
              {(role as any).description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {role.name}
                </p>
              )}
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
