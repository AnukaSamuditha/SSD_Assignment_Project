import { CompanyType, UserType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  user: UserType | null;

  hasHydrated: boolean;
  setUser: (user: UserType) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
        }),
    }),
    {
      name: "user-store",
    }
  )
);
