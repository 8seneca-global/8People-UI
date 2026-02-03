export const workflowQueryKeys = {
  all: ["workflow"] as const,
  configs: {
    all: () => [...workflowQueryKeys.all, "configs"] as const,
    list: () => [...workflowQueryKeys.configs.all(), "list"] as const,
    details: () => [...workflowQueryKeys.configs.all(), "detail"] as const,
    detail: (id: string) =>
      [...workflowQueryKeys.configs.details(), id] as const,
  },
};
