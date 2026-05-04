import { checkArrayIsValid, type Service } from "@config/zod";
import { create } from "zustand";
import { api } from "../lib/api";

type UseService = {
  service: Service[] | null;
  getServices: () => Promise<void>;
};
export const useService = create<UseService>((set) => ({
  service: null,
  getServices: async () => {
    const response = await api("service", { method: "GET" });

    const data = checkArrayIsValid(response.data);

    set(() => ({
      service: data,
    }));
  },
}));
