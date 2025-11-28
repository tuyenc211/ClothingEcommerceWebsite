import { create } from "zustand";
import { ProductVariant } from "./productStore";
import privateClient from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import useAuthStore from "./useAuthStore";

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

export interface CartItem {
  id: number;
  cart_id: number;
  variant_id: number;
  unitPrice: number;
  quantity: number;
  variant?: ProductVariant;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  itemCount: number;
}

interface CartState {
  currentCart: Cart | null;
  items: CartItem[];
  shippingFee: number;
  isLoading: boolean;
  error: string | null;

  fetchCartItems: (userId: number) => Promise<void>;
  createCart: (userId: number) => void;
  clearCart: () => Promise<void>;

  addToCart: (variant: ProductVariant, quantity?: number) => Promise<void>;
  buyNow: (variant: ProductVariant, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  getCartSummary: () => CartSummary;

  getTotalItems: () => number;
  setError: (error: string | null) => void;
  clearError: () => void;
}
const generateCartItemId = (variantId: number): number => {
  return variantId * 1000 + (Date.now() % 1000);
};
// Initial cart state
const initialState = {
  currentCart: null,
  items: [],
  shippingFee: 30000,
  isLoading: false,
  error: null,
};

export const useCartStore = create<CartState>()((set, get) => ({
  ...initialState,

  fetchCartItems: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await privateClient.get(`/carts/${userId}`);
      const cartItems = response.data?.data || response.data || [];

      set({
        items: cartItems,
        isLoading: false,
      });
      console.log("✅ Cart items fetched:", cartItems);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi tải giỏ hàng";
      set({ error: errorMessage, isLoading: false });
      console.error("❌ Fetch cart error:", errorMessage);
    }
  },

  createCart: (userId) => {
    const newCart: Cart = {
      id: Date.now(),
      userId,
      items: [],
    };

    set({
      currentCart: newCart,
      items: [],
    });
  },

  clearCart: async () => {
    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      set({ items: [] });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await privateClient.delete(`/carts/${userId}/clear`);
      set({ items: [], isLoading: false });
      console.log("✅ Cart cleared");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi xóa giỏ hàng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      console.error("❌ Clear cart error:", errorMessage);
    }
  },

  addToCart: async (variant, quantity = 1) => {
    // Lấy userId từ authStore thay vì currentCart
    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }

    // Khởi tạo cart nếu chưa có
    if (!get().currentCart) {
      get().createCart(userId);
    }

    set({ isLoading: true, error: null });
    try {
      const response = await privateClient.post(
        `/carts/${userId}/add?variantId=${variant.id}&quantity=${quantity}`
      );
      await get().fetchCartItems(userId);
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi thêm vào giỏ hàng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      console.error("❌ Add to cart error:", errorMessage);
    }
  },

  buyNow: async (variant, quantity = 1) => {
    // Lấy userId từ authStore
    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      throw new Error("User not authenticated");
    }

    // Khởi tạo cart nếu chưa có
    if (!get().currentCart) {
      get().createCart(userId);
    }

    set({ isLoading: true, error: null });
    try {
      // Clear cart first to ensure only this item is in cart
      await get().clearCart();

      // Add the single item to cart
      await privateClient.post(
        `/carts/${userId}/add?variantId=${variant.id}&quantity=${quantity}`
      );

      // Fetch updated cart items
      await get().fetchCartItems(userId);

      console.log("✅ Buy now item added to cart");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi mua hàng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      console.error("❌ Buy now error:", errorMessage);
      throw error;
    }
  },
  removeFromCart: async (itemId) => {
    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await privateClient.delete(`/carts/${userId}/remove/${itemId}`);

      // Update local state
      set((state) => ({
        items: state.items.filter((item) => item.id !== itemId),
        isLoading: false,
      }));
      toast.success("Đã xóa khỏi giỏ hàng");
      console.log("✅ Item removed from cart:", itemId);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi xóa khỏi giỏ hàng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      console.error("❌ Remove from cart error:", errorMessage);
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeFromCart(itemId);
      return;
    }

    const userId = useAuthStore.getState().authUser?.id;
    if (!userId) {
      toast.error("Vui lòng đăng nhập");
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await privateClient.put(
        `/carts/${userId}/update?itemId=${itemId}&quantity=${quantity}`
      );

      // Update local state
      set((state) => ({
        items: state.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
        isLoading: false,
      }));
      console.log("✅ Quantity updated:", itemId, quantity);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError?.response?.data?.message || "Lỗi khi cập nhật số lượng";
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      console.error("❌ Update quantity error:", errorMessage);
    }
  },

  getCartSummary: (): CartSummary => {
    const { items, shippingFee } = get();

    const subtotal = items.reduce(
      (total, item) => total + (item.unitPrice || 0) * item.quantity,
      0
    );

    const discount = 0;
    const subtotalAfterDiscount = subtotal - discount;
    const total = subtotalAfterDiscount + shippingFee;

    return {
      subtotal,
      discount,
      shippingFee,
      total,
      itemCount: items.reduce((count, item) => count + item.quantity, 0),
    };
  },

  getTotalItems: () => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser?.id) {
      return 0;
    }
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
