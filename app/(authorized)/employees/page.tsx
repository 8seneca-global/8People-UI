"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { Button } from "@/modules/core/components/ui/button";
import { Input } from "@/modules/core/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/core/components/ui/table";
import { Badge } from "@/modules/core/components/ui/badge";
import { useStore } from "@/lib/store";
import { Search, Plus, User, Loader2, ChevronRight } from "lucide-react";
import { useEmployees } from "@/modules/employees/api/queries";
import { EmployeeDetailView } from "@/modules/employees/components/employee-detail-view";
import { ScrollArea } from "@/modules/core/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function EmployeesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const { currentRole } = useStore();

  const selectedEmployeeId = searchParams.get("id");

  const { data, isLoading, error } = useEmployees();
  const employees = data?.data || [];

  useEffect(() => {
    // Redirect if needed for certain roles
  }, [currentRole, router]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (e) =>
        (e.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.companyEmail || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.organizationalUnit?.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (e.position?.title || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (e.code || "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [employees, search]);

  const selectedEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return employees.find((e) => e.id === selectedEmployeeId);
  }, [employees, selectedEmployeeId]);

  const handleEmployeeClick = (employeeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", employeeId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCloseDetail = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    router.push(pathname);
  };

  const handleAddEmployee = () => {
    router.push("/employees/add");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Employees" subtitle="Manage your workforce" />

      <main className="flex-1 flex overflow-hidden bg-muted/5">
        {/* Left Column: List */}
        <div
          className={cn(
            "flex-col p-4 transition-all duration-300 overflow-hidden",
            selectedEmployeeId
              ? "hidden md:flex md:w-[340px] md:min-w-[340px] border-r border-border bg-muted/20"
              : "flex flex-1 max-w-full",
          )}
        >
          <div className="flex flex-col h-full gap-4">
            {/* Actions bar */}
            <div className="flex items-center justify-between shrink-0 gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-background pl-9 h-9"
                />
              </div>
              {!selectedEmployeeId && (
                <Button onClick={handleAddEmployee} className="shrink-0">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Employee</span>
                </Button>
              )}
            </div>

            {isLoading && (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                Failed to load employees. Please try again later.
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
                        {!selectedEmployeeId && (
                          <>
                            <TableHead className="text-muted-foreground hidden lg:table-cell bg-muted/30">
                              Email
                            </TableHead>
                            <TableHead className="text-muted-foreground hidden xl:table-cell bg-muted/30">
                              Org Unit
                            </TableHead>
                            <TableHead className="text-muted-foreground hidden sm:table-cell bg-muted/30">
                              Position
                            </TableHead>
                            <TableHead className="text-muted-foreground hidden md:table-cell bg-muted/30">
                              Status
                            </TableHead>
                          </>
                        )}
                        {selectedEmployeeId && (
                          <TableHead className="w-10 bg-muted/30"></TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow
                          key={employee.id}
                          className={cn(
                            "border-border cursor-pointer transition-colors group",
                            selectedEmployeeId === employee.id
                              ? "bg-primary/10 hover:bg-primary/15"
                              : "hover:bg-secondary/50",
                          )}
                          onClick={() => handleEmployeeClick(employee.id)}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {employee.code}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-card-foreground">
                              {employee.fullName}
                            </div>
                            {selectedEmployeeId && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                {employee.position?.title ||
                                  employee.jobClassification?.title ||
                                  "—"}
                              </div>
                            )}
                          </TableCell>

                          {!selectedEmployeeId && (
                            <>
                              <TableCell className="text-muted-foreground font-mono text-xs hidden lg:table-cell">
                                {employee.companyEmail}
                              </TableCell>
                              <TableCell className="text-card-foreground hidden xl:table-cell">
                                {employee.organizationalUnit?.name || "—"}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <div className="text-xs">
                                  <p className="text-card-foreground font-medium">
                                    {employee.position?.title || "—"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {employee.jobClassification?.title || "—"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge
                                  variant={
                                    employee.status === "active"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={cn(
                                    "text-[10px] h-5",
                                    employee.status === "active"
                                      ? "bg-success/20 text-success border-success/30 hover:bg-success/30"
                                      : "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30",
                                  )}
                                >
                                  {employee.status}
                                </Badge>
                              </TableCell>
                            </>
                          )}

                          {selectedEmployeeId && (
                            <TableCell className="px-1 text-right">
                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-transform group-hover:translate-x-0.5",
                                  selectedEmployeeId === employee.id
                                    ? "text-primary"
                                    : "text-muted-foreground/30",
                                )}
                              />
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      {filteredEmployees.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="h-24 text-center text-muted-foreground"
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
        </div>

        {/* Right Column: Details */}
        {selectedEmployee && (
          <div className="flex-1 h-full overflow-hidden bg-background">
            <EmployeeDetailView
              employee={selectedEmployee as any}
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </main>
    </div>
  );
}
