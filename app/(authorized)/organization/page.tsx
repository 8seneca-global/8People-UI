"use client";

import { useMemo } from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { useGetOrgTree } from "@/modules/organization/api/queries";
import { useOrganizationUI } from "@/modules/organization/hooks/use-organization-ui";
import { OrgTreeView } from "@/modules/organization/components/chart/org-tree-view";
import { OrgUnitDetailDialog } from "@/modules/organization/components/detail/org-unit-detail-dialog";
import { PositionDetailDialog } from "@/modules/organization/components/detail/position-detail-dialog";
import type { OrgUnitNode } from "@/modules/organization/types";

export default function OrganizationPage() {
  const { data: treeData } = useGetOrgTree();

  const { handleNodeClick, selectedNode, detailOpen, setDetailOpen } =
    useOrganizationUI();

  // Build org tree from API data
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
        positions: [],
        managerName: undefined,
        costCenter: undefined,
      };
    };

    return mapNode(treeData[0]);
  }, [treeData]);

  if (!orgTree) {
    return (
      <>
        <PageHeader
          title="Organization"
          subtitle="O-S-C-P Organization Structure"
        />
        <main className="p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No organization data found.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Organization Chart"
        subtitle="O-S-C-P Organization Structure"
      />
      <main className="p-4 md:p-6">
        <div className="h-[calc(100vh-200px)] min-h-[600px]">
          <OrgTreeView data={orgTree} onNodeClick={handleNodeClick} />
        </div>

        <OrgUnitDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          node={selectedNode}
        />
      </main>
    </>
  );
}
