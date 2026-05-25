import toast from "react-hot-toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "../lib/api";
import type { User } from "../types";

/**
 * Storage seguro para prerender/SSR: durante el build no existe `window`,
 * así que devolvemos un storage no-op en lugar de tocar `localStorage`.
 */
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  setLoading: (status: boolean) => void;
  setUser: (data: User) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create(
  persist<AuthStore>(
    (set) => ({
      user: null,
      isLoading: false,
      setLoading: (status) => {
        set(() => ({
          isLoading: status,
        }));
      },
      setUser: async (user) => {
        if (!user) {
          toast.error("No hay datos");
          return;
        }

        set(() => ({
          user,
        }));
      },
      logout: () => {
        api("auth/logout", { method: "POST" });
        set(() => ({
          user: null,
        }));
      },
    }),
    {
      name: "auth_store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
    },
  ),
);
