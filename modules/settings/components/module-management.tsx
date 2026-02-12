import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Button } from "@/modules/core/components/ui/button";
import { Plus } from "lucide-react";
import { ModuleRow } from "./module-row";
import { NavigationModule } from "@/modules/settings/api";

interface ModuleManagementProps {
  parentModules: NavigationModule[];
  modules: NavigationModule[];
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
  onAddModule: () => void;
}

export const ModuleManagement = ({
  parentModules,
  modules,
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
  onAddModule,
}: ModuleManagementProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground">
              Module Management
            </CardTitle>
            <CardDescription>
              Configure application modules, their hierarchy, and display order.
              Drag to reorder.
            </CardDescription>
          </div>
          <Button onClick={onAddModule}>
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {parentModules.map((module) => (
            <ModuleRow
              key={module.id}
              module={module}
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
      </CardContent>
    </Card>
  );
};
