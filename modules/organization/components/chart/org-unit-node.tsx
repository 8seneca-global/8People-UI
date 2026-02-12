import {
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  User,
  Network,
  GripVertical,
} from "lucide-react";
import { Badge } from "@/modules/core/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrgUnitNode } from "../../types";
import { PositionNode } from "./position-node";
import type { Position } from "@/lib/mock-data";

interface OrgUnitNodeProps {
  node: OrgUnitNode;
  level?: number;
  search?: string;
  viewMode: "units" | "positions";
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

export function OrgUnitNodeComponent({
  node,
  level = 0,
  search = "",
  viewMode,
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
}: OrgUnitNodeProps) {
  const isExpanded = true; // Force expanded as per requirement
  const hasChildren = node.children.length > 0;
  const isDraggable = node.level >= 2;
  const isDropTarget = draggedNode && node.level === draggedNode.level - 1;

  const getNodeIcon = (type: OrgUnitNode["type"]) => {
    switch (type) {
      case "company":
        return <Building2 className="h-3.5 w-3.5" />;
      case "division":
        return <Network className="h-3.5 w-3.5" />;
      case "department":
        return <Users className="h-3.5 w-3.5" />;
      case "team":
        return <Users className="h-3.5 w-3.5" />;
    }
  };

  if (search) {
    const matchesSearch =
      node.name.toLowerCase().includes(search.toLowerCase()) ||
      node.code.toLowerCase().includes(search.toLowerCase());
    const childrenMatch = node.children.some(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()),
    );
    if (!matchesSearch && !childrenMatch) return null;
  }

  return (
    <div className="select-none group">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors text-sm",
          "hover:bg-secondary/50",
          selectedNodeId === node.id
            ? "bg-primary/10 text-primary font-medium border border-primary/20"
            : "text-foreground/85",
          dragOverNodeId === node.id && "ring-1 ring-primary bg-primary/10",
          draggedNode?.id === node.id && "opacity-50",
        )}
        style={{ marginLeft: level * 16 }}
        onClick={() => onNodeClick(node)}
        onDragOver={(e) => (isDropTarget ? onDragOver(e, node) : undefined)}
        onDragLeave={onDragLeave}
        onDrop={(e) => (isDropTarget ? onDrop(e, node) : undefined)}
        onDragEnd={onDragEnd}
      >
        {isDraggable ? (
          <div
            draggable={true}
            onDragStart={(e) => onDragStart(e, node)}
            className="cursor-grab p-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground/70" />
          </div>
        ) : (
          <div className="w-4" />
        )}

        {hasChildren && (
          <div className="p-0.5">
            <ChevronRight className="h-3 w-3 text-muted-foreground/60 rotate-90 transition-transform" />
          </div>
        )}

        <span className="truncate flex-1">{node.name}</span>
      </div>
      {isExpanded && (
        <div className="mt-1">
          {node.children.map((child) => (
            <OrgUnitNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              search={search}
              viewMode={viewMode}
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
            />
          ))}
          {viewMode === "positions" &&
            node.positions.map((pos) => (
              <PositionNode
                key={pos.id}
                position={pos}
                level={level}
                onClick={onPositionClick}
              />
            ))}
        </div>
      )}
    </div>
  );
}
