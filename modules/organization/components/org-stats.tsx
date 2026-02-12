import { Card, CardContent } from "@/modules/core/components/ui/card";
import { Users, Building2, AlertCircle, Briefcase } from "lucide-react";

interface OrgStatsProps {
  totalEmployees: number;
  totalOrgUnits: number;
  vacantCount: number;
  hiringCount: number;
}

export function OrgStats({
  totalEmployees,
  totalOrgUnits,
  vacantCount,
  hiringCount,
}: OrgStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {totalEmployees}
              </p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {totalOrgUnits}
              </p>
              <p className="text-sm text-muted-foreground">Org Units</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {vacantCount}
              </p>
              <p className="text-sm text-muted-foreground">Vacant Positions</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <Briefcase className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {hiringCount}
              </p>
              <p className="text-sm text-muted-foreground">Hiring</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
