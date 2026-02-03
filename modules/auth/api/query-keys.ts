export const authQueryKeys = {
  all: ["auth"] as const,
  login: () => [...authQueryKeys.all, "login"] as const,
  session: () => [...authQueryKeys.all, "session"] as const,
  myRoles: () => [...authQueryKeys.all, "my-roles"] as const,
};
