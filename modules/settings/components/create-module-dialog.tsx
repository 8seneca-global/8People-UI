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
import { RouteCombobox } from "./route-combobox";
import { FrontendRouteCombobox } from "./frontend-route-combobox";
import { IconPicker } from "./icon-picker";
import { iconOptions } from "./constants";
import { NavigationModule } from "@/modules/settings/api";

interface CreateModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newModule: any;
  setNewModule: React.Dispatch<React.SetStateAction<any>>;
  parentModules: NavigationModule[];
  allModules: NavigationModule[];
  handleCreateModule: () => void;
}

export const CreateModuleDialog = ({
  open,
  onOpenChange,
  newModule,
  setNewModule,
  parentModules,
  allModules,
  handleCreateModule,
}: CreateModuleDialogProps) => {
  const excludedRoutes = allModules
    .map((m) => m.urlPath)
    .filter((path): path is string => !!path && path !== "#");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Add New Module
          </DialogTitle>
          <DialogDescription>
            Create a new module for the application
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              Module Name
            </Label>
            <Input
              value={newModule.name}
              onChange={(e) =>
                setNewModule((p: any) => ({ ...p, name: e.target.value }))
              }
              placeholder="e.g. Reports"
              className="bg-background border-border/80 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">Icon</Label>
            <IconPicker
              selectedIcon={newModule.icon}
              onSelectIcon={(icon) =>
                setNewModule((p: any) => ({ ...p, icon }))
              }
            />
            <p className="text-xs text-muted-foreground/80 font-medium">
              Selected:{" "}
              <span className="text-foreground">
                {iconOptions.find((i) => i.value === newModule.icon)?.label ||
                  newModule.icon}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              Parent Module (optional)
            </Label>
            <Select
              value={newModule.parentId || "none"}
              onValueChange={(v) =>
                setNewModule((p: any) => ({
                  ...p,
                  parentId: v === "none" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="w-full bg-background border-border/80">
                <SelectValue placeholder="Select parent module" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="none">None (Top-level module)</SelectItem>
                {parentModules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              Backend Path (optional for parent modules)
            </Label>
            <RouteCombobox
              value={newModule.bePath}
              onChange={(v) => setNewModule((p: any) => ({ ...p, bePath: v }))}
              filterPath={
                parentModules.find((m) => m.id === newModule.parentId)?.bePath
              }
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              Frontend Path (optional for actions)
            </Label>
            <FrontendRouteCombobox
              value={newModule.urlPath}
              onChange={(v) => setNewModule((p: any) => ({ ...p, urlPath: v }))}
              excludedRoutes={excludedRoutes}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch
              checked={newModule.isActive}
              onCheckedChange={(c) =>
                setNewModule((p: any) => ({ ...p, isActive: c }))
              }
            />
            <Label className="text-foreground/90 font-medium cursor-pointer">
              Active
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateModule}>Add Module</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
