import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/modules/core/components/ui/dialog";
import { Badge } from "@/modules/core/components/ui/badge";
import { Briefcase } from "lucide-react";
import type { Position } from "@/lib/mock-data";

interface PositionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: Position | null;
}

export function PositionDetailDialog({
  open,
  onOpenChange,
  position,
}: PositionDetailDialogProps) {
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
            <div className="p-1.5 rounded bg-gray-500/20">
              <Briefcase className="h-4 w-4 text-gray-500" />
            </div>
            {position?.title}
          </DialogTitle>
        </DialogHeader>
        {position && (
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code</span>
                <Badge variant="outline">{position.code}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="text-card-foreground">
                  {position.organizationalUnitName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                {getHiringStatusBadge(position.hiringStatus) || (
                  <Badge className="bg-success/20 text-success">Filled</Badge>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Incumbent</span>
                <span className="text-card-foreground">
                  {position.incumbentName || "Vacant"}
                </span>
              </div>
              {position.parentPositionTitle && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reports To</span>
                  <span className="text-card-foreground">
                    {position.parentPositionTitle}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
