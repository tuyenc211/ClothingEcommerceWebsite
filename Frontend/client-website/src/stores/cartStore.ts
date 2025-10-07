import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, ProductVariant } from "./productStore";
import { Color } from "./colorStore";
import { Coupon } from "./couponStore";
import { Size } from "./sizeStore";
// Cart interface matching database schema
export interface Cart {
  id: number;
  userId: number;
  items: CartItem[]; // BIGINT NOT NULL references users(id)
}

// Cart item interface matching database schema
export interface CartItem {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  cart_id: number; // BIGINT NOT NULL references carts(id)
  variant_id: number; // BIGINT NOT NULL references product_variants(id)
  unit_price: number; // DECIMAL(12,2) NOT NULL
  quantity: number; // INT NOT NULL CHECK (quantity > 0)

  // Populated fields from joins
  variant?: ProductVariant;
}

// Cart summary interface
export interface CartSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

// Cart state interface
interface CartState {
  currentCart: Cart | null;
  items: CartItem[];
  appliedCoupon: Coupon | null;
  shippingFee: number;
  taxRate: number; // e.g., 0.1 for 10%
  freeShippingThreshold: number;
  isLoading: boolean;
  error: string | null;

  // Cart management
  createCart: (userId: number) => void;
  loadCart: (cartId: number) => void;
  clearCart: () => void;

  // Cart item actions - using variants
  addToCart: (variant: ProductVariant, quantity?: number) => void;
  addToCartByProduct: (
    product: Product,
    selectedColor: Color,
    selectedSize: Size,
    quantity?: number
  ) => void;
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
  isVariantInCart: (variantId: number) => boolean;
  getVariantQuantity: (variantId: number) => number;

  // Legacy methods for backward compatibility
  isItemInCart: (
    productId: number,
    colorId: number,
    sizeCode: string
  ) => boolean;
  getItemQuantity: (
    productId: number,
    colorId: number,
    sizeCode: string
  ) => number;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Generate unique cart item ID from variant ID
const generateCartItemId = (variantId: number): number => {
  return variantId * 1000 + (Date.now() % 1000);
};

// Legacy function for backward compatibility

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

      addToCartByProduct: (
        product,
        selectedColor,
        selectedSize,
        quantity = 1
      ) => {
        // Find or create a variant based on product, color, and size
        const variant: ProductVariant = {
          id: product.id * 1000 + selectedColor.id * 100 + selectedSize.id,
          product_id: product.id,
          sku: `${product.sku || product.id}_${selectedColor.id}_${
            selectedSize.code
          }`,
          size_id: selectedSize.id,
          color_id: selectedColor.id,
          price: product.base_price || 0,
        };

        get().addToCart(variant, quantity);
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
        if (!coupon.is_active) {
          set({ error: "Mã giảm giá không còn hiệu lực" });
          return false;
        }

        if (coupon.ends_at && new Date(coupon.ends_at) < new Date()) {
          set({ error: "Mã giảm giá đã hết hạn" });
          return false;
        }

        if (
          coupon.min_order_total &&
          summary.subtotal < coupon.min_order_total
        ) {
          set({
            error: `Đơn hàng tối thiểu ${coupon.min_order_total.toLocaleString(
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

        if (appliedCoupon && appliedCoupon.is_active) {
          const now = new Date();

          const startsAt = appliedCoupon.starts_at
            ? new Date(appliedCoupon.starts_at)
            : null;
          const endsAt = appliedCoupon.ends_at
            ? new Date(appliedCoupon.ends_at)
            : null;

          const isWithinDateRange =
            (!startsAt || now >= startsAt) && (!endsAt || now <= endsAt);

          const meetsMinTotal =
            !appliedCoupon.min_order_total ||
            subtotal >= appliedCoupon.min_order_total;

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

      isVariantInCart: (variantId) => {
        return get().items.some((item) => item.variant_id === variantId);
      },

      getVariantQuantity: (variantId) => {
        const item = get().items.find((item) => item.variant_id === variantId);
        return item?.quantity || 0;
      },

      // Legacy methods for backward compatibility
      isItemInCart: (productId, colorId) => {
        return get().items.some(
          (item) =>
            item.variant?.product_id === productId &&
            item.variant?.color_id === colorId
        );
      },
      getItemQuantity: (productId, colorId) => {
        const item = get().items.find(
          (item) =>
            item.variant?.product_id === productId &&
            item.variant?.color_id === colorId
        );
        return item?.quantity || 0;
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
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
