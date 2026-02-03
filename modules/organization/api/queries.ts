import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "./api";
import { organizationQueryKeys } from "./query-keys";

export const useGetOrgTree = () => {
  return useQuery({
    queryKey: organizationQueryKeys.tree.all(),
    queryFn: organizationApi.getTree,
  });
};

export const useGetOrgDetail = (id: string) => {
  return useQuery({
    queryKey: organizationQueryKeys.orgUnits.byId(id),
    queryFn: () => organizationApi.getDetail(id),
    enabled: !!id,
  });
};

export const useUpdateOrgDetail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      organizationApi.updateDetail(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.orgUnits.byId(id),
      });
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.tree.all(),
      });
    },
  });
};

export const useCreateOrgUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => organizationApi.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.tree.all(),
      });
    },
  });
};

export const useGetOrgEmployees = () => {
  return useQuery({
    queryKey: ["orgEmployees"],
    queryFn: organizationApi.getEmployees,
  });
};

export const useDeleteOrgUnit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => organizationApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.tree.all(),
      });
      queryClient.invalidateQueries({
        queryKey: ["orgEmployees"],
      });
    },
  });
};
