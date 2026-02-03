import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { coreApi } from "./api";
import { settingsQueryKeys } from "../../settings/api/query-keys";

export function useSystemRoutes(
  options?: Omit<UseQueryOptions<string[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: settingsQueryKeys.system.routes(),
    queryFn: coreApi.system.routes,
    ...options,
  });
}
