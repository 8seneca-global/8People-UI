export const attendanceQueryKeys = {
  all: ["attendance"] as const,
  shifts: {
    all: () => [...attendanceQueryKeys.all, "shifts"] as const,
    list: (filters?: any) =>
      [...attendanceQueryKeys.shifts.all(), { filters }] as const,
  },
  records: {
    all: () => [...attendanceQueryKeys.all, "records"] as const,
    list: (filters?: any) =>
      [...attendanceQueryKeys.records.all(), { filters }] as const,
    details: () => [...attendanceQueryKeys.records.all(), "detail"] as const,
    detail: (id: string) =>
      [...attendanceQueryKeys.records.details(), id] as const,
  },
  reports: () => [...attendanceQueryKeys.all, "reports"] as const,
};
