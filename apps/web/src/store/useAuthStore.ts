import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "admin" | "client";
  phone: string;
  isActive: boolean;
  createdAt: Date;
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
      logout: () =>
        set(() => ({
          user: null,
        })),
    }),
    {
      name: "auth_store",
    },
  ),
);
