import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/modules/core/components/ui/dialog";
import { Button } from "@/modules/core/components/ui/button";
import { Label } from "@/modules/core/components/ui/label";
import { Input } from "@/modules/core/components/ui/input";
import { Switch } from "@/modules/core/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import { IconPicker } from "./icon-picker";
import { RouteCombobox } from "./route-combobox";
import { FrontendRouteCombobox } from "./frontend-route-combobox";
import { iconOptions } from "./constants";
import { NavigationModule } from "@/modules/settings/api";

interface EditModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newModule: any;
  setNewModule: React.Dispatch<React.SetStateAction<any>>;
  parentModules: NavigationModule[];
  allModules: NavigationModule[];
  selectedModuleId: string | null;
  handleEditModule: () => void;
}

export const EditModuleDialog = ({
  open,
  onOpenChange,
  newModule,
  setNewModule,
  parentModules,
  allModules,
  selectedModuleId,
  handleEditModule,
}: EditModuleDialogProps) => {
  const excludedRoutes = allModules
    .filter((m) => m.id !== selectedModuleId)
    .map((m) => m.urlPath)
    .filter((path): path is string => !!path && path !== "#");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Edit Module
          </DialogTitle>
          <DialogDescription>Update module configuration</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Module Name</Label>
            <Input
              value={newModule.name}
              onChange={(e) =>
                setNewModule((p: any) => ({ ...p, name: e.target.value }))
              }
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker
              selectedIcon={newModule.icon}
              onSelectIcon={(icon) =>
                setNewModule((p: any) => ({ ...p, icon }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Selected:{" "}
              {iconOptions.find((i) => i.value === newModule.icon)?.label ||
                newModule.icon}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Backend Path</Label>
            <RouteCombobox
              value={newModule.bePath}
              onChange={(v) => setNewModule((p: any) => ({ ...p, bePath: v }))}
              filterPath={
                parentModules.find((m) => m.id === newModule.parentId)?.bePath
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Frontend Path</Label>
            <FrontendRouteCombobox
              value={newModule.urlPath}
              onChange={(v) => setNewModule((p: any) => ({ ...p, urlPath: v }))}
              excludedRoutes={excludedRoutes}
            />
          </div>
          <div className="space-y-2">
            <Label>Parent Module</Label>
            <Select
              value={newModule.parentId || "none"}
              onValueChange={(v) =>
                setNewModule((p: any) => ({
                  ...p,
                  parentId: v === "none" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="w-full bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="none">None (Top-level module)</SelectItem>
                {parentModules
                  .filter((m) => m.id !== selectedModuleId)
                  .map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={newModule.isActive}
              onCheckedChange={(c) =>
                setNewModule((p: any) => ({ ...p, isActive: c }))
              }
            />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditModule}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
