export const recruitmentQueryKeys = {
  all: ["recruitment"] as const,
  candidates: {
    all: () => [...recruitmentQueryKeys.all, "candidates"] as const,
    list: (filters?: any) =>
      [...recruitmentQueryKeys.candidates.all(), "list", { filters }] as const,
    details: () =>
      [...recruitmentQueryKeys.candidates.all(), "detail"] as const,
    detail: (id: string) =>
      [...recruitmentQueryKeys.candidates.details(), id] as const,
  },
  interviews: {
    all: () => [...recruitmentQueryKeys.all, "interviews"] as const,
    list: (filters?: any) =>
      [...recruitmentQueryKeys.interviews.all(), "list", { filters }] as const,
    details: () =>
      [...recruitmentQueryKeys.interviews.all(), "detail"] as const,
    detail: (id: string) =>
      [...recruitmentQueryKeys.interviews.details(), id] as const,
  },
  jobs: {
    all: () => [...recruitmentQueryKeys.all, "jobs"] as const,
    list: (filters?: any) =>
      [...recruitmentQueryKeys.jobs.all(), "list", { filters }] as const,
    details: () => [...recruitmentQueryKeys.jobs.all(), "detail"] as const,
    detail: (id: string) =>
      [...recruitmentQueryKeys.jobs.details(), id] as const,
  },
};
