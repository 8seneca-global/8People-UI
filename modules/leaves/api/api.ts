import { api } from "@/lib/axios";
import { LeaveBalance, LeaveRequest, LeaveRequestInput, LeaveType, PaginatedResponse } from "./types";

export const LeaveApi = {
    leaveTypes: {
        list: async (): Promise<LeaveType[]> => {
            const { data } = await api.get<LeaveType[]>("/leave-types");
            return data;
        },
    },
    requests: {
        list: async (): Promise<PaginatedResponse<LeaveRequest>> => {
            const { data } = await api.get<PaginatedResponse<LeaveRequest>>("/leave/requests");
            return data;
        },
        create: async (input: LeaveRequestInput): Promise<LeaveRequest> => {
            const { data } = await api.post<LeaveRequest>("/leave/requests", input);
            return data;
        },
        approve: async (id: string): Promise<void> => {
            await api.post(`/leave/${id}/approve`);
        },
        reject: async (id: string): Promise<void> => {
            await api.post(`/leave/${id}/reject`);
        },
    },
    balance: {
        list: async (year: number): Promise<PaginatedResponse<LeaveBalance>> => {
            const { data } = await api.get<PaginatedResponse<LeaveBalance>>(`/leave/balances?year=${year}`);
            return data;
        },
        update: async(): Promise<void> => {
            await api.put("/leave/balance")
        }
    },
}