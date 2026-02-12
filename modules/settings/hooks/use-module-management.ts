import { useState } from "react";
import { useModules } from "@/modules/settings/api";
import { useCreateModule } from "@/modules/settings/api";
import { useUpdateModule } from "@/modules/settings/api";
import { useDeleteModule } from "@/modules/settings/api";

export const useModuleManagement = () => {
  const { data: modules = [] } = useModules();
  const { mutate: createModule } = useCreateModule();
  const { mutate: updateModule } = useUpdateModule();
  const { mutate: deleteModule } = useDeleteModule();

  const [createModuleOpen, setCreateModuleOpen] = useState(false);
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [deleteModuleConfirmOpen, setDeleteModuleConfirmOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [newModule, setNewModule] = useState({
    name: "",
    icon: "LayoutDashboard",
    urlPath: "",
    bePath: "",
    parentId: "",
    sortOrder: 0,
    isActive: true,
  });

  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [dragOverModuleId, setDragOverModuleId] = useState<string | null>(null);

  const selectedModule = selectedModuleId
    ? modules.find((m) => m.id === selectedModuleId)
    : null;

  const handleCreateModule = () => {
    if (newModule.name.trim()) {
      createModule({
        name: newModule.name,
        label: newModule.name,
        icon: newModule.icon,
        urlPath: newModule.urlPath || undefined,
        bePath: newModule.bePath || undefined,
        parentId: newModule.parentId || undefined,
        sortOrder: newModule.sortOrder,
        isActive: newModule.isActive,
      });
      setNewModule({
        name: "",
        icon: "LayoutDashboard",
        urlPath: "",
        bePath: "",
        parentId: "",
        sortOrder: 0,
        isActive: true,
      });
      setCreateModuleOpen(false);
    }
  };

  const handleEditModule = () => {
    if (selectedModuleId && newModule.name.trim()) {
      updateModule({
        id: selectedModuleId,
        data: {
          name: newModule.name,
          label: newModule.name,
          icon: newModule.icon,
          urlPath: newModule.urlPath || undefined,
          bePath: newModule.bePath || undefined,
          parentId: newModule.parentId || undefined,
          sortOrder: newModule.sortOrder,
          isActive: newModule.isActive,
        },
      });
      setEditModuleOpen(false);
    }
  };

  const handleDeleteModule = () => {
    if (selectedModuleId) {
      deleteModule(selectedModuleId);
      setSelectedModuleId(null);
      setDeleteModuleConfirmOpen(false);
    }
  };

  const openEditModule = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    if (module) {
      setSelectedModuleId(moduleId);
      setNewModule({
        name: module.name,
        icon: module.icon || "LayoutDashboard",
        urlPath: module.urlPath || "",
        bePath: module.bePath || "",
        parentId: module.parentId || "",
        sortOrder: module.sortOrder,
        isActive: module.isActive,
      });
      setEditModuleOpen(true);
    }
  };

  const openDeleteModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setDeleteModuleConfirmOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, moduleId: string) => {
    setDraggedModuleId(moduleId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, moduleId: string) => {
    e.preventDefault();
    if (draggedModuleId && draggedModuleId !== moduleId) {
      setDragOverModuleId(moduleId);
    }
  };

  const handleDragLeave = () => {
    setDragOverModuleId(null);
  };

  const handleDrop = (e: React.DragEvent, targetModuleId: string) => {
    e.preventDefault();
    if (!draggedModuleId || draggedModuleId === targetModuleId) {
      setDraggedModuleId(null);
      setDragOverModuleId(null);
      return;
    }
    console.log("Reorder triggered via Drop", {
      draggedModuleId,
      targetModuleId,
    });
    setDraggedModuleId(null);
    setDragOverModuleId(null);
  };

  const handleDragEnd = () => {
    setDraggedModuleId(null);
    setDragOverModuleId(null);
  };

  return {
    modules,
    createModuleOpen,
    setCreateModuleOpen,
    editModuleOpen,
    setEditModuleOpen,
    deleteModuleConfirmOpen,
    setDeleteModuleConfirmOpen,
    selectedModuleId,
    selectedModule,
    newModule,
    setNewModule,
    draggedModuleId,
    dragOverModuleId,
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
  };
};
