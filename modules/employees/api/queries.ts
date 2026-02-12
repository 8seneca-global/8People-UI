/**
 * Employee API Queries - Mock Mode
 *
 * All queries return mock data from the Zustand store instead of making API calls.
 */

import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { employeesQueryKeys } from "./query-keys";

// Define types locally since we're not using the API contracts
interface EmployeesListResponse {
  data: any[];
  total: number;
}

interface EmployeeResponse {
  data: any;
}

export function useEmployees(
  options?: Omit<
    UseQueryOptions<EmployeesListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: employeesQueryKeys.lists(),
    queryFn: async (): Promise<EmployeesListResponse> => {
      // Return mock employees from the store
      const employees = useStore.getState().employees;
      return {
        data: employees,
        total: employees.length,
      };
    },
    ...options,
  });
}

export function useEmployee(
  id: string,
  options?: Omit<
    UseQueryOptions<EmployeeResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: employeesQueryKeys.detail(id),
    queryFn: async (): Promise<EmployeeResponse> => {
      // Return mock employee from the store
      const employees = useStore.getState().employees;
      const employee = employees.find((e) => e.id === id);
      return { data: employee || null };
    },
    enabled: !!id,
    ...options,
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Update employee in the store
      useStore.getState().updateEmployee(id, data);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: employeesQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["orgUnits"],
      });
    },
  });
}
