"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import { ParentSelectionSectionProps } from "./detail-types";

export function ParentSelectionSection({
  parent,
  isEditing,
  parentId,
  allPossibleParents,
  onParentChange,
}: ParentSelectionSectionProps) {
  if (!parent && !isEditing) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Parent Organization
      </h2>
      {isEditing ? (
        <div className="w-full max-w-md">
          <Select
            value={parentId || "none"}
            onValueChange={(val) => onParentChange(val === "none" ? null : val)}
          >
            <SelectTrigger className="bg-background dark:bg-slate-950 border-border/80 dark:text-slate-100">
              <SelectValue placeholder="Select parent unit" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="none">No Parent (Top Level)</SelectItem>
              {allPossibleParents.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        parent && (
          <div className="flex items-center gap-2 text-sm bg-muted/30 p-3 rounded-lg border border-border w-fit">
            <span className="font-medium text-primary">{parent.name}</span>
            <span className="text-muted-foreground">({parent.code})</span>
          </div>
        )
      )}
    </div>
  );
}
