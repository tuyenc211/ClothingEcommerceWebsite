import { create } from "zustand";
import { mockOrders } from "@/data/productv2";
import { persist } from "zustand/middleware";
// Order status matching database schema
export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentMethod = "COD" | "WALLET";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "PARTIAL";

// Order item interface matching database schema
export interface OrderItem {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  order_id: number; // BIGINT NOT NULL references orders(id)
  product_id: number; // BIGINT NOT NULL references products(id)
  variant_id?: number; // BIGINT references product_variants(id)
  product_name: string; // VARCHAR(255) NOT NULL
  sku: string; // VARCHAR(120) NOT NULL
  attributesSnapshot?: Record<string, unknown>; // JSON - color, size info
  unit_price: number; // DECIMAL(12,2) NOT NULL
  quantity: number; // INT NOT NULL
  line_total: number; // DECIMAL(12,2) NOT NULL
}

// Shipment interface matching database schema
export interface Shipment {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  order_id: number; // BIGINT NOT NULL references orders(id)
  carrier?: string; // VARCHAR(100)
  tracking_number?: string; // VARCHAR(100)
  status?: string; // VARCHAR(50)
  shipped_at?: string; // DATETIME
  delivered_at?: string; // DATETIME
}

// Order status history interface
export interface OrderStatusHistory {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  orderId: number; // BIGINT NOT NULL references orders(id)
  fromStatus?: string; // VARCHAR(30)
  toStatus: string; // VARCHAR(30) NOT NULL
  changedBy?: number; // BIGINT references users(id)
  changedAt: string; // DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  note?: string; // VARCHAR(500)
}

// Order interface matching database schema
export interface Order {
  id: number; // BIGINT PRIMARY KEY AUTO_INCREMENT
  user_id?: number; // BIGINT references users(id)
  code: string; // VARCHAR(40) NOT NULL UNIQUE
  status: OrderStatus; // ENUM NOT NULL DEFAULT 'NEW'
  total_items: number; // INT NOT NULL DEFAULT 0
  subtotal: number; // DECIMAL(12,2) NOT NULL DEFAULT 0
  discount_total: number; // DECIMAL(12,2) NOT NULL DEFAULT 0
  shipping_fee: number; // DECIMAL(12,2) NOT NULL DEFAULT 0
  grand_total: number; // DECIMAL(12,2) NOT NULL DEFAULT 0
  payment_method: PaymentMethod; // ENUM NOT NULL
  payment_status: PaymentStatus; // ENUM NOT NULL DEFAULT 'UNPAID'
  shipping_address_snapshot?: Record<string, unknown>; // JSON
  placed_at?: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  paid_at?: string; // DATETIME
  cancelled_at?: string; // DATETIME
  created_at: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  updated_at: string; // DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

  // Relationships (populated from joins)
  items?: OrderItem[];
  shipments?: Shipment[];
  statusHistory?: OrderStatusHistory[];

  // Legacy fields for compatibility
  // Alias for discount_total
  shippingAddress?: string; // Simple string version
  customerId?: string; // Alias for userId
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  customerName?: string;
  startDate?: string;
  endDate?: string;
}

interface OrderState {
  // Data
  orders: Order[];
  currentOrder: Order | null;
  // Loading states
  isLoading: boolean;
  isUpdating: boolean;

  // Filters and search
  filters: OrderFilters;
  searchTerm: string;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // Actions
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  updateOrderStatus: (id: number, status: OrderStatus) => Promise<void>;
  cancelOrder: (id: number, reason?: string) => Promise<void>;
  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Utility
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByDateRange: (start: string, end: string) => Order[];
  getTotalRevenue: () => number;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      // Initial state
      orders: mockOrders,
      filteredOrders: [],
      currentOrder: null,
      isLoading: false,
      isUpdating: false,
      filters: {},
      searchTerm: "",
      currentPage: 1,
      itemsPerPage: 10,

      // Fetch orders
      fetchOrders: async () => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
          set({ orders: mockOrders });
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch order by ID
      fetchOrderById: async (id: number) => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          await new Promise((resolve) => setTimeout(resolve, 500)); // Mock delay

          // Get order from current state (not from mockOrders) to reflect any updates
          const { orders } = get();
          const order = orders.find((o) => o.id === id);
          set({ currentOrder: order || null });
        } catch (error) {
          console.error("Failed to fetch order:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Update order status
      updateOrderStatus: async (id: number, status: OrderStatus) => {
        set({ isUpdating: true });
        try {
          // TODO: Replace with actual API call
          await new Promise((resolve) => setTimeout(resolve, 500)); // Mock delay

          const { orders, currentOrder } = get();
          const updatedOrders = orders.map((order) =>
            order.id === id
              ? { ...order, status, updated_at: new Date().toISOString() }
              : order
          );

          // Also update currentOrder if it's the same order being updated
          const updatedCurrentOrder =
            currentOrder?.id === id
              ? {
                  ...currentOrder,
                  status,
                  updated_at: new Date().toISOString(),
                }
              : currentOrder;

          set({
            orders: updatedOrders,
            currentOrder: updatedCurrentOrder,
          });
        } catch (error) {
          console.error("Failed to update order status:", error);
        } finally {
          set({ isUpdating: false });
        }
      },

      // Cancel order
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cancelOrder: async (id: number, reason?: string) => {
        set({ isUpdating: true });
        try {
          // TODO: Replace with actual API call
          await new Promise((resolve) => setTimeout(resolve, 500)); // Mock delay

          const { orders, currentOrder } = get();
          const now = new Date().toISOString();
          const updatedOrders = orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  status: "CANCELLED" as OrderStatus,
                  cancelled_at: now,
                  updated_at: now,
                }
              : order
          );

          // Also update currentOrder if it's the same order being cancelled
          const updatedCurrentOrder =
            currentOrder?.id === id
              ? {
                  ...currentOrder,
                  status: "CANCELLED" as OrderStatus,
                  cancelled_at: now,
                  updated_at: now,
                }
              : currentOrder;

          set({
            orders: updatedOrders,
            currentOrder: updatedCurrentOrder,
          });
        } catch (error) {
          console.error("Failed to cancel order:", error);
        } finally {
          set({ isUpdating: false });
        }
      },

      // Set filters
      setFilters: (filters: Partial<OrderFilters>) => {
        set((state) => ({ filters: { ...state.filters, ...filters } }));
      },

      // Pagination
      setPage: (page: number) => {
        set({ currentPage: page });
      },

      setItemsPerPage: (items: number) => {
        set({ itemsPerPage: items, currentPage: 1 });
      },

      // Utility functions
      getOrdersByStatus: (status: OrderStatus) => {
        const { orders } = get();
        return orders.filter((order) => order.status === status);
      },

      getOrdersByDateRange: (start: string, end: string) => {
        const { orders } = get();
        return orders.filter((order) => {
          const orderDate = new Date(order.created_at);
          return orderDate >= new Date(start) && orderDate <= new Date(end);
        });
      },

      getTotalRevenue: () => {
        const { orders } = get();
        return orders
          .filter((order) => order.status === "DELIVERED")
          .reduce((sum, order) => sum + order.grand_total, 0);
      },
    }),
    {
      name: "order-storage",
      partialize: (state: OrderState) => ({
        orders: state.orders,
      }),
    }
  )
);
