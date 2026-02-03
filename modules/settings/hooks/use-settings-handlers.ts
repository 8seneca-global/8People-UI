import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActionType } from "@/lib/rbac";
import { useStore } from "@/lib/store";
import { useRoleManagement } from "./use-role-management";
import { useModuleManagement } from "./use-module-management";

export const useSettingsHandlers = () => {
  const router = useRouter();
  const { currentRole } = useStore();

  const roleState = useRoleManagement();
  const moduleState = useModuleManagement();

  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Redirect if not admin
  useEffect(() => {
    if (currentRole !== "admin") {
      router.push("/");
    }
  }, [currentRole, router]);

  // Permission Handlers (still in this hook as they bridge roles and modules)
  const isModuleEnabled = (moduleId: string): boolean => {
    const perms = roleState.editedModulePermissions[moduleId];
    if (perms && perms.length > 0) return true;

    const children = getChildModules(moduleId);
    return children.some((child) => isModuleEnabled(child.id));
  };

  const getChildModules = (parentId: string) =>
    moduleState.modules
      .filter((m) => m.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

  const toggleModuleEnabled = (moduleId: string) => {
    roleState.setHasPermissionChanges(true);
    const isEnabled = isModuleEnabled(moduleId);

    roleState.setEditedModulePermissions((prev) => {
      const updated = { ...prev };

      const setEnabledRecursive = (id: string, enable: boolean) => {
        if (enable) {
          // When enabling, we add 'view' as a default if nothing exists
          if (!updated[id]) {
            updated[id] = ["view"];
          }
        } else {
          // When disabling, we clear EVERYTHING for this module
          delete updated[id];
        }

        const children = getChildModules(id);
        children.forEach((child) => setEnabledRecursive(child.id, enable));
      };

      setEnabledRecursive(moduleId, !isEnabled);
      return updated;
    });

    if (isEnabled) {
      setExpandedModules((prev) => prev.filter((id) => id !== moduleId));
    }
  };

  const toggleAction = (moduleId: string, action: ActionType) => {
    roleState.setHasPermissionChanges(true);
    roleState.setEditedModulePermissions((prev) => {
      const updated = { ...prev };
      const currentActions = updated[moduleId] || [];
      const isAdding = !currentActions.includes(action);

      const updateModuleActions = (
        id: string,
        add: boolean,
        specificAction?: ActionType
      ) => {
        const targetAction = specificAction || action;
        const actions = updated[id] || [];

        if (add) {
          let newActions = [...actions];
          if (!newActions.includes(targetAction)) {
            newActions.push(targetAction);
          }
          // Rule: Edit/Delete requires View, but Create does not
          if (
            (targetAction === "edit" || targetAction === "delete") &&
            !newActions.includes("view")
          ) {
            newActions.push("view");
          }
          updated[id] = newActions;
        } else {
          let newActions = actions.filter((a) => a !== targetAction);
          // Rule: Removing View removes Edit/Delete, but keeps Create
          if (targetAction === "view") {
            newActions = newActions.filter((a) => a === "create");
          }

          if (newActions.length === 0) {
            delete updated[id];
          } else {
            updated[id] = newActions;
          }
        }
      };

      updateModuleActions(moduleId, isAdding);

      // Propagation logic
      const children = getChildModules(moduleId);
      if (children.length > 0) {
        children.forEach((child) => {
          if (action === "view") {
            // Propagate View to kids
            updateModuleActions(child.id, isAdding);
          } else if (isAdding) {
            // Other actions: if adding to parent, maybe add to kids too?
            // The user said "select a option in parent module, it also affect children module"
            // I removed this before, but if they want "Automatic Child Module Selection",
            // maybe it should apply for specific actions too?
            // Let's stick to just View for now as that's the "module selection" action.
          }
        });
      }

      return updated;
    });
  };

  const setModulePermissions = (moduleId: string, actions: ActionType[]) => {
    roleState.setHasPermissionChanges(true);
    roleState.setEditedModulePermissions((prev) => ({
      ...prev,
      [moduleId]: actions,
    }));
  };

  const savePermissionChanges = () => {
    if (roleState.selectedRoleId) {
      const permissionsUpdates = Object.entries(
        roleState.editedModulePermissions
      ).map(([moduleId, actions]) => ({
        moduleId,
        canView: actions.includes("view"),
        canCreate: actions.includes("create"),
        canEdit: actions.includes("edit"),
        canDelete: actions.includes("delete"),
      }));

      roleState.updateRolePermissions({
        id: roleState.selectedRoleId,
        data: { permissions: permissionsUpdates },
      });
      roleState.setHasPermissionChanges(false);
    }
  };

  const parentModules = moduleState.modules
    .filter((m) => !m.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const filteredEmployees = roleState.employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName}`
      .toLowerCase()
      .includes(roleState.employeeSearchQuery.toLowerCase())
  );

  return {
    currentRole,
    ...roleState,
    ...moduleState,
    parentModules,
    filteredEmployees,
    isModuleEnabled,
    getChildModules,
    toggleModuleEnabled,
    toggleAction,
    setModulePermissions,
    savePermissionChanges,
  };
};
