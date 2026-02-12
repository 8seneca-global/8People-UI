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
import { Role } from "@/modules/settings/api/types";

interface DeleteRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: Role | undefined;
  handleDeleteRole: () => void;
}

export const DeleteRoleDialog = ({
  open,
  onOpenChange,
  selectedRole,
  handleDeleteRole,
}: DeleteRoleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Delete Role
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{selectedRole?.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteRole}>
            Delete Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
