"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  Background,
  Position,
  BackgroundVariant,
  Panel,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/modules/core/components/ui/button";
import { Maximize2, FileImage, FileText } from "lucide-react";
import dagre from "dagre";
import { Card, CardContent } from "@/modules/core/components/ui/card";
import type { OrgUnitNode } from "../../types";
import { OrgNode, type OrgNodeData } from "./org-node";

import "@xyflow/react/dist/style.css";

// --- Constants ---
const NODE_WIDTH = 240;
const NODE_HEIGHT = 100;

// --- Layout Logic ---
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 150, ranksep: 150 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    };
  });
};

// --- Main Component ---

interface OrgTreeViewProps {
  data: OrgUnitNode;
  onNodeClick: (node: OrgUnitNode) => void;
}

const nodeTypes = {
  orgNode: OrgNode,
};

export function OrgTreeView({ data, onNodeClick }: OrgTreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data) {
      const initial = new Set<string>();
      initial.add(data.id);
      setExpandedIds(initial);
    }
  }, [data]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!data) return;
    const allIds = new Set<string>();
    const traverse = (node: OrgUnitNode) => {
      allIds.add(node.id);
      node.children?.forEach(traverse);
    };
    traverse(data);
    setExpandedIds(allIds);
  }, [data]);

  const exportAsPng = useCallback(() => {
    const element = document.querySelector(
      ".react-flow__viewport",
    ) as HTMLElement;
    if (!element) return;

    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(nodesBounds, 1200, 800, 0.5, 2, 0.1);

    toPng(element, {
      backgroundColor: "transparent",
      width: 1200,
      height: 800,
      style: {
        width: "1200px",
        height: "800px",
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "organization-chart.png";
      link.href = dataUrl;
      link.click();
    });
  }, [nodes]);

  const exportAsPdf = useCallback(() => {
    const element = document.querySelector(
      ".react-flow__viewport",
    ) as HTMLElement;
    if (!element) return;

    const nodesBounds = getNodesBounds(nodes);
    const viewport = getViewportForBounds(nodesBounds, 1200, 800, 0.5, 2, 0.1);

    toPng(element, {
      backgroundColor: "white",
      width: 1200,
      height: 800,
      style: {
        width: "1200px",
        height: "800px",
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then((dataUrl) => {
      const pdf = new jsPDF("l", "px", [1200, 800]);
      pdf.addImage(dataUrl, "PNG", 0, 0, 1200, 800);
      pdf.save("organization-chart.pdf");
    });
  }, [nodes]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const traverse = (node: OrgUnitNode, isVisible: boolean) => {
      if (!isVisible) return;

      const isExpanded = expandedIds.has(node.id);
      const hasChildren = node.children && node.children.length > 0;

      const nodeData: OrgNodeData = {
        id: node.id,
        name: node.name,
        type: node.type,
        code: node.code,
        isExpanded,
        hasChildren,
        onToggleExpand: toggleExpand,
      };

      nodes.push({
        id: node.id,
        type: "orgNode",
        data: nodeData,
        position: { x: 0, y: 0 },
      });

      if (hasChildren && isExpanded) {
        node.children.forEach((child) => {
          edges.push({
            id: `e${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            type: "step",
            animated: true,
            className: "stroke-foreground",
            style: { strokeWidth: 1.5 },
          });
          traverse(child, true);
        });
      }
    };

    traverse(data, true);
    const finalNodes = getLayoutedElements(nodes, edges);
    return { nodes: finalNodes, edges };
  }, [data, expandedIds, toggleExpand]);

  useEffect(() => {
    if (mounted) {
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges, mounted]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const findNode = (id: string, n: OrgUnitNode): OrgUnitNode | null => {
        if (n.id === id) return n;
        for (const child of n.children) {
          const found = findNode(id, child);
          if (found) return found;
        }
        return null;
      };
      const fullNode = findNode(node.id, data);
      if (fullNode) {
        onNodeClick(fullNode);
      }
    },
    [data, onNodeClick],
  );

  if (!mounted) {
    return <div className="h-full w-full bg-background/20" />;
  }

  return (
    <Card className="bg-card border-none shadow-none overflow-hidden h-full flex flex-col">
      <CardContent className="p-0 flex-1 relative bg-background/20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          minZoom={0.05}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="hsl(var(--muted-foreground) / 0.2)"
          />

          <Panel position="top-right" className="flex flex-col gap-2 p-4">
            <div className="flex flex-col gap-2 bg-secondary/90 backdrop-blur-md p-3 rounded-xl border border-border shadow-2xl">
              <Button
                variant="secondary"
                size="sm"
                className="justify-start gap-2 h-9 px-4 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                onClick={expandAll}
              >
                <Maximize2 size={16} />
                <span className="font-semibold text-xs">Expand All</span>
              </Button>

              <div className="h-px bg-border my-1" />

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
                  Export Diagram
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="justify-start gap-2 h-9 px-4 cursor-pointer hover:bg-primary/20 hover:text-primary"
                  onClick={exportAsPng}
                >
                  <FileImage size={16} />
                  <span className="font-medium text-xs">Save as PNG</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="justify-start gap-2 h-9 px-4 cursor-pointer hover:bg-primary/20 hover:text-primary"
                  onClick={exportAsPdf}
                >
                  <FileText size={16} />
                  <span className="font-medium text-xs">Save as PDF</span>
                </Button>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </CardContent>
    </Card>
  );
}
