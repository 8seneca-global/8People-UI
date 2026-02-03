export const leaveQueryKeys = {
  all: ["leave"] as const,
  requests: {
    all: () => [...leaveQueryKeys.all, "requests"] as const,
    list: () => [...leaveQueryKeys.requests.all(), "list"] as const,
    detail: (id: string) => [...leaveQueryKeys.requests.all(), id] as const
  },
  leaveTypes: {
    all: () => [...leaveQueryKeys.all, "leave-types"] as const,
    list: () => [...leaveQueryKeys.leaveTypes.all(), "list"] as const
  },
  balance: {
    all: () => [...leaveQueryKeys.all, "balance"] as const,
    list: () => [...leaveQueryKeys.balance.all(), "list"] as const
  },
};
