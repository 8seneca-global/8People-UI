"use client";

import { Edit2, Plus, Save, X } from "lucide-react";
import { Button } from "@/modules/core/components/ui/button";
import { Input } from "@/modules/core/components/ui/input";
import { Label } from "@/modules/core/components/ui/label";
import { UnitDetailHeaderProps } from "./detail-types";

export function UnitDetailHeader({
  name,
  isEditing,
  isPending,
  onEdit,
  onCancel,
  onSave,
  onNameChange,
  actions,
}: UnitDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1 flex-1 mr-4">
        {isEditing ? (
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">
              Unit Name
            </Label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              className="text-2xl font-bold h-12 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
        ) : (
          <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
            {name}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!isEditing && actions}
        {isEditing && (
          <>
            <Button variant="outline" onClick={onCancel} disabled={isPending}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isPending}>
              {isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
