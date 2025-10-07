import { mockSizes } from "@/data/productv2";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Size {
  id: number;
  code: string; // VARCHAR(50) NOT NULL UNIQUE
  name: string; // VARCHAR(100) NOT NULL
  sortOrder: number; // INT NOT NULL DEFAULT 0
}

interface SizeState {
  sizes: Size[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addSize: (size: Omit<Size, "id">) => void;
  updateSize: (id: number, size: Partial<Size>) => void;
  deleteSize: (id: number) => void;
  getSize: (id: number) => Size | undefined;
  getSizes: () => Size[];
  clearError: () => void;
  // Computed
}

export const useSizeStore = create<SizeState>()(
  persist(
    (set, get) => ({
      sizes: mockSizes,
      isLoading: false,
      error: null,

      addSize: (size) => {
        const newSize: Size = {
          ...size,
          id: Date.now(),
        };

        set((state) => ({
          sizes: [newSize, ...state.sizes],
          error: null,
        }));
      },

      updateSize: (id, size) => {
        set((state) => ({
          sizes: state.sizes.map((s) => (s.id === id ? { ...s, ...size } : s)),
          error: null,
        }));
      },

      deleteSize: (id) => {
        set((state) => ({
          sizes: state.sizes.filter((s) => s.id !== id),
          error: null,
        }));
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
    }
  )
);
