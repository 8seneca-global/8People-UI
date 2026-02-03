"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/modules/core/components/ui/tabs";
import { TransactionDetail } from "../../api/transactions-mock";
import { Badge } from "@/modules/core/components/ui/badge";
import {
  Briefcase,
  Building2,
  FileText,
  Banknote,
  User,
  MapPin,
  CheckCircle2,
  Edit2,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/core/components/ui/button";
import { EmployeeTransaction } from "../../api/transactions-mock";
import { useState, useEffect } from "react";
import { Input } from "@/modules/core/components/ui/input";

interface TransactionDetailTabsProps {
  transaction: EmployeeTransaction;
  onApprove: (id: string) => void;
  onEdit: (transaction: EmployeeTransaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionDetailTabs({
  transaction,
  onApprove,
  onEdit,
  onDelete,
}: TransactionDetailTabsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(transaction);

  useEffect(() => {
    setLocalData(transaction);
    setIsEditing(false);
  }, [transaction]);

  const detail = localData.details;

  const handleSave = () => {
    onEdit(localData);
    setIsEditing(false);
  };

  const updateDetail = (
    section: keyof typeof localData.details,
    field: string,
    value: string | number,
  ) => {
    setLocalData((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [section]: {
          ...(prev.details[section] as any),
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="h-full flex flex-col bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
      {/* Detail Header with Actions */}
      <div className="px-6 py-3 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {transaction.action}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {transaction.reason || "No reason provided"}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] h-5 font-bold px-2",
              transaction.status === "Approved"
                ? "bg-success/20 text-success border-success/30 hover:bg-success/30"
                : transaction.status === "Pending"
                  ? "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30"
                  : "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30",
            )}
          >
            {transaction.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-bold gap-2 text-success border-success/30 hover:bg-success/10 hover:border-success/50 transition-all shadow-sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-bold gap-2 border-border/60 hover:bg-secondary/10 transition-all shadow-sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </>
          ) : (
            <>
              {transaction.status === "Pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-xs font-bold gap-2 text-success border-success/30 hover:bg-success/10 hover:border-success/50 transition-all shadow-sm"
                  onClick={() => onApprove(transaction.id)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-bold gap-2 border-border/60 hover:bg-secondary/10 transition-all shadow-sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4 text-muted-foreground" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-bold gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30 transition-all shadow-sm"
                onClick={() => onDelete(transaction.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-border bg-card">
          <TabsList className="bg-muted/50 p-1 flex h-auto justify-start border border-border gap-1 w-full">
            <TabsTrigger
              value="general"
              className="px-4 py-2 text-xs h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all font-medium"
            >
              General Information
            </TabsTrigger>
            <TabsTrigger
              value="org"
              className="px-4 py-2 text-xs h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all font-medium"
            >
              Organization & Job
            </TabsTrigger>
            <TabsTrigger
              value="contract"
              className="px-4 py-2 text-xs h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all font-medium"
            >
              Contract Information
            </TabsTrigger>
            <TabsTrigger
              value="salary"
              className="px-4 py-2 text-xs h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all font-medium"
            >
              Salary Information
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto bg-muted/5">
          <div className="p-4 md:p-6 space-y-8 w-full">
            {/* General Information */}
            <TabsContent
              value="general"
              className="mt-0 space-y-6 animate-in fade-in duration-300 border-none outline-none"
            >
              <section className="space-y-4">
                <div className="px-0 py-2 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    General Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <DetailField
                    label="Employee Type"
                    value={detail.generalInfo.employeeType}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("generalInfo", "employeeType", val)
                    }
                  />
                  <DetailField
                    label="Service Start Date"
                    value={detail.generalInfo.serviceStartDate}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("generalInfo", "serviceStartDate", val)
                    }
                  />
                  <DetailField
                    label="Working Time"
                    value={detail.generalInfo.workingTime}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("generalInfo", "workingTime", val)
                    }
                  />
                  <DetailField
                    label="Employee Level"
                    value={detail.generalInfo.employeeLevel}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("generalInfo", "employeeLevel", val)
                    }
                  />
                  <DetailField
                    label="Employee Band"
                    value={detail.generalInfo.employeeBand}
                  />
                  <DetailField
                    label="Employee Category"
                    value={detail.generalInfo.employeeCategory}
                  />
                  <DetailField
                    label="Employee Group"
                    value={detail.generalInfo.employeeGroup}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("generalInfo", "employeeGroup", val)
                    }
                  />
                  <DetailField
                    label="Employee Sub Group"
                    value={detail.generalInfo.employeeSubGroup}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("generalInfo", "employeeSubGroup", val)
                    }
                  />
                </div>
              </section>
            </TabsContent>

            {/* Organization & Job */}
            <TabsContent
              value="org"
              className="mt-0 space-y-6 animate-in fade-in duration-300 border-none outline-none"
            >
              <section className="space-y-4">
                <div className="px-0 py-2 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Position Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailField
                    label="Job Title"
                    value={detail.organizationJob.jobTitle}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("organizationJob", "jobTitle", val)
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailField
                      label="Direct Line Manager"
                      value={detail.organizationJob.directLineManager}
                      isEditing={isEditing}
                      onChange={(val) =>
                        updateDetail(
                          "organizationJob",
                          "directLineManager",
                          val,
                        )
                      }
                    />
                    <DetailField
                      label="Functional Manager"
                      value={detail.organizationJob.functionalManager}
                      isEditing={isEditing}
                      onChange={(val) =>
                        updateDetail(
                          "organizationJob",
                          "functionalManager",
                          val,
                        )
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="px-0 py-2 border-b border-border">
                  <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Organizational Structure
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {detail.organizationJob.orgStructure.map((item, idx) => (
                    <DetailField
                      key={idx}
                      label={item.level}
                      value={item.unit}
                    />
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* Contract Information */}
            <TabsContent
              value="contract"
              className="mt-0 space-y-6 animate-in fade-in duration-300 border-none outline-none"
            >
              <section className="space-y-4">
                <div className="px-0 py-2 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Contract Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <DetailField
                    label="Contract Category"
                    value={detail.contractInfo.category}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("contractInfo", "category", val)
                    }
                  />
                  <DetailField
                    label="Contract Number"
                    value={detail.contractInfo.contractNumber}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("contractInfo", "contractNumber", val)
                    }
                  />
                  <DetailField
                    label="Duration"
                    value={detail.contractInfo.duration}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("contractInfo", "duration", val)
                    }
                  />
                  <DetailField
                    label="Probation Start Date"
                    value={detail.contractInfo.startDate}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("contractInfo", "startDate", val)
                    }
                  />
                  <DetailField
                    label="Probation End Date"
                    value={detail.contractInfo.endDate}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("contractInfo", "endDate", val)
                    }
                  />
                  <DetailField
                    label="Appendix Number"
                    value={detail.contractInfo.appendixNumber}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("contractInfo", "appendixNumber", val)
                    }
                  />
                  <DetailField
                    label="Sign Date"
                    value={detail.contractInfo.signDate}
                    isEditing={isEditing}
                    onChange={(val) =>
                      updateDetail("contractInfo", "signDate", val)
                    }
                  />
                </div>
              </section>
            </TabsContent>

            {/* Salary Information */}
            <TabsContent
              value="salary"
              className="mt-0 space-y-6 animate-in fade-in duration-300 border-none outline-none"
            >
              <section className="space-y-4">
                <div className="px-0 py-2 border-b border-border">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Compensation Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <DetailField
                      label="Base Salary"
                      value={detail.salaryInfo.baseSalary}
                      isEditing={isEditing}
                      formatCurrency
                      onChange={(val) =>
                        updateDetail("salaryInfo", "baseSalary", val)
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <DetailField
                        label="Currency"
                        value={detail.salaryInfo.currency}
                        isEditing={isEditing}
                        onChange={(val) =>
                          updateDetail("salaryInfo", "currency", val)
                        }
                      />
                      <DetailField
                        label="Pay Cycle"
                        value={detail.salaryInfo.payCycle}
                        isEditing={isEditing}
                        onChange={(val) =>
                          updateDetail("salaryInfo", "payCycle", val)
                        }
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
                      Allowances
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {detail.salaryInfo.allowances.map((allowance, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md transition-all"
                        >
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {allowance.name}
                          </span>
                          <span className="text-base font-bold text-primary">
                            ₫{new Intl.NumberFormat().format(allowance.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function DetailField({
  label,
  value,
  isEditing,
  formatCurrency,
  onChange,
}: {
  label: string;
  value: string | number;
  isEditing?: boolean;
  formatCurrency?: boolean;
  onChange?: (val: string) => void;
}) {
  const displayValue =
    !isEditing && formatCurrency && typeof value === "number"
      ? `₫${new Intl.NumberFormat().format(value)}`
      : value;

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
        {label}
      </label>
      {isEditing ? (
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-9 text-sm bg-background border-primary/20 focus-visible:ring-primary/20"
        />
      ) : (
        <div className="bg-secondary/10 border border-border/30 rounded px-3 py-1.5 text-sm font-medium min-h-[38px] flex items-center text-foreground shadow-sm transition-colors hover:bg-secondary/20">
          {displayValue || "—"}
        </div>
      )}
    </div>
  );
}
