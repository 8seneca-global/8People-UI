import type { Position } from "@/lib/mock-data";

export interface OrgUnitNode {
  id: string;
  code: string;
  name: string;
  type: "company" | "division" | "department" | "team";
  level: number;
  managerName?: string;
  costCenter?: string;
  employeeCount: number;
  children: OrgUnitNode[];
  positions: any[];
}

export interface OrgUnitDetail {
  id: string;
  name: string;
  parent: {
    id: string;
    name: string;
    code: string;
  } | null;
  manager: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    positionTitle: string;
  } | null;
  employees: Array<{
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    positionTitle?: string;
    status: string;
  }>;
  headcount: {
    total: number;
    filled: number;
    hiring: number;
    vacant: number;
  };
}

export type ViewMode = "units" | "positions";
