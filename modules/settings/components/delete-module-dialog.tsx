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
import { NavigationModule } from "@/modules/settings/api";

interface DeleteModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedModule: NavigationModule | null | undefined;
  handleDeleteModule: () => void;
}

export const DeleteModuleDialog = ({
  open,
  onOpenChange,
  selectedModule,
  handleDeleteModule,
}: DeleteModuleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Delete Module
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{selectedModule?.name}"? Child
            modules will also be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteModule}>
            Delete Module
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
