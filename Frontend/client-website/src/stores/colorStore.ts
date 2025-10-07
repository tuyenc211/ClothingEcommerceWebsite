import { mockColors } from "@/data/productv2";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Color {
  id: number;
  name: string;
  code: string;
}

interface ColorState {
  colors: Color[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setColors: (colors: Color[]) => void;
  addColor: (color: Omit<Color, "id">) => void;
  updateColor: (id: number, updates: Partial<Color>) => void;
  deleteColor: (id: number) => void;
  getColor: (id: number) => Color | undefined;
  clearError: () => void;

  // Computed
}

// Fashion colors for clothing store

export const useColorStore = create<ColorState>()(
  persist(
    (set, get) => ({
      colors: mockColors,
      isLoading: false,
      error: null,

      setColors: (colors) => set({ colors }),

      addColor: (colorData) => {
        const newColor: Color = {
          ...colorData,
          id: Date.now(),
        };

        set((state) => ({
          colors: [newColor, ...state.colors],
          error: null,
        }));
      },

      updateColor: (id, updates) => {
        set((state) => ({
          colors: state.colors.map((color) =>
            color.id === id ? { ...color, ...updates } : color
          ),
          error: null,
        }));
      },

      deleteColor: (id) => {
        set((state) => ({
          colors: state.colors.filter((color) => color.id !== id),
          error: null,
        }));
      },

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
