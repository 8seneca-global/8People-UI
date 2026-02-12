"use client";

import { User, ExternalLink, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/core/components/ui/table";
import { Button } from "@/modules/core/components/ui/button";
import { Label } from "@/modules/core/components/ui/label";
import { EmployeeCombobox } from "@/modules/employees/components/employee-combobox";
import { ManagementTableProps } from "./detail-types";

export function ManagementTable({
  manager,
  isEditing,
  managerId,
  onManagerChange,
  onViewEmployee,
  onRemoveManager,
}: ManagementTableProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
          <div className="p-1.5 rounded-md bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          Management (Reporting)
        </h3>
        {isEditing && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Manager:</Label>
            <EmployeeCombobox
              value={managerId}
              onChange={onManagerChange}
              placeholder="Search manager..."
              className="w-[250px]"
            />
          </div>
        )}
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Manager Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manager ? (
              <TableRow className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                      {manager.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-card-foreground">
                        {manager.fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {manager.positionTitle}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {manager.email}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {manager.phone || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => onViewEmployee(manager.id)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={onRemoveManager}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-16 text-center text-muted-foreground italic"
                >
                  No manager assigned to this unit.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
