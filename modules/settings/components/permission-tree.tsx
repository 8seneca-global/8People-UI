import React from "react";
import { Checkbox } from "@/modules/core/components/ui/checkbox";
import { LayoutDashboard, Plus, X } from "lucide-react";
import { ActionType, moduleActions } from "@/lib/rbac";
import { actionIcons, iconMap } from "./constants";
import { NavigationModule } from "@/modules/settings/api";
import { Button } from "@/modules/core/components/ui/button";
import { AddCustomPermissionDialog } from "./add-custom-permission-dialog";

interface PermissionTreeProps {
  parentModules: NavigationModule[];
  editedModulePermissions: Record<string, ActionType[]>;
  getChildModules: (parentId: string) => NavigationModule[];
  toggleModuleEnabled: (moduleId: string) => void;
  toggleAction: (moduleId: string, action: ActionType) => void;
  isModuleEnabled: (moduleId: string) => boolean;
  onPermissionCreated?: (moduleId: string, actions: ActionType[]) => void;
  onDeleteModule?: (module: NavigationModule) => void;
}

export const PermissionTree = ({
  parentModules,
  editedModulePermissions,
  getChildModules,
  toggleModuleEnabled,
  toggleAction,
  isModuleEnabled,
  onPermissionCreated,
  onDeleteModule,
}: PermissionTreeProps) => {
  const [permissionDialogOpen, setPermissionDialogOpen] = React.useState(false);
  const [selectedParentModule, setSelectedParentModule] =
    React.useState<NavigationModule | null>(null);
  const [editingModule, setEditingModule] =
    React.useState<NavigationModule | null>(null);

  const handleAddPermission = (module: NavigationModule) => {
    setSelectedParentModule(module);
    setPermissionDialogOpen(true);
  };

  const handleEditPermission = (
    module: NavigationModule,
    parent?: NavigationModule
  ) => {
    setEditingModule(module);
    if (parent) setSelectedParentModule(parent);
    setPermissionDialogOpen(true);
  };

  return (
    <div className="space-y-3">
      {parentModules.map((parentModule) => {
        const childModules = getChildModules(parentModule.id);
        const hasChildren = childModules.length > 0;
        const isParentEnabled = isModuleEnabled(parentModule.id);

        const isGroup = !parentModule.urlPath || parentModule.urlPath === "#";

        // Children with URL paths are Pages (Sub-rows)
        // Children without URL paths are Actions (Inline tags)
        const subNavigationModules = childModules.filter(
          (m) => m.urlPath && m.urlPath !== "#"
        );
        const customPermissions = childModules.filter(
          (m) => !m.urlPath || m.urlPath === "#"
        );

        const isExpanded = isParentEnabled && subNavigationModules.length > 0;
        const Icon = iconMap[parentModule.icon || ""] || LayoutDashboard;

        return (
          <div
            key={parentModule.id}
            className="rounded-lg border border-border overflow-hidden"
          >
            {/* Parent Module */}
            <div
              className={`flex items-center gap-3 p-3 bg-card ${!isGroup ? "border-b-0" : ""}`}
            >
              <Checkbox
                checked={isParentEnabled}
                onCheckedChange={() => toggleModuleEnabled(parentModule.id)}
                className="border-border data-[state=checked]:bg-primary"
              />
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 font-medium text-card-foreground">
                {parentModule.name}
              </span>

              {isParentEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 ml-auto text-[10px] gap-1 border-border font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                  title="Add Action"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddPermission(parentModule);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Action
                </Button>
              )}
            </div>

            {/* Actions for Module (CRUD + Custom Actions) */}
            <div className={`border-t border-border bg-secondary/30 p-3 pl-14`}>
              <div className="flex flex-wrap gap-2 items-center">
                {moduleActions.map((action) => {
                  const isChecked = (
                    editedModulePermissions[parentModule.id] || []
                  ).includes(action.id);
                  return (
                    <div
                      key={action.id}
                      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 cursor-pointer transition-colors ${
                        isChecked
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-secondary"
                      }`}
                      onClick={() => toggleAction(parentModule.id, action.id)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() =>
                          toggleAction(parentModule.id, action.id)
                        }
                        className="border-border data-[state=checked]:bg-primary h-3.5 w-3.5"
                      />
                      {actionIcons[action.id]}
                      <span className="text-sm">{action.name}</span>
                    </div>
                  );
                })}

                {/* Custom Actions Inline */}
                {customPermissions.length > 0 && (
                  <div className="w-px h-6 bg-border mx-2" />
                )}
                {customPermissions.map((cp) => {
                  const isCpEnabled = isModuleEnabled(cp.id);
                  return (
                    <div key={cp.id} className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors cursor-pointer ${
                          isCpEnabled
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-secondary"
                        }`}
                        onClick={() => handleEditPermission(cp, parentModule)}
                      >
                        <Checkbox
                          checked={isCpEnabled}
                          onCheckedChange={() => {}}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModuleEnabled(cp.id);
                          }}
                          className="h-3.5 w-3.5 border-border data-[state=checked]:bg-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          {cp.name}
                        </span>
                        {/* Inline Actions for CP */}
                        {isCpEnabled && (
                          <div className="flex gap-1 ml-2 border-l border-border pl-2">
                            {moduleActions.map((action) => {
                              const isChecked = (
                                editedModulePermissions[cp.id] || []
                              ).includes(action.id);
                              return (
                                <div
                                  key={action.id}
                                  className={`p-1 rounded cursor-pointer ${isChecked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAction(cp.id, action.id);
                                  }}
                                  title={action.name}
                                >
                                  {actionIcons[action.id]}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div
                          className="ml-2 p-1 text-muted-foreground hover:text-destructive cursor-pointer border-l border-border pl-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onDeleteModule) onDeleteModule(cp);
                          }}
                          title="Delete Action"
                        >
                          <X className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Child items (Sub-modules) - only for Groups */}
            {hasChildren && (
              <div className="border-t border-border">
                {subNavigationModules.map((childModule) => {
                  const isChildEnabled = isModuleEnabled(childModule.id);
                  const ChildIcon =
                    iconMap[childModule.icon || ""] || LayoutDashboard;

                  // Fetch Grandchildren
                  const allChildrenOfChild = getChildModules(childModule.id);
                  // For now, only show non-navigable children as inline actions
                  const grandChildren = allChildrenOfChild.filter(
                    (m) => !m.urlPath || m.urlPath === "#"
                  );
                  const greatGrandNavModules = allChildrenOfChild.filter(
                    (m) => m.urlPath && m.urlPath !== "#"
                  );

                  return (
                    <div
                      key={childModule.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-3 p-3 pl-10 bg-secondary/20">
                        <Checkbox
                          checked={isChildEnabled}
                          onCheckedChange={() =>
                            toggleModuleEnabled(childModule.id)
                          }
                          className="border-border data-[state=checked]:bg-primary"
                        />
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                          <ChildIcon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm text-card-foreground flex-1">
                          {childModule.name}
                        </span>

                        {isChildEnabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 ml-auto text-[10px] gap-1 border-border font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Add Action"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddPermission(childModule);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                            Action
                          </Button>
                        )}
                      </div>

                      {/* Actions for child (Page) */}
                      <div className="bg-secondary/10 p-3 pl-20">
                        <div className="flex flex-wrap gap-2 items-center">
                          {moduleActions.map((action) => {
                            const isChecked = (
                              editedModulePermissions[childModule.id] || []
                            ).includes(action.id);
                            return (
                              <div
                                key={action.id}
                                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 cursor-pointer transition-colors ${
                                  isChecked
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:bg-secondary"
                                }`}
                                onClick={() =>
                                  toggleAction(childModule.id, action.id)
                                }
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    toggleAction(childModule.id, action.id)
                                  }
                                  className="border-border data-[state=checked]:bg-primary h-3.5 w-3.5"
                                />
                                {actionIcons[action.id]}
                                <span className="text-sm">{action.name}</span>
                              </div>
                            );
                          })}

                          {/* Inline Custom Permissions for Child */}
                          {grandChildren.length > 0 && (
                            <div className="w-px h-6 bg-border mx-2" />
                          )}
                          {grandChildren.map((gc) => {
                            const isGcEnabled = isModuleEnabled(gc.id);
                            return (
                              <div
                                key={gc.id}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors cursor-pointer ${
                                    isGcEnabled
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:bg-secondary"
                                  }`}
                                  onClick={() =>
                                    handleEditPermission(gc, childModule)
                                  }
                                >
                                  <Checkbox
                                    checked={isGcEnabled}
                                    onCheckedChange={() => {}}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleModuleEnabled(gc.id);
                                    }}
                                    className="h-3.5 w-3.5 border-border data-[state=checked]:bg-primary"
                                  />
                                  <span className="text-sm text-foreground font-medium">
                                    {gc.name}
                                  </span>
                                  {isGcEnabled && (
                                    <div className="flex gap-1 ml-2 border-l border-border pl-2">
                                      {moduleActions.map((action) => {
                                        const isChecked = (
                                          editedModulePermissions[gc.id] || []
                                        ).includes(action.id);
                                        return (
                                          <div
                                            key={action.id}
                                            className={`p-1 rounded cursor-pointer ${isChecked ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleAction(gc.id, action.id);
                                            }}
                                            title={action.name}
                                          >
                                            {actionIcons[action.id]}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                  <div
                                    className="ml-2 p-1 text-muted-foreground hover:text-destructive cursor-pointer border-l border-border pl-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onDeleteModule) onDeleteModule(gc);
                                    }}
                                    title="Delete Action"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <AddCustomPermissionDialog
        open={permissionDialogOpen}
        onOpenChange={(open) => {
          setPermissionDialogOpen(open);
          if (!open) {
            setEditingModule(null);
            setSelectedParentModule(null);
          }
        }}
        parentModule={selectedParentModule}
        editModule={editingModule}
        currentActions={
          editingModule
            ? editedModulePermissions[editingModule.id] || []
            : ["view"]
        }
        onPermissionCreated={onPermissionCreated}
      />
    </div>
  );
};
