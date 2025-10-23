import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
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
  isFetching: boolean;
  error: string | null;
  fetchSizes: () => Promise<void>;
  addSize: (size: Omit<Size, "id">) => Promise<void>;
  updateSize: (id: number, size: Partial<Size>) => Promise<void>;
  deleteSize: (id: number) => Promise<void>;
  getSize: (id: number) => Size | undefined;
  getSizes: () => Size[];
  clearError: () => void;
}

export const useSizeStore = create<SizeState>()(
  persist(
    (set, get) => ({
      sizes: [],
      isLoading: false,
      isFetching: false,
      error: null,

      fetchSizes: async () => {
        // Prevent multiple simultaneous fetches
        if (get().isFetching) return;

        set({ isFetching: true, error: null });
        try {
          const response = await privateClient.get("/sizes");
          const sizes = response.data.data || response.data;

          set({
            sizes: sizes.sort((a: Size, b: Size) => a.sortOrder - b.sortOrder),
            error: null,
          });

          console.log("✅ Sizes fetched:", sizes);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi tải danh sách màu";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch colors error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isFetching: false });
        }
      },

      addSize: async (size) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.post("/sizes", size);
          const newSize = response.data.data || response.data;

          set((state) => ({
            sizes: [newSize, ...state.sizes].sort(
              (a, b) => a.sortOrder - b.sortOrder
            ),
            error: null,
          }));

          toast.success("Thêm size thành công");
          console.log("✅ Size added:", newSize);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Không thể thêm size";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateSize: async (id, size) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.put(`/sizes/${id}`, size);
          const updatedSize = response.data.data || response.data;

          set((state) => ({
            sizes: state.sizes
              .map((s) => (s.id === id ? updatedSize : s))
              .sort((a, b) => a.sortOrder - b.sortOrder),
            error: null,
          }));

          toast.success("Cập nhật size thành công");
          console.log("✅ Size updated:", updatedSize);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Không thể cập nhật size";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteSize: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await privateClient.delete(`/sizes/${id}`);

          set((state) => ({
            sizes: state.sizes.filter((s) => s.id !== id),
            error: null,
          }));

          toast.success("Xóa size thành công");
          console.log("✅ Size deleted:", id);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Không thể xóa size";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      getSize: (id) => {
        return get().sizes.find((s) => s.id === id);
      },

      getSizes: () => {
        return get().sizes;
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
