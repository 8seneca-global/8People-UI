export const documentsQueryKeys = {
  all: ["documents"] as const,
  lists: () => [...documentsQueryKeys.all, "list"] as const,
  details: () => [...documentsQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...documentsQueryKeys.details(), id] as const,
};
