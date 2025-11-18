import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useProductStore } from "./productStore";
// Category interface matching database schema
export interface Category {
  id: number;
  parentId?: Category;
  name: string;
  slug: string;
  isActive: boolean;

  // Optional populated fields
  parent?: Category;
  children?: Category[];
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // API Actions
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: {
    name: string;
    parentId?: number;
  }) => Promise<void>;
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  getCategory: (id: number) => Category | undefined;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,

      // API Actions
      fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/categories");
          const categories = response.data?.data || response.data || [];

          set({ categories, isLoading: false });
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

      createCategory: async (categoryData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.post(
            "/categories",
            categoryData
          );
          const newCategory = response.data?.data || response.data;

          set((state) => ({
            categories: [newCategory, ...state.categories],
            isLoading: false,
          }));

          toast.success("Thêm danh mục thành công");
          console.log("✅ Category created:", newCategory);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi thêm danh mục";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Create category error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        }
      },

      updateCategory: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.put(
            `/categories/${id}`,
            updates
          );
          const updatedCategory = response.data?.data || response.data;

          set((state) => ({
            categories: state.categories.map((category) =>
              category.id === id
                ? { ...category, ...updatedCategory }
                : category
            ),
            isLoading: false,
          }));

          toast.success("Cập nhật danh mục thành công");
          console.log("✅ Category updated:", updatedCategory);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi cập nhật danh mục";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Update category error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteCategory: async (id) => {
        const productsInCategory = useProductStore
          .getState()
          .products.filter((product) => product.category?.id === id);

        if (productsInCategory.length > 0) {
          toast.error("Không thể xóa danh mục đang chứa sản phẩm");
          return;
        }

        // ✅ Check có subcategories không
        const hasSubcategories = get().categories.some(
          (cat) => cat.parentId?.id === id
        );

        if (hasSubcategories) {
          toast.error("Không thể xóa danh mục đang có danh mục con");
          return;
        }
        set({ isLoading: true, error: null });
        try {
          await privateClient.delete(`/categories/${id}`);

          set((state) => ({
            categories: state.categories.filter(
              (category) => category.id !== id
            ),
            isLoading: false,
          }));

          toast.success("Xóa danh mục thành công");
          console.log("✅ Category deleted:", id);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message || "Lỗi khi xóa danh mục";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Delete category error:", errorMessage);
          toast.error(errorMessage);
          throw error;
        }
      },

      // Local Actions
      getCategory: (id) => {
        const categories = get().categories || [];
        return categories.find((category) => category.id === id);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "category-storage",
      partialize: (state) => ({
        categories: state.categories,
      }),
    }
  )
);
