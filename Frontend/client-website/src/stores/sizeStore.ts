import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";

export interface Size {
  id: number;
  code: string;
  name: string;
  sortOrder: number;
}

interface SizeState {
  sizes: Size[];
  isLoading: boolean;
  error: string | null;
  fetchSizes: () => Promise<void>;
  clearError: () => void;
}

export const useSizeStore = create<SizeState>()(
  persist(
    (set, get) => ({
      sizes: [],
      isLoading: false,
      error: null,

      // API Actions
      fetchSizes: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/sizes");
          const sizes = response.data?.data || response.data || [];

          set({
            sizes: sizes.sort((a: Size, b: Size) => a.sortOrder - b.sortOrder),
            isLoading: false,
          });

          console.log("✅ Sizes fetched:", sizes);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi tải danh sách size";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch sizes error:", errorMessage);
          // Client-website không cần toast error vì có thể là chức năng không quan trọng
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "size-storage",
      partialize: (state) => ({
        sizes: state.sizes,
      }),
    }
  )
);
