import { create } from "zustand";
import { api } from "../lib/api";

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  key: number;
}

interface UseService {
  service: Service[] | null;
  loading: boolean;
  getServices: () => Promise<void>;
}

export const useService = create<UseService>((set) => ({
  service: null,
  loading: false,
  getServices: async () => {
    set({ loading: true });
    const res = await api<{ data: Service[] }>("service");
    set({
      service: res?.data ?? null,
      loading: false,
    });
  },
}));
