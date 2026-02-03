import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { settingsApi } from "./api";
import { settingsQueryKeys } from "./query-keys";
import { authQueryKeys } from "../../auth/api/query-keys";
import { NavigationModule, Role, Endpoint } from "./types";

export function useModules(
  options?: Omit<
    UseQueryOptions<NavigationModule[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: settingsQueryKeys.modules.all(),
    queryFn: settingsApi.modules.list,
    ...options,
  });
}

export function useModuleEndpoints(
  options?: Omit<UseQueryOptions<Endpoint[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["module-endpoints"], // TODO: Add to query keys if needed
    queryFn: settingsApi.modules.endpoints,
    ...options,
  });
}

export function useRoles(
  options?: Omit<UseQueryOptions<Role[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: settingsQueryKeys.roles.all(),
    queryFn: settingsApi.roles.list,
    ...options,
  });
}

export function useMyRoles(
  options?: Omit<UseQueryOptions<Role[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: authQueryKeys.myRoles(),
    queryFn: settingsApi.roles.myRoles,
    ...options,
  });
}
