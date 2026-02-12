/**
 * Settings API Mutations - Mock Mode
 *
 * All mutations work with mock data from the Zustand store.
 */

import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { settingsQueryKeys } from "./query-keys";
import { NavigationModule, Role } from "./types";

// Modules

export function useCreateModule(
  options?: Omit<
    UseMutationOptions<NavigationModule, Error, any>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any): Promise<NavigationModule> => {
      useStore.getState().addModule(input);
      return {
        ...input,
        id: `mod-${Date.now()}`,
        sortOrder: 0,
        isActive: true,
        children: [],
      };
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.modules.all(),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

interface UpdateModuleVariables {
  id: string;
  data: any;
}

export function useUpdateModule(
  options?: Omit<
    UseMutationOptions<NavigationModule, Error, UpdateModuleVariables>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: UpdateModuleVariables): Promise<NavigationModule> => {
      useStore.getState().updateModule(id, data);
      return { id, ...data } as NavigationModule;
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.modules.all(),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useDeleteModule(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      useStore.getState().deleteModule(id);
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.modules.all(),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

// Roles

export function useCreateRole(
  options?: Omit<UseMutationOptions<Role, Error, any>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: any): Promise<Role> => {
      useStore.getState().addCustomRole({
        name: input.name,
        description: input.description || "",
        permissions: [],
        modulePermissions: {},
        assignedEmployeeIds: [],
      });
      return {
        id: `cr-${Date.now()}`,
        name: input.name,
        description: input.description,
        permissions: [],
        userRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.roles.all(),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

interface UpdateRoleVariables {
  id: string;
  data: any;
}

export function useUpdateRole(
  options?: Omit<
    UseMutationOptions<Role, Error, UpdateRoleVariables>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: UpdateRoleVariables): Promise<Role> => {
      useStore.getState().updateCustomRole(id, data);
      return {
        id,
        name: data.name,
        description: data.description,
        permissions: [],
        userRoles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.roles.all(),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useDeleteRole(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      useStore.getState().deleteCustomRole(id);
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.roles.all(),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}

interface UpdateRolePermissionsVariables {
  id: string;
  data: any;
}

export function useUpdateRolePermissions(
  options?: Omit<
    UseMutationOptions<any, Error, UpdateRolePermissionsVariables>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: UpdateRolePermissionsVariables): Promise<any> => {
      // Update permissions in the store
      if (data.permissions) {
        useStore.getState().updateRolePermissions(id, data.permissions);
      }
      return { id, ...data };
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: settingsQueryKeys.roles.all(),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}
