/**
 * Organization API Queries - Mock Mode
 *
 * All queries return mock data from the Zustand store instead of making API calls.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { organizationQueryKeys } from "./query-keys";
import { OrgTreeNode } from "./api";

// Helper function to build tree from flat org units
function buildOrgTree(units: any[], employees: any[]): OrgTreeNode[] {
  const unitMap = new Map<string, OrgTreeNode>();

  // Create nodes for all units
  units.forEach((unit) => {
    const employeeCount = employees.filter(
      (e) => e.organizationalUnitId === unit.id,
    ).length;

    unitMap.set(unit.id, {
      id: unit.id,
      code: unit.code,
      name: unit.name,
      abbreviation: unit.abbreviation,
      level: unit.level,
      employeeCount,
      children: [],
    });
  });

  const roots: OrgTreeNode[] = [];

  // Build tree structure
  units.forEach((unit) => {
    const node = unitMap.get(unit.id)!;
    if (unit.parentId) {
      const parent = unitMap.get(unit.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export const useGetOrgTree = () => {
  return useQuery({
    queryKey: organizationQueryKeys.tree.all(),
    queryFn: async (): Promise<OrgTreeNode[]> => {
      const state = useStore.getState();
      return buildOrgTree(state.organizationalUnits, state.employees);
    },
  });
};

export const useGetOrgDetail = (id: string) => {
  return useQuery({
    queryKey: organizationQueryKeys.orgUnits.byId(id),
    queryFn: async () => {
      const state = useStore.getState();
      const unit = state.organizationalUnits.find((u) => u.id === id);
      if (!unit) return null;

      // Get employees in this unit
      const employees = state.employees.filter(
        (e) => e.organizationalUnitId === id,
      );

      // Get positions in this unit
      const positions = state.positions.filter(
        (p) => p.organizationalUnitId === id,
      );

      return {
        ...unit,
        employees,
        positions,
        employeeCount: employees.length,
        positionCount: positions.length,
      };
    },
    enabled: !!id,
  });
};

export const useUpdateOrgDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      useStore.getState().updateOrganizationalUnit(id, data);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.orgUnits.byId(id),
      });
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.tree.all(),
      });
    },
  });
};

export const useCreateOrgUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      useStore.getState().addOrganizationalUnit(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.tree.all(),
      });
    },
  });
};

export const useGetOrgEmployees = () => {
  return useQuery({
    queryKey: ["orgEmployees"],
    queryFn: async () => {
      const employees = useStore.getState().employees;
      return employees.map((e) => ({
        id: e.id,
        fullName: e.fullName,
        positionTitle: e.positionTitle,
        organizationalUnitId: e.organizationalUnitId,
        organizationalUnitName: e.organizationalUnitName,
      }));
    },
  });
};

export const useDeleteOrgUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      useStore.getState().deleteOrganizationalUnit(id);
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.tree.all(),
      });
      queryClient.invalidateQueries({
        queryKey: ["orgEmployees"],
      });
    },
  });
};
