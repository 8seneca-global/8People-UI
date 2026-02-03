import { useState } from "react";
import { Edit2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/modules/core/components/ui/avatar";
import { Card, CardContent } from "@/modules/core/components/ui/card";
import { Button } from "@/modules/core/components/ui/button";
import { Input } from "@/modules/core/components/ui/input";
import { Employee } from "@/lib/store";
import { DetailedEmployeeInfo } from "../mock-details";

interface EmployeeInfoHeaderProps {
  employee: Employee;
  detailedInfo?: DetailedEmployeeInfo;
}

export function EmployeeInfoHeader({
  employee,
  detailedInfo,
}: EmployeeInfoHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="mb-8 animate-in fade-in duration-500">
      <div className="px-0 py-2 border-b border-border flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Employee Information
        </h3>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors font-bold"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            EDIT
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-[10px] hover:bg-muted font-bold text-muted-foreground"
              onClick={() => setIsEditing(false)}
            >
              CANCEL
            </Button>
            <Button
              variant="default"
              size="sm"
              className="h-8 text-[10px] gap-1.5 font-bold shadow-sm"
              onClick={() => {
                // In a real app, save logic would go here
                setIsEditing(false);
              }}
            >
              SAVE CHANGES
            </Button>
          </div>
        )}
      </div>
      <div className="p-0">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.fullName}`}
                  alt={employee.fullName}
                />
                <AvatarFallback className="text-2xl">
                  {employee.firstName[0]}
                  {employee.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 h-6 w-6 rounded-full bg-success border-4 border-background" />
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-4 flex-1">
            <DetailField label="Employee Local ID (*)" value={employee.code} />
            <DetailField label="Employee Global ID" value="564420" />
            <DetailField label="Title" value="Mr." isEditable={isEditing} />
            <DetailField
              label="First Name (*)"
              value={employee.firstName}
              isEditable={isEditing}
            />
            <DetailField
              label="Middle Name"
              value={detailedInfo?.middleName || "Xuan"}
              isEditable={isEditing}
            />
            <DetailField
              label="Last Name"
              value={employee.lastName}
              isEditable={isEditing}
            />
            <DetailField label="Second Name" value="" isEditable={isEditing} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  isEditable,
}: {
  label: string;
  value: string | number;
  isEditable?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
        {label}
      </label>
      {isEditable ? (
        <Input
          defaultValue={value}
          className="h-9 text-sm font-medium bg-background border-primary/20 focus-visible:ring-primary/20"
        />
      ) : (
        <div className="bg-secondary/30 border border-border/50 rounded px-3 py-1.5 text-sm font-medium text-foreground min-h-[34px] flex items-center">
          {value}
        </div>
      )}
    </div>
  );
}
