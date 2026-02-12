import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/modules/core/components/ui/dialog";
import { Badge } from "@/modules/core/components/ui/badge";
import { cn } from "@/lib/utils";
import { Building2, Network, Users } from "lucide-react";
import type { OrgUnitNode } from "../../types";
import type { Position } from "@/lib/mock-data";

interface OrgUnitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: OrgUnitNode | null;
}

export function OrgUnitDetailDialog({
  open,
  onOpenChange,
  node,
}: OrgUnitDetailDialogProps) {
  const getNodeIcon = (type: OrgUnitNode["type"]) => {
    switch (type) {
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "division":
        return <Network className="h-4 w-4" />;
      case "department":
        return <Users className="h-4 w-4" />;
      case "team":
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: OrgUnitNode["type"]) => {
    switch (type) {
      case "company":
        return "bg-primary/20 text-primary";
      case "division":
        return "bg-purple-500/20 text-purple-500";
      case "department":
        return "bg-blue-500/20 text-blue-500";
      case "team":
        return "bg-green-500/20 text-green-500";
    }
  };

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            {node && (
              <>
                <div className={cn("p-1.5 rounded", getTypeColor(node.type))}>
                  {getNodeIcon(node.type)}
                </div>
                {node.name}
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        {node && (
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code</span>
                <Badge variant="outline">{node.code}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline" className="capitalize">
                  {node.type}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level</span>
                <span className="text-card-foreground">{node.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Headcount</span>
                <span className="text-card-foreground font-medium">
                  {node.employeeCount}
                </span>
              </div>
              {node.managerName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manager</span>
                  <span className="text-card-foreground">
                    {node.managerName}
                  </span>
                </div>
              )}
              {node.costCenter && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Center</span>
                  <span className="text-card-foreground">
                    {node.costCenter}
                  </span>
                </div>
              )}
            </div>
            {node.positions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-card-foreground mb-2">
                  Positions ({node.positions.length})
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {node.positions.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex items-center justify-between text-sm p-2 rounded bg-secondary/50"
                    >
                      <span>{pos.title}</span>
                      {getHiringStatusBadge(pos.hiringStatus)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
