"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/core/components/ui/tabs";
import { Employee } from "@/lib/store";
import { EmployeeInfoHeader } from "./employee-info-header";
import { PersonalTab } from "./tabs/personal-tab";
import { OrganizationJobTab } from "./tabs/organization-job-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { RelationshipTab } from "./tabs/relationship-tab";
import { mockDetailedEmployees } from "../mock-details";
import { ScrollArea } from "@/modules/core/components/ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "@/modules/core/components/ui/button";

interface EmployeeDetailViewProps {
  employee: Employee;
  onClose: () => void;
}

export function EmployeeDetailView({
  employee,
  onClose,
}: EmployeeDetailViewProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const detailedInfo =
    mockDetailedEmployees[employee.code] || mockDetailedEmployees["P-001"];

  return (
    <div className="flex flex-col h-full bg-background animate-in slide-in-from-right duration-300 transition-all min-h-0">
      {/* Header with Close Button */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-card shrink-0">
        <h2 className="text-lg font-semibold tracking-tight">
          Employee Information
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Top Info Card */}
          <EmployeeInfoHeader employee={employee} detailedInfo={detailedInfo} />

          {/* Tabs Section - Consolidated to 4 tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-muted/50 p-1 mb-4 flex flex-wrap h-auto w-full justify-start border border-border gap-1">
              <TabsTrigger
                value="personal"
                className="px-4 py-2 text-xs sm:text-sm h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Personal Info
              </TabsTrigger>
              <TabsTrigger
                value="org-job"
                className="px-4 py-2 text-xs sm:text-sm h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Organization & Job
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="px-4 py-2 text-xs sm:text-sm h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="relationship"
                className="px-4 py-2 text-xs sm:text-sm h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Relationship Info
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="personal"
              className="mt-0 focus-visible:outline-none"
            >
              <PersonalTab info={detailedInfo} />
            </TabsContent>

            <TabsContent
              value="org-job"
              className="mt-0 focus-visible:outline-none"
            >
              <OrganizationJobTab info={detailedInfo} />
            </TabsContent>

            <TabsContent
              value="documents"
              className="mt-0 focus-visible:outline-none"
            >
              <DocumentsTab info={detailedInfo} />
            </TabsContent>

            <TabsContent
              value="relationship"
              className="mt-0 focus-visible:outline-none"
            >
              <RelationshipTab info={detailedInfo} />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}
