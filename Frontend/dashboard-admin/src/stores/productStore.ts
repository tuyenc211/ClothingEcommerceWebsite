import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category } from "./categoryStore";
import { Review } from "./reviewStore";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

// Product image interface để match với product_images table
export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string; // VARCHAR(500) NOT NULL
  position: number; // INT NOT NULL DEFAULT 0
}

// Product variant interface để match với product_variants table
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
  variant_id: number; // BIGINT NOT NULL UNIQUE
  quantity: number; // INT NOT NULL DEFAULT 0
}

// Product interface để match với products table
export interface Product {
  id: number;
  sku: string; // VARCHAR(100) NOT NULL UNIQUE
  name: string; // VARCHAR(255) NOT NULL
  slug: string; // VARCHAR(280) NOT NULL UNIQUE
  description?: string; // MEDIUMTEXT
  basePrice: number; // DECIMAL(12,2) NOT NULL DEFAULT 0
  category: Category; // BIGINT references categories(id)
  isPublished: boolean; // TINYINT(1) NOT NULL DEFAULT 1

  // Relationships (populated from joins)
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
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
  addProduct: (
    product: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => void;
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
  )=> Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProduct: (id: number) => Product | undefined;
  getProductBySku: (sku: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;

  // Product search and filtering
  searchProducts: (query: string) => Product[];
  filterProductsByCategory: (categoryId: number) => Product[];
  getPublishedProducts: () => Product[];

  // Variant management
  addProductVariant: (
    product_id: number,
    variant: Omit<ProductVariant, "id" | "productId">
  ) => void;
  updateProductVariant: (
    variantId: number,
    variant: Partial<ProductVariant>
  ) => void;
  deleteProductVariant: (variantId: number) => void;
  getProductVariants: (productId: number) => ProductVariant[];
  getVariantById: (variantId: number) => ProductVariant | undefined;

  // Image management
  addProductImage: (
    productId: number,
    image: Omit<ProductImage, "id" | "productId">
  ) => void;
  updateProductImage: (imageId: number, image: Partial<ProductImage>) => void;
  deleteProductImage: (imageId: number) => void;
  getProductImages: (productId: number) => ProductImage[];

  // Inventory management
  updateInventory: (variantId: number, quantity: number) => void;
  getInventoryByVariant: (variantId: number) => Inventory | undefined;
  getTotalProductStock: (productId: number) => number;
  getStockStatus: (productId: number) => StockStatus;
  getProductsByStockStatus: (status: StockStatus) => Product[];

  // Utility methods
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  recalculateAllTotalQuantities: () => void;
}
export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [], // Initialize with empty array, will be loaded from API
      isLoading: false,
      error: null,

