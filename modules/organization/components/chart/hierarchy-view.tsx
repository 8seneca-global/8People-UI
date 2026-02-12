import { Card, CardContent } from "@/modules/core/components/ui/card";
import { Button } from "@/modules/core/components/ui/button";
import { OrgUnitNodeComponent } from "./org-unit-node";
import type { OrgUnitNode } from "../../types";
import type { Position } from "@/lib/mock-data";

interface HierarchyViewProps {
  orgTree: OrgUnitNode;
  viewMode: "units" | "positions";
  setViewMode: (mode: "units" | "positions") => void;
  search: string;
  zoom: number;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onNodeClick: (node: OrgUnitNode) => void;
  onPositionClick: (position: Position) => void;
  selectedNodeId?: string;
  draggedNode?: OrgUnitNode | null;
  dragOverNodeId?: string | null;
  onDragStart: (e: React.DragEvent, node: OrgUnitNode) => void;
  onDragOver: (e: React.DragEvent, node: OrgUnitNode) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, node: OrgUnitNode) => void;
  onDragEnd: () => void;
}

export function HierarchyView({
  orgTree,
  viewMode,
  setViewMode,
  search,
  zoom,
  expandedNodes,
  onToggle,
  onNodeClick,
  onPositionClick,
  selectedNodeId,
  draggedNode,
  dragOverNodeId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: HierarchyViewProps) {
  return (
    <div
      className="overflow-y-auto overflow-x-hidden flex-1 px-2 custom-scrollbar"
      style={{
        maxHeight: "calc(100vh - 280px)",
      }}
    >
      <div className="space-y-1">
        <OrgUnitNodeComponent
          node={orgTree}
          level={0}
          expandedNodes={expandedNodes}
          onToggle={onToggle}
          onNodeClick={onNodeClick}
          onPositionClick={onPositionClick}
          selectedNodeId={selectedNodeId}
          draggedNode={draggedNode}
          dragOverNodeId={dragOverNodeId}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onDragEnd={onDragEnd}
          viewMode={viewMode}
          search={search}
        />
      </div>
    </div>
  );
}
