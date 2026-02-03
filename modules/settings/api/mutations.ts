import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { settingsApi } from "./api";
import { settingsQueryKeys } from "./query-keys";
import { NavigationModule, Role } from "./types";
import {
  UpdateModuleInput,
  CreateRoleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from "@hr-system/contracts";

// Modules

export function useCreateModule(
  options?: Omit<UseMutationOptions<NavigationModule, Error, any>, "mutationFn">
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.modules.create,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.modules.all(),
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

interface UpdateModuleVariables {
  id: string;
  data: UpdateModuleInput;
}

export function useUpdateModule(
  options?: Omit<
    UseMutationOptions<NavigationModule, Error, UpdateModuleVariables>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.modules.update(id, data),
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.modules.all(),
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

export function useDeleteModule(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.modules.delete,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.modules.all(),
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

// Roles

export function useCreateRole(
  options?: Omit<UseMutationOptions<Role, Error, CreateRoleInput>, "mutationFn">
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.roles.create,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.roles.all(),
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

interface UpdateRoleVariables {
  id: string;
  data: UpdateRoleInput;
}

export function useUpdateRole(
  options?: Omit<
    UseMutationOptions<Role, Error, UpdateRoleVariables>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.roles.update(id, data),
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.roles.all(),
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

export function useDeleteRole(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsApi.roles.delete,
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.roles.all(),
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}

interface UpdateRolePermissionsVariables {
  id: string;
  data: UpdateRolePermissionsInput;
}

export function useUpdateRolePermissions(
  options?: Omit<
    UseMutationOptions<any, Error, UpdateRolePermissionsVariables>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => settingsApi.roles.updatePermissions(id, data),
    ...options,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.roles.all(),
      });
      options?.onSuccess?.(data, variables, context, mutation);
    },
  });
}
