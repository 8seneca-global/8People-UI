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
      return leaveTypes;
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
        data: balances,
        total: balances.length,
        page: 1,
        pageSize: balances.length,
      };
    },
    select: (res) => res.data,
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
        data: requests,
        total: requests.length,
        page: 1,
        pageSize: requests.length,
      };
    },
    select: (res) => res.data,
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
      const newRequest: Omit<LeaveRequest, "id" | "createdAt" | "updatedAt"> = {
        employeeId: input.employeeId,
        employeeName: input.employeeName || "Unknown",
        leaveTypeId: input.leaveTypeId,
        leaveTypeName: input.leaveTypeName || "Leave",
        startDate: input.startDate,
        endDate: input.endDate,
        totalDays: input.totalDays,
        reason: input.reason,
        status: "pending",
        approvers: input.approvers || [],
      };

      useStore.getState().addLeaveRequest(newRequest);

      return {
        ...newRequest,
        id: `lr-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as LeaveRequest;
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: leaveQueryKeys.requests.all(),
      });
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
      // For mock mode, we need an approver ID - use a default admin ID
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
      // For mock mode, we need an approver ID - use a default admin ID
      useStore.getState().rejectLeaveRequest(id, "P-001", "Rejected");
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: leaveQueryKeys.requests.all(),
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
}
