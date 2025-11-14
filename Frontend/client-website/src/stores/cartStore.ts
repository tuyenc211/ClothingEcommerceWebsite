import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductVariant } from "./productStore";
import { Coupon } from "./couponStore";
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
  shipping: number;
  total: number;
  itemCount: number;
}

interface CartState {
  currentCart: Cart | null;
  items: CartItem[];
  appliedCoupon: Coupon | null;
  shippingFee: number;
  freeShippingThreshold: number;
  isLoading: boolean;
  error: string | null;

  // Cart management
  fetchCartItems: (userId: number) => Promise<void>;
  createCart: (userId: number) => void;
  clearCart: () => Promise<void>;

  // Cart item actions - using variants
  addToCart: (variant: ProductVariant, quantity?: number) => Promise<void>;
  buyNow: (variant: ProductVariant, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  // Coupon actions
  applyCoupon: (coupon: Coupon) => boolean;
  removeCoupon: () => void;
  // Calculation methods
  getCartSummary: () => CartSummary;

  // Utility methods
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
  appliedCoupon: null,
  shippingFee: 30000,
  freeShippingThreshold: 500000,
  isLoading: false,
  error: null,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch cart items from backend
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

      // Cart management
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

      // Cart item actions - using variants
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

      applyCoupon: (coupon) => {
        const { getCartSummary } = get();
        const summary = getCartSummary();

        // Check if coupon is valid
        if (!coupon.isActive) {
          set({ error: "Mã giảm giá không còn hiệu lực" });
          return false;
        }

        if (coupon.endsAt && new Date(coupon.endsAt) < new Date()) {
          set({ error: "Mã giảm giá đã hết hạn" });
          return false;
        }

        if (coupon.minOrderTotal && summary.subtotal < coupon.minOrderTotal) {
          set({
            error: `Đơn hàng tối thiểu ${coupon.minOrderTotal.toLocaleString(
              "vi-VN"
            )} VNĐ để sử dụng mã này`,
          });
          return false;
        }

        set({
          appliedCoupon: coupon,
          error: null,
        });
        return true;
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
      },

      getCartSummary: (): CartSummary => {
        const { items, appliedCoupon, shippingFee, freeShippingThreshold } =
          get();

        const subtotal = items.reduce(
          (total, item) => total + (item.unitPrice || 0) * item.quantity,
          0
        );

        let discount = 0;

        if (appliedCoupon && appliedCoupon.isActive) {
          const now = new Date();

          const startsAt = appliedCoupon.startsAt
            ? new Date(appliedCoupon.startsAt)
            : null;
          const endsAt = appliedCoupon.endsAt
            ? new Date(appliedCoupon.endsAt)
            : null;

          const isWithinDateRange =
            (!startsAt || now >= startsAt) && (!endsAt || now <= endsAt);

          const meetsMinTotal =
            !appliedCoupon.minOrderTotal ||
            subtotal >= appliedCoupon.minOrderTotal;

          if (isWithinDateRange && meetsMinTotal) {
            // Percentage discount calculation
            discount = (subtotal * appliedCoupon.value) / 100;

            // Không cho giảm quá số tiền đơn hàng
            if (discount > subtotal) {
              discount = subtotal;
            }
          }
        }

        const subtotalAfterDiscount = subtotal - discount;

        const shipping =
          subtotalAfterDiscount >= freeShippingThreshold ? 0 : shippingFee;

        const total = subtotalAfterDiscount + shipping;

        return {
          subtotal,
          discount,
          shipping,
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
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        currentCart: state.currentCart,
        items: state.items,
      }),
    }
  )
);

// Sample coupons for testing - Use the same data as couponStore
