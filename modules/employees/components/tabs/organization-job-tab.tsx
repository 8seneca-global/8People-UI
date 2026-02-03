"use client";

import { DetailedEmployeeInfo } from "../../mock-details";
import { Network, UserCheck, Briefcase, DollarSign } from "lucide-react";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/modules/core/components/ui/radio-group";
import { Label } from "@/modules/core/components/ui/label";

interface OrganizationJobTabProps {
  info?: DetailedEmployeeInfo;
}

export function OrganizationJobTab({ info }: OrganizationJobTabProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      <section className="space-y-8">
        <div className="px-0 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Organization and Job Information
            </h3>
          </div>
        </div>
        <div className="p-0 pt-2 space-y-10">
          {/* Job Title */}
          <div className="flex items-center gap-8 max-w-2xl px-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight w-32 shrink-0">
              Job Title
            </label>
            <div className="bg-secondary/10 border border-border/30 rounded-lg px-3 py-2 text-sm font-medium text-foreground flex-1 min-h-[38px] flex items-center shadow-sm">
              {info?.organizationJob.jobTitle || "—"}
            </div>
          </div>

          {/* Org Structure */}
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-primary/70" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                Organization Structure
              </span>
            </div>
            <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-3 border-b border-border w-1/3 text-center border-r">
                      Organization Level
                    </th>
                    <th className="px-6 py-3 border-b border-border text-center">
                      Organization Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {info?.organizationJob.orgStructure.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-3 border-r border-border font-medium text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center">
                            {idx > 0 && (
                              <div className="w-px h-2 bg-border -mt-2" />
                            )}
                            <div className="w-2 h-2 rounded-full border border-primary/50" />
                          </div>
                          {item.level}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-medium text-foreground bg-primary/5">
                        {item.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Managers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-2">
            <ManagerSection
              title="Direct Line Manager"
              manager={info?.organizationJob.directLineManager}
            />
            <ManagerSection
              title="Functional Manager"
              manager={info?.organizationJob.functionalManager}
            />
          </div>
        </div>
      </section>

      {/* Salary Section merged from ContractTab */}
      <section className="space-y-6">
        <div className="px-0 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Salary Details
            </h3>
          </div>
        </div>
        <div className="p-0 pt-2 px-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-8">
            <DetailField
              label="Base Salary"
              value={
                info
                  ? formatCurrency(
                      info.salaryDetail.baseSalary,
                      info.salaryDetail.currency,
                    )
                  : "—"
              }
              highlight
            />
            <DetailField
              label="Currency"
              value={info?.salaryDetail.currency || "—"}
            />
            <DetailField
              label="Pay Cycle"
              value={info?.salaryDetail.payCycle || "—"}
            />
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight block mb-2">
                Allowances
              </label>
              <div className="space-y-2">
                {info?.salaryDetail.allowances.map(
                  (al: { name: string; amount: number }, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs bg-muted/30 rounded-lg px-3 py-2 border border-border/50 shadow-sm"
                    >
                      <span className="text-muted-foreground font-medium">
                        {al.name}
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrency(al.amount, info.salaryDetail.currency)}
                      </span>
                    </div>
                  ),
                )}
                {!info?.salaryDetail.allowances.length && (
                  <span className="text-xs text-muted-foreground italic px-1">
                    No allowances
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ManagerSection({ title, manager }: { title: string; manager: any }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 text-primary/70" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
          {title}
        </span>
      </div>

      <RadioGroup
        value={manager?.byOrgStructure ? "org" : "select"}
        className="space-y-3"
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2 w-48 shrink-0">
            <RadioGroupItem value="org" id={`${title}-org`} disabled />
            <Label
              htmlFor={`${title}-org`}
              className="text-xs text-muted-foreground"
            >
              By Organization Structure
            </Label>
          </div>
          <div className="bg-secondary/10 border border-border/30 rounded px-3 py-1.5 text-xs text-foreground flex-1 min-h-[30px] flex items-center shadow-sm">
            {manager?.byOrgStructure ? `${manager.code} - ${manager.name}` : ""}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2 w-48 shrink-0">
            <RadioGroupItem value="select" id={`${title}-select`} disabled />
            <Label
              htmlFor={`${title}-select`}
              className="text-xs text-muted-foreground opacity-50"
            >
              Select an Employee
            </Label>
          </div>
          <div className="bg-secondary/5 border border-border/20 rounded px-3 py-1.5 text-xs text-muted-foreground flex-1 min-h-[30px] flex items-center opacity-50">
            {!manager?.byOrgStructure && manager?.name
              ? `${manager.code} - ${manager.name}`
              : ""}
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}

function DetailField({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight">
        {label}
      </label>
      <div
        className={`bg-secondary/10 border border-border/30 rounded px-3 py-1.5 min-h-[34px] flex items-center shadow-sm
        ${highlight ? "text-primary text-base font-bold" : "text-sm font-medium text-foreground"}
      `}
      >
        {value}
      </div>
    </div>
  );
}
