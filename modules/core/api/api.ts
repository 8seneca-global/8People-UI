import { api } from "@/lib/axios";

export const coreApi = {
  system: {
    routes: async (): Promise<string[]> => {
      const { data } = await api.get<string[]>("/settings/system/routes");
      return data;
    },
  },
};
