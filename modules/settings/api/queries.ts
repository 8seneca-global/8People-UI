/**
 * Settings API Queries - Mock Mode
 *
 * All queries return mock data from the Zustand store instead of making API calls.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { settingsQueryKeys } from "./query-keys";
import { authQueryKeys } from "../../auth/api/query-keys";
import { NavigationModule, Role, Endpoint } from "./types";
import { defaultModules } from "@/lib/rbac";

export function useModules(
  options?: Omit<
    UseQueryOptions<NavigationModule[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: settingsQueryKeys.modules.all(),
    queryFn: async (): Promise<NavigationModule[]> => {
      // Return mock modules from the store
      const modules = useStore.getState().modules;

      // Convert store modules to NavigationModule format
      return modules.map((m, idx) => ({
        id: m.id,
        name: m.name,
        label: m.label,
        urlPath: m.urlPath,
        bePath: m.bePath,
        icon: m.icon,
        parentId: m.parentId,
        sortOrder: idx,
        isActive: m.isActive,
        children: [],
      }));
    },
    ...options,
  });
}

export function useModuleEndpoints(
  options?: Omit<UseQueryOptions<Endpoint[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: ["module-endpoints"],
    queryFn: async (): Promise<Endpoint[]> => {
      // Return mock endpoints
      return [
        { method: "GET", path: "/employees", group: "Employees" },
        { method: "GET", path: "/employees/:id", group: "Employees" },
        { method: "POST", path: "/employees", group: "Employees" },
        { method: "PUT", path: "/employees/:id", group: "Employees" },
        { method: "DELETE", path: "/employees/:id", group: "Employees" },
        { method: "GET", path: "/organization/units", group: "Organization" },
        {
          method: "GET",
          path: "/organization/units/:id",
          group: "Organization",
        },
        { method: "POST", path: "/organization/units", group: "Organization" },
        {
          method: "PUT",
          path: "/organization/units/:id",
          group: "Organization",
        },
        {
          method: "DELETE",
          path: "/organization/units/:id",
          group: "Organization",
        },
        { method: "GET", path: "/leave/requests", group: "Leave" },
        { method: "POST", path: "/leave/requests", group: "Leave" },
        { method: "GET", path: "/settings/modules", group: "Settings" },
        { method: "GET", path: "/settings/roles", group: "Settings" },
      ];
    },
    ...options,
  });
}

export function useRoles(
  options?: Omit<UseQueryOptions<Role[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsQueryKeys.roles.all(),
    queryFn: async (): Promise<Role[]> => {
      // Return mock roles from the store
      const customRoles = useStore.getState().customRoles;

      return customRoles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: [],
        userRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    },
    ...options,
  });
}

export function useMyRoles(
  options?: Omit<UseQueryOptions<Role[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: authQueryKeys.myRoles(),
    queryFn: async (): Promise<Role[]> => {
      // In mock mode, return all custom roles as "my roles"
      const customRoles = useStore.getState().customRoles;

      return customRoles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: [],
        userRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    },
    ...options,
  });
}
