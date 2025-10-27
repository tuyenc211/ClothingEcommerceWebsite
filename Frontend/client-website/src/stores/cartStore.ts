import { create } from "zustand";
import { persist } from "zustand/middleware";
import {  ProductVariant } from "./productStore";
import { Coupon } from "./couponStore";
export interface Cart {
  id: number;
  userId: number;
  items: CartItem[]; 
}

export interface CartItem {
  id: number; 
  cart_id: number; 
  variant_id: number; 
  unit_price: number; 
  quantity: number; 
  variant?: ProductVariant;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

interface CartState {
  currentCart: Cart | null;
  items: CartItem[];
  appliedCoupon: Coupon | null;
  shippingFee: number;
  taxRate: number; 
  freeShippingThreshold: number;
  isLoading: boolean;
  error: string | null;

  // Cart management
  createCart: (userId: number) => void;
  loadCart: (cartId: number) => void;
  clearCart: () => void;

  // Cart item actions - using variants
  addToCart: (variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  getCartItem: (itemId: number) => CartItem | undefined;
  // Coupon actions
  applyCoupon: (coupon: Coupon) => boolean;
  removeCoupon: () => void;
  // Calculation methods
  getCartSummary: () => CartSummary;
  getItemTotal: (itemId: number) => number;

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
  taxRate: 0.1,
  freeShippingThreshold: 500000,
  isLoading: false,
  error: null,
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      ...initialState,

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

      loadCart: (cart_id) => {
        // In a real app, this would fetch from API
        set((state) => ({
          currentCart: state.currentCart
            ? { ...state.currentCart, id: cart_id }
            : { id: cart_id, userId: 0, items: [] },
        }));
      },

      clearCart: () => {
        set((state) => ({
          ...initialState,
          currentCart: state.currentCart, // Keep cart reference but clear items
        }));
      },

      // Cart item actions - using variants
      addToCart: (variant, quantity = 1) => {
        const existingItem = get().items.find(
          (item) => item.variant_id === variant.id
        );

        if (existingItem) {
          get().updateQuantity(
            existingItem.id,
            existingItem.quantity + quantity
          );
        } else {
          const newItem: CartItem = {
            id: generateCartItemId(variant.id),
            cart_id: get().currentCart?.id || 0,
            variant_id: variant.id,
            unit_price: variant.price,
            quantity,
            variant, // ← Đảm bảo variant được populate đầy đủ
          };

          set((state) => ({
            items: [...state.items, newItem],
          }));
        }
      },
      removeFromCart: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      getCartItem: (itemId) => {
        return get().items.find((item) => item.id === itemId);
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

        if (
          coupon.minOrderTotal &&
          summary.subtotal < coupon.minOrderTotal
        ) {
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
        const {
          items,
          appliedCoupon,
          shippingFee,
          taxRate,
          freeShippingThreshold,
        } = get();

        const subtotal = items.reduce(
          (total, item) => total + item.unit_price * item.quantity,
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
            // Flat discount value
            discount = appliedCoupon.value;

            // Không cho giảm quá số tiền đơn hàng
            if (discount > subtotal) {
              discount = subtotal;
            }
          }
        }

        const subtotalAfterDiscount = subtotal - discount;

        const shipping =
          subtotalAfterDiscount >= freeShippingThreshold ? 0 : shippingFee;

        const tax = subtotalAfterDiscount * taxRate;

        const total = subtotalAfterDiscount + shipping + tax;

        return {
          subtotal,
          discount,
          shipping,
          tax,
          total,
          itemCount: items.reduce((count, item) => count + item.quantity, 0),
        };
      },

      getItemTotal: (itemId) => {
        const item = get().getCartItem(itemId);
        if (!item) return 0;
        return item.unit_price * item.quantity;
      },

      getTotalItems: () => {
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
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);

// Sample coupons for testing - Use the same data as couponStore
