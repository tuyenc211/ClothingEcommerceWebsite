import { create } from "zustand";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Inventory,
  Color,
  Size,
  Review,
} from "@/types";

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  setError: (error: string | null) => void;
  setProducts: (products: Product[]) => void;
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
      set({
        products: data,
        isLoading: false,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError?.response?.data?.message || "Lỗi khi tải danh sách sản phẩm";
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
}));
