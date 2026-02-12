import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { authApi } from "./api";
import { LoginResponse, LoginVariables } from "./types";

export const useLoginMutation = (
  options?: Omit<
    UseMutationOptions<LoginResponse, Error, LoginVariables, unknown>,
    "mutationFn"
  >
) => {
  return useMutation({
    mutationFn: authApi.login,
    ...options,
  });
};
