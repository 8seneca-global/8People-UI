"use client";

import {
  User,
  Plus,
  X,
  MailIcon,
  ExternalLink,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/core/components/ui/table";
import { Button } from "@/modules/core/components/ui/button";
import { EmployeeCombobox } from "@/modules/employees/components/employee-combobox";
import { cn } from "@/lib/utils";
import { IncumbentsTableProps } from "./detail-types";

export function IncumbentsTable({
  employees,
  isEditing,
  isAddingEmployee,
  onAddEmployeeSelected,
  onRemovePendingEmployee,
  onRemoveEmployee,
  onViewEmployee,
  setIsAddingEmployee,
  getStatusBadge,
}: IncumbentsTableProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-card-foreground">
          <div className="p-1.5 rounded-md bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          Incumbents / Employees ({employees.length})
        </h3>
        {isEditing && (
          <div className="flex items-center gap-2">
            {isAddingEmployee ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                <EmployeeCombobox
                  onChange={onAddEmployeeSelected}
                  placeholder="Select employee to add..."
                  className="w-[250px]"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddingEmployee(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setIsAddingEmployee(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            )}
          </div>
        )}
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <TableRow
                  key={emp.id}
                  className={cn(
                    "hover:bg-muted/30",
                    emp.isPending && "bg-blue-50/30 dark:bg-blue-900/10",
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {emp.fullName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-card-foreground font-medium text-sm">
                          {emp.fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {emp.positionTitle || "Member"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MailIcon className="h-3 w-3" />
                      {emp.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(emp.status, emp.isPending)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {emp.isPending ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onRemovePendingEmployee(emp.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => onViewEmployee(emp.id)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {isEditing && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => onRemoveEmployee(emp.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No members found in this unit structure.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
