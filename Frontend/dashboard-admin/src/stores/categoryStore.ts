import { create } from "zustand";
import { persist } from "zustand/middleware";
import slugify from "slugify";
import { mockCategories } from "@/data/productv2";
// Category interface matching database schema
export interface Category {
  id: number;
  parentId?: number; // BIGINT references categories(id)
  name: string; // VARCHAR(150) NOT NULL
  slug: string; // VARCHAR(180) NOT NULL UNIQUE
  isActive: boolean; // TINYINT(1) NOT NULL DEFAULT 1

  // Optional populated fields
  parent?: Category; // Parent category if parentId exists
  children?: Category[]; // Child categories

  // Legacy fields for compatibility
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;

  // Basic CRUD actions
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  deleteCategory: (id: number) => void;
  toggleCategoryStatus: (id: number) => void;
  getCategory: (id: number) => Category | undefined;
  getCategoryBySlug: (slug: string) => Category | undefined;

  // Hierarchy management
  addChildCategory: (
    parentId: number,
    category: Omit<Category, "id" | "parentId">
  ) => void;
  getChildCategories: (parentId: number) => Category[];
  getRootCategories: () => Category[];
  getCategoryHierarchy: (id: number) => Category[];
  moveCategoryToParent: (categoryId: number, newParentId?: number) => void;

  // Search and filtering
  searchCategories: (query: string) => Category[];
  getActiveCategories: () => Category[];
  getCategoriesSorted: () => Category[];

  // Legacy methods for backward compatibility

  // Utility methods
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: mockCategories,
      isLoading: false,
      error: null,

      // Basic CRUD actions
      addCategory: (categoryData) => {
        const newCategory: Category = {
          ...categoryData,
          id: Date.now(),
          slug: categoryData.slug || slugify(categoryData.name),
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, categoryData) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id
              ? {
                  ...category,
                  ...categoryData,
                  // Auto-generate slug if name is updated but slug is not provided
                  slug:
                    categoryData.slug ||
                    (categoryData.name
                      ? slugify(categoryData.name)
                      : category.slug),
                }
              : category
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          // Remove category and all its children
          categories: state.categories.filter(
            (category) => category.id !== id && category.parentId !== id
          ),
        }));
      },

      toggleCategoryStatus: (id) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id
              ? { ...category, isActive: !category.isActive }
              : category
          ),
        }));
      },

      getCategory: (id) => {
        const { categories } = get();
        return categories.find((category) => category.id === id);
      },

      getCategoryBySlug: (slug) => {
        const { categories } = get();
        return categories.find((category) => category.slug === slug);
      },

      // Hierarchy management
      addChildCategory: (parentId, categoryData) => {
        const newCategory: Category = {
          ...categoryData,
          id: Date.now(),
          parentId,
          slug: categoryData.slug || slugify(categoryData.name),
        };

        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      getChildCategories: (parentId) => {
        const { categories } = get();
        return categories.filter((category) => category.parentId === parentId);
      },

      getRootCategories: () => {
        const { categories } = get();
        return categories.filter((category) => !category.parentId);
      },

      getCategoryHierarchy: (id) => {
        const { categories } = get();
        const hierarchy: Category[] = [];
        let currentCategory = categories.find((cat) => cat.id === id);

        while (currentCategory) {
          hierarchy.unshift(currentCategory);
          if (currentCategory.parentId) {
            currentCategory = categories.find(
              (cat) => cat.id === currentCategory!.parentId
            );
          } else {
            break;
          }
        }

        return hierarchy;
      },

      moveCategoryToParent: (categoryId, newParentId) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === categoryId
              ? { ...category, parentId: newParentId }
              : category
          ),
        }));
      },

      // Search and filtering
      searchCategories: (query) => {
        const { categories } = get();
        const lowercaseQuery = query.toLowerCase();
        return categories.filter(
          (category) =>
            category.name.toLowerCase().includes(lowercaseQuery) ||
            category.slug.toLowerCase().includes(lowercaseQuery)
        );
      },

      getActiveCategories: () => {
        const { categories } = get();
        return categories.filter((category) => category.isActive);
      },

      getCategoriesSorted: () => {
        const { categories } = get();
        return categories.sort((a, b) => {
          // First sort by parentId (root categories first)
          if (!a.parentId && b.parentId) return -1;
          if (a.parentId && !b.parentId) return 1;

          // Finally by name
          return a.name.localeCompare(b.name);
        });
      },

      // Legacy methods for backward compatibility
      // Utility methods
      setLoading: (loading) => {
        set({ isLoading: loading });
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
