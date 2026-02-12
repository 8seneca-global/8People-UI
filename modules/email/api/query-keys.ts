export const emailQueryKeys = {
  all: ["email"] as const,
  config: () => [...emailQueryKeys.all, "config"] as const,
};
