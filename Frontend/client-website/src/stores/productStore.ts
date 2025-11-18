import { create } from "zustand";
import { Category } from "./categoryStore";
import { Review } from "./reviewStore";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Size } from "./sizeStore";
import { Color } from "./colorStore";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  position: number;
}
export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  size: Size;
  color: Color;
  price: number;
  product?: Product; // Populated from backend join (optional)
  inventory?: Inventory; // Populated from backend join (optional)
}

// Inventory interface để match với inventories table
export interface Inventory {
  id: number;
  variant_id: number;
  productVariant: ProductVariant;
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
  reviews?: Review[];
  colors?: Array<{ id: number; name: string; code: string }>;
  sizes?: Array<{ id: number; name: string; code: string; sortOrder: number }>;
  inventories?: Inventory[];
  // Computed fields
  totalQuantity?: number;
}
interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  getProduct: (id: number) => Product | undefined;
  getProductBySku: (sku: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  getPublishedProducts: () => Product[];
  setError: (error: string | null) => void;
  clearError: () => void;
}
export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
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
        axiosError?.response?.data?.message || "Lỗi khi tải danh sách sản phẩm";
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
        product.category?.name?.toLowerCase().includes(lowercaseQuery) ||
        product.variants?.some((variant) => variant.color.id || variant.size.id)
    );
  },
  getPublishedProducts: () => {
    const { products } = get();
    return products.filter((product) => product.isPublished);
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
