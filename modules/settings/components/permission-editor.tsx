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
import { Pencil, Save, Trash2, User } from "lucide-react";
import { ActionType } from "@/lib/rbac";
import { roleIcons } from "./constants";
import { PermissionTree } from "./permission-tree";
import { Role } from "@/modules/settings/api/types";
import { NavigationModule } from "@/modules/settings/api";

interface PermissionEditorProps {
  selectedRole: Role | undefined;
  hasPermissionChanges: boolean;
  onSavePermissions: () => void;
  onEditRole: () => void;
  onDeleteRole: () => void;
  employees: any[]; // Assuming employee state from store
  // Props for PermissionTree
  parentModules: NavigationModule[];
  editedModulePermissions: Record<string, ActionType[]>;
  getChildModules: (parentId: string) => NavigationModule[];
  toggleModuleEnabled: (moduleId: string) => void;
  toggleAction: (moduleId: string, action: ActionType) => void;
  isModuleEnabled: (moduleId: string) => boolean;
  onPermissionCreated?: (moduleId: string, actions: ActionType[]) => void;
  onDeleteModule?: (module: NavigationModule) => void;
}

export const PermissionEditor = ({
  selectedRole,
  hasPermissionChanges,
  onSavePermissions,
  onEditRole,
  onDeleteRole,
  employees,
  parentModules,
  editedModulePermissions,
  getChildModules,
  toggleModuleEnabled,
  toggleAction,
  isModuleEnabled,
  onPermissionCreated,
  onDeleteModule,
}: PermissionEditorProps) => {
  return (
    <Card className="bg-card border-border lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground text-base flex items-center gap-2">
              {selectedRole?.name} Permissions
              {(selectedRole as any)?.isBuiltIn && (
                <Badge
                  variant="outline"
                  className="text-xs border-muted-foreground/30"
                >
                  Built-in
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{selectedRole?.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            {hasPermissionChanges && (
              <Button size="sm" onClick={onSavePermissions}>
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onEditRole}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit Role
            </Button>
            {!(selectedRole as any)?.isBuiltIn && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive bg-transparent"
                onClick={onDeleteRole}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Added assigned employees section */}
        {selectedRole &&
          (selectedRole as any).assignedEmployeeIds &&
          (selectedRole as any).assignedEmployeeIds.length > 0 && (
            <div className="mb-4 p-3 bg-secondary/30 rounded-lg border border-border">
              <p className="text-sm font-medium text-card-foreground mb-2">
                Assigned Employees (
                {(selectedRole as any).assignedEmployeeIds.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {(selectedRole as any).assignedEmployeeIds.map(
                  (empId: string) => {
                    const emp = employees.find((e) => e.id === empId);
                    return emp ? (
                      <Badge key={empId} variant="outline" className="text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {emp.firstName} {emp.lastName}
                      </Badge>
                    ) : null;
                  }
                )}
              </div>
            </div>
          )}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-3">
            Check modules to grant access. Actions (View, Create, Edit, Delete)
            appear when a module is enabled.
          </p>
        </div>
        <PermissionTree
          parentModules={parentModules}
          editedModulePermissions={editedModulePermissions}
          getChildModules={getChildModules}
          toggleModuleEnabled={toggleModuleEnabled}
          toggleAction={toggleAction}
          isModuleEnabled={isModuleEnabled}
          onPermissionCreated={onPermissionCreated}
          onDeleteModule={onDeleteModule}
        />
      </CardContent>
    </Card>
  );
};
