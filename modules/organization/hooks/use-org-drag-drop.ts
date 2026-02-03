import { useState, useCallback } from "react";
import type { OrgUnitNode } from "../types";

export function useOrgDragDrop() {
  const [draggedNode, setDraggedNode] = useState<OrgUnitNode | null>(null);
  const [dragOverNode, setDragOverNode] = useState<string | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, node: OrgUnitNode) => {
      if (node.level < 2) {
        e.preventDefault();
        return;
      }
      setDraggedNode(node);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", node.id);
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, node: OrgUnitNode) => {
      e.preventDefault();
      if (!draggedNode) return;

      if (node.level === draggedNode.level - 1 && node.id !== draggedNode.id) {
        e.dataTransfer.dropEffect = "move";
        setDragOverNode(node.id);
      }
    },
    [draggedNode],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverNode(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetNode: OrgUnitNode) => {
      e.preventDefault();
      setDraggedNode(null);
      setDragOverNode(null);
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
    setDragOverNode(null);
  }, []);

  return {
    draggedNode,
    dragOverNode,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
