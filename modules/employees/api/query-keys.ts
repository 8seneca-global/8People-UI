export const employeesQueryKeys = {
  all: ["employees"] as const,
  lists: () => [...employeesQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...employeesQueryKeys.lists(), { filters }] as const,
  details: () => [...employeesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...employeesQueryKeys.details(), id] as const,
  address: (id: string) =>
    [...employeesQueryKeys.detail(id), "address"] as const,
  taxInfo: (id: string) =>
    [...employeesQueryKeys.detail(id), "tax-info"] as const,
  bankInfo: (id: string) =>
    [...employeesQueryKeys.detail(id), "bank-info"] as const,
  emergencyContacts: (id: string) =>
    [...employeesQueryKeys.detail(id), "emergency-contacts"] as const,
  education: (id: string) =>
    [...employeesQueryKeys.detail(id), "education"] as const,
  contracts: (id: string) =>
    [...employeesQueryKeys.detail(id), "contracts"] as const,
};
