import {
  useQuery,
  UseQueryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { employeesApi } from "./api";
import { employeesQueryKeys } from "./query-keys";
import { EmployeesListResponse, EmployeeResponse } from "@hr-system/contracts";

export function useEmployees(
  options?: Omit<
    UseQueryOptions<EmployeesListResponse, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: employeesQueryKeys.lists(),
    queryFn: employeesApi.list,
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
    queryFn: () => employeesApi.get(id),
    enabled: !!id,
    ...options,
  });
}
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      employeesApi.patch(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: employeesQueryKeys.all,
      });
      // Also invalidate org units as employee might have moved
      queryClient.invalidateQueries({
        queryKey: ["orgUnits"],
      });
    },
  });
}
