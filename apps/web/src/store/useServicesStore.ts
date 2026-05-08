import { create } from "zustand";
import { api } from "../lib/api";
import type { ApiResponse, Service } from "../types";

interface UseServicesState {
  services: Service[] | null;
  loading: boolean;
  getServices: () => Promise<void>;
}

/**
 * Store global de servicios activos.
 * Reemplaza al hook duplicado que vivía en hooks/useService.ts (que rompía
 * cuando el endpoint devolvía null porque hacía response.data sin chequeo).
 */
export const useServicesStore = create<UseServicesState>((set) => ({
  services: null,
  loading: false,
  getServices: async () => {
    set({ loading: true });
    const res = await api<ApiResponse<Service[]>>("service");
    set({
      services: res?.data ?? null,
      loading: false,
    });
  },
}));
