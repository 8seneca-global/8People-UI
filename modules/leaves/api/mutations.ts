import { useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { LeaveApi } from "./api";
import { leaveQueryKeys } from "./query-keys";
import { LeaveBalance, LeaveRequest, LeaveRequestInput, LeaveType, PaginatedResponse } from "./types";


export function useLeaveTypes(
    options?: Omit<UseQueryOptions<LeaveType[], Error>, "queryFn">
) {
    return useQuery({
        queryKey: leaveQueryKeys.leaveTypes.all(),
        queryFn: LeaveApi.leaveTypes.list,
        ...options,
    });
}

export function useLeaveBalance(
    year: number,
    options?: Omit<
        UseQueryOptions<PaginatedResponse<LeaveBalance>, Error, LeaveBalance[]>,
        "queryFn"
    >
) {
    return useQuery({
        queryKey: leaveQueryKeys.balance.all(),
        queryFn: () => LeaveApi.balance.list(year),
        select: (res) => res.data,
        ...options,
    });
}


export function useLeaveRequests(
    options?: Omit<
        UseQueryOptions<PaginatedResponse<LeaveRequest>, Error, LeaveRequest[]>,
        "queryFn"
    >
) {
    return useQuery({
        queryKey: leaveQueryKeys.requests.all(),
        queryFn: LeaveApi.requests.list,
        select: (res) => res.data,
        ...options,
    });
}


export function useCreateLeaveRequest(
    options?: Omit<UseMutationOptions<LeaveRequest, Error, LeaveRequestInput>, "mutationFn">
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: LeaveApi.requests.create,
        ...options,
        onSuccess: (data, variables, context, mutation) => {
            queryClient.invalidateQueries({
                queryKey: leaveQueryKeys.requests.all(),
            });
            options?.onSuccess?.(data, variables, context, mutation);
        },
    });
}

export function useApproveLeaveRequest(
    options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: LeaveApi.requests.approve,
        ...options,
        onSuccess: (data, variables, context, mutation) => {
            queryClient.invalidateQueries({
                queryKey: leaveQueryKeys.requests.all(),
            });
            queryClient.invalidateQueries({
                queryKey: leaveQueryKeys.balance.all()
            })
            options?.onSuccess?.(data, variables, context, mutation);
        },
    });
}

export function useRejectLeaveRequest(
    options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">
) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: LeaveApi.requests.reject,
        ...options,
        onSuccess: (data, variables, context, mutation) => {
            queryClient.invalidateQueries({
                queryKey: leaveQueryKeys.requests.all(),
            });
            options?.onSuccess?.(data, variables, context, mutation);
        },
    });
}




