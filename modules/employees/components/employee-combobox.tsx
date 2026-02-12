"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/modules/core/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/modules/core/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/modules/core/components/ui/popover";
import { useEmployees } from "@/modules/employees/api/queries";
import { cn } from "@/lib/utils";

interface EmployeeComboboxProps {
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const EmployeeCombobox = ({
  value,
  onChange,
  placeholder = "Select employee...",
  className,
}: EmployeeComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { data: employeesData, isLoading } = useEmployees();

  const employees = employeesData?.data || [];
  const selectedEmployee = employees.find(
    (emp) => emp.id === (value as string),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-background border-border/80 text-foreground hover:bg-secondary/50 dark:bg-slate-950 dark:text-slate-100",
            className,
          )}
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {selectedEmployee ? selectedEmployee.fullName : placeholder}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-card border-border shadow-2xl z-50 overflow-hidden"
        align="start"
      >
        <Command className="bg-card">
          <CommandInput
            placeholder="Search employee..."
            className="border-none focus:ring-0 dark:text-slate-100"
          />
          <CommandList className="max-h-[300px] overflow-y-auto custom-scrollbar">
            <CommandEmpty>No employee found.</CommandEmpty>
            <CommandGroup>
              {employees.map((employee) => (
                <CommandItem
                  key={employee.id}
                  value={employee.fullName || ""}
                  onSelect={() => {
                    onChange(employee.id);
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-accent/50"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      (value as any) === employee.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{employee.fullName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {employee.companyEmail}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
