/**
 * Core API Queries - Mock Mode
 *
 * All queries return mock data instead of making API calls.
 */

import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { settingsQueryKeys } from "../../settings/api/query-keys";

export function useSystemRoutes(
  options?: Omit<UseQueryOptions<string[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: settingsQueryKeys.system.routes(),
    queryFn: async (): Promise<string[]> => {
      // Return mock system routes
      return [
        "/dashboard",
        "/employees",
        "/employees/:id",
        "/organization",
        "/organization/chart",
        "/leave",
        "/leave/requests",
        "/leave/balances",
        "/attendance",
        "/recruitment",
        "/recruitment/jobs",
        "/recruitment/candidates",
        "/settings",
        "/settings/modules",
        "/settings/roles",
      ];
    },
    ...options,
  });
}
