import { Position } from "@/lib/mock-data"

export interface OrgUnitNode {
    id: string
    code: string
    name: string
    type: "company" | "division" | "department" | "team"
    level: number
    managerName?: string
    costCenter?: string
    employeeCount: number
    children: OrgUnitNode[]
    positions: Position[]
}

export type SelectedDetail =
    | { type: "department"; node: OrgUnitNode }
    | { type: "team"; node: OrgUnitNode }
    | { type: "division"; node: OrgUnitNode }
    | { type: "position"; position: Position }
    | null

export type ActiveSection = "overview" | "members" | "hiring" | "vacant" | null
