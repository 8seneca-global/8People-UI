/**
 * Leave API Mutations - Mock Mode
 *
 * All queries and mutations work with mock data from the Zustand store.
 */

import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { leaveQueryKeys } from "./query-keys";
import {
  LeaveBalance,
  LeaveRequest,
  LeaveRequestInput,
  LeaveType,
  PaginatedResponse,
} from "./types";

export function useLeaveTypes(
  options?: Omit<UseQueryOptions<LeaveType[], Error>, "queryFn">,
) {
  return useQuery({
    queryKey: leaveQueryKeys.leaveTypes.all(),
    queryFn: async (): Promise<LeaveType[]> => {
      const leaveTypes = useStore.getState().leaveTypes;
      return leaveTypes as unknown as LeaveType[];
    },
    ...options,
  });
}

export function useLeaveBalance(
  year: number,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<LeaveBalance>, Error, LeaveBalance[]>,
    "queryFn"
  >,
) {
  return useQuery({
    queryKey: leaveQueryKeys.balance.all(),
    queryFn: async (): Promise<PaginatedResponse<LeaveBalance>> => {
      const balances = useStore
        .getState()
        .leaveBalances.filter((b) => b.year === year);
      return {
        data: balances as any,
        total: balances.length,
        page: 1,
        pageSize: balances.length,
        totalPages: 1,
        limit: balances.length
      } as unknown as PaginatedResponse<LeaveBalance>;
    },
    select: (res) => res.data as unknown as LeaveBalance[],
    ...options,
  });
}

export function useLeaveRequests(
  options?: Omit<
    UseQueryOptions<PaginatedResponse<LeaveRequest>, Error, LeaveRequest[]>,
    "queryFn"
  >,
) {
  return useQuery({
    queryKey: leaveQueryKeys.requests.all(),
    queryFn: async (): Promise<PaginatedResponse<LeaveRequest>> => {
      const requests = useStore.getState().leaveRequests;
      return {
        data: requests as any,
        total: requests.length,
        page: 1,
        pageSize: requests.length,
        totalPages: 1,
        limit: requests.length
      } as unknown as PaginatedResponse<LeaveRequest>;
    },
    select: (res) => res.data as unknown as LeaveRequest[],
    ...options,
  });
}

export function useCreateLeaveRequest(
  options?: Omit<
    UseMutationOptions<LeaveRequest, Error, LeaveRequestInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LeaveRequestInput): Promise<LeaveRequest> => {
      const store = useStore.getState();

      const newRequest = {
        employeeId: "P-011", // Default to current user for mock
        employeeName: "Current User",
        leaveTypeId: input.leaveTypeId,
        leaveTypeName: "Leave",
        startDate: input.startDate,
        endDate: input.endDate,
        totalDays: 1,
        reason: input.reason || "",
        status: "pending" as const,
        approvers: [],
      };

      // @ts-ignore
      store.addLeaveRequest(newRequest);

      return {
        ...input,
        id: `lr-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as LeaveRequest;
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: leaveQueryKeys.requests.all(),
      });
      // @ts-ignore
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useApproveLeaveRequest(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      useStore.getState().approveLeaveRequest(id, "P-001", "Approved");
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: leaveQueryKeys.requests.all(),
      });
      queryClient.invalidateQueries({
        queryKey: leaveQueryKeys.balance.all(),
      });
      // @ts-ignore
      options?.onSuccess?.(data, variables, context);
    },
  });
}

export function useRejectLeaveRequest(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      useStore.getState().rejectLeaveRequest(id, "P-001", "Rejected");
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: leaveQueryKeys.requests.all(),
      });
      // @ts-ignore
      options?.onSuccess?.(data, variables, context);
    },
  });
}
