import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  categoryName?: string;
  author: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  tags: string[];
  images: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface BlogState {
  blogs: Blog[];
  categories: BlogCategory[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: string;

  // Actions
  setBlogs: (blogs: Blog[]) => void;
  setCategories: (categories: BlogCategory[]) => void;
  addBlog: (
    blog: Omit<Blog, "id" | "createdAt" | "updatedAt" | "views">
  ) => void;
  updateBlog: (id: string, updates: Partial<Blog>) => void;
  deleteBlog: (id: string) => void;
  getBlog: (id: string) => Blog | undefined;

  addCategory: (
    category: Omit<BlogCategory, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCategory: (id: string, updates: Partial<BlogCategory>) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => BlogCategory | undefined;

  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedStatus: (status: string) => void;
  clearError: () => void;

  // Computed
  filteredBlogs: () => Blog[];
}

// Mock data for blog categories
const mockCategories: BlogCategory[] = [
  {
    id: "1",
    name: "Thời trang",
    description: "Xu hướng thời trang mới nhất",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Lifestyle",
    description: "Phong cách sống hiện đại",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Tips & Tricks",
    description: "Mẹo hay cho cuộc sống",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock data for blogs
const mockBlogs: Blog[] = [
  {
    id: "1",
    title: "Xu hướng thời trang Xuân Hè 2024",
    description:
      "Khám phá những xu hướng thời trang hot nhất trong mùa Xuân Hè 2024",
    content: "Nội dung blog chi tiết về xu hướng thời trang...",
    category: "1",
    categoryName: "Thời trang",
    author: "Admin",
    status: "published",
    featured: true,
    tags: ["thời trang", "xuân hè", "2024"],
    images: [],
    views: 1250,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Cách phối đồ cho mùa thu",
    description: "Hướng dẫn phối đồ thông minh cho những ngày thu se lạnh",
    content: "Nội dung hướng dẫn chi tiết...",
    category: "1",
    categoryName: "Thời trang",
    author: "Admin",
    status: "published",
    featured: false,
    tags: ["phối đồ", "mùa thu", "style"],
    images: [],
    views: 890,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Phong cách minimalist",
    description: "Làm thế nào để tạo nên phong cách tối giản trong tủ đồ",
    content: "Nội dung về phong cách minimalist...",
    category: "2",
    categoryName: "Lifestyle",
    author: "Admin",
    status: "draft",
    featured: false,
    tags: ["minimalist", "phong cách", "đơn giản"],
    images: [],
    views: 0,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      blogs: mockBlogs,
      categories: mockCategories,
      isLoading: false,
      error: null,
      searchTerm: "",
      selectedCategory: "",
      selectedStatus: "",

      setBlogs: (blogs) => set({ blogs }),
      setCategories: (categories) => set({ categories }),

      addBlog: (blogData) => {
        const newBlog: Blog = {
          ...blogData,
          id: Date.now().toString(),
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt:
            blogData.status === "published"
              ? new Date().toISOString()
              : undefined,
        };

        // Add category name
        const category = get().categories.find(
          (cat) => cat.id === newBlog.category
        );
        if (category) {
          newBlog.categoryName = category.name;
        }

        set((state) => ({
          blogs: [newBlog, ...state.blogs],
          error: null,
        }));
      },

      updateBlog: (id, updates) => {
        set((state) => {
          const updatedBlogs = state.blogs.map((blog) => {
            if (blog.id === id) {
              const updatedBlog = {
                ...blog,
                ...updates,
                updatedAt: new Date().toISOString(),
              };

              // Update category name if category changed
              if (updates.category) {
                const category = state.categories.find(
                  (cat) => cat.id === updates.category
                );
                if (category) {
                  updatedBlog.categoryName = category.name;
                }
              }

              // Set published date if status changed to published
              if (
                updates.status === "published" &&
                blog.status !== "published"
              ) {
                updatedBlog.publishedAt = new Date().toISOString();
              }

              return updatedBlog;
            }
            return blog;
          });

          return { blogs: updatedBlogs, error: null };
        });
      },

      deleteBlog: (id) => {
        set((state) => ({
          blogs: state.blogs.filter((blog) => blog.id !== id),
          error: null,
        }));
      },

      getBlog: (id) => {
        return get().blogs.find((blog) => blog.id === id);
      },

      addCategory: (categoryData) => {
        const newCategory: BlogCategory = {
          ...categoryData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          categories: [newCategory, ...state.categories],
          error: null,
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id
              ? { ...category, ...updates, updatedAt: new Date().toISOString() }
              : category
          ),
          error: null,
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          error: null,
        }));
      },

      getCategory: (id) => {
        return get().categories.find((category) => category.id === id);
      },

      setSearchTerm: (term) => set({ searchTerm: term }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSelectedStatus: (status) => set({ selectedStatus: status }),
      clearError: () => set({ error: null }),

      filteredBlogs: () => {
        const { blogs, searchTerm, selectedCategory, selectedStatus } = get();
        let filtered = blogs;

        // Filter by search term
        if (searchTerm.trim()) {
          filtered = filtered.filter(
            (blog) =>
              blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              blog.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              blog.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
              )
          );
        }

        // Filter by category
        if (selectedCategory) {
          filtered = filtered.filter(
            (blog) => blog.category === selectedCategory
          );
        }

        // Filter by status
        if (selectedStatus) {
          filtered = filtered.filter((blog) => blog.status === selectedStatus);
        }

        return filtered;
      },
    }),
    {
      name: "blog-storage",
      partialize: (state) => ({
        blogs: state.blogs,
        categories: state.categories,
        searchTerm: state.searchTerm,
        selectedCategory: state.selectedCategory,
        selectedStatus: state.selectedStatus,
      }),
    }
  )
);
