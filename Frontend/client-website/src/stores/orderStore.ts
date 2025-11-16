import { create } from "zustand";
import privateClient from "@/lib/axios";
import { Product, useProductStore } from "./productStore";
import {toast} from "sonner";
export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "COD" | "WALLET";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "PARTIAL";

export interface OrderItem {
  id: number;
  orderId: number;
  product: Product;
  variantId?: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Shipment {
  id: number;
  orderId: number;
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  fromStatus?: string;
  toStatus: string;
  changedBy?: number;
  changedAt: string;
  note?: string;
}

export interface CreateOrderRequest {
  paymentMethod: PaymentMethod;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    ward: string;
    province: string;
  };
}

export interface Order {
  id: number;
  code: string;
  status: OrderStatus;
  totalItems: number;
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddressSnapshot?: Record<string, unknown>;
  placedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
  shipments?: Shipment[];
  statusHistory?: OrderStatusHistory[];
}
interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isUpdating: boolean;
  searchTerm: string;
  currentPage: number;
  itemsPerPage: number;

  // API actions
  fetchUserOrders: (userId: number) => Promise<void>;
  fetchOrderById: (orderId: number) => Promise<void>;
  createOrder: (userId: number, req: CreateOrderRequest) => Promise<Order>;
  cancelOrder: (userId: number, orderId: number) => Promise<void>;
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByDateRange: (start: string, end: string) => Order[];
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Initial state
  orders: [],
  currentOrder: null,
  isLoading: false,
  isUpdating: false,
  searchTerm: "",
  currentPage: 1,
  itemsPerPage: 10,

  // ===== API actions =====
  fetchUserOrders: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await privateClient.get(`/orders/user/${userId}`);
      set({ orders: res.data });
    } catch (e) {
      console.error("Failed to fetch user orders:", e);
      toast.error("Không thể tải đơn hàng của bạn. Vui lòng thử lại sau.");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOrderById: async (orderId) => {
    set({ isLoading: true });
    try {
      const res = await privateClient.get(`/orders/${orderId}`);
      set({ currentOrder: res.data });
    } catch (e) {
      console.error("Failed to fetch order:", e);
      set({ currentOrder: null });
    } finally {
      set({ isLoading: false });
    }
  },

  createOrder: async (userId, request) => {
    set({ isUpdating: true });
    try {
      const res = await privateClient.post(`/orders/${userId}`, request);
      const newOrder = res.data;
      set((s) => ({ orders: [newOrder, ...s.orders], currentOrder: newOrder }));
      return newOrder;
    } catch (e) {
      console.error("Failed to create order:", e);
      throw e;
    } finally {
      set({ isUpdating: false });
    }
  },

  cancelOrder: async (userId, orderId) => {
    set({ isUpdating: true });
    try {
      await privateClient.patch(`/orders/${userId}/${orderId}/cancel`);
      set((s) => ({
        orders: s.orders.map((o) =>
          o.id === orderId ? ({ ...o, status: "CANCELLED" } as Order) : o
        ),
        currentOrder:
          s.currentOrder?.id === orderId
            ? ({ ...s.currentOrder, status: "CANCELLED" } as Order)
            : s.currentOrder,
      }));
      const productStore = useProductStore.getState();
      await productStore.fetchProducts();
    } catch (e) {
      console.error("Failed to cancel order:", e);
      throw e;
    } finally {
      set({ isUpdating: false });
    }
  },

  setPage: (page) => set({ currentPage: page }),
  setItemsPerPage: (items) => set({ itemsPerPage: items, currentPage: 1 }),

  getOrdersByStatus: (status) =>
    get().orders.filter((o) => o.status === status),

  getOrdersByDateRange: (start, end) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return get().orders.filter((o) => {
      const t = new Date(
        o.createdAt || o.placedAt || o.updatedAt || 0
      ).getTime();
      return t >= s && t <= e;
    });
  },
}));
