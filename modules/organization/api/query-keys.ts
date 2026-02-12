export const organizationQueryKeys = {
  all: ["organization"] as const,
  orgUnits: {
    all: () => [...organizationQueryKeys.all, "org-units"] as const,
    list: () => [...organizationQueryKeys.orgUnits.all(), "list"] as const,
    details: () => [...organizationQueryKeys.orgUnits.all(), "detail"] as const,
    byId: (id: string) =>
      [...organizationQueryKeys.orgUnits.details(), id] as const,
  },
  jobs: {
    all: () => [...organizationQueryKeys.all, "jobs"] as const,
    list: () => [...organizationQueryKeys.jobs.all(), "list"] as const,
    details: () => [...organizationQueryKeys.jobs.all(), "detail"] as const,
    detail: (id: string) =>
      [...organizationQueryKeys.jobs.details(), id] as const,
  },
  positions: {
    all: () => [...organizationQueryKeys.all, "positions"] as const,
    list: () => [...organizationQueryKeys.positions.all(), "list"] as const,
    details: () =>
      [...organizationQueryKeys.positions.all(), "detail"] as const,
    detail: (id: string) =>
      [...organizationQueryKeys.positions.details(), id] as const,
  },
  tree: {
    all: () => [...organizationQueryKeys.all, "tree"] as const,
  },
};
