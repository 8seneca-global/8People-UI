import { api } from "@/lib/axios";
import { LoginResponse, LoginVariables } from "./types";

export const authApi = {
  login: async ({ idToken }: LoginVariables): Promise<LoginResponse> => {
    const { data } = await api.post("/auth/google", { idToken });
    return data;
  },
};
