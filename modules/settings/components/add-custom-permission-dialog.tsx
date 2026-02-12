import React, { useState, useEffect } from "react";
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
import { EndpointCombobox } from "./endpoint-combobox";
import { NavigationModule } from "@/modules/settings/api";
import { useCreateModule, useUpdateModule } from "@/modules/settings/api";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { ActionType, moduleActions } from "@/lib/rbac";
import { actionIcons } from "./constants";
import { Checkbox } from "@/modules/core/components/ui/checkbox";

interface AddCustomPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentModule: NavigationModule | null;
  onPermissionCreated?: (moduleId: string, actions: ActionType[]) => void;
  editModule?: NavigationModule | null;
  currentActions?: ActionType[];
}

export const AddCustomPermissionDialog = ({
  open,
  onOpenChange,
  parentModule,
  onPermissionCreated,
  editModule,
  currentActions = ["view"],
}: AddCustomPermissionDialogProps) => {
  const { mutate: createModule, isPending: isCreating } = useCreateModule();
  const { mutate: updateModule, isPending: isUpdating } = useUpdateModule();

  const [name, setName] = useState("");
  const [route, setRoute] = useState("");
  const [selectedActions, setSelectedActions] = useState<ActionType[]>([
    "view",
  ]);

  const isEditMode = !!editModule;
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (editModule) {
        setName(editModule.name);
        setRoute(editModule.bePath || "");
        setSelectedActions(currentActions);
      } else {
        setName("");
        setRoute("");
        setSelectedActions(["view"]);
      }
    }
  }, [open, editModule, currentActions]);

  const toggleAction = (actionId: ActionType) => {
    setSelectedActions((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter((a) => a !== actionId);
      }
      return [...prev, actionId];
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Permission name is required");
      return;
    }

    if (isEditMode && editModule) {
      updateModule(
        {
          id: editModule.id,
          data: {
            name: name,
            label: name,
            bePath: route,
          },
        },
        {
          onSuccess: () => {
            toast.success("Action updated successfully");
            if (onPermissionCreated) {
              onPermissionCreated(editModule.id, selectedActions);
            }
            onOpenChange(false);
          },
          onError: (error: any) => {
            const message =
              error.response?.data?.message ||
              error.message ||
              "Failed to update action";
            toast.error(message);
          },
        },
      );
    } else {
      if (!parentModule) {
        toast.error("Parent module is missing");
        return;
      }

      createModule(
        {
          name: name,
          label: name,
          bePath: route,
          urlPath: null,
          parentId: parentModule.id,
          icon: "Shield",
          isActive: true,
          sortOrder: 99,
        },
        {
          onSuccess: (newModule) => {
            toast.success("Action added successfully");
            if (onPermissionCreated && newModule.id) {
              onPermissionCreated(newModule.id, selectedActions);
            }
            onOpenChange(false);
          },
          onError: (error: any) => {
            const message =
              error.response?.data?.message ||
              error.message ||
              "Failed to create action";
            toast.error(message);
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {isEditMode ? "Edit Action" : "Add Action"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? `Update the custom action ${editModule?.name}`
              : `Create a custom action for ${parentModule?.name} linked to a specific API endpoint.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              Action Name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Import Employees"
              className="bg-background border-border/80 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              API Endpoint (Route)
            </Label>
            <EndpointCombobox
              value={route}
              onChange={setRoute}
              filterPath={parentModule?.bePath || editModule?.bePath || ""}
            />
            <p className="text-[10px] text-muted-foreground/80 font-medium">
              {isEditMode
                ? "The API route this permission controls."
                : "Select the API route this permission should control."}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              {isEditMode ? "Permissions" : "Initial Permissions"}
            </Label>
            <div className="flex flex-wrap gap-2">
              {moduleActions.map((action) => {
                const isChecked = selectedActions.includes(action.id);
                return (
                  <div
                    key={action.id}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-all duration-200 ${
                      isChecked
                        ? "border-primary bg-primary/15"
                        : "border-border/60 hover:border-border hover:bg-secondary/50"
                    }`}
                    onClick={() => toggleAction(action.id)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleAction(action.id)}
                      className="border-border/80 data-[state=checked]:bg-primary h-3.5 w-3.5"
                    />
                    <div
                      className={
                        isChecked ? "text-primary" : "text-muted-foreground"
                      }
                    >
                      {actionIcons[action.id]}
                    </div>
                    <span
                      className={`text-sm ${isChecked ? "text-primary font-medium" : "text-foreground/80"}`}
                    >
                      {action.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Action"
                : "Add Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
