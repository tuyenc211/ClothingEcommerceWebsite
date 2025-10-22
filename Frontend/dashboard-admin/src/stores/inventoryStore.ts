import { create } from "zustand";
import { persist } from "zustand/middleware";
import privateClient from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

// Inventory interface matching backend model
export interface Inventory {
  id: number;
  productVariant: {
    id: number;
    sku: string;
    sizeId?: number;
    colorId?: number;
    price: number;
    product?: {
      id: number;
      name: string;
      sku: string;
    };
    size?: {
      id: number;
      name: string;
      code: string;
    };
    color?: {
      id: number;
      name: string;
      code: string;
    };
  };
  quantity: number;
}

// Update inventory request DTO
export interface UpdateInventoryRequest {
  variantId: number;
  quantity: number;
}

interface InventoryState {
  inventories: Inventory[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAllInventories: () => Promise<void>;
  fetchInventoryByVariant: (variantId: number) => Promise<Inventory | null>;
  fetchInventoriesByProduct: (productId: number) => Promise<Inventory[]>;
  updateInventory: (request: UpdateInventoryRequest) => Promise<boolean>;

  // Utils
  clearError: () => void;
  getInventoryByVariantId: (variantId: number) => Inventory | undefined;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventories: [],
      isLoading: false,
      error: null,

      // Fetch all inventories
      fetchAllInventories: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get("/inventories");
          const data = response.data?.data || response.data || [];

          set({ inventories: data, isLoading: false });
          console.log("✅ Inventories fetched:", data);
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải danh sách tồn kho";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch inventories error:", errorMessage);
          toast.error(errorMessage);
        }
      },

      // Fetch inventory by variant ID
      fetchInventoryByVariant: async (variantId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get(`/inventories/${variantId}`);
          const data = response.data?.data || response.data;

          set({ isLoading: false });
          console.log("✅ Inventory fetched for variant:", variantId, data);
          return data;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải thông tin tồn kho";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch inventory error:", errorMessage);
          toast.error(errorMessage);
          return null;
        }
      },

      // Fetch inventories by product ID
      fetchInventoriesByProduct: async (productId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.get(
            `/inventories/product/${productId}`
          );
          const data = response.data?.data || response.data || [];

          set({ isLoading: false });
          console.log("✅ Inventories fetched for product:", productId, data);
          return data;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi tải danh sách tồn kho sản phẩm";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Fetch product inventories error:", errorMessage);
          toast.error(errorMessage);
          return [];
        }
      },

      // Update inventory
      updateInventory: async (request: UpdateInventoryRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await privateClient.put(
            "/inventories/update",
            request
          );
          const updatedInventory = response.data?.data || response.data;

          // Update in local state
          set((state) => ({
            inventories: state.inventories.map((inv) =>
              inv.productVariant.id === request.variantId
                ? updatedInventory
                : inv
            ),
            isLoading: false,
          }));

          toast.success("Cập nhật tồn kho thành công!");
          console.log("✅ Inventory updated:", updatedInventory);
          return true;
        } catch (error) {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Lỗi khi cập nhật tồn kho";

          set({ error: errorMessage, isLoading: false });
          console.error("❌ Update inventory error:", errorMessage);
          toast.error(errorMessage);
          return false;
        }
      },

      clearError: () => set({ error: null }),

      getInventoryByVariantId: (variantId: number) => {
        return get().inventories.find(
          (inv) => inv.productVariant.id === variantId
        );
      },
    }),
    {
      name: "inventory-storage",
      partialize: (state) => ({ inventories: state.inventories }),
    }
  )
);
