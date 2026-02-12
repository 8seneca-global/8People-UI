import { api } from "@/lib/axios";
import { NavigationModule, Role, Endpoint } from "./types";
import {
  CreateRoleInput,
  UpdateModuleInput,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from "@hr-system/contracts";

export const settingsApi = {
  modules: {
    list: async (): Promise<NavigationModule[]> => {
      const { data } = await api.get<NavigationModule[]>("/settings/modules");
      return data;
    },
    create: async (input: any): Promise<NavigationModule> => {
      const { data } = await api.post<NavigationModule>(
        "/settings/modules",
        input
      );
      return data;
    },
    update: async (
      id: string,
      data: UpdateModuleInput
    ): Promise<NavigationModule> => {
      const { data: res } = await api.patch<NavigationModule>(
        `/settings/modules/${id}`,
        data
      );
      return res;
    },
    delete: async (id: string): Promise<void> => {
      await api.delete(`/settings/modules/${id}`);
    },
    endpoints: async (): Promise<Endpoint[]> => {
      const response = await api.get("/settings/modules/endpoints");
      return response.data as Endpoint[];
    },
  },
  roles: {
    list: async (): Promise<Role[]> => {
      const { data } = await api.get<Role[]>("/settings/roles");
      return data;
    },
    myRoles: async (): Promise<Role[]> => {
      const { data } = await api.get<Role[]>("/auth/my-roles");
      return data;
    },
    create: async (input: CreateRoleInput): Promise<Role> => {
      const { data } = await api.post<Role>("/settings/roles", input);
      return data;
    },
    update: async (id: string, data: UpdateRoleInput): Promise<Role> => {
      const { data: res } = await api.patch<Role>(
        `/settings/roles/${id}`,
        data
      );
      return res;
    },
    delete: async (id: string): Promise<void> => {
      await api.delete(`/settings/roles/${id}`);
    },
    updatePermissions: async (
      id: string,
      data: UpdateRolePermissionsInput
    ): Promise<any> => {
      const { data: res } = await api.patch(
        `/settings/roles/${id}/permissions`,
        data
      );
      return res;
    },
  },
};


