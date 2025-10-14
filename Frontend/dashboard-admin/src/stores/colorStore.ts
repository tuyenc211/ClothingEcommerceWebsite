import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
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
  createColor: (color: Omit<Color, "id">) => Promise<void>;
  updateColor: (id: number, updates: Partial<Color>) => Promise<void>;
  deleteColor: (id: number) => Promise<void>;

  // Local Actions
  setColors: (colors: Color[]) => void;
  getColor: (id: number) => Color | undefined;
  clearError: () => void;
}

// Fashion colors for clothing store

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
          toast.error(errorMessage);
          throw error;
        }
      },

      createColor: async (colorData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.post("/colors", colorData);
          const newColor = response.data?.data || response.data;

          set((state) => ({
            colors: [newColor, ...state.colors],
            isLoading: false,
          }));

          toast.success("Thêm màu thành công");
          console.log("✅ Color created:", newColor);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi thêm màu";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Create color error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        }
      },

      updateColor: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.put(`/colors/${id}`, updates);
          const updatedColor = response.data?.data || response.data;

          set((state) => ({
            colors: state.colors.map((color) =>
              color.id === id ? { ...color, ...updatedColor } : color
            ),
            isLoading: false,
          }));

          toast.success("Cập nhật màu thành công");
          console.log("✅ Color updated:", updatedColor);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi cập nhật màu";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Update color error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteColor: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await privateClient.delete(`/colors/${id}`);

          set((state) => ({
            colors: state.colors.filter((color) => color.id !== id),
            isLoading: false,
          }));

          toast.success("Xóa màu thành công");
          console.log("✅ Color deleted:", id);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi xóa màu";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Delete color error:", errorMessage);
          toast.error(errorMessage);
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
