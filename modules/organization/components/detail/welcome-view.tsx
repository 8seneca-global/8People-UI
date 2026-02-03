"use client";

import { Card, CardContent } from "@/modules/core/components/ui/card";
import { Building2, Users, Network } from "lucide-react";

interface WelcomeViewProps {
  totalEmployees: number;
  totalPositions: number;
}

export function WelcomeView({
  totalEmployees,
  totalPositions,
}: WelcomeViewProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-primary/10 p-6 rounded-full">
        <Building2 className="h-12 w-12 text-primary" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-card-foreground">
          Welcome to 8seneca Org Chart
        </h1>
        <p className="text-muted-foreground text-lg">
          Select an organization unit from the sidebar to view details,
          management tools, and metrics.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-default">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <span className="text-4xl font-bold text-card-foreground">
              {totalEmployees}
            </span>
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Employees
            </span>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors cursor-default">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <span className="text-4xl font-bold text-card-foreground">
              {totalPositions}
            </span>
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Network className="h-4 w-4" />
              Total Positions
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
