import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
export interface Category {
  id: number;
  parentId?: Category;
  name: string;
  slug: string;
  isActive: boolean;
  children?: Category[];
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  getCategory: (id: number) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getChildCategories: (parentId: number) => Category[];
  // Utility methods
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,
      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/categories");
          const categories = response.data?.data || response.data || [];

          set({ categories: categories, isLoading: false });
          console.log("✅ Categories fetched:", categories);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải danh sách danh mục";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch categories error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        }
      },

      getCategory: (id) => {
        const { categories } = get();
        return categories.find((category) => category.id === id);
      },

      getCategoryBySlug: (slug) => {
        const { categories } = get();
        return categories.find((category) => category.slug === slug);
      },
      getChildCategories: (parentId) => {
        const { categories } = get();
        return categories.filter(
          (category) => category.parentId?.id === parentId
        );
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "category-storage",
    }
  )
);
