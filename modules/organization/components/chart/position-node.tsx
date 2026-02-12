import { Briefcase, User } from "lucide-react";
import { Badge } from "@/modules/core/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Position } from "@/lib/mock-data";

interface PositionNodeProps {
  position: Position;
  level: number;
  isSelected?: boolean;
  onClick: (position: Position) => void;
}

export function PositionNode({
  position,
  level,
  isSelected,
  onClick,
}: PositionNodeProps) {
  const getHiringStatusBadge = (status: Position["hiringStatus"]) => {
    switch (status) {
      case "vacant":
        return (
          <Badge variant="destructive" className="text-xs">
            Vacant
          </Badge>
        );
      case "hiring":
        return (
          <Badge className="text-xs bg-warning/20 text-warning border-warning/30">
            Hiring
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
        "hover:bg-secondary/80 border border-transparent",
        isSelected && "bg-primary/10 border-primary/20",
      )}
      style={{ marginLeft: (level + 1) * 24 }}
      onClick={() => onClick(position)}
    >
      <div className="w-5" />
      <div className="p-1.5 rounded bg-gray-500/20 text-gray-500">
        <Briefcase className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-card-foreground truncate text-sm">
            {position.title}
          </span>
          {getHiringStatusBadge(position.hiringStatus)}
        </div>
        {position.incumbentName ? (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            {position.incumbentName}
          </p>
        ) : (
          <p className="text-xs text-destructive/70">No incumbent</p>
        )}
      </div>
      <Badge variant="secondary" className="text-xs">
        {position.code}
      </Badge>
    </div>
  );
}
