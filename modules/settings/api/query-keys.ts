export const settingsQueryKeys = {
  all: ["settings"] as const,
  roles: {
    all: () => [...settingsQueryKeys.all, "roles"] as const,
    lists: () => [...settingsQueryKeys.roles.all(), "list"] as const,
    details: () => [...settingsQueryKeys.roles.all(), "detail"] as const,
    detail: (id: string) => [...settingsQueryKeys.roles.details(), id] as const,
  },
  system: {
    all: () => [...settingsQueryKeys.all, "system"] as const,
    routes: () => [...settingsQueryKeys.system.all(), "routes"] as const,
  },
  modules: {
    all: () => ["modules"] as const,
    list: () => [...settingsQueryKeys.modules.all(), "list"] as const,
  },
};


