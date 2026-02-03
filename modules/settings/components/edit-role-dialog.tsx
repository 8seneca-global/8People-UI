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
import { Textarea } from "@/modules/core/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/modules/core/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/modules/core/components/ui/command";
import { Checkbox } from "@/modules/core/components/ui/checkbox";
import { Badge } from "@/modules/core/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";
import { colorOptions } from "./constants";

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newRole: { name: string; description: string; color: string };
  setNewRole: React.Dispatch<
    React.SetStateAction<{ name: string; description: string; color: string }>
  >;
  assignedEmployeeIds: string[];
  toggleEmployeeAssignment: (employeeId: string) => void;
  employees: any[];
  employeeSearchOpen: boolean;
  setEmployeeSearchOpen: (open: boolean) => void;
  employeeSearchQuery: string;
  setEmployeeSearchQuery: (query: string) => void;
  filteredEmployees: any[];
  handleEditRole: () => void;
}

export const EditRoleDialog = ({
  open,
  onOpenChange,
  newRole,
  setNewRole,
  assignedEmployeeIds,
  toggleEmployeeAssignment,
  employees,
  employeeSearchOpen,
  setEmployeeSearchOpen,
  employeeSearchQuery,
  setEmployeeSearchQuery,
  filteredEmployees,
  handleEditRole,
}: EditRoleDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Edit Role</DialogTitle>
          <DialogDescription>
            Update role information and assigned employees
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">Role Name</Label>
            <Input
              value={newRole.name}
              onChange={(e) =>
                setNewRole((p) => ({ ...p, name: e.target.value }))
              }
              className="bg-background border-border/80 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              Description
            </Label>
            <Textarea
              value={newRole.description}
              onChange={(e) =>
                setNewRole((p) => ({ ...p, description: e.target.value }))
              }
              className="bg-background border-border/80 focus-visible:ring-primary min-h-[80px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              Assign Employees
            </Label>
            <Popover
              open={employeeSearchOpen}
              onOpenChange={setEmployeeSearchOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between bg-background border-border/80 text-foreground hover:bg-secondary/50"
                >
                  <span
                    className={
                      assignedEmployeeIds.length > 0
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  >
                    {assignedEmployeeIds.length > 0
                      ? `${assignedEmployeeIds.length} employee${assignedEmployeeIds.length !== 1 ? "s" : ""} assigned`
                      : "Select employees..."}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 bg-card border-border"
                align="start"
              >
                <Command className="bg-card">
                  <CommandInput
                    placeholder="Search employees..."
                    value={employeeSearchQuery}
                    onValueChange={setEmployeeSearchQuery}
                    className="border-0 text-foreground"
                  />
                  <CommandList>
                    <CommandEmpty className="text-muted-foreground">
                      No employees found.
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredEmployees.map((emp) => (
                        <CommandItem
                          key={emp.id}
                          value={emp.id}
                          onSelect={() => toggleEmployeeAssignment(emp.id)}
                          className="cursor-pointer text-foreground"
                        >
                          <Checkbox
                            checked={assignedEmployeeIds.includes(emp.id)}
                            className="mr-2"
                          />
                          {emp.firstName} {emp.lastName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {assignedEmployeeIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {assignedEmployeeIds.map((empId) => {
                  const emp = employees.find((e) => e.id === empId);
                  return emp ? (
                    <Badge
                      key={empId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {emp.firstName} {emp.lastName}
                      <button
                        onClick={() => toggleEmployeeAssignment(empId)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/90 font-medium">
              Color Theme
            </Label>
            <Select
              value={newRole.color}
              onValueChange={(v) => setNewRole((p) => ({ ...p, color: v }))}
            >
              <SelectTrigger className="w-full bg-background border-border/80 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded ${color.value.split(" ")[0]}`}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleEditRole}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
