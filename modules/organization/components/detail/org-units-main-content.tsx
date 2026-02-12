"use client";

import { WelcomeView } from "./welcome-view";
import { UnitDetailView } from "./unit-detail-view";
import type { OrgUnitNode } from "../../types";

interface OrgUnitsMainContentProps {
  selectedNode: OrgUnitNode | null;
  employeesCount: number;
  positionsCount: number;
}

export function OrgUnitsMainContent({
  selectedNode,
  employeesCount,
  positionsCount,
}: OrgUnitsMainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-background/30 px-8 py-6 custom-scrollbar">
      {selectedNode ? (
        <UnitDetailView node={selectedNode} />
      ) : (
        <WelcomeView
          totalEmployees={employeesCount}
          totalPositions={positionsCount}
        />
      )}
    </main>
  );
}
