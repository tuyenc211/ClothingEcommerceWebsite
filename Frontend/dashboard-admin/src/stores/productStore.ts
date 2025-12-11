import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category } from "./categoryStore";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

// Product image interface để match với product_images table
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  position: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string; // VARCHAR(120) NOT NULL UNIQUE
  size_id?: number; // BIGINT references sizes(id)
  color_id?: number; // BIGINT references colors(id)
  price: number; // DECIMAL(12,2) NOT NULL
  inventory?: Inventory;
}

// Inventory interface để match với inventories table
export interface Inventory {
  id: number;
  variant_id: number;
  quantity: number;
}

// Product interface để match với products table
export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  category: Category;
  isPublished: boolean;

  // Relationships (populated from joins)
  images?: ProductImage[];
  variants?: ProductVariant[];
  colors?: Array<{ id: number; name: string; code: string }>;
  sizes?: Array<{ id: number; name: string; code: string; sortOrder: number }>;
  // Computed fields
  totalQuantity?: number;
  // Legacy fields for compatibility
}
interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  // Product CRUD actions
  addProductWithVariants: (
    productData: Omit<Product, "id" | "variants" | "images" | "slug">,
    selectedSizes: number[],
    selectedColors: number[],
    imageFiles: File[]
  ) => Promise<void>;
  updateProduct: (
    id: number,
    productData: Partial<Product>,
    selectedSizes: number[],
    selectedColors: number[],
    imageFiles?: File[],
    keepImageUrls?: string[]
  ) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProduct: (id: number) => Product | undefined;
  getVariantById: (variantId: number) => ProductVariant | undefined;
}
export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,

      // Product CRUD actions
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await privateClient.get("/products");
          const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
          console.log(data);
          set({ products: data, isLoading: false });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const message =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải danh sách sản phẩm";
          set({ error: message, isLoading: false });
          toast.error(message);
          throw error;
        }
      },
      addProductWithVariants: async (
        productData,
        selectedSizes,
        selectedColors,
        imageFiles
      ) => {
        set({ isLoading: true, error: null });
        try {
          // Step 1: Create product first without images
          const payload = {
            sku: productData.sku || `PRD-${Date.now()}`,
            name: productData.name,
            description: productData.description || "",
            basePrice: productData.basePrice,
            categoryId: productData.category?.id || productData.category,
            isPublished: productData.isPublished ?? true,
            sizeIds: selectedSizes,
            colorIds: selectedColors,
          };

          const res = await privateClient.post("/products", payload);
          const created = res.data?.data || res.data;
          const productId = created.id;

          // Step 2: Upload images with productId in URL if provided
          if (imageFiles && imageFiles.length > 0 && productId) {
            const formData = new FormData();
            imageFiles.forEach((file) => {
              formData.append("files", file);
            });

            await privateClient.post(
              `/products/${productId}/upload-image`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            // Fetch updated product with images
            const updatedRes = await privateClient.get(
              `/products/${productId}`
            );
            const updatedProduct = updatedRes.data?.data || updatedRes.data;

            set((state) => ({
              products: [...state.products, updatedProduct],
              isLoading: false,
            }));
          } else {
            set((state) => ({
              products: [...state.products, created],
              isLoading: false,
            }));
          }

          toast.success("Thêm sản phẩm thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const message =
            axiosError?.response?.data?.message || "Lỗi khi thêm sản phẩm";
          set({ error: message, isLoading: false });
          toast.error(message);
          throw error;
        }
      },

      updateProduct: async (
        id,
        productData,
        selectedSizes,
        selectedColors,
        imageFiles,
        keepImageUrls = [] // ✅ THÊM PARAM
      ) => {
        set({ isLoading: true, error: null });
        try {
          // Step 1: Update product information first
          const payload = {
            sku: productData.sku,
            name: productData.name,
            description: productData.description || "",
            basePrice: productData.basePrice,
            categoryId: productData.category?.id || productData.category,
            isPublished: productData.isPublished ?? true,
            sizeIds: selectedSizes,
            colorIds: selectedColors,
            keepImageUrls: keepImageUrls, // ✅ THÊM DÒNG NÀY
          };

          await privateClient.put(`/products/${id}`, payload); // ✅ SỬA: xóa hardcode 26

          // Step 2: Upload new images with productId in URL if provided
          if (imageFiles && imageFiles.length > 0) {
            const formData = new FormData();
            imageFiles.forEach((file) => {
              formData.append("files", file);
            });

            await privateClient.post(`/products/${id}/upload-image`, formData, {
              headers: {
                "Content-Type": undefined,
              },
            });
          }

          await get().fetchProducts();

          toast.success("Cập nhật sản phẩm thành công");
          set({ isLoading: false });
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const message =
            axiosError?.response?.data?.message || "Lỗi khi cập nhật sản phẩm";
          set({ error: message, isLoading: false });
          toast.error(message);
          throw error;
        }
      },

      deleteProduct: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await privateClient.delete(`/products/${id}`);

          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
            isLoading: false,
          }));
          toast.success("Xóa sản phẩm thành công");
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const message =
            axiosError?.response?.data?.message || "Lỗi khi xóa sản phẩm";
          set({ error: message, isLoading: false });
          toast.error(message);
          throw error;
        }
      },

      getProduct: (id) => {
        const { products } = get();
        return products.find((product) => product.id === id);
      },


      // Variant management
      getVariantById: (variantId) => {
        const { products } = get();
        for (const product of products) {
          const variant = product.variants?.find((v) => v.id === variantId);
          if (variant) return variant;
        }
        return undefined;
      },
    }),
    {
      name: "product-storage",
    }
  )
);
