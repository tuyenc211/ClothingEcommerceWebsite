import { create } from "zustand";
import privateClient from "@/lib/axios";

// ===== Types =====
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
    productId: number;
    variantId?: number;
    productName: string;
    sku: string;
    attributesSnapshot?: Record<string, unknown>;
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
    // Customer information
    userId?: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    user?: {
        id: number;
        fullName: string;
        email: string;
        phoneNumber?: string;
    };
}

export interface OrderFilters {
    status?: OrderStatus;
    paymentMethod?: PaymentMethod;
    customerName?: string; // nếu BE có trả về
    startDate?: string;
    endDate?: string;
}

interface OrderState {
    // Data
    orders: Order[];
    filteredOrders: Order[];
    currentOrder: Order | null;

    // Loading
    isLoading: boolean;
    isUpdating: boolean;

    // Filters & search
    filters: OrderFilters;
    searchTerm: string;

    // Pagination
    currentPage: number;
    itemsPerPage: number;

    // API actions
    fetchAllOrders: () => Promise<void>;
    fetchUserOrders: (userId: number) => Promise<void>;
    fetchOrderById: (orderId: number) => Promise<void>;
    createOrder: (userId: number, req: CreateOrderRequest) => Promise<Order>;
    cancelOrder: (userId: number, orderId: number) => Promise<void>;
    updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<void>;
    // Filters/search
    setFilters: (filters: Partial<OrderFilters>) => void;
    setSearchTerm: (term: string) => void;
    clearFilters: () => void;
    applyFilters: () => void;

    // Pagination
    setPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;

    // Utils
    getOrdersByStatus: (status: OrderStatus) => Order[];
    getOrdersByDateRange: (start: string, end: string) => Order[];
    getTotalRevenue: () => number;
    exportOrders: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    // Initial state
    orders: [],
    filteredOrders: [],
    currentOrder: null,
    isLoading: false,
    isUpdating: false,
    filters: {},
    searchTerm: "",
    currentPage: 1,
    itemsPerPage: 10,

    // ===== API actions =====
    fetchAllOrders: async () => {
        set({ isLoading: true });
        try {
            const res = await privateClient.get(`/orders`);
            const orders = res.data || [];
            
            // Fetch user information for each order
            const { useUserStore } = await import("./userStore");
            const userStore = useUserStore.getState();
            
            // Ensure users are loaded
            if (userStore.users.length === 0) {
                await userStore.fetchUsers();
            }
            
            // Map orders with user information
            const ordersWithUserInfo = await Promise.all(orders.map(async (order: any) => {
                // Try to get userId from different possible fields
                const userId = order.userId || order.user_id || order.user?.id;
                
                if (userId) {
                    const user = userStore.getUserById(userId);
                    if (user) {
                        return {
                            ...order,
                            userId: userId,
                            user: {
                                id: user.id,
                                fullName: user.fullName,
                                email: user.email,
                                phone: user.phone,
                            },
                        };
                    }
                }
                return order;
            }));
            
            set({ orders: ordersWithUserInfo });
            get().applyFilters();
        } catch (e) {
            console.error("Failed to fetch all orders:", e);
            set({ orders: [], filteredOrders: [] });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchUserOrders: async (userId) => {
        set({ isLoading: true });
        try {
            const res = await privateClient.get(`/orders/user/${userId}`);
            set({ orders: res.data });
            get().applyFilters();
        } catch (e) {
            console.error("Failed to fetch user orders:", e);
            set({ orders: [], filteredOrders: [] });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchOrderById: async (orderId) => {
        set({ isLoading: true });
        try {
            const res = await privateClient.get(`/orders/${orderId}`);
            const order = res.data || res.data?.data;
            
            set({ currentOrder: order });
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
            get().applyFilters();
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
            get().applyFilters();
        } catch (e) {
            console.error("Failed to cancel order:", e);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    updateOrderStatus: async (orderId: number, status: OrderStatus) => {
        set({ isUpdating: true });
        try {
            await privateClient.patch(`/orders/${orderId}/status?status=${status}`);
            set((s) => ({
                orders: s.orders.map((o) =>
                    o.id === orderId ? ({ ...o, status } as Order) : o
                ),
                currentOrder:
                    s.currentOrder?.id === orderId
                        ? ({ ...s.currentOrder, status } as Order)
                        : s.currentOrder,
            }));
            get().applyFilters();
        } catch (e) {
            console.error("Failed to update order status:", e);
            throw e;
        } finally {
            set({ isUpdating: false });
        }
    },

    // ===== Filters/Search/Pagination/Utils =====
    setFilters: (filters) => {
        set((state) => ({ filters: { ...state.filters, ...filters } }));
        get().applyFilters();
    },

    setSearchTerm: (term) => {
        set({ searchTerm: term });
        get().applyFilters();
    },

    clearFilters: () => {
        set({ filters: {}, searchTerm: "", currentPage: 1 });
        get().applyFilters();
    },

    applyFilters: () => {
        const { orders, filters, searchTerm } = get();
        let filtered = [...orders];

        if (searchTerm) {
            filtered = filtered.filter((order) =>
                order.code?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.status) {
            filtered = filtered.filter((order) => order.status === filters.status);
        }

        if (filters.paymentMethod) {
            filtered = filtered.filter(
                (order) => order.paymentMethod === filters.paymentMethod
            );
        }

        // Date range (ưu tiên createdAt, fallback placedAt/updatedAt)
        if (filters.startDate || filters.endDate) {
            const start = filters.startDate
                ? new Date(filters.startDate).getTime()
                : 0;
            const end = filters.endDate
                ? new Date(filters.endDate).getTime()
                : Date.now();

            filtered = filtered.filter((order) => {
                const t = new Date(
                    order.createdAt || order.placedAt || order.updatedAt || 0
                ).getTime();
                return t >= start && t <= end;
            });
        }

        // Newest first
        filtered.sort(
            (a, b) =>
                new Date(b.createdAt || b.placedAt || b.updatedAt || 0).getTime() -
                new Date(a.createdAt || a.placedAt || a.updatedAt || 0).getTime()
        );

        set({ filteredOrders: filtered, currentPage: 1 });
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

    getTotalRevenue: () =>
        get()
            .orders.filter((o) => o.status === "DELIVERED")
            .reduce((sum, o) => sum + o.grandTotal, 0),

    exportOrders: () => {
        const { filteredOrders } = get();
        console.log("Exporting orders:", filteredOrders);
        // TODO: CSV export
    },
}));
