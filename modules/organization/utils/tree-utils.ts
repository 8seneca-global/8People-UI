import type { OrgUnitNode } from "../types";

export interface FlatOrgNode {
  id: string;
  parentId: string | null;
  name: string;
  code: string;
  type: string;
  employeeCount: number;
}

export const flattenOrgTree = (
  node: OrgUnitNode,
  parentId: string | null = null,
): FlatOrgNode[] => {
  const flattened: FlatOrgNode[] = [
    {
      id: node.id,
      parentId,
      name: node.name,
      code: node.code,
      type: node.type,
      employeeCount: node.employeeCount,
    },
  ];

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      flattened.push(...flattenOrgTree(child, node.id));
    });
  }

  return flattened;
};
