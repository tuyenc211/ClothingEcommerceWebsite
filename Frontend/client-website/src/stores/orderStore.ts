import { mockOrders } from "@/data/productv2";
import { create } from "zustand";

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
  filteredOrders: Order[];
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

  // Filters and search actions
  setFilters: (filters: Partial<OrderFilters>) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;

  // Pagination
  setPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;

  // Utility
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByDateRange: (start: string, end: string) => Order[];
  getTotalRevenue: () => number;
  exportOrders: () => void;
}
export const useOrderStore = create<OrderState>((set, get) => ({
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
      get().applyFilters();
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
      const order = mockOrders.find((o) => o.id === id);
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

      const { orders } = get();
      const updatedOrders = orders.map((order) =>
        order.id === id
          ? { ...order, status, updated_at: order.updated_at }
          : order
      );

      set({ orders: updatedOrders });
      get().applyFilters();
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      set({ isUpdating: false });
    }
  },

  // Cancel order
  cancelOrder: async (id: number, reason?: string) => {
    set({ isUpdating: true });
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500)); // Mock delay

      const { orders } = get();
      const updatedOrders = orders.map((order) =>
        order.id === id
          ? {
              ...order,
              status: "CANCELLED" as OrderStatus,
              notes: reason ? `Cancelled: ${reason}` : "Cancelled by admin",
              updated_at: order.updated_at,
            }
          : order
      );

      set({ orders: updatedOrders });
      get().applyFilters();
    } catch (error) {
      console.error("Failed to cancel order:", error);
    } finally {
      set({ isUpdating: false });
    }
  },

  // Set filters
  setFilters: (filters: Partial<OrderFilters>) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
    get().applyFilters();
  },

  // Set search term
  setSearchTerm: (term: string) => {
    set({ searchTerm: term });
    get().applyFilters();
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: {}, searchTerm: "", currentPage: 1 });
    get().applyFilters();
  },

  // Apply filters
  applyFilters: () => {
    const { orders, filters, searchTerm } = get();

    let filtered = [...orders];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // Apply payment method filter
    if (filters.paymentMethod) {
      filtered = filtered.filter(
        (order) => order.payment_method === filters.paymentMethod
      );
    }

    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at);
        const start = filters.startDate
          ? new Date(filters.startDate)
          : new Date(0);
        const end = filters.endDate ? new Date(filters.endDate) : new Date();
        return orderDate >= start && orderDate <= end;
      });
    }

    // Sort by order time (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    set({ filteredOrders: filtered, currentPage: 1 });
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

  exportOrders: () => {
    const { filteredOrders } = get();
    // TODO: Implement CSV export functionality
    console.log("Exporting orders:", filteredOrders);
  },
}));
