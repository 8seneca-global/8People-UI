"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Check, ChevronsUpDown, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/modules/core/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/modules/core/components/ui/form";
import { Input } from "@/modules/core/components/ui/input";
import { Button } from "@/modules/core/components/ui/button";
import { Switch } from "@/modules/core/components/ui/switch";
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
import { Badge } from "@/modules/core/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  useGetOrgTree,
  useCreateOrgUnit,
  useGetOrgEmployees,
} from "../../api/queries";

const addUnitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  parentId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  employeeIds: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

type AddUnitFormValues = z.infer<typeof addUnitSchema>;

interface AddUnitDialogProps {
  trigger?: React.ReactNode;
  preselectedParentId?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddUnitDialog({
  trigger,
  preselectedParentId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddUnitDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen;

  const { data: orgTree } = useGetOrgTree();
  const { data: orgEmployees = [] } = useGetOrgEmployees();
  const createMutation = useCreateOrgUnit();

  const form = useForm<AddUnitFormValues>({
    resolver: zodResolver(addUnitSchema),
    defaultValues: {
      name: "",
      parentId: preselectedParentId || null,
      managerId: null,
      employeeIds: [],
      isActive: true,
    },
  });

  // Reset form when opening, preserving preselectedParentId
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: "",
        parentId: preselectedParentId || null,
        managerId: null,
        employeeIds: [],
        isActive: true,
      });
    }
  }, [open, preselectedParentId, form]);

  const flattenTree = (nodes: any[]): any[] => {
    if (!nodes) return [];
    return nodes.reduce((acc, n) => {
      acc.push(n);
      if (n.children) {
        acc.push(...flattenTree(n.children));
      }
      return acc;
    }, []);
  };

  const allPossibleParents = orgTree ? flattenTree(orgTree as any) : [];
  const employees = orgEmployees || [];

  async function onSubmit(values: AddUnitFormValues) {
    try {
      await createMutation.mutateAsync({
        ...values,
        status: values.isActive ? "active" : "inactive",
        validFrom: new Date().toISOString(),
      });
      toast.success("Organizational unit created successfully");
      setOpen?.(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to create organizational unit");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only render trigger if provided or if not controlled (fallback trigger) 
          If controlled and no trigger, we expect parent to handle opening */}
      {(!isControlled || trigger) && (
        <DialogTrigger asChild>
          {trigger || (
            <Button size="sm" className="flex-1 h-8 text-xs font-medium">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Unit
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-6xl bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Organizational Unit</DialogTitle>
          <DialogDescription>
            Create a new unit in the organization. The unit code will be
            automatically generated.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Marketing, Engineering"
                      {...field}
                      className="bg-secondary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Parent Unit</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          disabled={!!preselectedParentId}
                          className={cn(
                            "w-full justify-between bg-secondary",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? allPossibleParents.find(
                                (p) => p.id === field.value,
                              )?.name
                            : "Select parent unit..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search units..." />
                        <CommandList>
                          <CommandEmpty>No unit found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              onSelect={() => field.onChange(null)}
                              className="text-primary font-medium"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === null
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              None (Top Level)
                            </CommandItem>
                            {allPossibleParents.map((unit) => (
                              <CommandItem
                                key={unit.id}
                                value={unit.name}
                                onSelect={() => field.onChange(unit.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === unit.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {unit.name} ({unit.code})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Unit Manager</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between bg-secondary",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? employees.find((e: any) => e.id === field.value)
                                ?.fullName || "Select manager..."
                            : "Select manager..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search employees..." />
                        <CommandList>
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem onSelect={() => field.onChange(null)}>
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === null
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              No Manager
                            </CommandItem>
                            {employees.map((emp: any) => (
                              <CommandItem
                                key={emp.id}
                                value={emp.fullName}
                                onSelect={() => field.onChange(emp.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === emp.id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {emp.fullName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeIds"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Incumbents / Employees</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between bg-secondary min-h-10 h-auto py-2"
                        >
                          <div className="flex flex-wrap gap-1">
                            {field.value.length > 0 ? (
                              field.value.map((id) => (
                                <Badge
                                  key={id}
                                  variant="secondary"
                                  className="mr-1 mb-1 bg-primary/20 hover:bg-primary/30 text-primary border-primary/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    field.onChange(
                                      field.value.filter((i) => i !== id),
                                    );
                                  }}
                                >
                                  {
                                    employees.find((e: any) => e.id === id)
                                      ?.fullName
                                  }
                                  <X className="ml-1 h-3 w-3" />
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">
                                Select employees...
                              </span>
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search employees..." />
                        <CommandList>
                          <CommandEmpty>No employee found.</CommandEmpty>
                          <CommandGroup>
                            {employees.map((emp: any) => {
                              const isSelected = field.value.includes(emp.id);
                              const isHijacked = !!emp.organizationalUnitId;

                              return (
                                <CommandItem
                                  key={emp.id}
                                  value={emp.fullName}
                                  onSelect={() => {
                                    if (isSelected) {
                                      field.onChange(
                                        field.value.filter(
                                          (id) => id !== emp.id,
                                        ),
                                      );
                                    } else {
                                      field.onChange([...field.value, emp.id]);
                                    }
                                  }}
                                >
                                  <div className="flex items-center w-full">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        isSelected
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span className="flex-1">
                                      {emp.fullName}
                                    </span>
                                    {isHijacked && (
                                      <div className="flex items-center text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded ml-2">
                                        <AlertCircle className="h-2.5 w-2.5 mr-1" />
                                        Will transfer from{" "}
                                        {emp.organizationalUnitName ||
                                          "another unit"}
                                      </div>
                                    )}
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Selected employees will be transferred from their current
                    units.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 shadow-sm bg-secondary/30">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Inactive units are hidden from standard views.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen?.(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Unit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
