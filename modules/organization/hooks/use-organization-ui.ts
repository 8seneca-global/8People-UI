import { useState } from "react";
import type { OrgUnitNode, ViewMode } from "../types";
import type { Position } from "@/lib/mock-data";

export function useOrganizationUI() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["O-001"]),
  );
  const [selectedNode, setSelectedNode] = useState<OrgUnitNode | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [positionDetailOpen, setPositionDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<ViewMode>("units");

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleNodeClick = (node: OrgUnitNode) => {
    setSelectedNode(node);
    setDetailOpen(true);
  };

  const handlePositionClick = (position: Position) => {
    setSelectedPosition(position);
    setPositionDetailOpen(true);
  };

  return {
    expandedNodes,
    toggleNode,
    selectedNode,
    setSelectedNode,
    handleNodeClick,
    selectedPosition,
    setSelectedPosition,
    handlePositionClick,
    detailOpen,
    setDetailOpen,
    positionDetailOpen,
    setPositionDetailOpen,
    search,
    setSearch,
    zoom,
    setZoom,
    viewMode,
    setViewMode,
  };
}
