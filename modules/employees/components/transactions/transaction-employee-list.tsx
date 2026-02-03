"use client";

import { useMemo, useState } from "react";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/modules/core/components/ui/input";
import { ScrollArea } from "@/modules/core/components/ui/scroll-area";
import { useEmployees } from "@/modules/employees/api/queries";
import { cn } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/core/components/ui/table";

interface TransactionEmployeeListProps {
  selectedId: string | null;
  onSelect: (employeeId: string) => void;
}

export function TransactionEmployeeList({
  selectedId,
  onSelect,
}: TransactionEmployeeListProps) {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useEmployees();
  const employees = data?.data || [];

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (e) =>
        (e.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.code || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [employees, search]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="shrink-0">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background pl-9 h-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20 text-center font-medium">
          Error loading employees
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex-1 min-h-0 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground w-20 bg-muted/30">
                    Code
                  </TableHead>
                  <TableHead className="text-muted-foreground bg-muted/30">
                    Name
                  </TableHead>
                  <TableHead className="w-10 bg-muted/30"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className={cn(
                      "border-border cursor-pointer transition-colors group",
                      selectedId === employee.id
                        ? "bg-primary/10 hover:bg-primary/15"
                        : "hover:bg-secondary/50",
                    )}
                    onClick={() => onSelect(employee.id)}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground/80 py-3">
                      {employee.code}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-bold text-sm text-card-foreground tracking-tight">
                        {employee.fullName}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">
                        {employee.position?.title || "System Staff"}
                      </div>
                    </TableCell>
                    <TableCell className="px-1 text-right py-3">
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform group-hover:translate-x-0.5",
                          selectedId === employee.id
                            ? "text-primary"
                            : "text-muted-foreground/30",
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground text-xs"
                    >
                      No employees found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
