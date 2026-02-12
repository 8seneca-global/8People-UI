"use client";

import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { useGetOrgTree } from "@/modules/organization/api/queries";
import { useOrganizationUI } from "@/modules/organization/hooks/use-organization-ui";
import { useOrgDragDrop } from "@/modules/organization/hooks/use-org-drag-drop";
import { useStore } from "@/lib/store";
import type { OrgUnitNode } from "@/modules/organization/types";
import { OrgUnitsSidebar } from "@/modules/organization/components/detail/org-units-sidebar";
import { OrgUnitsMainContent } from "@/modules/organization/components/detail/org-units-main-content";

export default function OrgUnitsPage() {
  const { employees, positions } = useStore();
  const { data: treeData } = useGetOrgTree();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const { handleNodeClick, selectedNode } = useOrganizationUI();

  const dragProps = useOrgDragDrop();

  // Mapping API data to OrgUnitNode (Recursive)
  const orgTree = useMemo((): OrgUnitNode | null => {
    if (!treeData || treeData.length === 0) return null;

    const mapNode = (apiNode: any): OrgUnitNode => {
      let type: OrgUnitNode["type"] = "team";
      if (apiNode.level === 0) type = "company";
      else if (apiNode.level === 1) type = "division";
      else if (apiNode.level === 2) type = "department";

      return {
        id: apiNode.id,
        code: apiNode.code,
        name: apiNode.name,
        type,
        level: apiNode.level,
        employeeCount: apiNode.employeeCount,
        children: (apiNode.children || []).map(mapNode),
        positions: [], // Positions are fetched in UnitDetailView
        managerName: undefined,
        costCenter: undefined,
      };
    };

    return mapNode(treeData[0]);
  }, [treeData]);

  // Automatic "Expand All" on load
  useEffect(() => {
    if (orgTree) {
      const allIds = new Set<string>();
      const traverse = (node: OrgUnitNode) => {
        allIds.add(node.id);
        node.children.forEach(traverse);
      };
      traverse(orgTree);
      setExpandedNodes(allIds);
    }
  }, [orgTree]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!orgTree) {
    return (
      <>
        <PageHeader
          title="Organizational Units"
          subtitle="Manage organization structure (O)"
        />
        <main className="p-4 md:p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground text-sm">
                Loading structure...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Organizational Units"
        subtitle="Manage organization structure (O)"
      />
      <main className="p-4 md:p-6">
        <div className="flex h-[calc(100vh-140px)] -m-6 overflow-hidden bg-background/50 backdrop-blur-sm">
          <OrgUnitsSidebar
            employeesCount={employees.length}
            search={search}
            setSearch={setSearch}
            orgTree={orgTree}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
            handleNodeClick={handleNodeClick}
            selectedNodeId={selectedNode?.id}
            dragProps={{
              draggedNode: dragProps.draggedNode,
              dragOverNodeId: dragProps.dragOverNode,
              onDragStart: dragProps.handleDragStart,
              onDragOver: dragProps.handleDragOver,
              onDragLeave: dragProps.handleDragLeave,
              onDrop: dragProps.handleDrop,
              onDragEnd: dragProps.handleDragEnd,
            }}
          />

          <OrgUnitsMainContent
            selectedNode={selectedNode}
            employeesCount={employees.length}
            positionsCount={positions.length}
          />
        </div>
      </main>
    </>
  );
}
