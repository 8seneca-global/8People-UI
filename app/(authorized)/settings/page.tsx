"use client";

import React from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/core/components/ui/tabs";

// Components
import { RoleList } from "@/modules/settings/components/role-list";
import { PermissionEditor } from "@/modules/settings/components/permission-editor";
import { ModuleManagement } from "@/modules/settings/components/module-management";
import { GeneralSettings } from "@/modules/settings/components/general-settings";
import { CreateRoleDialog } from "@/modules/settings/components/create-role-dialog";
import { EditRoleDialog } from "@/modules/settings/components/edit-role-dialog";
import { DeleteRoleDialog } from "@/modules/settings/components/delete-role-dialog";
import { CreateModuleDialog } from "@/modules/settings/components/create-module-dialog";
import { EditModuleDialog } from "@/modules/settings/components/edit-module-dialog";
import { DeleteModuleDialog } from "@/modules/settings/components/delete-module-dialog";
import { useSettingsHandlers } from "@/modules/settings/hooks/use-settings-handlers";

export default function SettingsPage() {
  const {
    currentRole,
    employees,
    roles,
    modules,
    selectedRoleId,
    setSelectedRoleId,
    selectedRole,
    selectedModule,
    hasPermissionChanges,
    editedModulePermissions,
    createModuleOpen,
    setCreateModuleOpen,
    editModuleOpen,
    setEditModuleOpen,
    deleteModuleConfirmOpen,
    setDeleteModuleConfirmOpen,
    selectedModuleId,
    newModule,
    setNewModule,
    draggedModuleId,
    dragOverModuleId,
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
    parentModules,
    filteredEmployees,
    isModuleEnabled,
    getChildModules,
    toggleModuleEnabled,
    handleCreateRole,
    handleEditRole,
    handleDeleteRole,
    openEditRole,
    toggleEmployeeAssignment,
    handleCreateModule,
    handleEditModule,
    handleDeleteModule,
    openEditModule,
    openDeleteModule,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    toggleAction,
    setModulePermissions,
    savePermissionChanges,
  } = useSettingsHandlers();

  if (currentRole !== "admin") {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Configure roles, permissions, and system settings"
      />
      <main className="p-4 md:p-6">
        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="general">General Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <RoleList
                roles={roles}
                selectedRoleId={selectedRoleId}
                onSelectRole={setSelectedRoleId}
                onAddRole={() => setCreateRoleOpen(true)}
              />
              <PermissionEditor
                selectedRole={selectedRole}
                hasPermissionChanges={hasPermissionChanges}
                onSavePermissions={savePermissionChanges}
                onEditRole={openEditRole}
                onDeleteRole={() => setDeleteConfirmOpen(true)}
                employees={employees}
                parentModules={parentModules}
                editedModulePermissions={editedModulePermissions}
                getChildModules={getChildModules}
                toggleModuleEnabled={toggleModuleEnabled}
                toggleAction={toggleAction}
                isModuleEnabled={isModuleEnabled}
                onPermissionCreated={setModulePermissions}
                onDeleteModule={(module) => openDeleteModule(module.id)}
              />
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <ModuleManagement
              parentModules={parentModules}
              modules={modules}
              draggedModuleId={draggedModuleId}
              dragOverModuleId={dragOverModuleId}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              handleDragEnd={handleDragEnd}
              openEditModule={openEditModule}
              openDeleteModule={openDeleteModule}
              getChildModules={getChildModules}
              onAddModule={() => setCreateModuleOpen(true)}
            />
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateRoleDialog
          open={createRoleOpen}
          onOpenChange={setCreateRoleOpen}
          newRole={newRole}
          setNewRole={setNewRole}
          assignedEmployeeIds={assignedEmployeeIds}
          toggleEmployeeAssignment={toggleEmployeeAssignment}
          employees={employees}
          employeeSearchOpen={employeeSearchOpen}
          setEmployeeSearchOpen={setEmployeeSearchOpen}
          employeeSearchQuery={employeeSearchQuery}
          setEmployeeSearchQuery={setEmployeeSearchQuery}
          filteredEmployees={filteredEmployees}
          handleCreateRole={handleCreateRole}
        />

        <EditRoleDialog
          open={editRoleOpen}
          onOpenChange={setEditRoleOpen}
          newRole={newRole}
          setNewRole={setNewRole}
          assignedEmployeeIds={assignedEmployeeIds}
          toggleEmployeeAssignment={toggleEmployeeAssignment}
          employees={employees}
          employeeSearchOpen={employeeSearchOpen}
          setEmployeeSearchOpen={setEmployeeSearchOpen}
          employeeSearchQuery={employeeSearchQuery}
          setEmployeeSearchQuery={setEmployeeSearchQuery}
          filteredEmployees={filteredEmployees}
          handleEditRole={handleEditRole}
        />

        <DeleteRoleDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          selectedRole={selectedRole}
          handleDeleteRole={handleDeleteRole}
        />

        <CreateModuleDialog
          open={createModuleOpen}
          onOpenChange={setCreateModuleOpen}
          newModule={newModule}
          setNewModule={setNewModule}
          parentModules={parentModules}
          allModules={modules}
          handleCreateModule={handleCreateModule}
        />

        <EditModuleDialog
          open={editModuleOpen}
          onOpenChange={setEditModuleOpen}
          newModule={newModule}
          setNewModule={setNewModule}
          parentModules={parentModules}
          allModules={modules}
          selectedModuleId={selectedModuleId}
          handleEditModule={handleEditModule}
        />

        <DeleteModuleDialog
          open={deleteModuleConfirmOpen}
          onOpenChange={setDeleteModuleConfirmOpen}
          selectedModule={selectedModule}
          handleDeleteModule={handleDeleteModule}
        />
      </main>
    </>
  );
}
