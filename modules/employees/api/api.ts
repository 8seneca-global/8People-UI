import { api } from "@/lib/axios";
import { EmployeesListResponse, EmployeeResponse } from "@hr-system/contracts";

export const employeesApi = {
  list: async (): Promise<EmployeesListResponse> => {
    const { data } = await api.get<EmployeesListResponse>("/employees");
    return data;
  },
  get: async (id: string): Promise<EmployeeResponse> => {
    const { data } = await api.get<EmployeeResponse>(`/employees/${id}`);
    return data;
  },
  patch: async (id: string, data: any): Promise<any> => {
    const { data: responseData } = await api.patch<any>(
      `/employees/${id}`,
      data,
    );
    return responseData;
  },
};
