"use client";

import { Search, Building2 } from "lucide-react";
import { Button } from "@/modules/core/components/ui/button";
import { Input } from "@/modules/core/components/ui/input";
import { HierarchyView } from "../chart/hierarchy-view";
import { AddUnitDialog } from "./add-unit-dialog";
import type { OrgUnitNode } from "../../types";

interface OrgUnitsSidebarProps {
  employeesCount: number;
  search: string;
  setSearch: (value: string) => void;
  orgTree: OrgUnitNode;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  handleNodeClick: (node: OrgUnitNode) => void;
  selectedNodeId?: string;
  dragProps: any; // Simplified for extraction
}

export function OrgUnitsSidebar({
  employeesCount,
  search,
  setSearch,
  orgTree,
  expandedNodes,
  toggleNode,
  handleNodeClick,
  selectedNodeId,
  dragProps,
}: OrgUnitsSidebarProps) {
  return (
    <aside className="w-[320px] border-r border-border bg-card/30 flex flex-col shrink-0">
      <div className="p-4 space-y-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-card-foreground leading-none">
              8Seneca
            </h3>
            <p className="text-[10px] text-muted-foreground mt-1">
              {employeesCount} employees
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <AddUnitDialog />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search division, role, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col pt-4">
        <HierarchyView
          orgTree={orgTree}
          viewMode="units"
          setViewMode={() => {}}
          search={search}
          zoom={100}
          expandedNodes={expandedNodes}
          onToggle={toggleNode}
          onNodeClick={handleNodeClick}
          onPositionClick={() => {}}
          selectedNodeId={selectedNodeId}
          {...dragProps}
        />
      </div>
    </aside>
  );
}
