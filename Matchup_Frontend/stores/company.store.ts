import { CompanyType } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CompanyState = {
  company: CompanyType | null;

  hasHydrated: boolean;
  setCompany: (company: CompanyType) => void;
  logout: () => void;
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: null,
      hasHydrated: false,

      setCompany: (company) => set({ company }),

      logout: () =>
        set({
          company: null,
        }),
    }),
    {
      name: "company-store",
    }
  )
);
