import { create } from "zustand";
import { Category } from "./categoryStore";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

import {Review} from "@/services/reviewsService";
import {Color, Size} from "@/types";

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
  product?: Product;
  inventory?: Inventory;
}
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
  setError: (error: string | null) => void;
  setProducts: (products: Product[]) => void;
  clearError: () => void;
}
export const useProductStore = create<ProductState>()(
    (set, get) => ({
      products: [],
      isLoading: false,
      error: null,
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await privateClient.get("/products");
          const data = Array.isArray(res.data?.data) ? res.data.data : res.data;
          console.log(data);
          set({
            products: data,
            isLoading: false,
          });
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
      setProducts: (products: Product[]) => {
        set({ products });
      },
      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
);
