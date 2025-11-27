import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";

export interface Color {
  id: number;
  name: string;
  code: string;
}

interface ColorState {
  colors: Color[];
  isLoading: boolean;
  error: string | null;

  // API Actions
  fetchColors: () => Promise<void>;

  // Local Actions
  setColors: (colors: Color[]) => void;
  getColor: (id: number) => Color | undefined;
  clearError: () => void;
}
export const useColorStore = create<ColorState>()(
  persist(
    (set, get) => ({
      colors: [],
      isLoading: false,
      error: null,

      // API Actions
      fetchColors: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/colors");
          const colors = response.data?.data || response.data || [];

          set({ colors, isLoading: false });
          console.log("✅ Fetched colors:", colors);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi tải danh sách màu";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch colors error:", errorMessage);
          // Client-website không cần toast error vì có thể là chức năng không quan trọng
          throw error;
        }
      },

      // Local Actions
      setColors: (colors) => set({ colors }),

      getColor: (id) => {
        return get().colors.find((color) => color.id === id);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "color-storage",
      partialize: (state) => ({
        colors: state.colors,
      }),
    }
  )
);
