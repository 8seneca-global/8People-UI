import React from "react";
import { Badge } from "@/modules/core/components/ui/badge";
import { Button } from "@/modules/core/components/ui/button";
import { GripVertical, LayoutDashboard, Pencil, Trash2 } from "lucide-react";
import { iconMap } from "./constants";
import { NavigationModule } from "@/modules/settings/api";

interface ModuleRowProps {
  module: NavigationModule;
  isChild?: boolean;
  draggedModuleId: string | null;
  dragOverModuleId: string | null;
  handleDragStart: (e: React.DragEvent, moduleId: string) => void;
  handleDragOver: (e: React.DragEvent, moduleId: string) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, targetModuleId: string) => void;
  handleDragEnd: () => void;
  openEditModule: (moduleId: string) => void;
  openDeleteModule: (moduleId: string) => void;
  getChildModules: (parentId: string) => NavigationModule[];
  modules: NavigationModule[];
}

export const ModuleRow = ({
  module,
  isChild = false,
  draggedModuleId,
  dragOverModuleId,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragEnd,
  openEditModule,
  openDeleteModule,
  getChildModules,
  modules,
}: ModuleRowProps) => {
  const Icon = iconMap[module.icon || ""] || LayoutDashboard;
  const childModules = getChildModules(module.id);
  const hasChildren = childModules.length > 0;
  const isDragging = draggedModuleId === module.id;
  const isDragOver = dragOverModuleId === module.id;
  const parentModule = module.parentId
    ? modules.find((m) => m.id === module.parentId)
    : null;
  const isParentPage =
    parentModule && parentModule.urlPath && parentModule.urlPath !== "#";

  return (
    <div key={module.id}>
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, module.id)}
        onDragOver={(e) => handleDragOver(e, module.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, module.id)}
        onDragEnd={handleDragEnd}
        className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
          isChild ? "ml-8 bg-secondary/30" : "bg-card"
        } ${isDragging ? "opacity-50 border-dashed" : ""} ${
          isDragOver ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-md bg-primary/10`}
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-card-foreground">{module.name}</p>
          <div className="flex flex-col gap-1 mt-1">
            {module.bePath && (
              <p className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded w-fit">
                BE: {module.bePath}
              </p>
            )}
            {module.urlPath && (
              <p className="text-[10px] text-primary bg-primary/5 px-1.5 py-0.5 rounded w-fit">
                URL: {module.urlPath}
              </p>
            )}
            {!module.bePath && !module.urlPath && (
              <p className="text-xs text-muted-foreground italic">
                Parent Module (Group)
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={module.isActive ? "default" : "secondary"}>
            {module.isActive ? "Active" : "Inactive"}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openEditModule(module.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => openDeleteModule(module.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {hasChildren && (
        <div className="mt-2 space-y-2">
          {childModules.map((child) => (
            <ModuleRow
              key={child.id}
              module={child}
              isChild={true}
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
              modules={modules}
            />
          ))}
        </div>
      )}
    </div>
  );
};