      // Product CRUD actions
      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: Date.now(),
          sku: productData.sku || `PRD-${Date.now()}`,
          slug:
            productData.slug ||
            productData.name?.toLowerCase().replace(/\s+/g, "-") ||
            "",
        };

        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },
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
            const updatedRes = await privateClient.get(`/products/${productId}`);
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
        keepImageUrls = []  // ✅ THÊM PARAM
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
            keepImageUrls: keepImageUrls,  // ✅ THÊM DÒNG NÀY
          };
      
          await privateClient.put(`/products/${id}`, payload);  // ✅ SỬA: xóa hardcode 26
      
          // Step 2: Upload new images with productId in URL if provided
          if (imageFiles && imageFiles.length > 0) {
            const formData = new FormData();
            imageFiles.forEach((file) => {
              formData.append("files", file);
            });
      
            await privateClient.post(
              `/products/${id}/upload-image`,
              formData,
              {
                headers: {
                  "Content-Type": undefined,
                },
              }
            );
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

      getProductBySku: (sku) => {
        const { products } = get();
        return products.find((product) => product.sku === sku);
      },

      getProductBySlug: (slug) => {
        const { products } = get();
        return products.find((product) => product.slug === slug);
      },

      // Product search and filtering
      searchProducts: (query) => {
        const { products } = get();
        const lowercaseQuery = query.toLowerCase();
        return products.filter(
          (product) =>
            product.name?.toLowerCase().includes(lowercaseQuery) ||
            product.description?.toLowerCase().includes(lowercaseQuery) ||
            product.sku?.toLowerCase().includes(lowercaseQuery) ||
            product.variants?.some(
              (variant) => variant.color_id || variant.size_id
            )
        );
      },

      filterProductsByCategory: (categoryId) => {
        const { products } = get();
        return products.filter((product) => product.category.id === categoryId);
      },

      getPublishedProducts: () => {
        const { products } = get();
        return products.filter((product) => product.isPublished);
      },

      // Variant management
      addProductVariant: (product_id, variantData) => {
        const newVariant: ProductVariant = {
          ...variantData,
          id: Date.now(),
          product_id,
          sku: variantData.sku || `VAR-${Date.now()}`,
        };

        set((state) => ({
          products: state.products.map((product) =>
            product.id === product_id
              ? {
                  ...product,
                  variants: [...(product.variants || []), newVariant],
                }
              : product
          ),
        }));
      },

      updateProductVariant: (variantId, variantData) => {
        set((state) => ({
          products: state.products.map((product) => ({
            ...product,
            variants: product.variants?.map((variant) =>
              variant.id === variantId
                ? { ...variant, ...variantData }
                : variant
            ),
          })),
        }));
      },

      deleteProductVariant: (variantId) => {
        set((state) => ({
          products: state.products.map((product) => ({
            ...product,
            variants: product.variants?.filter(
              (variant) => variant.id !== variantId
            ),
          })),
        }));
      },

      getProductVariants: (productId) => {
        const { products } = get();
        const product = products.find((p) => p.id === productId);
        return product?.variants || [];
      },

      getVariantById: (variantId) => {
        const { products } = get();
        for (const product of products) {
          const variant = product.variants?.find((v) => v.id === variantId);
          if (variant) return variant;
        }
        return undefined;
      },

      // Image management
      addProductImage: (productId, imageData) => {
        const newImage: ProductImage = {
          ...imageData,
          id: Date.now(),
          product_id: productId,
        };

        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  images: [...(product.images || []), newImage],
                }
              : product
          ),
        }));
      },

      updateProductImage: (imageId, imageData) => {
        set((state) => ({
          products: state.products.map((product) => ({
            ...product,
            images: product.images?.map((image) =>
              image.id === imageId ? { ...image, ...imageData } : image
            ),
          })),
        }));
      },

      deleteProductImage: (imageId) => {
        set((state) => ({
          products: state.products.map((product) => ({
            ...product,
            images: product.images?.filter((image) => image.id !== imageId),
          })),
        }));
      },

      getProductImages: (productId) => {
        const { products } = get();
        const product = products.find((p) => p.id === productId);
        return product?.images || [];
      },

      // Inventory management
      updateInventory: (variantId: number, quantity: number) => {
        set((state) => ({
          products: state.products.map((product) => {
            // Kiểm tra xem product có chứa variant này không
            const hasVariant = product.variants?.some(
              (v) => v.id === variantId
            );
            if (!hasVariant) return product;

            const updatedVariants = product.variants?.map((variant) => {
              if (variant.id === variantId) {
                // Nếu có inventory thì update, ngược lại tạo mới
                const updatedInventory: Inventory = variant.inventory
                  ? { ...variant.inventory, quantity }
                  : { id: Date.now(), variant_id: variantId, quantity };

                return {
                  ...variant,
                  inventory: updatedInventory,
                };
              }
              return variant;
            });

            // Tính lại tổng tồn kho product
            const totalQuantity =
              updatedVariants?.reduce(
                (sum, v) => sum + (v.inventory?.quantity || 0),
                0
              ) || 0;

            return {
              ...product,
              variants: updatedVariants,
              totalQuantity,
            };
          }),
        }));
      },

      getInventoryByVariant: (variantId: number): Inventory | undefined => {
        const { products } = get();
        for (const product of products) {
          const variant = product.variants?.find((v) => v.id === variantId);
          if (variant?.inventory) return variant.inventory;
        }
        return undefined;
      },

      getTotalProductStock: (productId) => {
        const { products } = get();
        const product = products.find((p) => p.id === productId);
        return product?.totalQuantity || 0;
      },

      getStockStatus: (productId) => {
        const totalStock = get().getTotalProductStock(productId);
        if (totalStock === 0) return "out_of_stock";
        if (totalStock <= 10) return "low_stock";
        return "in_stock";
      },

      getProductsByStockStatus: (status) => {
        const { products } = get();
        return products.filter((product) => {
          const totalStock = product.totalQuantity || 0;
          if (status === "out_of_stock") return totalStock === 0;
          if (status === "low_stock") return totalStock > 0 && totalStock <= 10;
          if (status === "in_stock") return totalStock > 10;
          return false;
        });
      },
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

      recalculateAllTotalQuantities: () => {
        set((state) => ({
          products: state.products.map((product) => {
            const totalQuantity =
              product.variants?.reduce(
                (sum, v) => sum + (v.inventory?.quantity || 0),
                0
              ) || 0;

            return {
              ...product,
              totalQuantity,
            };
          }),
        }));
      },
    }),
    {
      name: "product-storage",
    }
  )
);
