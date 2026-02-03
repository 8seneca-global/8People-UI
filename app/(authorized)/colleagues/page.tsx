"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/modules/core/components/layout/page-header";
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
import { Search, Phone, Mail } from "lucide-react";

function ColleaguesContent() {
  const router = useRouter();
  const { currentRole, employees } = useStore();
  const [search, setSearch] = useState("");

  // Redirect if not employee role
  useEffect(() => {
    if (currentRole !== "employee") {
      router.push("/employees");
    }
  }, [currentRole, router]);

  if (currentRole !== "employee") {
    return null;
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.companyEmail.toLowerCase().includes(search.toLowerCase()) ||
      emp.organizationalUnitName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Colleagues"
        subtitle="View your colleagues' contact information"
      />
      <main className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="pl-10 bg-input border-border"
            />
          </div>

          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">
                    Department
                  </TableHead>
                  <TableHead className="text-muted-foreground">Team</TableHead>
                  <TableHead className="text-muted-foreground">Phone</TableHead>
                  <TableHead className="text-muted-foreground">
                    Work Email
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary">
                          <span className="text-sm font-medium">
                            {emp.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">
                            {emp.fullName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {emp.jobTitle || emp.positionTitle}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/20 text-primary">
                        {emp.organizationalUnitName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">-</TableCell>
                    <TableCell>
                      {emp.cellphone ? (
                        <div className="flex items-center gap-2 text-card-foreground">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {emp.cellphone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-card-foreground">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {emp.companyEmail}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No colleagues found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </>
  );
}

export default function ColleaguesPage() {
  return (
    <Suspense fallback={null}>
      <ColleaguesContent />
    </Suspense>
  );
}
