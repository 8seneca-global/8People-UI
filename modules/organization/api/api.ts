import { api } from "@/lib/axios";

export interface OrgTreeNode {
  id: string;
  code: string;
  name: string;
  abbreviation?: string;
  level: number;
  employeeCount: number;
  children?: OrgTreeNode[];
}

export const organizationApi = {
  getTree: async (): Promise<OrgTreeNode[]> => {
    const { data } = await api.get<OrgTreeNode[]>("/organization/units/tree");
    return data;
  },
  getDetail: async (id: string): Promise<any> => {
    const { data } = await api.get<any>(`/organization/units/${id}/detail`);
    return data;
  },
  updateDetail: async (id: string, data: any): Promise<any> => {
    const { data: responseData } = await api.put<any>(
      `/organization/units/${id}/detail`,
      data,
    );
    return responseData;
  },
  createUnit: async (data: any): Promise<any> => {
    const { data: responseData } = await api.post<any>(
      "/organization/units",
      data,
    );
    return responseData;
  },
  getEmployees: async (): Promise<any[]> => {
    const { data } = await api.get<any[]>("/organization/units/employees");
    return data;
  },
  deleteUnit: async (id: string): Promise<any> => {
    const { data } = await api.delete<any>(`/organization/units/${id}`);
    return data;
  },
};
