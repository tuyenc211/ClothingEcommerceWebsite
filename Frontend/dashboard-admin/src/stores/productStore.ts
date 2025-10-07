import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category } from "./categoryStore";
import { Review } from "./reviewStore";
import { mockProducts } from "@/data/productv2";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

// Product image interface để match với product_images table
export interface ProductImage {
  id: number;
  product_id: number;
  imageUrl: string; // VARCHAR(500) NOT NULL
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
  base_price: number; // DECIMAL(12,2) NOT NULL DEFAULT 0
  category_id?: number; // BIGINT references categories(id)
  is_published: boolean; // TINYINT(1) NOT NULL DEFAULT 1

  // Relationships (populated from joins)
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  // Computed fields
  totalQuantity?: number;
  // Legacy fields for compatibility
}
interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;

  // Product CRUD actions
  addProduct: (
    product: Omit<Product, "id" | "createdAt" | "updatedAt">
  ) => void;
  addProductWithVariants: (
    productData: Omit<Product, "id" | "variants" | "images">,
    selectedSizes: number[],
    selectedColors: number[],
    imageFiles: File[]
  ) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
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
      products: mockProducts, // Initialize with empty array, will be loaded from API
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

      addProductWithVariants: (
        productData,
        selectedSizes,
        selectedColors,
        imageFiles
      ) => {
        const productId = Date.now();
        const baseSlug =
          productData.name?.toLowerCase().replace(/\s+/g, "-") || "";

        // Tạo product images từ files
        const productImages: ProductImage[] = imageFiles.map((file, index) => ({
          id: Date.now() + index,
          product_id: productId,
          imageUrl: URL.createObjectURL(file), // Tạm thời dùng object URL, thực tế sẽ upload lên server
          position: index + 1,
        }));

        // Tạo variants từ combinations của sizes và colors
        const variants: ProductVariant[] = [];
        let variantIdCounter = Date.now();

        selectedSizes.forEach((sizeId) => {
          selectedColors.forEach((colorId) => {
            const variantSku = `${productData.sku}-${sizeId}-${colorId}`;
            const variant: ProductVariant = {
              id: variantIdCounter++,
              product_id: productId,
              sku: variantSku,
              size_id: sizeId,
              color_id: colorId,
              price: productData.base_price,
              inventory: {
                id: variantIdCounter++,
                variant_id: variantIdCounter - 1,
                quantity: 0, // Default quantity = 0
              },
            };
            variants.push(variant);
          });
        });

        // Tính tổng quantity từ tất cả variants
        const totalQuantity = variants.reduce(
          (sum, v) => sum + (v.inventory?.quantity || 0),
          0
        );

        const newProduct: Product = {
          ...productData,
          id: productId,
          slug: baseSlug,
          images: productImages,
          variants: variants,
          totalQuantity: totalQuantity,
        };

        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },

      updateProduct: (id, productData) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? {
                  ...product,
                  ...productData,
                  updatedAt: new Date().toISOString(),
                }
              : product
          ),
        }));
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
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
            product.category?.name?.toLowerCase().includes(lowercaseQuery) ||
            product.variants?.some(
              (variant) => variant.color_id || variant.size_id
            )
        );
      },

      filterProductsByCategory: (categoryId) => {
        const { products } = get();
        return products.filter((product) => product.category_id === categoryId);
      },

      getPublishedProducts: () => {
        const { products } = get();
        return products.filter((product) => product.is_published);
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
