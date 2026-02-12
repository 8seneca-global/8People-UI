"use client";

import React from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OrgNodeData extends Record<string, unknown> {
  id: string;
  name: string;
  type: string;
  code: string;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggleExpand: (id: string) => void;
}

const NODE_WIDTH = 240;
const NODE_HEIGHT = 100;

export const OrgNode = ({ data }: NodeProps<Node<OrgNodeData>>) => {
  const typeColors: Record<string, string> = {
    company: "var(--primary)",
    division: "var(--accent)",
    department: "var(--primary)",
    team: "var(--success)",
  };
  const color = typeColors[data.type as string] || "var(--primary)";

  return (
    <div
      className={cn(
        "org-node-container relative group transition-all duration-300",
        "bg-card border border-border shadow-md",
      )}
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        borderRadius: "12px",
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      }}
    >
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "var(--primary)",
          width: "1px",
          height: "1px",
          border: "none",
          opacity: 0,
        }}
      />

      <div style={{ backgroundColor: color, height: "5px" }}></div>

      <div
        style={{
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: color,
              backgroundColor: `color-mix(in srgb, ${color}, transparent 85%)`,
              padding: "3px 8px",
              borderRadius: "6px",
            }}
          >
            {(data.type as string) === "company"
              ? "CEO"
              : (data.code as string)}
          </span>
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--card-foreground)",
            marginTop: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={data.name as string}
        >
          {data.name as string}
        </div>
      </div>

      {/* Expand/Collapse Toggle */}
      {data.hasChildren && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            (data.onToggleExpand as (id: string) => void)(data.id as string);
          }}
          className={cn(
            "absolute w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform z-10 cursor-pointer border-2 border-background",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "-bottom-4 left-1/2 -translate-x-1/2",
          )}
        >
          {data.isExpanded ? (
            <ChevronDown size={20} strokeWidth={3} className="rotate-180" />
          ) : (
            <ChevronDown size={20} strokeWidth={3} />
          )}
        </div>
      )}

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "var(--primary)",
          width: "1px",
          height: "1px",
          border: "none",
          opacity: 0,
        }}
      />
    </div>
  );
};
