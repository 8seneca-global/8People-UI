import { useState, useEffect } from "react";
import { ActionType } from "@/lib/rbac";
import { useRoles } from "@/modules/settings/api";
import { useCreateRole } from "@/modules/settings/api";
import { useUpdateRole } from "@/modules/settings/api";
import { useDeleteRole } from "@/modules/settings/api";
import { useUpdateRolePermissions } from "@/modules/settings/api";
import { useEmployees } from "@/modules/employees/api";
import { useStore } from "@/lib/store";
import { colorOptions } from "../components/constants";

export const useRoleManagement = () => {
  const { data: employeeData } = useEmployees();
  const employees = employeeData?.data || [];
  const { data: roles = [] } = useRoles();
  const { mutate: createRole } = useCreateRole();
  const { mutate: updateRole } = useUpdateRole();
  const { mutate: deleteRole } = useDeleteRole();
  const { mutate: updateRolePermissions } = useUpdateRolePermissions();

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [hasPermissionChanges, setHasPermissionChanges] = useState(false);
  const [editedModulePermissions, setEditedModulePermissions] = useState<
    Record<string, ActionType[]>
  >({});

  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    color: colorOptions[0].value,
  });

  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  useEffect(() => {
    if (selectedRole) {
      const permissionsMap: Record<string, ActionType[]> = {};
      (selectedRole as any).permissions?.forEach((p: any) => {
        if (!permissionsMap[p.moduleId]) {
          permissionsMap[p.moduleId] = [];
        }
        if (p.canView) permissionsMap[p.moduleId].push("view");
        if (p.canCreate) permissionsMap[p.moduleId].push("create");
        if (p.canEdit) permissionsMap[p.moduleId].push("edit");
        if (p.canDelete) permissionsMap[p.moduleId].push("delete");
      });
      setEditedModulePermissions(permissionsMap);
      setHasPermissionChanges(false);
    }
  }, [selectedRoleId, selectedRole]);

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const handleCreateRole = () => {
    if (newRole.name.trim()) {
      const userIds = assignedEmployeeIds
        .map((empId) => {
          const emp = employees.find((e) => e.id === empId);
          return emp?.user?.id;
        })
        .filter(Boolean) as string[];

      createRole({
        name: newRole.name,
        description: newRole.description,
        userIds,
      });
      setNewRole({ name: "", description: "", color: colorOptions[0].value });
      setAssignedEmployeeIds([]);
      setCreateRoleOpen(false);
    }
  };

  const handleEditRole = () => {
    if (selectedRole && newRole.name.trim()) {
      const userIds = assignedEmployeeIds
        .map((empId) => {
          const emp = employees.find((e) => e.id === empId);
          return (emp as any)?.user?.id;
        })
        .filter(Boolean) as string[];

      updateRole({
        id: selectedRole.id,
        data: {
          name: newRole.name,
          description: newRole.description,
          userIds,
        },
      });
      setNewRole({ name: "", description: "", color: colorOptions[0].value });
      setAssignedEmployeeIds([]);
      setEditRoleOpen(false);
    }
  };

  const handleDeleteRole = () => {
    if (selectedRoleId && selectedRole && !(selectedRole as any).isBuiltIn) {
      deleteRole(selectedRoleId);
      setSelectedRoleId(roles[0]?.id || null);
      setDeleteConfirmOpen(false);
    }
  };

  const openEditRole = () => {
    if (selectedRole) {
      setNewRole({
        name: selectedRole.name,
        description: selectedRole.description || "",
        color: colorOptions[0].value,
      });

      // Initialize assignedEmployeeIds from selectedRole.userRoles
      const initialEmployeeIds =
        (selectedRole as any).userRoles
          ?.map((ur: any) => ur.user?.employee?.id)
          .filter(Boolean) || [];

      setAssignedEmployeeIds(initialEmployeeIds);
      setEditRoleOpen(true);
    }
  };

  const toggleEmployeeAssignment = (employeeId: string) => {
    setAssignedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  return {
    roles,
    employees,
    selectedRoleId,
    setSelectedRoleId,
    selectedRole,
    hasPermissionChanges,
    setHasPermissionChanges,
    editedModulePermissions,
    setEditedModulePermissions,
    createRoleOpen,
    setCreateRoleOpen,
    editRoleOpen,
    setEditRoleOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    newRole,
    setNewRole,
    assignedEmployeeIds,
    employeeSearchOpen,
    setEmployeeSearchOpen,
    employeeSearchQuery,
    setEmployeeSearchQuery,
    handleCreateRole,
    handleEditRole,
    handleDeleteRole,
    openEditRole,
    toggleEmployeeAssignment,
    updateRolePermissions,
  };
};
